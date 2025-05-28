import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { join } from 'node:path';
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

const port = process.env['PORT'] ?? 3002;

app.listen(port, () => {
    console.log(`server running on port ${port}`);
});