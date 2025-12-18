import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";

// Use /tmp for reliable writing on Render Free Tier
const UPLOAD_DIR = "/tmp/uploads";

// Ensure directory exists at startup
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

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

  // ✅ UPLOAD ROUTE WITH DEBUGGING
  app.post("/api/documents/upload", upload.single("file"), async (req, res) => {
    try {
      console.log("--- UPLOAD ATTEMPT START ---");
      console.log("Headers:", req.headers['content-type']);
      console.log("Body contents:", req.body);
      
      if (!req.file) {
        console.error("Upload Error: req.file is undefined");
        return res.status(400).json({ error: "No file received by server" });
      }

      console.log("File received:", req.file.originalname, "saved as:", req.file.filename);

      const { email } = req.body;
      if (!email) {
        console.error("Upload Error: email field missing in req.body");
        return res.status(400).json({ error: "No email associated with upload. Ensure 'email' is appended to FormData BEFORE the file." });
      }

      console.log("Attempting database insertion for email:", email);

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

      console.log(`✅ Success: Document saved with ID: ${document.id}`);
      res.json(document);
    } catch (error: any) {
      // THIS IS THE KEY: It prints the exact file and line number causing the searchParams error
      console.error("--- CRITICAL UPLOAD ERROR STACK TRACE ---");
      console.error(error.stack || error);
      console.error("------------------------------------------");
      
      res.status(500).json({ 
        error: error.message || "Failed to process upload",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined 
      });
    }
  });

  return httpServer;
}
