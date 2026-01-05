import { Router, Request, Response } from 'express';

const router = Router();

router.use((req: Request, res: Response) => {
  res.status(410).json({ error: 'Enrollements désactivés. Utilisez le modèle niveaux/ressources.' });
});

export default router;
