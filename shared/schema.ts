import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  filePath: text("file_path").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  email: text("email"),
  phoneNumber: text("phone_number"),
  mpesaReceiptNumber: text("mpesa_receipt_number"),
  amount: integer("amount").notNull().default(60),
  isProcessed: boolean("is_processed").default(false),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => documents.id),
  checkoutRequestId: text("checkout_request_id"),
  merchantRequestId: text("merchant_request_id"),
  amount: integer("amount").notNull().default(60),
  phoneNumber: text("phone_number").notNull(),
  status: text("status").notNull().default("pending"),
  mpesaReceiptNumber: text("mpesa_receipt_number"),
  resultCode: text("result_code"),
  resultDesc: text("result_desc"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documentsRelations = relations(documents, ({ many }) => ({
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  document: one(documents, {
    fields: [payments.documentId],
    references: [documents.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateDocumentEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
