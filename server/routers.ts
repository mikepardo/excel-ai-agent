import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  chart: router({
    // Get chart recommendations
    recommend: protectedProcedure
      .input(z.object({
        headers: z.array(z.string()),
        rows: z.array(z.array(z.any())),
      }))
      .query(async ({ input }) => {
        const { recommendCharts } = await import('./chartRecommendations');
        return recommendCharts(input);
      }),

    // Transform data for charting
    transformData: publicProcedure
      .input(z.object({
        headers: z.array(z.string()),
        rows: z.array(z.array(z.any())),
        config: z.object({
          xAxis: z.string().optional(),
          yAxis: z.array(z.string()).optional(),
          dataKey: z.string().optional(),
          valueKey: z.string().optional(),
        }),
      }))
      .query(async ({ input }) => {
        const { transformDataForChart } = await import('./chartRecommendations');
        return transformDataForChart(
          { headers: input.headers, rows: input.rows },
          input.config
        );
      }),
  }),

  formula: router({
    // Get formula suggestions
    getSuggestions: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        const { getFormulaSuggestions } = await import('./formulaSuggestions');
        return getFormulaSuggestions(input.query);
      }),

    // Get AI-powered formula suggestions
    getAISuggestions: protectedProcedure
      .input(z.object({
        cellRef: z.string(),
        nearbyData: z.array(z.array(z.any())).optional(),
        columnHeaders: z.array(z.string()).optional(),
        userIntent: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { getAIFormulaSuggestions } = await import('./formulaSuggestions');
        return getAIFormulaSuggestions(input);
      }),

    // Explain a formula
    explain: publicProcedure
      .input(z.object({ formula: z.string() }))
      .query(async ({ input }) => {
        const { explainFormula } = await import('./formulaSuggestions');
        return { explanation: await explainFormula(input.formula) };
      }),
  }),

  template: router({
    // List all available templates
    list: publicProcedure.query(async () => {
      const { getAllTemplates } = await import('./templates');
      return getAllTemplates();
    }),

    // Create spreadsheet from template
    createFromTemplate: protectedProcedure
      .input(z.object({
        templateId: z.string(),
        name: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getTemplateById } = await import('./templates');
        const { createExcelFile } = await import('./excelProcessor');
        const { createSpreadsheet } = await import('./db');

        const template = getTemplateById(input.templateId);
        if (!template) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' });
        }

        // Create Excel file from template
        const { fileKey, fileUrl } = await createExcelFile(
          template.data,
          input.name,
          ctx.user.id
        );

        // Create spreadsheet record
        const id = await createSpreadsheet({
          userId: ctx.user.id,
          name: input.name,
          fileKey,
          fileUrl,
          fileType: 'xlsx',
          originalFileName: `${input.name}.xlsx`,
        });

        return { id };
      }),
  }),

  spreadsheet: router({
    // List all user's spreadsheets
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserSpreadsheets } = await import('./db');
      return getUserSpreadsheets(ctx.user.id);
    }),

    // Get specific spreadsheet with its data
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getSpreadsheetById } = await import('./db');
        const { parseExcelFile } = await import('./excelProcessor');
        
        const spreadsheet = await getSpreadsheetById(input.id);
        if (!spreadsheet) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Spreadsheet not found' });
        }
        
        if (spreadsheet.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        // Parse Excel data
        const data = await parseExcelFile(spreadsheet.fileUrl);
        
        return {
          ...spreadsheet,
          data,
        };
      }),

    // Create new spreadsheet
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        fileKey: z.string(),
        fileUrl: z.string(),
        fileType: z.string(),
        originalFileName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createSpreadsheet } = await import('./db');
        
        const id = await createSpreadsheet({
          userId: ctx.user.id,
          name: input.name,
          fileKey: input.fileKey,
          fileUrl: input.fileUrl,
          fileType: input.fileType,
          originalFileName: input.originalFileName,
        });
        
        return { id };
      }),

    // Delete spreadsheet
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getSpreadsheetById, deleteSpreadsheet } = await import('./db');
        
        const spreadsheet = await getSpreadsheetById(input.id);
        if (!spreadsheet) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        
        if (spreadsheet.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        await deleteSpreadsheet(input.id);
        return { success: true };
      }),

    // Get download URL for spreadsheet
    getDownloadUrl: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getSpreadsheetById } = await import('./db');
        
        const spreadsheet = await getSpreadsheetById(input.id);
        if (!spreadsheet) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        
        if (spreadsheet.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        return {
          url: spreadsheet.fileUrl,
          fileName: spreadsheet.originalFileName || `${spreadsheet.name}.xlsx`,
        };
      }),
  }),

  chat: router({
    // Get chat history for a spreadsheet
    getMessages: protectedProcedure
      .input(z.object({ spreadsheetId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getSpreadsheetById, getSpreadsheetMessages } = await import('./db');
        
        const spreadsheet = await getSpreadsheetById(input.spreadsheetId);
        if (!spreadsheet || spreadsheet.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        return getSpreadsheetMessages(input.spreadsheetId);
      }),

    // Send message and get AI response
    sendMessage: protectedProcedure
      .input(z.object({
        spreadsheetId: z.number(),
        message: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getSpreadsheetById, createChatMessage, getSpreadsheetMessages, createCheckpoint } = await import('./db');
        const { parseExcelFile, createExcelFile } = await import('./excelProcessor');
        const { processUserCommand, generateCheckpointDescription } = await import('./aiAgent');
        
        // Verify access
        const spreadsheet = await getSpreadsheetById(input.spreadsheetId);
        if (!spreadsheet || spreadsheet.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        // Save user message
        await createChatMessage({
          spreadsheetId: input.spreadsheetId,
          userId: ctx.user.id,
          role: 'user',
          content: input.message,
        });
        
        // Get conversation history
        const messages = await getSpreadsheetMessages(input.spreadsheetId);
        const conversationHistory = messages.slice(-10).map(m => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        }));
        
        // Parse current spreadsheet data
        const spreadsheetData = await parseExcelFile(spreadsheet.fileUrl);
        
        // Process with AI
        const aiResponse = await processUserCommand(
          input.message,
          spreadsheetData,
          conversationHistory
        );
        
        // Save AI response
        await createChatMessage({
          spreadsheetId: input.spreadsheetId,
          userId: ctx.user.id,
          role: 'assistant',
          content: aiResponse.message,
        });
        
        // If AI made changes, apply them and create checkpoint
        if (aiResponse.actions && aiResponse.actions.length > 0 && !aiResponse.needsClarification) {
          const { applyAIActions } = await import('./excelModifier');
          const { createExcelFile } = await import('./excelProcessor');
          const { updateSpreadsheet } = await import('./db');
          
          try {
            // Apply AI actions to the spreadsheet
            const { workbook, data } = await applyAIActions(
              spreadsheet.fileUrl,
              aiResponse.actions
            );
            
            // Save modified spreadsheet to S3
            const { fileKey, fileUrl } = await createExcelFile(
              data,
              spreadsheet.name,
              ctx.user.id
            );
            
            // Update spreadsheet record
            await updateSpreadsheet(input.spreadsheetId, {
              fileKey,
              fileUrl,
            });
            
            // Create checkpoint
            const description = generateCheckpointDescription(aiResponse.actions);
            await createCheckpoint({
              spreadsheetId: input.spreadsheetId,
              userId: ctx.user.id,
              fileKey,
              fileUrl,
              description,
            });
          } catch (error) {
            console.error('Error applying AI actions:', error);
            // Still save a checkpoint with the original file
            const description = generateCheckpointDescription(aiResponse.actions);
            await createCheckpoint({
              spreadsheetId: input.spreadsheetId,
              userId: ctx.user.id,
              fileKey: spreadsheet.fileKey,
              fileUrl: spreadsheet.fileUrl,
              description: `${description} (failed to apply)`,
            });
          }
        }
        
        return aiResponse;
      }),
  }),

  checkpoint: router({
    // List checkpoints for a spreadsheet
    list: protectedProcedure
      .input(z.object({ spreadsheetId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getSpreadsheetById, getSpreadsheetCheckpoints } = await import('./db');
        
        const spreadsheet = await getSpreadsheetById(input.spreadsheetId);
        if (!spreadsheet || spreadsheet.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        return getSpreadsheetCheckpoints(input.spreadsheetId);
      }),

    // Restore to a checkpoint
    restore: protectedProcedure
      .input(z.object({ checkpointId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getCheckpointById, updateSpreadsheet, getSpreadsheetById } = await import('./db');
        
        const checkpoint = await getCheckpointById(input.checkpointId);
        if (!checkpoint) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        
        const spreadsheet = await getSpreadsheetById(checkpoint.spreadsheetId);
        if (!spreadsheet || spreadsheet.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        // Update spreadsheet to checkpoint version
        await updateSpreadsheet(checkpoint.spreadsheetId, {
          fileKey: checkpoint.fileKey,
          fileUrl: checkpoint.fileUrl,
        });
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

