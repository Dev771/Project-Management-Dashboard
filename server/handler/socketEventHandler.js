import task from "../database/task.js";

export const userJoinedProject = ({ projectId, userId, socket, callbackFunction, io }) => {
    if(!projectId || !userId) {
        console.log("Invalid Socket Connection!!!");
        socket.disconnect();
    }

    const room = `Project_${projectId}`;
    socket.join(room);

    socket.room = room;
    socket.projectId = projectId;
    socket.userId = userId;

    const currentAllSocketsInRoom = io.sockets.adapter.rooms.get(room);
    const otherSocketConnections = [...(currentAllSocketsInRoom || [])].filter(id => id !== socket.id);
    const existingUsers = otherSocketConnections
            .map(id => {
                const data = io.sockets.sockets.get(id);

                return {
                    userId: data.userId,
                    username: data.username,
                    userEmail: data.userEmail
                }
            });
    socket.to(room).emit("userJoined", { 
        userId,
        username: socket.username,
        userEmail: socket.userEmail 
    });
    callbackFunction({ existingUsers });
}

export const leaveRoom = (socket) => {
    socket.to(socket.room).emit("userLeft", { userId: socket.userId });
    socket.leave(socket.room);
    socket.disconnect();
}

export const newTaskAdded = async (socket, taskId, callbackFunction) => {
    const { projectId, userId } = socket;

    if(!projectId || !userId) {
        socket.disconnect();
    }

    const room = socket.room;

    const taskDetails = await task.getTaskDetails(projectId, taskId);

    if(taskDetails) {
        socket.to(room).emit("newTaskAdded", taskDetails);
    }
    callbackFunction();
}

export const taskUpdated = async (socket, taskId, callbackFunction) => {
    const { projectId, userId } = socket;

    if(!projectId || !userId) {
        socket.disconnect();
    }

    const room = socket.room;

    const taskDetails = await task.getTaskDetails(projectId, taskId);

    if(taskDetails) {
        socket.to(room).emit("taskUpdated", taskDetails);
    }
    callbackFunction();
}

export const taskDeleted = async (socket, taskId, callbackFunction) => {
    const room = socket.room;

    socket.to(room).emit("taskDeleted", taskId);
    callbackFunction();
}

export const commented = async (socket, data, callbackFunction) => {
    const room = socket.room;

    socket.to(room).emit("commented", data);
    callbackFunction();
}