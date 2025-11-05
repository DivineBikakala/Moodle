import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';

// Configuration du client S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const bucketName = process.env.AWS_S3_BUCKET_NAME || 'moodle-resources';

// Configuration Multer pour l'upload vers S3
export const uploadToS3 = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: bucketName,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const filename = `resources/${uniqueSuffix}${ext}`;
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max
  },
  fileFilter: (req, file, cb) => {
    // Autoriser tous les types de fichiers communs pour l'éducation
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/mpeg',
      'text/plain',
      'application/zip'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// Générer une URL signée pour télécharger un fichier (valide 1 heure)
export async function getSignedDownloadUrl(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileKey
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
}

// Supprimer un fichier de S3
export async function deleteFileFromS3(fileKey: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fileKey
  });

  await s3Client.send(command);
}

// Extraire la clé S3 depuis une URL complète
export function extractS3KeyFromUrl(url: string): string {
  // Format: https://bucket.s3.region.amazonaws.com/key
  // ou: https://s3.region.amazonaws.com/bucket/key
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(p => p);
    // Si le bucket est dans le hostname
    if (urlObj.hostname.includes(bucketName)) {
      return pathParts.join('/');
    }
    // Si le bucket est dans le path
    return pathParts.slice(1).join('/');
  } catch {
    // Si ce n'est pas une URL, supposer que c'est déjà une clé
    return url;
  }
}

export { s3Client, bucketName };

