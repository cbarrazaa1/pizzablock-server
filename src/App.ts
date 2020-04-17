import {httpServer} from './HttpServer';
import io from 'socket.io';
import express from 'express';
import cors from 'cors';
import Server, {server, setServer} from './Server';

const expressApp = express();
expressApp.use(cors({origin: 'http://localhost:3000', credentials: true}));
setServer(new Server(io(httpServer)));

const port = Number(process.env.PORT ?? 4000);
const host = String(process.env.HOST ?? '0.0.0.0');

httpServer.listen(port, host, () => {
  console.log(`Started PizzaBlock Server on port ${port}.`);
});
