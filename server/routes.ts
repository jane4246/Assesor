import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";

// Use /tmp for reliable writing on Render Free Tier
const UPLOAD_DIR = "/tmp/uploads";

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // ✅ UPLOAD ROUTE
  app.post("/api/documents/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file received by server" });
      }

      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "No email associated with upload" });
      }

      const document = await storage.createDocument({
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        fileType: path.extname(req.file.originalname).toLowerCase(),
        filePath: req.file.path,
        email,
        paymentStatus: "pending",
        amount: 60,
      });

      console.log(`Document saved to DB with ID: ${document.id}`);
      res.json(document);
    } catch (error: any) {
      console.error("Route Upload Error:", error);
      res.status(500).json({ error: error.message || "Failed to process upload" });
    }
  });

  // Keep your other GET/PATCH routes below...
  
  return httpServer;
}
