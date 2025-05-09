import { leaveRoom, userJoinedProject, newTaskAdded, taskUpdated, taskDeleted, commented } from "../../handler/socketEventHandler.js";

export default function projectWebSocketEvents(socket, io) {
    socket.on("joinProject", ({ projectId, userId }, callbackFunction) => userJoinedProject({ projectId, userId, callbackFunction, socket, io }));
    
    // Tasks 
    socket.on("newTaskAdded", ({ taskId }, callbackFunction) => newTaskAdded(socket, taskId, callbackFunction));
    socket.on("taskUpdated", ({ taskId }, callbackFunction) => taskUpdated(socket, taskId, callbackFunction));
    socket.on("taskDeleted", ({ taskId }, callbackFunction) => taskDeleted(socket, taskId, callbackFunction))

    // Comments
    socket.on("commented", (data, callbackFunction) => commented(socket, data, callbackFunction));

    socket.on("leaveProject", (...args) => leaveRoom(socket, ...args));
}