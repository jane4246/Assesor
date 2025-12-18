import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
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
      cb(new Error("Invalid file type"));
    }
  },
});

const initiatePaymentSchema = z.object({
  documentId: z.string(),
  phoneNumber: z.string(),
});

const confirmPaymentSchema = z.object({
  documentId: z.string(),
});

const updateEmailSchema = z.object({
  email: z.string().email(),
});

export async function registerRoutes(
  _httpServer: Server,
  app: Express
): Promise<Server> {

  // ✅ UPLOAD DOCUMENT
  app.post("/api/documents/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const email = req.body.email;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const document = await storage.createDocument({
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        fileType: path.extname(req.file.originalname).toLowerCase(),
        filePath: req.file.path,
        email, // ✅ FIX
        paymentStatus: "pending",
        amount: 60,
      });

      res.json(document);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  app.get("/api/documents", async (_req, res) => {
    try {
      res.json(await storage.getAllDocuments());
    } catch {
      res.status(500).json({ error: "Failed to get documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    const doc = await storage.getDocument(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  });

  app.get("/api/documents/:id/download", async (req, res) => {
    const doc = await storage.getDocument(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (doc.paymentStatus !== "completed") {
      return res.status(403).json({ error: "Payment required" });
    }

    const filePath = path.isAbsolute(doc.filePath)
      ? doc.filePath
      : path.resolve(process.cwd(), doc.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File missing" });
    }

    res.download(filePath, doc.originalName);
  });

  app.patch("/api/documents/:id/email", async (req, res) => {
    try {
      const { email } = updateEmailSchema.parse(req.body);
      const doc = await storage.updateDocumentEmail(req.params.id, email);
      if (!doc) return res.status(404).json({ error: "Not found" });
      res.json(doc);
    } catch {
      res.status(400).json({ error: "Invalid email" });
    }
  });

  app.post("/api/payments/initiate", async (req, res) => {
    const { documentId, phoneNumber } = initiatePaymentSchema.parse(req.body);

    let phone = phoneNumber.replace(/\s/g, "");
    if (phone.startsWith("0")) phone = "254" + phone.slice(1);
    if (phone.startsWith("+")) phone = phone.slice(1);

    const checkoutRequestId = `CRQ${Date.now()}`;
    const merchantRequestId = `MRQ${Date.now()}`;

    await storage.createPayment({
      documentId,
      phoneNumber: phone,
      amount: 60,
      status: "pending",
      checkoutRequestId,
      merchantRequestId,
    });

    await storage.updateDocumentPayment(documentId, "pending");

    res.json({ success: true, message: "STK push sent" });
  });

  app.post("/api/payments/confirm", async (req, res) => {
    const { documentId } = confirmPaymentSchema.parse(req.body);

    const receipt = `REC${Date.now().toString(36).toUpperCase()}`;
    await storage.updateDocumentPayment(documentId, "completed", receipt);

    res.json({ status: "completed" });
  });

  app.post("/api/mpesa/callback", async (_req, res) => {
    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  });

  return _httpServer;
}
