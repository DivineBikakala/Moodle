import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models';
import { authenticate, isTeacher } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/students - Récupérer tous les étudiants (professeur uniquement)
router.get('/', authenticate, isTeacher, async (_req: Request, res: Response) => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json({ students });
  } catch (error) {
    console.error('Erreur GET /api/students', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/students/:id - Récupérer un étudiant par ID (professeur uniquement)
router.get('/:id', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const student = await User.findOne({ where: { id, role: 'student' }, attributes: { exclude: ['password'] } });
    if (!student) return res.status(404).json({ error: 'Étudiant non trouvé' });
    res.json({ student });
  } catch (error) {
    console.error('Erreur GET /api/students/:id', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/students - Créer un nouvel étudiant (professeur uniquement)
router.post(
  '/',
  authenticate,
  isTeacher,
  [
    body('username').trim().notEmpty().withMessage("Le nom d'utilisateur est requis"),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
    body('lastName').trim().notEmpty().withMessage('Le nom est requis'),
    body('phone').optional().trim(),
    body('levelId').isInt().withMessage('Le niveau (levelId) est requis et doit être un nombre')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Erreur de validation', details: errors.array() });

      const { username, email, password, firstName, lastName, phone, levelId } = req.body as any;

      // Vérifier unicité email et username
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) return res.status(400).json({ error: 'Cet email est déjà utilisé' });

      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) return res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà utilisé' });

      const student = await User.create({
        username,
        email,
        password,
        firstName,
        lastName,
        phone: phone ?? null,
        levelId: levelId ?? 0,
        role: 'student'
      });

      const studentData = student.toJSON();
      delete (studentData as any).password;

      res.status(201).json({ message: 'Étudiant créé avec succès', student: studentData });
    } catch (error) {
      console.error('Erreur POST /api/students', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// PUT /api/students/:id - Modifier un étudiant (professeur uniquement)
router.put(
  '/:id',
  authenticate,
  isTeacher,
  [
    body('username').optional().trim().notEmpty(),
    body('email').optional().isEmail().withMessage('Email invalide'),
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('phone').optional().trim(),
    body('levelId').optional().isInt().withMessage('Le niveau doit être un nombre')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const id = parseInt(req.params.id, 10);
      const { username, email, firstName, lastName, phone, levelId } = req.body as any;

      const student = await User.findOne({ where: { id, role: 'student' } });
      if (!student) return res.status(404).json({ error: 'Étudiant non trouvé' });

      if (email && email !== student.email) {
        const e = await User.findOne({ where: { email } });
        if (e) return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }

      if (username && username !== student.username) {
        const u = await User.findOne({ where: { username } });
        if (u) return res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà utilisé' });
      }

      await student.update({
        username: username ?? student.username,
        email: email ?? student.email,
        firstName: firstName ?? student.firstName,
        lastName: lastName ?? student.lastName,
        phone: phone !== undefined ? phone : student.phone,
        levelId: levelId !== undefined ? levelId : student.levelId
      });

      const studentData = student.toJSON();
      delete (studentData as any).password;

      res.json({ message: 'Étudiant mis à jour avec succès', student: studentData });
    } catch (error) {
      console.error('Erreur PUT /api/students/:id', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// DELETE /api/students/:id - Supprimer un étudiant (professeur uniquement)
router.delete('/:id', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const student = await User.findOne({ where: { id, role: 'student' } });
    if (!student) return res.status(404).json({ error: 'Étudiant non trouvé' });

    await student.destroy();
    res.json({ message: 'Étudiant supprimé avec succès' });
  } catch (error) {
    console.error('Erreur DELETE /api/students/:id', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

