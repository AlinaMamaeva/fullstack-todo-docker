import { Router } from "express";
import { fileTypeFromFile } from "file-type";
import fs from "node:fs/promises";
import { upload } from "../middleware/upload.js";

const router = Router();

router.post("/uploads", upload.single("file"), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const detectedType = await fileTypeFromFile(req.file.path);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!detectedType || !allowedTypes.includes(detectedType.mime)) {
      await fs.unlink(req.file.path);

      return res.status(400).json({
        error: "Invalid image content",
      });
    }

    return res.status(201).json({
      message: "File uploaded successfully",
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    next(error);
  }
});

export default router;