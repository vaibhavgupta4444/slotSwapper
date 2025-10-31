import express, { Request, Response } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import dbConnect from './config/dbConnect';
import userRouter from "./routes/userRoutes";
import eventRouter from "./routes/eventRoutes";
import swappableSlotsRouter from "./routes/swappableSlotsRoutes";
import swapRequestRouter from "./routes/swapRequestRoutes";
import SocketService from './services/socketService';

dotenv.config();

dbConnect();

const app = express();
const port = 3000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO service
const socketService = new SocketService(server);

// Make socket service available globally
declare global {
  var socketService: SocketService;
}
global.socketService = socketService;

app.use(express.json());
app.use(cors());

// Routes
app.use("/api/user", userRouter);
app.use("/api/events", eventRouter);
app.use("/api/swappable-slots", swappableSlotsRouter);
app.use("/api/swap-request", swapRequestRouter);
app.use("/api/swap-requests", swapRequestRouter);
app.use("/api/swap-response", swapRequestRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("SlotSwapper API with WebSocket support is running!");
});

server.listen(port, () => {
  console.log(`Server with WebSocket support is running on http://localhost:${port}`);
});
