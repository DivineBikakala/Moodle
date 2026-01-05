import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Level, Resource } from '../models';
import { authenticate, isTeacher } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/levels - Récupérer tous les niveaux
router.get('/', authenticate, async (_req: Request, res: Response) => {
  try {
    const levels = await Level.findAll({ order: [['order', 'ASC']] });
    res.json({ levels });
  } catch (error) {
    console.error('Erreur GET /api/levels', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/levels/:id - Récupérer un niveau avec ses ressources
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const level = await Level.findByPk(id, { include: [{ model: Resource, as: 'resources' }] });
    if (!level) return res.status(404).json({ error: 'Niveau non trouvé' });
    res.json({ level });
  } catch (error) {
    console.error('Erreur GET /api/levels/:id', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/levels - Créer un niveau (teacher)
router.post(
  '/',
  authenticate,
  isTeacher,
  [body('name').trim().notEmpty().withMessage('Le nom est requis'), body('description').optional().trim(), body('order').optional().isInt()],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, description, order } = req.body as any;
      let levelOrder = order;
      if (levelOrder === undefined) {
        const maxLevel = await Level.findOne({ order: [['order', 'DESC']] });
        levelOrder = maxLevel ? (maxLevel as any).order + 1 : 0;
      }

      const level = await Level.create({ name, description, order: levelOrder });
      res.status(201).json({ message: 'Niveau créé', level });
    } catch (error) {
      console.error('Erreur POST /api/levels', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// PUT /api/levels/:id - Mettre à jour un niveau (teacher)
router.put(
  '/:id',
  authenticate,
  isTeacher,
  [body('name').optional().trim(), body('description').optional().trim(), body('order').optional().isInt()],
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const level = await Level.findByPk(id);
      if (!level) return res.status(404).json({ error: 'Niveau non trouvé' });

      const { name, description, order } = req.body as any;
      await level.update({ name: name ?? level.name, description: description ?? level.description, order: order ?? level.order });
      res.json({ message: 'Niveau mis à jour', level });
    } catch (error) {
      console.error('Erreur PUT /api/levels/:id', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// DELETE /api/levels/:id - Supprimer un niveau (teacher)
router.delete('/:id', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const level = await Level.findByPk(id);
    if (!level) return res.status(404).json({ error: 'Niveau non trouvé' });
    await level.destroy();
    res.json({ message: 'Niveau supprimé' });
  } catch (error) {
    console.error('Erreur DELETE /api/levels/:id', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
