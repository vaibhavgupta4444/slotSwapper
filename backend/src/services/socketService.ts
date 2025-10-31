import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Server } from 'http';

interface AuthenticatedSocket extends Socket {
    userId?: string;
    user?: any;
}


class SocketService {
    private io: SocketIOServer;
    private userSockets: Map<string, string> = new Map(); // userId -> socketId

    constructor(server: Server) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: "*",
                credentials: true,
                methods: ['GET', 'POST']
            }
        });

        this.initializeSocketHandlers();
    }

    private initializeSocketHandlers() {
        this.io.use(this.authenticateSocket.bind(this));

        this.io.on('connection', (socket: AuthenticatedSocket) => {
            console.log(`User ${socket.userId} connected with socket ${socket.id}`);
            
            // Store user socket mapping
            if (socket.userId) {
                this.userSockets.set(socket.userId, socket.id);
            }

            // Handle user joining their personal room
            socket.on('join-user-room', () => {
                if (socket.userId) {
                    socket.join(`user:${socket.userId}`);
                    console.log(`User ${socket.userId} joined their personal room`);
                }
            });

            // Handle disconnect
            socket.on('disconnect', () => {
                console.log(`User ${socket.userId} disconnected`);
                if (socket.userId) {
                    this.userSockets.delete(socket.userId);
                }
            });
        });
    }

    private authenticateSocket(socket: AuthenticatedSocket, next: (err?: Error) => void) {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
            
            if (!token) {
                return next(new Error('Authentication token required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            socket.userId = decoded.userId || decoded.id || decoded._id;
            socket.user = decoded;
            
            next();
        } catch (error) {
            console.error('Socket authentication error:', error);
            next(new Error('Authentication failed'));
        }
    }

    // Emit notification to a specific user
    public notifyUser(userId: string, event: string, data: any) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.io.to(socketId).emit(event, data);
            console.log(`Notification sent to user ${userId}:`, event, data);
        } else {
            console.log(`User ${userId} not connected, notification not sent`);
        }
    }

    // Emit to a user's room (alternative method)
    public notifyUserRoom(userId: string, event: string, data: any) {
        this.io.to(`user:${userId}`).emit(event, data);
        console.log(`Room notification sent to user ${userId}:`, event, data);
    }

    // Send swap request notification
    public sendSwapRequestNotification(recipientId: string, swapRequest: any) {
        this.notifyUser(recipientId, 'new-swap-request', {
            type: 'swap-request',
            message: `New swap request from ${swapRequest.requesterId.name}`,
            data: swapRequest,
            timestamp: new Date()
        });
    }

    // Send swap response notification
    public sendSwapResponseNotification(requesterId: string, response: any) {
        const message = response.accepted 
            ? `Your swap request has been accepted!`
            : `Your swap request has been rejected.`;

        this.notifyUser(requesterId, 'swap-response', {
            type: 'swap-response',
            message,
            data: response,
            timestamp: new Date()
        });
    }

    // Get the Socket.IO instance
    public getIO() {
        return this.io;
    }
}

export default SocketService;