import { Router, Request, Response } from 'express';

const router = Router();

// Toutes les routes /api/courses sont obsolètes. Retourner 410 Gone.
router.use((req: Request, res: Response) => {
  res.status(410).json({ error: 'Les routes /api/courses sont supprimées. Utilisez /api/levels et /api/resources.' });
});

export default router;
