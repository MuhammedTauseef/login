// src/Formidable.js

import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Initialize formidable with desired options
const form = new formidable.IncomingForm({
  uploadDir: path.join(process.cwd(), '/public/uploads'), // Ensure this directory exists
  keepExtensions: true, // Retain file extensions
  maxFileSize: 5 * 1024 * 1024, // 5MB max file size
});

// Ensure the upload directory exists
if (!fs.existsSync(form.uploadDir)) {
  fs.mkdirSync(form.uploadDir, { recursive: true });
}

// Function to parse the incoming request
export const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};
