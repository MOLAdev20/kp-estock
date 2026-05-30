import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../../uploads/products");

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, callback) => {
    callback(null, uploadDir);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase() || ".jpg";
    const filename = `${req.params.uuid}-${Date.now()}${extension}`;
    callback(null, filename);
  },
});

const uploadProductThumbnail = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (_, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error("Only JPG, PNG, and WEBP images are allowed");
      error.statusCode = 415;
      return callback(error);
    }

    return callback(null, true);
  },
});

export default uploadProductThumbnail;
