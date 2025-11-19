import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';

export interface CollaborationUser {
  userId: number;
  userName: string;
  spreadsheetId: number;
  cursorPosition?: { row: number; col: number };
  color: string;
}

export interface CellEdit {
  spreadsheetId: number;
  cell: string;
  value: any;
  userId: number;
  timestamp: number;
}

const activeUsers = new Map<string, CollaborationUser>();
const spreadsheetRooms = new Map<number, Set<string>>();

/**
 * Generate a random color for user cursor
 */
function generateUserColor(): string {
  const colors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // amber
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Initialize Socket.IO for real-time collaboration
 */
export function setupCollaboration(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    path: '/api/socket.io',
  });

  io.on('connection', (socket) => {
    console.log('[Collaboration] Client connected:', socket.id);

    // Join spreadsheet room
    socket.on('join-spreadsheet', (data: { spreadsheetId: number; userId: number; userName: string }) => {
      const { spreadsheetId, userId, userName } = data;
      const roomName = `spreadsheet-${spreadsheetId}`;

      // Leave previous rooms
      Array.from(socket.rooms).forEach((room) => {
        if (room !== socket.id && room.startsWith('spreadsheet-')) {
          socket.leave(room);
        }
      });

      // Join new room
      socket.join(roomName);

      // Track user
      const user: CollaborationUser = {
        userId,
        userName,
        spreadsheetId,
        color: generateUserColor(),
      };
      activeUsers.set(socket.id, user);

      // Track room membership
      if (!spreadsheetRooms.has(spreadsheetId)) {
        spreadsheetRooms.set(spreadsheetId, new Set());
      }
      spreadsheetRooms.get(spreadsheetId)!.add(socket.id);

      // Notify others in the room
      socket.to(roomName).emit('user-joined', user);

      // Send current users to the new joiner
      const roomUsers = Array.from(spreadsheetRooms.get(spreadsheetId) || [])
        .map((socketId) => activeUsers.get(socketId))
        .filter((u) => u && u.userId !== userId);

      socket.emit('room-users', roomUsers);

      console.log(`[Collaboration] User ${userName} joined spreadsheet ${spreadsheetId}`);
    });

    // Handle cursor movement
    socket.on('cursor-move', (data: { row: number; col: number }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      user.cursorPosition = data;
      const roomName = `spreadsheet-${user.spreadsheetId}`;

      socket.to(roomName).emit('cursor-update', {
        userId: user.userId,
        userName: user.userName,
        color: user.color,
        position: data,
      });
    });

    // Handle cell edits
    socket.on('cell-edit', (data: { cell: string; value: any }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const roomName = `spreadsheet-${user.spreadsheetId}`;
      const edit: CellEdit = {
        spreadsheetId: user.spreadsheetId,
        cell: data.cell,
        value: data.value,
        userId: user.userId,
        timestamp: Date.now(),
      };

      // Broadcast to others in the room
      socket.to(roomName).emit('cell-updated', {
        cell: data.cell,
        value: data.value,
        userId: user.userId,
        userName: user.userName,
      });

      console.log(`[Collaboration] Cell ${data.cell} edited by ${user.userName}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        const roomName = `spreadsheet-${user.spreadsheetId}`;
        
        // Remove from tracking
        activeUsers.delete(socket.id);
        spreadsheetRooms.get(user.spreadsheetId)?.delete(socket.id);

        // Notify others
        socket.to(roomName).emit('user-left', {
          userId: user.userId,
          userName: user.userName,
        });

        console.log(`[Collaboration] User ${user.userName} left spreadsheet ${user.spreadsheetId}`);
      }

      console.log('[Collaboration] Client disconnected:', socket.id);
    });
  });

  return io;
}
