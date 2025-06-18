import { Router } from 'express';
import { getSchema } from './db';

export default function apiRouter() {
    const router = Router();
    // status route
    router.get('/status', (req, res) => {
        res.json({ ok: true });
    });
    // db schema route
    router.get('/db-schema', async (req, res) => {
        res.json(await getSchema());
    });
    return router;
}