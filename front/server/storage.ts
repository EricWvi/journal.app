import { Node, NodeType } from "@/lib/html-parse";
import { Visibility, type Entry, type InsertEntry } from "@shared/schema";
import fs from "fs";

export interface IStorage {
  getDraft(): Promise<Entry>;
  getEntries(): Promise<Entry[]>;
  getEntry(id: number): Promise<Entry | undefined>;
  createDraft(): Promise<Entry>;
  createEntryFromDraft(id: number, entry: InsertEntry): Promise<Entry>;
  updateEntry(id: number, entry: InsertEntry): Promise<Entry | undefined>;
  deleteEntry(id: number): Promise<boolean>;
  searchEntries(query: string): Promise<Entry[]>;
}

export class MemStorage implements IStorage {
  private entries: Map<number, Entry>;
  private currentId: number;

  constructor() {
    this.entries = new Map<number, Entry>();
    // read from file
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    } else {
      if (fs.existsSync("uploads/entries.json")) {
        this.entries = new Map(
          JSON.parse(fs.readFileSync("uploads/entries.json", "utf-8")),
        );
      }
    }

    this.currentId = this.entries.size + 1;

    // dump to file on exit, pretty formatted
    process.on("exit", () => {
      fs.writeFileSync(
        "uploads/entries.json",
        JSON.stringify(Array.from(this.entries.entries()), null, 2),
      );
    });
  }

  async getDraft(): Promise<Entry> {
    const e = Array.from(this.entries.values()).find(
      (entry) => entry.visibility === Visibility.DRAFT,
    );
    if (e) return e;
    return this.createDraft();
  }

  async getEntries(): Promise<Entry[]> {
    return Array.from(this.entries.values())
      .filter((entry) => entry.visibility !== Visibility.DRAFT)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  async getEntry(id: number): Promise<Entry | undefined> {
    return this.entries.get(id);
  }

  async getEntryCount(): Promise<number> {
    return this.entries.size;
  }

  async getEntryDate(): Promise<string[]> {
    const dates = Array.from(this.entries.values())
      .filter((entry) => entry.visibility !== Visibility.DRAFT)
      .map((entry) => new Date(entry.createdAt).toISOString().split("T")[0]);
    return Array.from(new Set(dates));
  }

  async createDraft(): Promise<Entry> {
    const id = this.currentId++;
    const now = new Date();
    const entry: Entry = {
      id,
      creatorId: 1,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,

      content: [],
      visibility: Visibility.DRAFT,
      payload: {},
    };
    this.entries.set(id, entry);
    return entry;
  }

  async createEntryFromDraft(
    id: number,
    insertEntry: InsertEntry,
  ): Promise<Entry> {
    const now = new Date();
    const entry: Entry = {
      id,
      creatorId: 1,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,

      content: Array.isArray(insertEntry.content)
        ? (insertEntry.content as Node[])
        : [],
      visibility: insertEntry.visibility ?? Visibility.PUBLIC,
      payload: insertEntry.payload ?? {},
    };
    this.entries.set(id, entry);
    return entry;
  }

  async updateEntry(
    id: number,
    updateData: InsertEntry,
  ): Promise<Entry | undefined> {
    const existing = this.entries.get(id);
    if (!existing) return undefined;

    const updated: Entry = {
      ...existing,
      updatedAt: new Date(),

      content: Array.isArray(updateData.content)
        ? (updateData.content as Node[])
        : existing.content,
      visibility: updateData.visibility ?? existing.visibility,
      payload: updateData.payload ?? existing.payload,
    };
    this.entries.set(id, updated);
    return updated;
  }

  async deleteEntry(id: number): Promise<boolean> {
    return this.entries.delete(id);
  }

  async searchEntries(query: string): Promise<Entry[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.entries.values())
      .filter((entry) => {
        const nodes = entry.content as Node[];
        return nodes.some(
          (node) =>
            node.type === NodeType.TEXT &&
            typeof node.content === "string" &&
            node.content.toLowerCase().includes(lowercaseQuery),
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

export const storage = new MemStorage();
