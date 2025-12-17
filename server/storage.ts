import { 
  type User, 
  type InsertUser, 
  type Document, 
  type InsertDocument, 
  type Payment, 
  type InsertPayment,
  users,
  documents,
  payments
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createDocument(doc: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  updateDocumentEmail(id: string, email: string): Promise<Document | undefined>;
  updateDocumentPayment(id: string, status: string, mpesaReceiptNumber?: string, filePath?: string): Promise<Document | undefined>;
  
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentByDocumentId(documentId: string): Promise<Payment | undefined>;
  getPaymentByCheckoutRequestId(checkoutRequestId: string): Promise<Payment | undefined>;
  updatePayment(id: string, data: Partial<Payment>): Promise<Payment | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(doc).returning();
    return document;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getAllDocuments(): Promise<Document[]> {
    return await db.select().from(documents).orderBy(desc(documents.uploadedAt));
  }

  async updateDocumentEmail(id: string, email: string): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set({ email })
      .where(eq(documents.id, id))
      .returning();
    return document || undefined;
  }

  async updateDocumentPayment(
    id: string, 
    status: string, 
    mpesaReceiptNumber?: string,
    filePath?: string
  ): Promise<Document | undefined> {
    const updateData: Partial<Document> = { paymentStatus: status };
    if (mpesaReceiptNumber) {
      updateData.mpesaReceiptNumber = mpesaReceiptNumber;
    }
    if (filePath) {
      updateData.filePath = filePath;
    }
    const [document] = await db
      .update(documents)
      .set(updateData)
      .where(eq(documents.id, id))
      .returning();
    return document || undefined;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async getPaymentByDocumentId(documentId: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.documentId, documentId))
      .orderBy(desc(payments.createdAt));
    return payment || undefined;
  }

  async getPaymentByCheckoutRequestId(checkoutRequestId: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.checkoutRequestId, checkoutRequestId));
    return payment || undefined;
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return payment || undefined;
  }
}

export const storage = new DatabaseStorage();
