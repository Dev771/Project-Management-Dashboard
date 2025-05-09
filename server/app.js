import express from "express";
import cors from "cors";
import http from "http";

import Routes from "./router/index.js";
import startSocketConnection from "./server/socket-io.js";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api", Routes);

startSocketConnection(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("Server is Running on PORT", PORT)
});