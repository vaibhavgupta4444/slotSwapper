import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  id: string;
  type: 'swap-request' | 'swap-response';
  message: string;
  data: any;
  timestamp: Date;
  read: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return;
    }

    // Initialize socket connection
    const newSocket = io('http://localhost:3000', {
      auth: {
        token: token
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      // Join the user's personal room
      newSocket.emit('join-user-room');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Handle incoming swap request notifications
    newSocket.on('new-swap-request', (data) => {
      console.log('New swap request notification:', data);
      
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'swap-request',
        message: data.message,
        data: data.data,
        timestamp: new Date(data.timestamp),
        read: false
      };

      setNotifications(prev => [notification, ...prev]);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('New Swap Request', {
          body: data.message,
          icon: '/favicon.ico'
        });
      }
    });

    // Handle swap response notifications
    newSocket.on('swap-response', (data) => {
      console.log('Swap response notification:', data);
      
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'swap-response',
        message: data.message,
        data: data.data,
        timestamp: new Date(data.timestamp),
        read: false
      };

      setNotifications(prev => [notification, ...prev]);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('Swap Request Update', {
          body: data.message,
          icon: '/favicon.ico'
        });
      }
    });

    setSocket(newSocket);

    // Request notification permission on first load
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      newSocket.close();
    };
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: SocketContextType = {
    socket,
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
    isConnected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};