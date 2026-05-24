import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Level, Resource, Course } from '../models';
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

// GET /api/levels/:id - Récupérer un niveau avec ses ressources (via les cours)
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    const level = await Level.findByPk(id);
    if (!level) return res.status(404).json({ error: 'Niveau non trouvé' });

    // Récupérer les cours de ce niveau avec leurs ressources
    const courses = await Course.findAll({
      where: { levelId: id },
      include: [{ model: Resource, as: 'resources' }]
    });

    // Aplatir toutes les ressources de tous les cours du niveau
    const resources = courses.flatMap((c: any) => c.resources || []);

    res.json({ level: { ...(level as any).toJSON(), resources } });
  } catch (error) {
    console.error('Erreur GET /api/levels/:id', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/levels/:id/resources - Créer une ressource pour un niveau (trouve/crée un cours automatiquement)
router.post(
  '/:id/resources',
  authenticate,
  isTeacher,
  [
    body('title').isString().notEmpty().withMessage('Le titre est requis'),
    body('description').optional().isString(),
    body('fileUrl').isString().notEmpty().withMessage('L\'URL du fichier est requise'),
    body('fileType').isString().notEmpty().withMessage('Le type de fichier est requis'),
    body('category').isIn(['notes', 'exercices', 'examen', 'audio']).withMessage('Catégorie invalide'),
    body('isVisible').optional().isBoolean()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Données invalides', details: errors.array() });

      const levelId = parseInt(req.params.id, 10);

      const level = await Level.findByPk(levelId);
      if (!level) return res.status(404).json({ error: 'Niveau non trouvé' });

      // Trouver ou créer un cours pour ce niveau
      let course = await Course.findOne({ where: { levelId, teacherId: req.userId } });
      if (!course) {
        course = await Course.create({
          title: (level as any).name,
          description: `Cours pour ${(level as any).name}`,
          levelId,
          teacherId: req.userId!,
          status: 'published'
        });
      }

      const { title, description, fileUrl, fileType, category, isVisible } = req.body;
      const resource = await Resource.create({
        courseId: (course as any).id,
        title,
        description,
        fileUrl,
        fileType,
        category,
        isVisible: isVisible !== undefined ? isVisible : true
      });

      res.status(201).json({ message: 'Ressource créée', resource });
    } catch (error: any) {
      console.error('Erreur POST /api/levels/:id/resources', error);
      res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
  }
);

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
