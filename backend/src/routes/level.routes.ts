import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Level, CourseResource } from '../models';
import { authenticate, isTeacher } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/levels - Récupérer tous les niveaux
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const levels = await Level.findAll({
      order: [['order', 'ASC']]
    });

    res.json({ levels });
  } catch (error) {
    console.error('Erreur lors de la récupération des niveaux:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/levels/:id - Récupérer un niveau avec ses ressources
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const level = await Level.findByPk(id, {
      include: [
        {
          model: CourseResource,
          as: 'resources'
        }
      ]
    });

    if (!level) {
      return res.status(404).json({ error: 'Niveau non trouvé' });
    }

    res.json({ level });
  } catch (error) {
    console.error('Erreur lors de la récupération du niveau:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/levels - Créer un nouveau niveau (professeur uniquement)
router.post(
  '/',
  authenticate,
  isTeacher,
  [
    body('name').trim().notEmpty().withMessage('Le nom du niveau est requis'),
    body('description').optional().trim(),
    body('order').optional().isInt().withMessage('L\'ordre doit être un nombre')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, order } = req.body;

      // Si order n'est pas fourni, utiliser le prochain ordre disponible
      let levelOrder = order;
      if (levelOrder === undefined) {
        const maxLevel = await Level.findOne({
          order: [['order', 'DESC']]
        });
        levelOrder = maxLevel ? maxLevel.order + 1 : 0;
      }

      const level = await Level.create({
        name,
        description,
        order: levelOrder
      });

      res.status(201).json({
        message: 'Niveau créé avec succès',
        level
      });
    } catch (error) {
      console.error('Erreur lors de la création du niveau:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// PUT /api/levels/:id - Modifier un niveau (professeur uniquement)
router.put(
  '/:id',
  authenticate,
  isTeacher,
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('order').optional().isInt().withMessage('L\'ordre doit être un nombre')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { name, description, order } = req.body;

      const level = await Level.findByPk(id);

      if (!level) {
        return res.status(404).json({ error: 'Niveau non trouvé' });
      }

      await level.update({
        name: name || level.name,
        description: description !== undefined ? description : level.description,
        order: order !== undefined ? order : level.order
      });

      res.json({
        message: 'Niveau mis à jour avec succès',
        level
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du niveau:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// DELETE /api/levels/:id - Supprimer un niveau (professeur uniquement)
router.delete('/:id', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const level = await Level.findByPk(id);

    if (!level) {
      return res.status(404).json({ error: 'Niveau non trouvé' });
    }

    await level.destroy();

    res.json({ message: 'Niveau supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du niveau:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

