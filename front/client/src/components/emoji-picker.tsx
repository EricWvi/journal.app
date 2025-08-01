import React, { useCallback, useEffect } from "react";
import { wechatEmojis, type WechatEmoji } from "@/lib/wechat-emoji";
import "./emoji.css";

type Props = {
  editorFocus: () => void;
};

export const emojiClassName = (emojiId: string) => {
  if (emojiId === "") {
    return "";
  }
  return `wechat-emoji mx-0.5 inline-block h-6 w-6 object-contain align-bottom [zoom:0.1875] ${emojiId}`;
};

const EmojiPicker = ({ editorFocus }: Props) => {
  const insertEmoji = useCallback((emoji: WechatEmoji) => {
    editorFocus();

    // Get current selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    // Create emoji element
    const emojiSpan = document.createElement("span");
    emojiSpan.className = emojiClassName(emoji.id);
    emojiSpan.contentEditable = "false";
    emojiSpan.draggable = false;
    emojiSpan.setAttribute("data-emoji-id", emoji.id);

    // Insert the emoji at cursor position
    range.deleteContents();
    range.insertNode(emojiSpan);

    // Move cursor after the emoji
    range.setStartAfter(emojiSpan);
    range.setEndAfter(emojiSpan);
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  return (
    <div className="mb-4 rounded-lg border-2 border-blue-200 bg-white p-4 shadow-lg">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Click to insert emoji
      </h3>
      <div className="grid max-h-48 grid-cols-[repeat(8,40px)] overflow-y-auto sm:grid-cols-10 sm:gap-2 md:grid-cols-12">
        {wechatEmojis.map((emoji: WechatEmoji) => (
          <div key={emoji.id} className="relative">
            <button
              onClick={() => insertEmoji(emoji)}
              className="flex h-10 w-10 items-center justify-center rounded transition-colors sm:border sm:border-gray-300 sm:hover:border-blue-300 sm:hover:bg-blue-50"
              title={emoji.name}
            >
              <span
                className={`wechat-emoji h-6 w-6 object-contain [zoom:0.1875] ${emoji.id}`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
