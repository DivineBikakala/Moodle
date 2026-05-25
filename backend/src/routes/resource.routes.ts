import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Resource, Course, User, Enrollment } from '../models';
import { authenticate, isTeacher } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/courses/:id/resources - Lister les ressources d'un cours
router.get('/courses/:id/resources', authenticate, async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id, 10);

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ error: 'Cours non trouvé' });

    const resources = await Resource.findAll({
      where: { courseId, isVisible: true },
      order: [['createdAt', 'DESC']]
    });

    res.json({ resources });
  } catch (error: any) {
    console.error('Erreur GET /api/courses/:id/resources', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// POST /api/courses/:id/resources - Créer une ressource pour un cours (teacher)
router.post(
    '/courses/:id/resources',
    authenticate,
    isTeacher,
    [
      body('title').isString().notEmpty().withMessage('Le titre est requis'),
      body('description').optional().isString(),
      body('fileUrl').isString().notEmpty().withMessage('L\'URL du fichier est requise'),
      body('fileType').isString().notEmpty().withMessage('Le type de fichier est requis'),
      body('category').isIn(['notes','exercices','examen','audio']).withMessage('Catégorie invalide'),
      body('isVisible').optional().isBoolean()
    ],
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const courseId = parseInt(req.params.id, 10);

        const course = await Course.findByPk(courseId);
        if (!course) return res.status(404).json({ error: 'Cours non trouvé' });

        if (course.teacherId !== req.userId) {
          return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à ajouter des ressources à ce cours' });
        }

        const { title, description, fileUrl, fileType, category, isVisible } = req.body;

        const resource = await Resource.create({
          courseId,
          title,
          description,
          fileUrl,
          fileType,
          category: category || 'notes',
          isVisible: isVisible !== undefined ? isVisible : true
        });

        res.status(201).json({ message: 'Ressource créée', resource });
      } catch (error: any) {
        console.error('Erreur POST /api/courses/:id/resources', error);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
      }
    }
);

// PATCH /api/resources/:id - Mettre à jour une ressource (teacher)
router.patch('/resources/:id', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const resource = await Resource.findByPk(id);
    if (!resource) return res.status(404).json({ error: 'Ressource non trouvée' });

    const course = await Course.findByPk(resource.courseId ?? undefined);
    if (!course || course.teacherId !== req.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

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

    const course = await Course.findByPk(resource.courseId ?? undefined);
    if (!course || course.teacherId !== req.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

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

    const enrollments = await Enrollment.findAll({
      where: { studentId: userId },
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title']
      }]
    });

    const courseIds = enrollments.map(e => e.courseId);

    const resources = await Resource.findAll({
      where: {
        courseId: courseIds,
        isVisible: true
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({ resources });
  } catch (error: any) {
    console.error('Erreur GET /api/my/resources', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

export default router;
