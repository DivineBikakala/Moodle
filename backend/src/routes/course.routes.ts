import { Router, Request, Response } from 'express';
import { Course, User } from '../models';

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

// POST /api/courses - Créer un cours (teacher)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, teacherId, isPublished } = req.body;
    if (!title || !description || !teacherId) {
      return res.status(400).json({ error: 'title, description et teacherId sont requis' });
    }

    const teacher = await User.findByPk(teacherId);
    if (!teacher) return res.status(400).json({ error: 'Teacher non trouvé' });

    const course = await Course.create({ title, description, teacherId, isPublished: !!isPublished });
    res.status(201).json({ message: 'Cours créé', course });
  } catch (error: any) {
    console.error('Erreur POST /api/courses', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// PUT /api/courses/:id - Modifier un cours
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description, isPublished } = req.body;
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ error: 'Cours non trouvé' });

    course.title = title ?? course.title;
    course.description = description ?? course.description;
    course.isPublished = typeof isPublished === 'boolean' ? isPublished : course.isPublished;

    await course.save();
    res.json({ message: 'Cours mis à jour', course });
  } catch (error: any) {
    console.error('Erreur PUT /api/courses/:id', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// DELETE /api/courses/:id - Supprimer un cours
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ error: 'Cours non trouvé' });

    await course.destroy();
    res.json({ message: 'Cours supprimé' });
  } catch (error: any) {
    console.error('Erreur DELETE /api/courses/:id', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

export default router;

