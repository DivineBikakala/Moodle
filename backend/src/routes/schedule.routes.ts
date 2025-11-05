import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Schedule } from '../models';
import { authenticate, isTeacher } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/schedules - Récupérer tous les horaires du professeur
router.get('/', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.id;

    const schedules = await Schedule.findAll({
      where: { teacherId },
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });

    res.json({ schedules });
  } catch (error) {
    console.error('Erreur lors de la récupération des horaires:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/schedules/:id - Récupérer un horaire spécifique
router.get('/:id', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const teacherId = req.user!.id;

    const schedule = await Schedule.findOne({
      where: { id, teacherId }
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Horaire non trouvé' });
    }

    res.json({ schedule });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'horaire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/schedules - Créer un nouvel horaire
router.post(
  '/',
  authenticate,
  isTeacher,
  [
    body('title').trim().notEmpty().withMessage('Le titre est requis'),
    body('description').optional().trim(),
    body('date').isDate().withMessage('Date invalide'),
    body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure de début invalide (format HH:MM)'),
    body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure de fin invalide (format HH:MM)'),
    body('location').optional().trim()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const teacherId = req.user!.id;
      const { title, description, date, startTime, endTime, location } = req.body;

      const schedule = await Schedule.create({
        teacherId,
        title,
        description,
        date,
        startTime,
        endTime,
        location
      });

      res.status(201).json({
        message: 'Horaire créé avec succès',
        schedule
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'horaire:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// PUT /api/schedules/:id - Modifier un horaire
router.put(
  '/:id',
  authenticate,
  isTeacher,
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('date').optional().isDate().withMessage('Date invalide'),
    body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure de début invalide (format HH:MM)'),
    body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure de fin invalide (format HH:MM)'),
    body('location').optional().trim()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const teacherId = req.user!.id;
      const { title, description, date, startTime, endTime, location } = req.body;

      const schedule = await Schedule.findOne({
        where: { id, teacherId }
      });

      if (!schedule) {
        return res.status(404).json({ error: 'Horaire non trouvé' });
      }

      await schedule.update({
        title: title || schedule.title,
        description: description !== undefined ? description : schedule.description,
        date: date || schedule.date,
        startTime: startTime || schedule.startTime,
        endTime: endTime || schedule.endTime,
        location: location !== undefined ? location : schedule.location
      });

      res.json({
        message: 'Horaire mis à jour avec succès',
        schedule
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'horaire:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// DELETE /api/schedules/:id - Supprimer un horaire
router.delete('/:id', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const teacherId = req.user!.id;

    const schedule = await Schedule.findOne({
      where: { id, teacherId }
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Horaire non trouvé' });
    }

    await schedule.destroy();

    res.json({ message: 'Horaire supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'horaire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

