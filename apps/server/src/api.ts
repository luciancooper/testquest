import { Router, type Request, type Response, type NextFunction } from 'express';
import type { QuestionData } from '@repo/types';

export default function apiRouter() {
    const router = Router();
    // status route
    router.get('/status', (req, res) => {
        res.json({ ok: true });
    });
    // questions route
    router.get('/questions', (req, res: Response<QuestionData[]>) => {
        res.json([
            { id: 'q1' },
            { id: 'q2' },
            { id: 'q3' },
        ]);
    });
    // id route
    router.get('/:id', (req, res) => {
        res.json({ id: req.params.id });
    });
    // unimplemented endpoint error handler
    router.use((err: { code?: number } | null, req: Request, res: Response, next: NextFunction) => {
        if (err && err.code === 501) {
            res.status(501).json({
                method: req.method,
                endpoint: req.baseUrl + req.path,
                ...err,
                message: 'Endpoint is not yet implemented',
            });
        } else next(err);
    });
    return router;
}