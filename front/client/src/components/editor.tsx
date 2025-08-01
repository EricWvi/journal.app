import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useImperativeHandle,
} from "react";
import {
  Smile,
  Highlighter,
  Bold,
  Italic,
  Underline,
  Strikethrough,
} from "lucide-react";
import EmojiPicker, { emojiClassName } from "@/components/emoji-picker";
import PhotoPicker, { EditorPhoto } from "@/components/photo-picker";
import { dumpHtmlNodes, Node, NodeType } from "@/lib/html-parse";
import { Entry } from "@shared/schema";
import { createRoot } from "react-dom/client";

export interface EditorHandle {
  dumpEditorContent: () => [Node[], string[], string[]];
}

type Props = {
  ref?: React.Ref<EditorHandle>;
  editingEntry: Entry | null;
};

const WYSIWYG = (props: Props) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    props.editingEntry?.content.forEach((node) => {
      switch (node.type) {
        case NodeType.IMAGE:
          const child = document.createElement("span");
          child.className = "block h-42 w-full rounded-lg overflow-hidden";
          child.contentEditable = "false";
          child.draggable = false;
          createRoot(child).render(<EditorPhoto imgSrc={node.content ?? ""} />);
          editorRef.current?.appendChild(child);
          return;
        case NodeType.TEXT:
          const textNode = document.createTextNode(node.content ?? "");
          editorRef.current?.appendChild(textNode);
          return;
        case NodeType.BREAK:
          const br = document.createElement("br");
          editorRef.current?.appendChild(br);
          return;
        case NodeType.EMOJI:
          const emoji = document.createElement("span");
          emoji.className = emojiClassName(node.content ?? "");
          emoji.contentEditable = "false";
          emoji.draggable = false;
          emoji.setAttribute("data-emoji-id", node.content ?? "");
          editorRef.current?.appendChild(emoji);
          return;
        default:
          return;
      }
    });

    // Focus on mount
    editorFocus();
  }, []);

  const savedSelectionRef = useRef<Range | null>(null);

  const saveSelection = (): void => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const handleBlur = () => {
    saveSelection();
  };

  const editorFocus = () => {
    editorRef.current?.focus();
    if (editorRef.current && savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    } else {
      if (editorRef.current) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false); // false means collapse to end
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  };

  const dumpEditorContent = (): [Node[], string[], string[]] => {
    if (editorRef.current && props.editingEntry) {
      const prev = props.editingEntry.content
        .filter((node) => node.type === NodeType.IMAGE)
        .map((node) => String(node.content));
      const content = dumpHtmlNodes(editorRef.current.childNodes);
      const curr = content
        .filter((node) => node.type === NodeType.IMAGE)
        .map((node) => String(node.content));
      // New items in curr
      const newItems = curr.filter((item) => !prev.includes(item));
      // Deleted items from curr (i.e., were in prev but not in curr)
      const deletedItems = prev.filter((item) => !curr.includes(item));
      return [content, newItems, deletedItems];
    }
    return [[], [], []];
  };

  useImperativeHandle(props.ref, () => ({
    dumpEditorContent,
  }));

  const handleHtmlDump = () => {
    const dumpNodes = dumpEditorContent();
    console.log("Dump Output:", dumpNodes);
  };

  const formatText = useCallback((command: string) => {
    document.execCommand(command, false, undefined);
    editorRef.current?.focus();
  }, []);

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-gray-50 p-3">
        {/* Text formatting */}
        <button
          onClick={() => formatText("bold")}
          className="rounded p-2 transition-colors hover:bg-gray-200"
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => formatText("italic")}
          className="rounded p-2 transition-colors hover:bg-gray-200"
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => formatText("underline")}
          className="rounded p-2 transition-colors hover:bg-gray-200"
          title="Underline"
        >
          <Underline size={18} />
        </button>
        <button
          onClick={() => formatText("strikethrough")}
          className="rounded p-2 transition-colors hover:bg-gray-200"
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </button>
        <button
          onClick={() => formatText("mark")}
          className="rounded p-2 transition-colors hover:bg-gray-200"
          title="Highlighter"
        >
          <Highlighter size={18} />
        </button>

        <div className="mx-2 h-6 w-px bg-gray-300"></div>

        {/* Emoji picker */}
        <button
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            editorFocus();
          }}
          className={`flex items-center gap-2 rounded px-3 py-2 transition-colors ${
            showEmojiPicker
              ? "bg-blue-500 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          <Smile size={18} />
        </button>

        <div className="mx-2 h-6 w-px bg-gray-300"></div>

        {/* dump 放到 dev 模式下，脚本设置变量 */}
        <button
          onClick={handleHtmlDump}
          className="rounded bg-red-100 px-3 py-2 text-red-700 transition-colors hover:bg-red-200"
        >
          Dump
        </button>

        <div className="mx-2 h-6 w-px bg-gray-300"></div>
        <PhotoPicker editorFocus={editorFocus} />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && <EmojiPicker editorFocus={editorFocus} />}

      {/* TODO placeholder */}
      {/* TODO 提取 editor 和 card 的 parse 部分，以及处理 image */}
      {/* WYSIWYG Editor */}
      <div className="mb-4">
        <div
          ref={editorRef}
          contentEditable
          onBlur={handleBlur}
          className="h-[40lvh] w-full overflow-y-auto bg-white p-3 text-lg/6 outline-none"
          suppressContentEditableWarning={true}
        ></div>
      </div>
      <img ref={imgRef}></img>
    </div>
  );
};

export default WYSIWYG;
