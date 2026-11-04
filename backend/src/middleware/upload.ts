
import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";

const uploadDir = path.resolve(
  process.env.UPLOAD_DIR || "uploads"
);

fs.mkdirSync(uploadDir, { recursive: true });

const maxFileSize = Number(
  process.env.MAX_FILE_SIZE || 5242880
);

if (!Number.isSafeInteger(maxFileSize) || maxFileSize <= 0) {
  throw new Error("MAX_FILE_SIZE must be a positive integer");
}

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(
      file.originalname
    ).toLowerCase();

    const uniqueName = `${crypto.randomUUID()}${extension}`;

    cb(null, uniqueName);
  },
});

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG and WebP images are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
  },
});
