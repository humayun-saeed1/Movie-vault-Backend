import { v2 as cloudinary } from 'cloudinary';
import configuration from '../config/configuration.js';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    const config = configuration();
    return cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
    });
  },
};
