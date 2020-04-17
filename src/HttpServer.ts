import express from 'express';
import http from 'http';
import cors from 'cors';

const expressApp = express();
export const httpServer = http.createServer(expressApp);