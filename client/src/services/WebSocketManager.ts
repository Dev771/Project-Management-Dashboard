import { io, Socket } from "socket.io-client";
import store from "../redux/store";
import { config } from "../config/config";

let socket: Socket;
let interval: number;

const WebSocketManager =  {
    connect: () => new Promise((resolve, reject) => {
      if (!socket) {
        const authToken = store.getState().user.token || localStorage.getItem("token");

        const opts = {
            reconnect: true,
            query: {
                authorization: authToken || "",
            }
        };
        socket = io(config.socketUrl, opts);
        socket.on("connect_error", (err) => {
          console.log(`connect_error due to ${err.message}`);
          reject(err);
        });
        interval = setInterval(() => {
          if (socket.connected) {
            clearInterval(interval);
            resolve(socket);
          }
        }, 200);
        socket.on("connect", () => {
          console.log("Socket.io connected.");
          clearInterval(interval);
          resolve(socket);
        });
      } else resolve(socket);
    })
}

export default WebSocketManager;