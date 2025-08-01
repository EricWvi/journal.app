import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useGetEntriesCount(year: number) {
  return useQuery<number>({
    queryKey: ["/api/meta", "entry", year],
    enabled: !!year,
    queryFn: async () => {
      const response = await apiRequest(
        "POST",
        "/api/meta?Action=GetEntriesCount",
        {
          year,
        },
      );
      const data = await response.json();
      return data.message.count;
    },
  });
}

export function useGetWordsCount() {
  return useQuery<number>({
    queryKey: ["/api/meta", "word"],
    queryFn: async () => {
      const response = await apiRequest(
        "POST",
        "/api/meta?Action=GetWordsCount",
        {},
      );
      const data = await response.json();
      return data.message.count;
    },
  });
}

export function useGetEntryDate() {
  return useQuery<string[]>({
    queryKey: ["/api/meta", "day"],
    queryFn: async () => {
      const response = await apiRequest(
        "POST",
        "/api/meta?Action=GetEntryDate",
        {},
      );
      const data = await response.json();
      return data.message.entryDates;
    },
  });
}
