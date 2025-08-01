import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  useEntry,
  useCreateEntryFromDraft,
  useUpdateDraft,
  useUpdateEntry,
} from "@/hooks/use-entries";
import { Visibility } from "@shared/schema";
import WYSIWYG, { EditorHandle } from "@/components/editor";
import { outTrash } from "@/hooks/use-apis";
import { formatDate, formatTime } from "@/lib/utils";

interface EntryModalProps {
  open: boolean;
  onClose: () => void;
  entryId: number;
  refresh: () => void;
}

export default function EntryModal({
  open,
  onClose,
  entryId,
  refresh,
}: EntryModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    if (open) {
      setTimeout(() => setIsAnimating(true), 10);
    }
  }, [open]);

  const closeModal = () => {
    setIsAnimating(false);
    onClose();
  };

  const { data: editingEntry, isLoading } = useEntry(entryId);
  const [visModal, setVisModal] = useState(
    editingEntry?.visibility || Visibility.PUBLIC,
  );

  const editorRef = useRef<EditorHandle>(null);
  const { toast } = useToast();
  const createEntryMutation = useCreateEntryFromDraft();
  const updateEntryMutation = useUpdateEntry();
  const updateDraftMutation = useUpdateDraft();

  if (isLoading || !editingEntry) return <></>;

  const handleSave = async (discard: boolean) => {
    const [dump, newIds, trash] = editorRef.current?.dumpEditorContent() || [
      [],
      [],
      [],
    ];
    const entryData = {
      content: dump,
      visibility: visModal,
      payload: {},
    };

    try {
      if (editingEntry.visibility !== Visibility.DRAFT) {
        if (!discard) {
          if (trash.length > 0) {
            outTrash(trash);
          }
          await updateEntryMutation.mutateAsync({
            id: editingEntry.id,
            ...entryData,
          });
        } else {
          if (newIds.length > 0) {
            outTrash(newIds);
          }
        }
      } else if (editingEntry.visibility === Visibility.DRAFT) {
        if (trash.length > 0) {
          outTrash(trash);
        }
        if (discard) {
          await updateDraftMutation.mutateAsync({
            id: editingEntry.id,
            ...entryData,
            visibility: Visibility.DRAFT,
          });
        } else {
          await createEntryMutation.mutateAsync({
            ...entryData,
            id: editingEntry.id,
            visibility:
              visModal != Visibility.DRAFT ? visModal : Visibility.PUBLIC,
          });
          refresh();
        }
      }

      closeModal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" onClick={() => handleSave(true)}></div>
      <div
        className={`bg-entry-modal absolute top-13 bottom-0 transform overflow-hidden rounded-t-xl p-0 transition-transform duration-200 ease-out ${
          isAnimating ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-border flex items-center justify-between border-b p-6">
            <div className="flex items-center space-x-4">
              <span className="text-foreground font-semibold">
                <span>
                  {formatDate(editingEntry.createdAt)}
                  {" · "}
                  {formatTime(editingEntry.createdAt)}
                </span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handleSave(false)}
                disabled={
                  createEntryMutation.isPending ||
                  updateEntryMutation.isPending ||
                  updateDraftMutation.isPending
                }
              >
                Done
              </Button>
            </div>
          </div>

          <WYSIWYG ref={editorRef} editingEntry={editingEntry} />
        </div>
      </div>
    </div>
  );
}
