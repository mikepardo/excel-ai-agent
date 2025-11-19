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

  macro: router({
    // Get user's macros
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserMacros } = await import('./db');
      return getUserMacros(ctx.user.id);
    }),

    // Get macro by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getMacroById } = await import('./db');
        return getMacroById(input.id);
      }),

    // Create new macro
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        actions: z.string(), // JSON string
      }))
      .mutation(async ({ ctx, input }) => {
        const { createMacro } = await import('./db');
        const { validateMacro } = await import('./macroEngine');

        // Validate macro
        const macroDef = {
          name: input.name,
          description: input.description,
          actions: JSON.parse(input.actions),
        };
        const validation = validateMacro(macroDef);
        if (!validation.valid) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: validation.errors.join(', '),
          });
        }

        const id = await createMacro({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          actions: input.actions,
        });
        return { id };
      }),

    // Execute macro
    execute: protectedProcedure
      .input(z.object({
        macroId: z.number(),
        spreadsheetData: z.any(),
      }))
      .mutation(async ({ input }) => {
        const { getMacroById } = await import('./db');
        const { executeMacro } = await import('./macroEngine');

        const macro = await getMacroById(input.macroId);
        if (!macro) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Macro not found' });
        }

        const macroDef = {
          name: macro.name,
          description: macro.description || undefined,
          actions: JSON.parse(macro.actions),
        };

        const result = await executeMacro(macroDef, input.spreadsheetData);
        return result;
      }),

    // Delete macro
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteMacro } = await import('./db');
        await deleteMacro(input.id);
        return { success: true };
      }),
  }),

  comment: router({
    // Get all comments for a spreadsheet
    list: protectedProcedure
      .input(z.object({ spreadsheetId: z.number() }))
      .query(async ({ input }) => {
        const { getCommentsBySpreadsheet } = await import('./db');
        return getCommentsBySpreadsheet(input.spreadsheetId);
      }),

    // Get comments for a specific cell
    getByCell: protectedProcedure
      .input(z.object({ spreadsheetId: z.number(), cellRef: z.string() }))
      .query(async ({ input }) => {
        const { getCommentsByCell } = await import('./db');
        return getCommentsByCell(input.spreadsheetId, input.cellRef);
      }),

    // Create a new comment
    create: protectedProcedure
      .input(z.object({
        spreadsheetId: z.number(),
        cellRef: z.string(),
        content: z.string(),
        parentId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createComment } = await import('./db');
        const id = await createComment({
          spreadsheetId: input.spreadsheetId,
          userId: ctx.user.id,
          cellRef: input.cellRef,
          content: input.content,
          parentId: input.parentId,
        });
        return { id };
      }),

    // Update a comment
    update: protectedProcedure
      .input(z.object({ id: z.number(), content: z.string() }))
      .mutation(async ({ input }) => {
        const { updateComment } = await import('./db');
        await updateComment(input.id, input.content);
        return { success: true };
      }),

    // Resolve/unresolve a comment
    resolve: protectedProcedure
      .input(z.object({ id: z.number(), resolved: z.boolean() }))
      .mutation(async ({ input }) => {
        const { resolveComment } = await import('./db');
        await resolveComment(input.id, input.resolved);
        return { success: true };
      }),

    // Delete a comment
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteComment } = await import('./db');
        await deleteComment(input.id);
        return { success: true };
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
        const { storageGet } = await import('./storage');
        
        const spreadsheet = await getSpreadsheetById(input.id);
        if (!spreadsheet) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Spreadsheet not found' });
        }
        
        if (spreadsheet.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        // Get fresh download URL from S3
        const { url: freshFileUrl } = await storageGet(spreadsheet.fileKey);
        
        // Parse Excel data with fresh URL
        const data = await parseExcelFile(freshFileUrl);
        
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

