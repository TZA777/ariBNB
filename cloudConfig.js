// =======================
// IMPORT CLOUDINARY SDK
// =======================

// Import Cloudinary library (v2 API version)
// This gives you methods to upload, delete, and manage images/videos
const cloudinary = require('cloudinary').v2;


// Import Cloudinary storage engine for multer
// This connects multer (file upload middleware) directly to Cloudinary
const { CloudinaryStorage } = require('multer-storage-cloudinary');


// =======================
// CLOUDINARY CONFIGURATION
// =======================

// Configure Cloudinary with your account credentials
// These values come from your .env file
cloudinary.config({
    
    // Unique name of your Cloudinary account (like username)
    cloud_name: process.env.CLOUD_NAME,

    // Public API key (used to identify your account)
    api_key: process.env.CLOUD_API_KEY,

    // Secret key (used for authentication — keep it private!)
    api_secret: process.env.CLOUD_API_SECRET,
});


// =======================
// CLOUD STORAGE SETUP (FOR MULTER)
// =======================

// Create a storage engine for multer
// Instead of saving files locally, this will upload them to Cloudinary
const storage = new CloudinaryStorage({

  // Pass configured cloudinary instance
  cloudinary: cloudinary,

  // Params define how files are stored in Cloudinary
  params: {

    // Folder name in your Cloudinary dashboard
    // All uploaded images will go inside this folder
    folder: 'airBNB_DEV',

    // Allowed file formats (security + validation)
    // Prevents uploading unsupported or harmful files
    allowed_formats: ['png', 'jpg', 'jpeg'],

    // NOTE (Important):
    // Official key is usually: "format" or "allowed_formats"
    // Some versions expect:
    // format: async (req, file) => 'png'
  },
});


// =======================
// EXPORT MODULES
// =======================

// Export both cloudinary and storage so you can use them in other files
// Example:
// const { storage } = require('./cloudConfig');
// const upload = multer({ storage });

module.exports = {
    cloudinary,  // for manual operations (delete, transform, etc.)
    storage,     // for multer file uploads
};