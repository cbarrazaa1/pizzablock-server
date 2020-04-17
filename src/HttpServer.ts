import express from 'express';
import http from 'http';
import cors from 'cors';

const expressApp = express();
expressApp.use(cors({origin: 'http://localhost:3000', credentials: true}));
export const httpServer = http.createServer(expressApp);