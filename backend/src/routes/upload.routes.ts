import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { Course, CourseResource } from '../models';
import { authenticate, isTeacher } from '../middlewares/auth.middleware';
import { uploadToS3, getSignedDownloadUrl, deleteFileFromS3, extractS3KeyFromUrl } from '../config/s3';

const router = Router();

// POST /api/courses/:id/upload - Upload un fichier vers S3 et créer une ressource
router.post(
  '/:id/upload',
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

      const courseId = parseInt(req.params.id, 10);
      const { title, description, levelId, category, isVisible } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Le titre est requis' });
      }

      // Vérifier que le cours existe et appartient au teacher
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Cours non trouvé' });
      }
      if (course.teacherId !== req.userId) {
        return res.status(403).json({ error: 'Vous ne pouvez pas ajouter de ressource à ce cours' });
      }

      // Créer la ressource avec les infos du fichier uploadé
      const fileInfo = req.file as any; // multer-s3 ajoute des propriétés spécifiques
      const resource = await CourseResource.create({
        courseId,
        levelId: levelId ? parseInt(levelId, 10) : undefined,
        title,
        description: description || '',
        fileUrl: fileInfo.location || fileInfo.key, // URL S3 ou clé
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
      console.error('Erreur POST /api/courses/:id/upload', error);
      res.status(500).json({ error: 'Erreur lors de l\'upload', details: error.message });
    }
  }
);

// GET /api/resources/:id/download - Obtenir une URL signée pour télécharger un fichier
router.get('/resources/:id/download', authenticate, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const resource = await CourseResource.findByPk(id);

    if (!resource) {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }

    // Générer une URL signée pour télécharger le fichier
    const fileKey = extractS3KeyFromUrl(resource.fileUrl);
    const signedUrl = await getSignedDownloadUrl(fileKey);

    res.json({
      resource: {
        id: resource.id,
        title: resource.title,
        fileType: resource.fileType
      },
      downloadUrl: signedUrl,
      expiresIn: 3600 // secondes
    });
  } catch (error: any) {
    console.error('Erreur GET /api/resources/:id/download', error);
    res.status(500).json({ error: 'Erreur lors de la génération du lien', details: error.message });
  }
});

// DELETE /api/resources/:id/file - Supprimer une ressource et son fichier S3
router.delete('/resources/:id/file', authenticate, isTeacher, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const resource = await CourseResource.findByPk(id);

    if (!resource) {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }

    // Vérifier que le teacher est propriétaire du cours
    const course = await Course.findByPk(resource.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Cours parent non trouvé' });
    }
    if (course.teacherId !== req.userId) {
      return res.status(403).json({ error: 'Vous ne pouvez pas supprimer cette ressource' });
    }

    // Supprimer le fichier de S3
    try {
      const fileKey = extractS3KeyFromUrl(resource.fileUrl);
      await deleteFileFromS3(fileKey);
    } catch (s3Error) {
      console.warn('Erreur lors de la suppression du fichier S3:', s3Error);
      // Continuer même si la suppression S3 échoue (fichier peut déjà être supprimé)
    }

    // Supprimer la ressource de la base de données
    await resource.destroy();

    res.json({ message: 'Ressource et fichier supprimés' });
  } catch (error: any) {
    console.error('Erreur DELETE /api/resources/:id/file', error);
    res.status(500).json({ error: 'Erreur lors de la suppression', details: error.message });
  }
});

export const uploadRoutes = router;

