import { Router, Request, Response } from 'express';
import * as ev from 'express-validator';
import { Course, User, Enrollment } from '../models';
import { authenticate, isTeacher, isStudent } from '../middlewares/auth.middleware';

const body = ev.body;
const validationResult = ev.validationResult;

const router = Router();

// GET /api/courses - Liste des cours
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const where: any = {};

    // Les enseignants voient leurs cours; les étudiants voient les cours publiés.
    if (req.userRole === 'teacher') {
      where.teacherId = req.userId;
    } else {
      where.status = 'published';
    }

    const levelId = req.query.levelId ? parseInt(String(req.query.levelId), 10) : null;
    if (levelId && !Number.isNaN(levelId)) {
      where.levelId = levelId;
    }

    const courses = await Course.findAll({
      where,
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ courses });
  } catch (error: any) {
    console.error('Erreur GET /api/courses', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// POST /api/courses - Créer un cours (teacher)
router.post(
  '/',
  authenticate,
  isTeacher,
  [
    body('title').isString().notEmpty().withMessage('Le titre est requis'),
    body('description').optional().isString(),
    body('levelId').optional({ nullable: true }).isInt().withMessage('levelId invalide'),
    body('isPublished').optional().isBoolean(),
    body('status').optional().isIn(['draft', 'published', 'archived'])
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Données invalides', details: errors.array() });

      const { title, description, levelId, isPublished, status } = req.body as any;
      const resolvedStatus = status || (isPublished ? 'published' : 'draft');

      const course = await Course.create({
        title,
        description,
        levelId: levelId ?? null,
        teacherId: req.userId!,
        status: resolvedStatus
      });

      res.status(201).json({ message: 'Cours créé', course });
    } catch (error: any) {
      console.error('Erreur POST /api/courses', error);
      res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
  }
);

// PUT /api/courses/:id - Mettre à jour un cours (teacher propriétaire)
router.put('/:id', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ error: 'Cours non trouvé' });
    if (course.teacherId !== req.userId) return res.status(403).json({ error: 'Non autorisé' });

    const { title, description, levelId, isPublished, status } = req.body as any;
    const resolvedStatus = status || (isPublished !== undefined ? (isPublished ? 'published' : 'draft') : course.status);

    await course.update({
      title: title ?? course.title,
      description: description ?? course.description,
      levelId: levelId !== undefined ? levelId : course.levelId,
      status: resolvedStatus
    });

    res.json({ message: 'Cours mis à jour', course });
  } catch (error: any) {
    console.error('Erreur PUT /api/courses/:id', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// DELETE /api/courses/:id - Supprimer un cours (teacher propriétaire)
router.delete('/:id', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ error: 'Cours non trouvé' });
    if (course.teacherId !== req.userId) return res.status(403).json({ error: 'Non autorisé' });

    await course.destroy();
    res.json({ message: 'Cours supprimé' });
  } catch (error: any) {
    console.error('Erreur DELETE /api/courses/:id', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// POST /api/courses/:id/enroll - Inscrire l'étudiant connecté
router.post('/:id/enroll', authenticate, isStudent, async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const studentId = req.userId!;

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ error: 'Cours non trouvé' });
    if (course.status !== 'published') return res.status(403).json({ error: 'Ce cours n\'est pas publié' });

    const [enrollment, created] = await Enrollment.findOrCreate({
      where: { courseId, studentId },
      defaults: { courseId, studentId, enrolledAt: new Date() }
    });

    if (!created) {
      return res.status(200).json({ message: 'Déjà inscrit', enrollment });
    }

    res.status(201).json({ message: 'Inscription réussie', enrollment });
  } catch (error: any) {
    console.error('Erreur POST /api/courses/:id/enroll', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

export default router;
