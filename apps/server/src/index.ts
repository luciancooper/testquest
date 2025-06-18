import express, { type Request, type Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { join } from 'node:path';
import { initialize } from './db';
import apiRouter from './api';

const app = express();
// parse text bodies
app.use(express.text());
// parse json bodies
app.use(express.json());
// parse url encoded bodies
app.use(express.urlencoded({ extended: true }));
// setup logging
app.use(morgan('dev'));
// setup cors
app.use(cors());

app.use('/api', apiRouter());

// serve static files from frontend build
app.use(express.static(join(import.meta.dirname, './public')));

// error 404
app.use((req, res) => {
    res.status(404).json({
        code: 404,
        message: 'Not Found',
        endpoint: `${req.method} ${req.originalUrl}`,
    });
});

// error 500
app.use((err: { message?: string, code?: number } | null, req: Request, res: Response) => {
    const code = err?.code ?? 500;
    res.status(code).json({
        code,
        ...err,
        message: err?.message ?? 'Internal Server Error',
        endpoint: `${req.method} ${req.originalUrl}`,
    });
});

// server port
const port = process.env['PORT'] ?? 3002;

// initialize database connection
try {
    await initialize();
    console.log('✅ SQL database connected');
    app.listen(port, () => {
        console.log(`server running on port ${port}`);
    });
} catch (err) {
    console.error('❌ Database connection failed:', err);
}