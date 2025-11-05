import { Router, Request, Response } from 'express';
import { param, validationResult } from 'express-validator';
import { Course, Enrollment } from '../models';
import { authenticate, isStudent } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/courses/:id/enroll - S'inscrire à un cours (student)
router.post(
  '/courses/:id/enroll',
  authenticate,
  isStudent,
  [param('id').isInt().withMessage('ID du cours invalide')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const courseId = parseInt(req.params.id, 10);
      const studentId = req.userId!;

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ error: 'Cours non trouvé' });

    // Vérifier si déjà inscrit
    const existing = await Enrollment.findOne({ where: { courseId, studentId } });
    if (existing) return res.status(400).json({ error: 'Déjà inscrit' });

    const enrollment = await Enrollment.create({ courseId, studentId });
    res.status(201).json({ message: 'Inscription réussie', enrollment });
    } catch (error: any) {
      console.error('Erreur POST /api/courses/:id/enroll', error);
      res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
  }
);

// GET /api/my-courses - Récupérer les cours où l'utilisateur est inscrit (student)
router.get('/my-courses', authenticate, isStudent, async (req: Request, res: Response) => {
  try {
    const studentId = req.userId!;
    const enrollments = await Enrollment.findAll({ where: { studentId }, include: [{ model: Course, as: 'course' }] });
    const courses = enrollments.map(e => (e as any).course);
    res.json({ courses });
  } catch (error: any) {
    console.error('Erreur GET /api/my-courses', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// DELETE /api/courses/:id/unenroll - Se désinscrire d'un cours (student)
router.delete(
  '/courses/:id/unenroll',
  authenticate,
  isStudent,
  [param('id').isInt().withMessage('ID du cours invalide')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const courseId = parseInt(req.params.id, 10);
      const studentId = req.userId!;

    const enrollment = await Enrollment.findOne({ where: { courseId, studentId } });
    if (!enrollment) return res.status(404).json({ error: 'Inscription non trouvée' });

    await enrollment.destroy();
    res.json({ message: 'Vous avez été désinscrit du cours' });
    } catch (error: any) {
      console.error('Erreur DELETE /api/courses/:id/unenroll', error);
      res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
  }
);

export default router;
