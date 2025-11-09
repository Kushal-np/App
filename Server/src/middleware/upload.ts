import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (
  req: any, 
  file: Express.Multer.File, 
  cb: multer.FileFilterCallback
) => {
  const fileType = file.mimetype;
  
  if (fileType.startsWith("image/") || 
      fileType.startsWith("audio/") || 
      fileType.startsWith("video/")) {
    cb(null, true); // Accept file
  } else {
    cb(null, false); // Reject file (don't throw error)
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

export default upload;