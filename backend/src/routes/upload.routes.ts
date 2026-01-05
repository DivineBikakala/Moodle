import { Router, Request, Response } from 'express';
import { param, validationResult } from 'express-validator';
import { Level, Resource, User } from '../models';
import { authenticate, isTeacher } from '../middlewares/auth.middleware';
import { uploadToS3, getSignedDownloadUrl, deleteFileFromS3, extractS3KeyFromUrl } from '../config/s3';

const router = Router();

// POST /api/levels/:id/upload - Upload un fichier vers S3 et créer une ressource pour le niveau
router.post(
  '/levels/:id/upload',
  authenticate,
  isTeacher,
  [param('id').isInt()],
  uploadToS3.single('file'),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      const levelId = parseInt(req.params.id, 10);
      const { title, description, category, isVisible } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Le titre est requis' });
      }

      const level = await Level.findByPk(levelId);
      if (!level) return res.status(404).json({ error: 'Niveau non trouvé' });

      const fileInfo = req.file as any;
      const resource = await Resource.create({
        levelId,
        title,
        description: description || '',
        fileUrl: fileInfo.location || fileInfo.key,
        fileType: fileInfo.mimetype,
        category: category || 'notes',
        isVisible: isVisible === 'true' || isVisible === true
      });

      res.status(201).json({
        message: 'Fichier uploadé et ressource créée',
        resource,
        file: {
          originalName: fileInfo.originalname,
          size: fileInfo.size,
          mimetype: fileInfo.mimetype,
          key: fileInfo.key
        }
      });
    } catch (error: any) {
      console.error('Erreur POST /api/levels/:id/upload', error);
      res.status(500).json({ error: 'Erreur lors de l\'upload', details: error.message });
    }
  }
);

// GET /api/resources/:id/download - Obtenir une URL signée pour télécharger un fichier
router.get('/resources/:id/download', authenticate, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const resource = await Resource.findByPk(id);

    if (!resource) return res.status(404).json({ error: 'Ressource non trouvée' });

    // Si utilisateur étudiant, vérifier le niveau et la visibilité
    const userId = req.userId;
    if (userId) {
      const user = await User.findByPk(userId);
      if (user && user.role === 'student') {
        if (!resource.isVisible) return res.status(404).json({ error: 'Ressource non trouvée' });
        if (user.levelId !== resource.levelId) return res.status(403).json({ error: 'Accès refusé' });
      }
    }

    const fileKey = extractS3KeyFromUrl(resource.fileUrl);
    const signedUrl = await getSignedDownloadUrl(fileKey);

    res.json({
      resource: { id: resource.id, title: resource.title, fileType: resource.fileType },
      downloadUrl: signedUrl,
      expiresIn: 3600
    });
  } catch (error: any) {
    console.error('Erreur GET /api/resources/:id/download', error);
    res.status(500).json({ error: 'Erreur lors de la génération du lien', details: error.message });
  }
});

// DELETE /api/resources/:id/file - Supprimer une ressource et son fichier S3 (teacher)
router.delete('/resources/:id/file', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const resource = await Resource.findByPk(id);
    if (!resource) return res.status(404).json({ error: 'Ressource non trouvée' });

    try {
      const fileKey = extractS3KeyFromUrl(resource.fileUrl);
      await deleteFileFromS3(fileKey);
    } catch (s3Error) {
      console.warn('Erreur lors de la suppression du fichier S3:', s3Error);
    }

    await resource.destroy();
    res.json({ message: 'Ressource et fichier supprimés' });
  } catch (error: any) {
    console.error('Erreur DELETE /api/resources/:id/file', error);
    res.status(500).json({ error: 'Erreur lors de la suppression', details: error.message });
  }
});

export const uploadRoutes = router;
