import { Router, Request, Response } from 'express';
import { Course, User } from '../models';
import { authenticate, isTeacher } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/courses - Lister tous les cours
router.get('/', async (_req: Request, res: Response) => {
  try {
    const courses = await Course.findAll({
      include: [{ model: User, as: 'teacher', attributes: ['id', 'email', 'firstName', 'lastName'] }]
    });
    res.json({ courses });
  } catch (error: any) {
    console.error('Erreur GET /api/courses', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// GET /api/courses/:id - Obtenir les détails d'un cours
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const course = await Course.findByPk(id, {
      include: [{ model: User, as: 'teacher', attributes: ['id', 'email', 'firstName', 'lastName'] }]
    });
    if (!course) return res.status(404).json({ error: 'Cours non trouvé' });
    res.json({ course });
  } catch (error: any) {
    console.error('Erreur GET /api/courses/:id', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// POST /api/courses - Créer un cours (teacher uniquement)
router.post('/', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const { title, description, levelId, status, isPublished } = req.body;

    console.log('Données reçues pour créer un cours:', { title, description, levelId, status, isPublished });

    if (!title || !description) {
      return res.status(400).json({ error: 'title et description sont requis' });
    }

    const teacherId = req.userId!;

    let courseStatus = status;
    if (isPublished !== undefined && !status) {
      courseStatus = isPublished ? 'published' : 'draft';
    }

    const courseData = {
      title,
      description,
      teacherId,
      levelId: levelId || null,
      status: courseStatus || 'draft'
    };

    console.log('Tentative de création de cours avec:', courseData);

    const course = await Course.create(courseData);

    console.log('Cours créé avec succès:', course.toJSON());
    res.status(201).json({ message: 'Cours créé', course });
  } catch (error: any) {
    console.error('❌ Erreur POST /api/courses:', error.message);
    console.error('Détails de l\'erreur:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

router.put('/:id', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description, levelId, status, isPublished } = req.body;
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    if (course.teacherId !== req.userId) {
      return res.status(403).json({ error: 'Vous ne pouvez modifier que vos propres cours' });
    }

    course.title = title ?? course.title;
    course.description = description ?? course.description;

    if (levelId !== undefined) {
      course.levelId = levelId;
    }

    if (isPublished !== undefined && !status) {
      course.status = isPublished ? 'published' : 'draft';
    } else if (status) {
      course.status = status;
    }

    await course.save();
    res.json({ message: 'Cours mis à jour', course });
  } catch (error: any) {
    console.error('Erreur PUT /api/courses/:id', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});
// DELETE /api/courses/:id - Supprimer un cours (teacher uniquement, ses propres cours)
router.delete('/:id', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    // Vérifier que le prof supprime bien son propre cours
    if (course.teacherId !== req.userId) {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres cours' });
    }

    await course.destroy();
    res.json({ message: 'Cours supprimé' });
  } catch (error: any) {
    console.error('Erreur DELETE /api/courses/:id', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

export default router;

