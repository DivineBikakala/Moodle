import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Course, CourseResource } from '../models';
import { authenticate, isTeacher } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/courses/:id/resources - Ajouter une ressource (teacher)
router.post(
  '/:id/resources',
  authenticate,
  isTeacher,
  [
    body('title').isString().notEmpty(),
    body('description').optional().isString(),
    body('fileUrl').isString().notEmpty(),
    body('fileType').isString().notEmpty(),
    body('category').optional().isString(),
    body('isVisible').optional().isBoolean()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const courseId = parseInt(req.params.id, 10);
      const { title, description, fileUrl, fileType, category, isVisible } = req.body;

      // Vérifier que le cours existe et appartient au teacher
      const course = await Course.findByPk(courseId);
      if (!course) return res.status(404).json({ error: 'Cours non trouvé' });
      if (course.teacherId !== req.userId && req.userRole !== 'teacher') {
        return res.status(403).json({ error: 'Vous ne pouvez pas ajouter de ressource à ce cours' });
      }

      const resource = await CourseResource.create({
        courseId,
        title,
        description,
        fileUrl,
        fileType,
        category: category || 'general',
        isVisible: isVisible !== undefined ? isVisible : true
      });

      res.status(201).json({ message: 'Ressource créée', resource });
    } catch (error: any) {
      console.error('Erreur POST /api/courses/:id/resources', error);
      res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
  }
);

// GET /api/courses/:id/resources - Lister les ressources d'un cours (public ou auth optional)
router.get('/:id/resources', async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const resources = await CourseResource.findAll({ where: { courseId } });
    res.json({ resources });
  } catch (error: any) {
    console.error('Erreur GET /api/courses/:id/resources', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// DELETE /api/resources/:id - Supprimer une ressource (teacher)
router.delete('/resources/:id', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const resource = await CourseResource.findByPk(id);
    if (!resource) return res.status(404).json({ error: 'Ressource non trouvée' });

    // Vérifier que le teacher est propriétaire du cours
    const course = await Course.findByPk(resource.courseId);
    if (!course) return res.status(404).json({ error: 'Cours parent non trouvé' });
    if (course.teacherId !== req.userId) {
      return res.status(403).json({ error: 'Vous ne pouvez pas supprimer cette ressource' });
    }

    await resource.destroy();
    res.json({ message: 'Ressource supprimée' });
  } catch (error: any) {
    console.error('Erreur DELETE /api/resources/:id', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Assurer qu'il n'y a qu'un export nommé (index.ts importe resourceRoutes)
export const resourceRoutes = router;
