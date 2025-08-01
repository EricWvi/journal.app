import type { Express, Request } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { Entry, insertEntrySchema } from "@shared/schema";
import { QueryCondition } from "@/hooks/use-entries";

// Configure multer for photo uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all entries
  app.post("/api/entry", async (req, res) => {
    const action = req.query.Action;
    try {
      if (action === "GetDraft") {
        const draft = await storage.getDraft();
        return res.json({ message: draft });
      }
      if (action === "GetEntries") {
        const { page, c } = req.body;
        const condition: QueryCondition[] = c || [];
        const all = await storage.getEntries();
        const entries = all.filter((entry: Entry) => {
          return condition.every((cond) => {
            if (cond.field === "date") {
              const entryDate = new Date(entry.createdAt);
              switch (cond.operator) {
                case "eq":
                  const valueDate = new Date(cond.value);
                  return (
                    entryDate.getFullYear() === valueDate.getFullYear() &&
                    entryDate.getMonth() === valueDate.getMonth() &&
                    entryDate.getDate() === valueDate.getDate()
                  );
                case "in":
                  const [left, right] = cond.value;
                  const leftDate = new Date(left);
                  const rightDate = new Date(right);
                  return entryDate >= leftDate && entryDate <= rightDate;
                default:
                  return false;
              }
            }
            if (cond.field === "tag") {
              return (
                entry.payload.tags && entry.payload.tags.includes(cond.value)
              );
            }
            if (cond.field === "place") {
              return (
                entry.payload.location &&
                Array.isArray(cond.value) &&
                entry.payload.location.length >= cond.value.length &&
                cond.value.every(
                  (loc: string, idx: number) =>
                    entry.payload.location &&
                    loc === entry.payload.location[idx],
                )
              );
            }
          });
        });
        const pageSize = 6;
        const hasMore = entries.length > page * pageSize;
        const entriesInPage = entries.slice(
          (page - 1) * pageSize,
          page * pageSize,
        );
        return res.json({ message: { entries: entriesInPage, hasMore } });
      }
      if (action === "GetEntry") {
        const { id } = req.body;
        const entry = await storage.getEntry(Number(id));
        if (!entry) {
          return res.status(404).json({ message: "Entry not found" });
        }
        return res.json({ message: entry });
      }
      if (action === "CreateEntryFromDraft") {
        const { id, ...data } = req.body;
        const validatedData = insertEntrySchema.partial().parse(data);
        const entry = await storage.createEntryFromDraft(
          Number(id),
          validatedData,
        );
        if (!entry) {
          return res.status(404).json({ message: "Entry not found" });
        }
        return res.json({ message: entry });
      }
      if (action === "UpdateEntry") {
        const { id, ...data } = req.body;
        const validatedData = insertEntrySchema.partial().parse(data);
        const entry = await storage.updateEntry(Number(id), validatedData);
        if (!entry) {
          return res.status(404).json({ message: "Entry not found" });
        }
        return res.json({ message: entry });
      }
      if (action === "DeleteEntry") {
        const { id } = req.body;
        const deleted = await storage.deleteEntry(Number(id));
        if (!deleted) {
          return res.status(404).json({ message: "Entry not found" });
        }
        return res.status(204).send();
      }
      return res.status(400).json({ message: "Unknown Action" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/meta", async (req, res) => {
    const action = req.query.Action;
    try {
      if (action === "GetEntriesCount") {
        const count = await storage.getEntryCount();
        return res.json({ message: { count } });
      }
      if (action === "GetWordsCount") {
        const count = Math.floor(Math.random() * 100000) + 1;
        return res.json({ message: { count } });
      }
      if (action === "GetEntryDate") {
        const dates = await storage.getEntryDate();
        return res.json({ message: { entryDates: dates } });
      }
      return res.status(400).json({ message: "Unknown Action" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Search entries
  app.post("/api/entry/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const entries = await storage.searchEntries(query);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to search entries" });
    }
  });

  // Upload photos
  app.post("/api/upload", upload.array("photos", 10), (req: any, res) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const filePaths = req.files.map((file: any) => `/api/m/${file.filename}`);
      res.json({ photos: filePaths });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload photos" });
    }
  });
  app.post("/api/media", async (req, res) => {
    const action = req.query.Action;
    try {
      if (action === "DeleteMedia") {
        const { ids } = req.body;
        ids.forEach((url: string) => {
          const filePath = path.join("uploads", url);
          // Delete file from file system
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Failed to delete file ${filePath}:`, err);
            }
          });
        });
        return res.json({ ids: ids });
      }
      return res.status(400).json({ message: "Unknown Action" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Serve uploaded files
  app.use("/api/m", express.static("uploads"));

  const httpServer = createServer(app);
  return httpServer;
}
