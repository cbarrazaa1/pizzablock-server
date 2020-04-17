import express from 'express';
import http from 'http';
import cors from 'cors';

const expressApp = express();
expressApp.use(cors());
export const httpServer = http.createServer(expressApp);