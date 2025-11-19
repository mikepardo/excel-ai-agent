import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface CollaborationUser {
  userId: number;
  userName: string;
  color: string;
  cursorPosition?: { row: number; col: number };
}

export interface CellUpdate {
  cell: string;
  value: any;
  userId: number;
  userName: string;
}

interface UseCollaborationProps {
  spreadsheetId: number;
  userId: number;
  userName: string;
  enabled: boolean;
}

export function useCollaboration({
  spreadsheetId,
  userId,
  userName,
  enabled,
}: UseCollaborationProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !spreadsheetId || !userId) return;

    // Connect to Socket.IO server
    const socketInstance = io({
      path: '/api/socket.io',
    });

    socketInstance.on('connect', () => {
      console.log('[Collaboration] Connected to server');
      setConnected(true);

      // Join spreadsheet room
      socketInstance.emit('join-spreadsheet', {
        spreadsheetId,
        userId,
        userName,
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('[Collaboration] Disconnected from server');
      setConnected(false);
      setActiveUsers([]);
    });

    // Handle room users list
    socketInstance.on('room-users', (users: CollaborationUser[]) => {
      console.log('[Collaboration] Room users:', users);
      setActiveUsers(users);
    });

    // Handle user joined
    socketInstance.on('user-joined', (user: CollaborationUser) => {
      console.log('[Collaboration] User joined:', user);
      setActiveUsers((prev) => [...prev, user]);
    });

    // Handle user left
    socketInstance.on('user-left', (data: { userId: number; userName: string }) => {
      console.log('[Collaboration] User left:', data);
      setActiveUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [enabled, spreadsheetId, userId, userName]);

  const moveCursor = useCallback(
    (row: number, col: number) => {
      if (socket && connected) {
        socket.emit('cursor-move', { row, col });
      }
    },
    [socket, connected]
  );

  const editCell = useCallback(
    (cell: string, value: any) => {
      if (socket && connected) {
        socket.emit('cell-edit', { cell, value });
      }
    },
    [socket, connected]
  );

  const onCursorUpdate = useCallback(
    (
      callback: (data: {
        userId: number;
        userName: string;
        color: string;
        position: { row: number; col: number };
      }) => void
    ) => {
      if (socket) {
        socket.on('cursor-update', callback);
        return () => {
          socket.off('cursor-update', callback);
        };
      }
    },
    [socket]
  );

  const onCellUpdated = useCallback(
    (callback: (data: CellUpdate) => void) => {
      if (socket) {
        socket.on('cell-updated', callback);
        return () => {
          socket.off('cell-updated', callback);
        };
      }
    },
    [socket]
  );

  return {
    connected,
    activeUsers,
    moveCursor,
    editCell,
    onCursorUpdate,
    onCellUpdated,
  };
}
