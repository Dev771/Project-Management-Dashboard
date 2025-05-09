import authMiddleware from './authMiddleware.js';

export const projectSocketMiddleware = async (socket, next) => {
    const { authorization } = socket.request._query;

    if(!authorization) {
        socket.disconnect();
    }

    const {
        valid,
        userId,
        userDetails
    } = await authMiddleware.checkIfTokenIsValid(authorization);

    if(!valid) {
        socket.disconnect();
    }

    socket.userId = userId;
    socket.username = userDetails?.name || "";
    socket.userEmail = userDetails?.email || "";
    next();
}