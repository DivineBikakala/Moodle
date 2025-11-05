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
    const { email, password, firstName, lastName, role } = req.body;

    // Validation des champs
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Tous les champs sont requis',
        required: ['email', 'password', 'firstName', 'lastName']
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Validation du rôle
    const userRole = role === 'teacher' ? 'teacher' : 'student';

    // Créer l'utilisateur (le mot de passe sera hashé automatiquement)
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: userRole
    });

    // Générer le token JWT
    const token = generateToken(user);

    // Retourner l'utilisateur (sans le mot de passe) et le token
    res.status(201).json({
      message: 'Inscription réussie',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
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
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
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
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
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
