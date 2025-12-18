import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";

// Change this to /tmp/uploads for better compatibility with Render
const UPLOAD_DIR = "/tmp/uploads";

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage_engine = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage_engine,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedExts = [".doc", ".docx", ".rtf"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only .doc, .docx, and .rtf are allowed."));
    }
  },
});

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  
  // ✅ UPLOAD ROUTE WITH ERROR HANDLING
  app.post("/api/documents/upload", (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("Multer Error:", err.message);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      
      const email = req.body.email; // Ensure frontend is sending 'email' in FormData
      if (!email) return res.status(400).json({ error: "Email is required" });

      const document = await storage.createDocument({
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        fileType: path.extname(req.file.originalname).toLowerCase(),
        filePath: req.file.path,
        email: email,
        paymentStatus: "pending",
        amount: 60,
      });

      res.json(document);
    } catch (error) {
      console.error("Storage Error:", error);
      res.status(500).json({ error: "Failed to save document to database" });
    }
  });

  // ... (keep other routes)
  return httpServer;
}
