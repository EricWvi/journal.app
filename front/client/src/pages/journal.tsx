import { useEffect, useRef, useState } from "react";
import Header from "@/components/header";
import EntryCard from "@/components/entry-card";
import EntryModal from "@/components/entry-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  EntryMeta,
  QueryCondition,
  useDraft,
  useEntries,
} from "@/hooks/use-entries";
import InfiniteScroll from "react-infinite-scroll-component";
import { useQueryClient } from "@tanstack/react-query";

export default function Journal() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<number>(0);
  const scrollableDivRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const [entries, setEntries] = useState<EntryMeta[]>([]);
  const [condition, setCondition] = useState<QueryCondition[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const refresh = () => {
    setEntries([]);
    setPage(0);
    setHasMore(true);
    loadInitialData();
  };

  const setQueryFn = (key: (string | number)[], data: any) => {
    queryClient.setQueryData(key, data);
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [metas, more] = await useEntries(1, condition, setQueryFn);
      setEntries(metas);
      setHasMore(more);
      setPage(2);
      setTimeout(() => {
        const el = scrollableDivRef.current;
        if (el && el.scrollHeight <= el.clientHeight && more) {
          fetchMoreData(2);
        }
      }, 100);
    } catch (err) {
      console.error("Error loading initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreData = async (page: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const [metas, hasMore] = await useEntries(page, condition, setQueryFn);
      setEntries((prev) => [...prev, ...metas]);
      setHasMore(hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Error fetching more data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async () => {
    const draft = await useDraft();
    setEditingEntry(draft);
    setEntryModalOpen(true);
  };

  const handleEditEntry = (id: number) => {
    setEditingEntry(id);
    setEntryModalOpen(true);
  };

  const handleEntryModalClose = () => {
    setEntryModalOpen(false);
    setTimeout(() => setEditingEntry(0), 200); // TODO update meta here
  };

  return (
    <div>
      <div
        className={`relative h-[100dvh] w-full origin-top overflow-hidden transition-all duration-300 ease-in-out ${entryModalOpen ? "translate-y-10 scale-90 rounded-xl" : ""}`}
      >
        <div
          className={`pointer-events-none absolute inset-0 z-20 transition-all duration-300 ${entryModalOpen ? "bg-gray-500/50 dark:bg-gray-500/14" : "bg-gray-500/0"}`}
        ></div>
        <div
          id="scrollableDiv"
          ref={scrollableDivRef}
          className={`journal-bg scrollbar-hide h-full overflow-y-auto ${entryModalOpen ? "rounded-xl" : ""}`}
        >
          <Header
            onSearchToggle={() => setSearchOpen(!searchOpen)}
            onCalendarToggle={() => setCalendarOpen(!calendarOpen)}
          />
          <main className="w-full max-w-4xl flex-1">
            {/* Entries List */}
            <InfiniteScroll
              scrollableTarget="scrollableDiv"
              className="px-5 sm:px-7 lg:px-9"
              dataLength={entries.length}
              next={() => fetchMoreData(page)}
              hasMore={hasMore}
              loader={
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="entry-card-shadow bg-entry-card animate-pulse rounded-lg p-5"
                    >
                      <div className="mb-4 h-6 rounded bg-gray-200 dark:bg-gray-800"></div>
                      <div className="mb-2 h-4 rounded bg-gray-200 dark:bg-gray-800"></div>
                      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800"></div>
                    </div>
                  ))}
                </div>
              }
              endMessage={
                <div className="py-12 text-center">
                  <p className="text-lg text-[hsl(215,4%,56%)]">
                    {entries.length === 0
                      ? "No entries yet. Start your journaling journey today!"
                      : "- end -"}
                  </p>
                </div>
              }
            >
              {/* Entry Cards */}
              {[
                ...entries
                  .filter((entry) => entry.isToday() || entry.isYesterday())
                  .map((entry, idx, arr) => {
                    const prev = arr[idx - 1];
                    const next = arr[idx + 1];
                    const showToday = entry.isToday() && !prev;
                    const showYesterday =
                      entry.isYesterday() && (!prev || entry.day !== prev.day);
                    const showTime = Boolean(
                      (prev &&
                        entry.year === prev.year &&
                        entry.month === prev.month &&
                        entry.day === prev.day) ||
                        (next &&
                          entry.year === next.year &&
                          entry.month === next.month &&
                          entry.day === next.day),
                    );
                    return {
                      entry,
                      showYear: false,
                      showMonth: false,
                      showToday,
                      showYesterday,
                      showTime,
                    };
                  }),
                ...entries
                  .filter((entry) => !entry.isToday() && !entry.isYesterday())
                  .map((entry, idx, arr) => {
                    const prev = arr[idx - 1];
                    const next = arr[idx + 1];
                    const showYear = entry.year !== new Date().getFullYear();
                    const showMonth =
                      !prev ||
                      entry.year !== prev.year ||
                      entry.month !== prev.month;
                    const showTime = Boolean(
                      (prev &&
                        entry.year === prev.year &&
                        entry.month === prev.month &&
                        entry.day === prev.day) ||
                        (next &&
                          entry.year === next.year &&
                          entry.month === next.month &&
                          entry.day === next.day),
                    );
                    return {
                      entry,
                      showYear,
                      showMonth,
                      showToday: false,
                      showYesterday: false,
                      showTime,
                    };
                  }),
              ].map(
                ({
                  entry,
                  showYear,
                  showMonth,
                  showToday,
                  showYesterday,
                  showTime,
                }) => (
                  <EntryCard
                    key={entry.id}
                    meta={entry}
                    showYear={showYear}
                    showMonth={showMonth}
                    showToday={showToday}
                    showYes={showYesterday}
                    showTime={showTime}
                    onEdit={() => handleEditEntry(entry.id)}
                  />
                ),
              )}
            </InfiniteScroll>
          </main>

          {/* Floating Action Button */}
          <div className="fixed right-6 bottom-6 z-40">
            <Button
              size="lg"
              className="h-14 w-14 rounded-full bg-[hsl(207,90%,54%)] shadow-lg transition-all duration-200 hover:bg-[hsl(207,90%,48%)] hover:shadow-xl"
              onClick={handleCreateEntry}
            >
              <Plus className="text-xl" />
            </Button>
          </div>

          {/* Overlays and Modals */}
          {/* <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} /> */}
          {/* <CalendarOverlay
          open={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          entries={entries}
        /> */}
        </div>
      </div>
      <EntryModal
        open={entryModalOpen}
        onClose={handleEntryModalClose}
        entryId={editingEntry}
        refresh={refresh}
      />
    </div>
  );
}
