import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

// Étendre l'interface Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: number;
      userRole?: 'teacher' | 'student';
    }
  }
}

// Interface pour le payload JWT
interface JWTPayload {
  id: number;
  email: string;
  role: 'teacher' | 'student';
}

/**
 * Middleware d'authentification
 * Vérifie le token JWT et charge l'utilisateur dans req.user
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extraire le token du header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Authentification requise',
        message: 'Aucun token fourni'
      });
      return;
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier et décoder le token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret_change_in_production'
    ) as JWTPayload;

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findByPk(decoded.id);

    if (!user) {
      res.status(401).json({
        error: 'Utilisateur non trouvé',
        message: 'Le token fait référence à un utilisateur inexistant'
      });
      return;
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        error: 'Token invalide',
        message: 'Le token fourni n\'est pas valide'
      });
      return;
    }

    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        error: 'Token expiré',
        message: 'Veuillez vous reconnecter'
      });
      return;
    }

    console.error('Erreur dans le middleware d\'authentification:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la vérification de l\'authentification'
    });
  }
};

/**
 * Middleware pour vérifier que l'utilisateur est un enseignant
 */
export const isTeacher = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentification requise'
    });
    return;
  }

  if (req.user.role !== 'teacher') {
    res.status(403).json({
      error: 'Accès refusé',
      message: 'Cette action est réservée aux enseignants'
    });
    return;
  }

  next();
};

/**
 * Middleware pour vérifier que l'utilisateur est un étudiant
 */
export const isStudent = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentification requise'
    });
    return;
  }

  if (req.user.role !== 'student') {
    res.status(403).json({
      error: 'Accès refusé',
      message: 'Cette action est réservée aux étudiants'
    });
    return;
  }

  next();
};

/**
 * Middleware optionnel : authentifier si un token est fourni
 * Permet d'avoir des routes qui fonctionnent avec ou sans authentification
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Pas de token, continuer sans authentification
      next();
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret_change_in_production'
    ) as JWTPayload;

    const user = await User.findByPk(decoded.id);

    if (user) {
      req.user = user;
      req.userId = user.id;
      req.userRole = user.role;
    }

    next();
  } catch (error) {
    // En cas d'erreur, continuer sans authentification
    next();
  }
};
