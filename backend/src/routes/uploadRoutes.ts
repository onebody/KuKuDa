import { Router, Request, Response } from 'express';
import multer from 'multer';
import { ensureBucket, uploadFile, deleteFile } from '../services/minioService';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Configure multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allow images and files
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

/**
 * Initialize MinIO bucket on startup
 */
ensureBucket().catch((err) => {
  console.error('❌ Failed to ensure MinIO bucket:', err);
});

/**
 * POST /api/upload/single
 * Upload single file
 */
router.post(
  '/single',
  authenticateToken,
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          code: 400,
          message: 'No file uploaded',
          data: null,
        });
      }

      const fileUrl = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      res.json({
        code: 200,
        message: 'File uploaded successfully',
        data: {
          fileName: req.file.originalname,
          fileUrl: fileUrl,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
        },
      });
    } catch (error: any) {
      console.error('❌ Error uploading file:', error);
      res.status(500).json({
        code: 500,
        message: error.message || 'Failed to upload file',
        data: null,
      });
    }
  }
);

/**
 * POST /api/upload/batch
 * Upload multiple files
 */
router.post(
  '/batch',
  authenticateToken,
  upload.array('files', 20), // Max 20 files
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          code: 400,
          message: 'No files uploaded',
          data: null,
        });
      }

      const uploadPromises = files.map((file) =>
        uploadFile(file.buffer, file.originalname, file.mimetype)
      );

      const fileUrls = await Promise.all(uploadPromises);

      const uploadedFiles = files.map((file, index) => ({
        fileName: file.originalname,
        fileUrl: fileUrls[index],
        fileSize: file.size,
        mimeType: file.mimetype,
      }));

      res.json({
        code: 200,
        message: `${files.length} files uploaded successfully`,
        data: uploadedFiles,
      });
    } catch (error: any) {
      console.error('❌ Error uploading files:', error);
      res.status(500).json({
        code: 500,
        message: error.message || 'Failed to upload files',
        data: null,
      });
    }
  }
);

/**
 * DELETE /api/upload
 * Delete file by URL
 */
router.delete(
  '/',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { fileUrl } = req.body;

      if (!fileUrl) {
        return res.status(400).json({
          code: 400,
          message: 'File URL is required',
          data: null,
        });
      }

      await deleteFile(fileUrl);

      res.json({
        code: 200,
        message: 'File deleted successfully',
        data: null,
      });
    } catch (error: any) {
      console.error('❌ Error deleting file:', error);
      res.status(500).json({
        code: 500,
        message: error.message || 'Failed to delete file',
        data: null,
      });
    }
  }
);

export default router;
