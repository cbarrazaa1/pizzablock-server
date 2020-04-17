import express from 'express';
import http from 'http';

const expressApp = express();
export const httpServer = http.createServer(expressApp);