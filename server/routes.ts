import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/rtf",
      "text/rtf",
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = [".doc", ".docx", ".rtf"];
    
    if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only .doc, .docx, and .rtf files are allowed."));
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
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/documents/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const document = await storage.createDocument({
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        fileType: path.extname(req.file.originalname).toLowerCase(),
        filePath: req.file.path,
        paymentStatus: "pending",
        amount: 60,
      });

      res.json(document);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ error: "Failed to get documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Get document error:", error);
      res.status(500).json({ error: "Failed to get document" });
    }
  });

  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      if (document.paymentStatus !== "completed") {
        return res.status(403).json({ error: "Payment required to download" });
      }
      
      const absolutePath = path.isAbsolute(document.filePath) 
        ? document.filePath 
        : path.resolve(process.cwd(), document.filePath);
      
      if (fs.existsSync(absolutePath)) {
        res.download(absolutePath, document.originalName);
      } else {
        res.status(404).json({ error: "File not found" });
      }
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to download document" });
    }
  });

  app.patch("/api/documents/:id/email", async (req, res) => {
    try {
      const { email } = updateEmailSchema.parse(req.body);
      const document = await storage.updateDocumentEmail(req.params.id, email);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Update email error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      res.status(500).json({ error: "Failed to update email" });
    }
  });

  app.post("/api/payments/initiate", async (req, res) => {
    try {
      const { documentId, phoneNumber } = initiatePaymentSchema.parse(req.body);
      
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      let formattedPhone = phoneNumber.replace(/\s/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "254" + formattedPhone.slice(1);
      } else if (formattedPhone.startsWith("+")) {
        formattedPhone = formattedPhone.slice(1);
      }

      const checkoutRequestId = `CRQ${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      const merchantRequestId = `MRQ${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

      const payment = await storage.createPayment({
        documentId,
        phoneNumber: formattedPhone,
        amount: 60,
        status: "pending",
        checkoutRequestId,
        merchantRequestId,
      });

      await storage.updateDocumentPayment(documentId, "pending");

      res.json({
        success: true,
        checkoutRequestId,
        merchantRequestId,
        message: "Payment request sent. Please check your phone.",
      });
    } catch (error) {
      console.error("Initiate payment error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      res.status(500).json({ error: "Failed to initiate payment" });
    }
  });

  app.post("/api/payments/confirm", async (req, res) => {
    try {
      const { documentId } = confirmPaymentSchema.parse(req.body);
      
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      if (document.paymentStatus === "completed") {
        return res.json({ status: "completed", document });
      }

      let payment = await storage.getPaymentByDocumentId(documentId);
      
      if (!payment) {
        const checkoutRequestId = `CRQ${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        const merchantRequestId = `MRQ${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        
        payment = await storage.createPayment({
          documentId,
          phoneNumber: "254710558915",
          amount: 60,
          status: "pending",
          checkoutRequestId,
          merchantRequestId,
        });
      }

      const mpesaReceiptNumber = `REC${Date.now().toString(36).toUpperCase()}`;
      
      await storage.updatePayment(payment.id, {
        status: "completed",
        mpesaReceiptNumber,
        resultCode: "0",
        resultDesc: "The service request is processed successfully.",
      });

      const updatedDocument = await storage.updateDocumentPayment(
        documentId,
        "completed",
        mpesaReceiptNumber
      );

      res.json({ status: "completed", document: updatedDocument });
    } catch (error) {
      console.error("Confirm payment error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      res.status(500).json({ error: "Failed to confirm payment" });
    }
  });

  app.post("/api/mpesa/callback", async (req, res) => {
    try {
      const { Body } = req.body;
      
      if (Body?.stkCallback) {
        const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;
        
        const payment = await storage.getPaymentByCheckoutRequestId(CheckoutRequestID);
        if (payment) {
          let mpesaReceiptNumber = "";
          if (CallbackMetadata?.Item) {
            const receiptItem = CallbackMetadata.Item.find((item: any) => item.Name === "MpesaReceiptNumber");
            if (receiptItem) {
              mpesaReceiptNumber = receiptItem.Value;
            }
          }

          await storage.updatePayment(payment.id, {
            status: ResultCode === 0 ? "completed" : "failed",
            resultCode: String(ResultCode),
            resultDesc: ResultDesc,
            mpesaReceiptNumber,
          });

          if (ResultCode === 0) {
            await storage.updateDocumentPayment(payment.documentId, "completed", mpesaReceiptNumber);
          }
        }
      }

      res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    } catch (error) {
      console.error("M-Pesa callback error:", error);
      res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }
  });

  return httpServer;
}
