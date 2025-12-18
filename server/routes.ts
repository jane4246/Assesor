import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";

// Use /tmp for Render Free Tier to avoid permission issues, 
// or stick to 'uploads' if you have a Disk attached.
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage_engine = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Double check directory exists before writing
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage_engine,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/rtf",
      "text/rtf",
    ];
    const allowedExts = [".doc", ".docx", ".rtf"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only .doc, .docx, and .rtf are allowed."));
    }
  },
});

// Schemas... (Keep your existing Zod schemas here)

export async function registerRoutes(
  _httpServer: Server,
  app: Express
): Promise<Server> {

  // ✅ UPLOAD DOCUMENT
  app.post("/api/documents/upload", (req, res, next) => {
    // Wrap multer in a function to catch "Invalid File Type" errors specifically
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Multer error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // email might be in req.body because multer populates body AFTER parsing file
      const email = req.body.email;
      if (!email) {
        return res.status(400).json({ error: "Email is required to associate document." });
      }

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

      console.log(`[Success] Document created: ${document.id}`);
      res.json(document);
    } catch (error) {
      console.error("Database/Storage error:", error);
      res.status(500).json({ error: "Failed to save document info to database" });
    }
  });

  // ✅ DOWNLOAD DOCUMENT (Improved Path Handling)
  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      const doc = await storage.getDocument(req.params.id);
      if (!doc) return res.status(404).json({ error: "Document not found" });
      
      if (doc.paymentStatus !== "completed") {
        return res.status(403).json({ error: "Payment required before download" });
      }

      // Ensure we have a clean absolute path
      const absolutePath = path.isAbsolute(doc.filePath) 
        ? doc.filePath 
        : path.join(process.cwd(), doc.filePath);

      if (!fs.existsSync(absolutePath)) {
        console.error(`File missing at: ${absolutePath}`);
        return res.status(404).json({ error: "File no longer exists on server" });
      }

      res.download(absolutePath, doc.originalName);
    } catch (error) {
      res.status(500).json({ error: "Download failed" });
    }
  });

  // ... (Keep the rest of your payment/callback routes as they were)

  return _httpServer;
}
