import * as Minio from 'minio';
import dotenv from 'dotenv';

dotenv.config();

// MinIO configuration
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const bucketName = process.env.MINIO_BUCKET || 'workflow-files';

/**
 * Ensure bucket exists (create if not exists)
 */
export const ensureBucket = async (): Promise<void> => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✅ Created bucket: ${bucketName}`);
      
      // Set bucket policy to allow public read (optional, for file access)
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    } else {
      console.log(`✅ Bucket already exists: ${bucketName}`);
    }
  } catch (error) {
    console.error('❌ Error ensuring bucket exists:', error);
    throw error;
  }
};

/**
 * Upload file to MinIO
 * @param fileBuffer - File buffer
 * @param fileName - File name (will be used as object name)
 * @param mimeType - MIME type
 * @returns Promise<string> - File URL
 */
export const uploadFile = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> => {
  try {
    // Generate unique object name to avoid collisions
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = fileName.split('.').pop();
    const objectName = `${timestamp}-${randomStr}.${extension}`;

    // Upload file
    await minioClient.putObject(bucketName, objectName, fileBuffer, fileBuffer.length, {
      'Content-Type': mimeType,
    });

    // Generate file URL
    const fileUrl = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${
      process.env.MINIO_PORT || '9000'
    }/${bucketName}/${objectName}`;

    console.log(`✅ File uploaded: ${objectName}`);
    return fileUrl;
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete file from MinIO
 * @param fileUrl - File URL
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    // Extract object name from URL
    const urlParts = fileUrl.split('/');
    const objectName = urlParts[urlParts.length - 1];

    await minioClient.removeObject(bucketName, objectName);
    console.log(`✅ File deleted: ${objectName}`);
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    throw error;
  }
};

/**
 * Get file URL (for downloading)
 * @param objectName - Object name in MinIO
 * @returns File URL
 */
export const getFileUrl = (objectName: string): string => {
  return `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${
    process.env.MINIO_PORT || '9000'
  }/${bucketName}/${objectName}`;
};

/**
 * List files in bucket
 * @param prefix - Optional prefix filter
 * @returns Array of file objects
 */
export const listFiles = async (prefix?: string): Promise<any[]> => {
  try {
    const objectsStream = minioClient.listObjectsV2(bucketName, prefix, true);
    const files: any[] = [];

    return new Promise((resolve, reject) => {
      objectsStream.on('data', (obj) => {
        files.push(obj);
      });

      objectsStream.on('end', () => {
        resolve(files);
      });

      objectsStream.on('error', (err) => {
        reject(err);
      });
    });
  } catch (error) {
    console.error('❌ Error listing files:', error);
    throw error;
  }
};

export default minioClient;
