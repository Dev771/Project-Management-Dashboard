import { Server } from "socket.io";
import projectWebSocketEvents from "../services/websocketEvents/projectWebSocketEvents.js";
import { projectSocketMiddleware } from "../middleware/projectSocketMiddleware.js";

export default function startSocketConnection(server) {
    const io = new Server(server, {
        cors: {
            origin: "*"
        }
    })

    io.use((socket, next) => projectSocketMiddleware(socket, next))
        .on("connection", (socket) => 
            projectWebSocketEvents(socket, io)
        );
}