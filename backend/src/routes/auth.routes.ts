import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

const router = Router();

// Interface pour le payload JWT
interface JWTPayload {
  id: number;
  email: string;
  role: 'teacher' | 'student';
}

// Fonction pour générer un token JWT
const generateToken = (user: User): string => {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'default_secret_change_in_production',
    { expiresIn: '7d' } // Token valide 7 jours
  );
};

// POST /api/auth/register - Inscription
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password, firstName, lastName, role, phone, levelId, level } = req.body;

    // Compatibilité: accepter `level` ou `levelId`
    const resolvedLevelId = levelId ?? level ?? null;

    // Validation des champs
    if (!email || !username || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Tous les champs sont requis',
        required: ['email', 'username', 'password', 'firstName', 'lastName']
      });
    }

    // Si role est student, levelId est requis
    const userRole = role === 'teacher' ? 'teacher' : 'student';
    if (userRole === 'student' && (resolvedLevelId === null || resolvedLevelId === undefined)) {
      return res.status(400).json({ error: 'levelId est requis pour les étudiants' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Vérifier si le username existe déjà
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({
        error: 'Ce nom d\'utilisateur est déjà utilisé'
      });
    }

    // Créer l'utilisateur (le mot de passe sera hashé automatiquement)
    const user = await User.create({
      email,
      username,
      password,
      firstName,
      lastName,
      phone: phone || null,
      role: userRole,
      levelId: resolvedLevelId
    });

    // Générer le token JWT
    const token = generateToken(user);

    // Retourner l'utilisateur (sans le mot de passe) et le token
    res.status(201).json({
      message: 'Inscription réussie',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        levelId: user.levelId,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'inscription',
      details: error.message
    });
  }
});

// POST /api/auth/login - Connexion
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation des champs
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email et mot de passe requis'
      });
    }

    // Rechercher l'utilisateur par email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token JWT
    const token = generateToken(user);

    // Retourner l'utilisateur et le token
    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        levelId: user.levelId
      },
      token
    });
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      error: 'Erreur lors de la connexion',
      details: error.message
    });
  }
});

// GET /api/auth/me - Obtenir le profil de l'utilisateur connecté
router.get('/me', async (req: Request, res: Response) => {
  try {
    // Extraire le token du header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token manquant ou invalide'
      });
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier et décoder le token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret_change_in_production'
    ) as JWTPayload;

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] } // Exclure le mot de passe
    });

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        levelId: user.levelId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token invalide'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expiré'
      });
    }

    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      details: error.message
    });
  }
});

export default router;
