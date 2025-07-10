import multer from 'multer';

const storage = multer.memoryStorage();

const allowedMimeTypes = ['image/png', 'image/jpeg','image/jpg'];

function fileFilter(req, file, cb) {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only jpeg or png images are allowed', { cause: 400 }));
  }
}

const fileSize = 10 * 1024 * 1024;

const fileUploader = multer({ storage, limits: { fileSize }, fileFilter });

export default fileUploader;