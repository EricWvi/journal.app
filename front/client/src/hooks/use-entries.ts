import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Entry, InsertEntry } from "@shared/schema";

export class EntryMeta {
  id: number;
  year: number;
  month: number;
  day: number;

  constructor(id: number, year: number, month: number, day: number) {
    this.id = id;
    this.year = year;
    this.month = month;
    this.day = day;
  }

  isToday(): boolean {
    const today = new Date();
    return (
      this.year === today.getFullYear() &&
      this.month === today.getMonth() + 1 &&
      this.day === today.getDate()
    );
  }

  isYesterday(): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      this.year === yesterday.getFullYear() &&
      this.month === yesterday.getMonth() + 1 &&
      this.day === yesterday.getDate()
    );
  }
}

export interface QueryCondition {
  field: string; // e.g., "date", "tag", "place"
  operator: string; // e.g., "eq", "in", "between", "like"
  value: any; // string, number, array, etc.
}

export async function useEntries(
  page: number = 1,
  condition: QueryCondition[] = [],
  setQueryFn: (key: (string | number)[], data: any) => void,
): Promise<[EntryMeta[], boolean]> {
  const response = await apiRequest("POST", "/api/entry?Action=GetEntries", {
    page,
    condition,
  });
  const data = await response.json();
  const metas = (data.message.entries as Entry[]).map((entry) => {
    setQueryFn(["/api/entry", entry.id], entry);
    const time = new Date(entry.createdAt);
    return new EntryMeta(
      entry.id,
      time.getFullYear(),
      time.getMonth() + 1,
      time.getDate(),
    );
  });
  return [metas, data.message.hasMore];
}

export function useEntry(id: number) {
  return useQuery<Entry>({
    queryKey: ["/api/entry", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/entry?Action=GetEntry", {
        id,
      });
      const data = await response.json();
      return data["message"];
    },
  });
}

export async function useDraft(): Promise<number> {
  const response = await apiRequest("POST", "/api/entry?Action=GetDraft", {});
  const data = await response.json();
  return data["message"].id;
}

export function useCreateEntryFromDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: number } & Partial<InsertEntry>) => {
      const response = await apiRequest(
        "POST",
        "/api/entry?Action=CreateEntryFromDraft",
        { id, ...data },
      );
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/entry", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/meta"], exact: false });
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: number } & Partial<InsertEntry>) => {
      const response = await apiRequest(
        "POST",
        "/api/entry?Action=UpdateEntry",
        { id, ...data },
      );
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/entry", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/meta"], exact: false });
    },
  });
}

export function useUpdateDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: number } & Partial<InsertEntry>) => {
      const response = await apiRequest(
        "POST",
        "/api/entry?Action=UpdateEntry",
        { id, ...data },
      );
      return response.json();
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["/api/entry", variables.id] }),
  });
}

// TODO useDeleteEntry fix bug
export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", "/api/entry?Action=DeleteEntry", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/meta"], exact: false });
    },
  });
}
