import { v2 as cloudinary } from 'cloudinary';
import { Buffer } from 'node:buffer';

console.log('Cloudinary environment variables:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudUploader = async (req, res, next) => {
  if (!req.file) throw new Error('Please upload an image', { cause: 400 });

  const b64 = Buffer.from(req.file.buffer).toString('base64');
  const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

  // const cloudinaryData = await cloudinary.uploader.upload(dataURI, { resource_type: 'auto' });
  // //   console.log(cloudinaryData.secure_url);
  const cloudinaryData = await cloudinary.uploader.upload(dataURI, {
      folder: 'profile_pictures',
      resource_type: 'image'
    });

  req.body.image = cloudinaryData.secure_url;
  next();
};

export default cloudUploader;