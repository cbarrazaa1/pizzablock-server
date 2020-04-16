import express from 'express';
import http from 'http';
import io from 'socket.io';
import Server from './Server';

const app = express();
const httpServer = http.createServer(app);

const port = Number(process.env.PORT ?? 4000);
const host = String(process.env.HOST ?? '0.0.0.0');

httpServer.listen(port, host, () => {
  console.log(`Started PizzaBlock Server on port ${port}.`);
});

export const server = new Server(io(httpServer));