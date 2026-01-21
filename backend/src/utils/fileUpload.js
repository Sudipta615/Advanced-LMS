const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FileUploadService {
  
  static ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }
  
  static getUploadPath(type) {
    const uploadsDir = path.join(__dirname, '../../uploads');
    this.ensureDirectoryExists(uploadsDir);
    
    switch (type) {
      case 'document':
        const documentsDir = path.join(uploadsDir, 'documents');
        this.ensureDirectoryExists(documentsDir);
        return documentsDir;
      case 'video':
        const videosDir = path.join(uploadsDir, 'videos');
        this.ensureDirectoryExists(videosDir);
        return videosDir;
      case 'thumbnail':
        const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
        this.ensureDirectoryExists(thumbnailsDir);
        return thumbnailsDir;
      default:
        return uploadsDir;
    }
  }
  
  static generateUniqueFilename(originalname) {
    const ext = path.extname(originalname);
    const basename = path.basename(originalname, ext);
    const uniqueId = uuidv4().substring(0, 8);
    return `${basename}_${uniqueId}${ext}`.replace(/\s+/g, '_');
  }
  
  static async uploadFile(file, type) {
    return new Promise((resolve, reject) => {
      try {
        const uploadPath = this.getUploadPath(type);
        const uniqueFilename = this.generateUniqueFilename(file.originalname);
        const filePath = path.join(uploadPath, uniqueFilename);
        
        fs.writeFile(filePath, file.buffer, (err) => {
          if (err) {
            reject(new Error('Failed to save file'));
          } else {
            resolve({
              filename: uniqueFilename,
              path: filePath,
              relativePath: path.join(type, uniqueFilename),
              size: file.size,
              mimetype: file.mimetype
            });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  static async uploadDocument(file) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                          'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
                          'application/zip', 'application/x-zip-compressed'];
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid document type. Allowed types: PDF, DOC, DOCX, PPT, PPTX, ZIP');
    }
    
    if (file.size > maxSize) {
      throw new Error('Document size exceeds maximum limit of 100MB');
    }
    
    return this.uploadFile(file, 'document');
  }
  
  static async uploadVideo(file) {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const maxSize = 500 * 1024 * 1024; // 500MB
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid video type. Allowed types: MP4, WebM, OGG');
    }
    
    if (file.size > maxSize) {
      throw new Error('Video size exceeds maximum limit of 500MB');
    }
    
    return this.uploadFile(file, 'video');
  }
  
  static async uploadThumbnail(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid image type. Allowed types: JPG, PNG, WebP');
    }
    
    if (file.size > maxSize) {
      throw new Error('Image size exceeds maximum limit of 10MB');
    }
    
    return this.uploadFile(file, 'thumbnail');
  }
  
  static async deleteFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }
  
  static async deleteFiles(filePaths) {
    const results = [];
    
    for (const filePath of filePaths) {
      try {
        await this.deleteFile(filePath);
        results.push({ success: true, path: filePath });
      } catch (error) {
        results.push({ success: false, path: filePath, error: error.message });
      }
    }
    
    return results;
  }
  
  static getFileUrl(relativePath) {
    return `/uploads/${relativePath}`;
  }
}

module.exports = FileUploadService;