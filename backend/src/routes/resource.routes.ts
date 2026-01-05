import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Resource, Level, User } from '../models';
import { authenticate, isTeacher } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/levels/:id/resources - Lister les ressources d'un niveau
router.get('/levels/:id/resources', authenticate, async (req: Request, res: Response) => {
  try {
    const levelId = parseInt(req.params.id, 10);
    const resources = await Resource.findAll({ where: { levelId } });
    res.json({ resources });
  } catch (error: any) {
    console.error('Erreur GET /api/levels/:id/resources', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// POST /api/levels/:id/resources - Créer une ressource pour un niveau (teacher)
router.post(
  '/levels/:id/resources',
  authenticate,
  isTeacher,
  [
    body('title').isString().notEmpty(),
    body('description').optional().isString(),
    body('fileUrl').isString().notEmpty(),
    body('fileType').isString().notEmpty(),
    body('category').isIn(['notes','exercices','examen','audio']).optional(),
    body('isVisible').optional().isBoolean()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const levelId = parseInt(req.params.id, 10);
      const level = await Level.findByPk(levelId);
      if (!level) return res.status(404).json({ error: 'Niveau non trouvé' });

      const { title, description, fileUrl, fileType, category, isVisible } = req.body;

      const resource = await Resource.create({
        levelId,
        title,
        description,
        fileUrl,
        fileType,
        category: category || 'notes',
        isVisible: isVisible !== undefined ? isVisible : true
      });

      res.status(201).json({ message: 'Ressource créée', resource });
    } catch (error: any) {
      console.error('Erreur POST /api/levels/:id/resources', error);
      res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
  }
);

// PATCH /api/resources/:id - Mettre à jour la visibilité ou autres champs (teacher)
router.patch('/resources/:id', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const resource = await Resource.findByPk(id);
    if (!resource) return res.status(404).json({ error: 'Ressource non trouvée' });

    const { isVisible, title, description } = req.body;
    if (isVisible !== undefined) resource.isVisible = !!isVisible;
    if (title !== undefined) resource.title = title;
    if (description !== undefined) resource.description = description;

    await resource.save();
    res.json({ message: 'Ressource mise à jour', resource });
  } catch (error: any) {
    console.error('Erreur PATCH /api/resources/:id', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// DELETE /api/resources/:id - Supprimer une ressource (teacher)
router.delete('/resources/:id', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const resource = await Resource.findByPk(id);
    if (!resource) return res.status(404).json({ error: 'Ressource non trouvée' });

    await resource.destroy();
    res.json({ message: 'Ressource supprimée' });
  } catch (error: any) {
    console.error('Erreur DELETE /api/resources/:id', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// GET /api/my/resources - Ressources disponibles pour l'étudiant connecté
router.get('/my/resources', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    if (user.role !== 'student') return res.status(403).json({ error: 'Seuls les étudiants peuvent accéder à cette route' });

    const levelId = user.levelId;
    if (levelId === undefined || levelId === null) return res.status(400).json({ error: 'Niveau de l\'étudiant non défini' });

    const resources = await Resource.findAll({ where: { levelId, isVisible: true } });
    res.json({ resources });
  } catch (error: any) {
    console.error('Erreur GET /api/my/resources', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

export default router;
