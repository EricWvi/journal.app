import { Node, NodeType } from "@/lib/html-parse";
import { emojiClassName } from "./emoji-picker";
import { EntryMeta, useEntry } from "@/hooks/use-entries";
import { ImageList } from "@/components/ui/image-list";
import { useEffect, useRef, useState } from "react";
import { Icon, More, MoreArrow } from "@/components/ui/icon";
import { formatDate, formatTime } from "@/lib/utils";

const monthToText = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface EntryCardProps {
  meta: EntryMeta;
  showYear: boolean;
  showMonth: boolean;
  showToday: boolean;
  showYes: boolean;
  showTime: boolean;
  onEdit: () => void;
}

export default function EntryCard({
  meta,
  showYear,
  showMonth,
  showToday,
  showYes,
  showTime,
  onEdit,
}: EntryCardProps) {
  const { data: entry, isLoading } = useEntry(meta.id);
  const [expanded, setExpanded] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const collapseHeight = 144; // Default height when collapsed

  useEffect(() => {
    if (entry && cardRef.current) {
      if (cardRef.current.scrollHeight > collapseHeight) {
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    }
  }, [entry]);

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.maxHeight = expanded
        ? cardRef.current.scrollHeight + "px"
        : collapseHeight + "px";
    }
  }, [expanded]);

  const filterContent = (content: Node[]) => {
    let rst: Node[] = [];
    let prev: NodeType = NodeType.BREAK;
    for (const node of content) {
      if (
        node.type === NodeType.IMAGE ||
        (prev === NodeType.IMAGE && node.type === NodeType.BREAK)
      ) {
        prev = node.type;
        continue;
      }
      rst.push(node);
      prev = node.type;
    }
    const firstNonBreak = rst.findIndex((node) => node.type !== NodeType.BREAK);
    const lastNonBreak = rst.findLastIndex(
      (node) => node.type !== NodeType.BREAK,
    );
    if (firstNonBreak === -1) return [];
    return rst.slice(firstNonBreak, lastNonBreak + 1);
  };

  return (
    <>
      {!isLoading && entry && (
        <>
          {showMonth && (
            <h3 className="text-foreground mt-6 mb-2 ml-1 text-xl leading-none font-semibold">
              {monthToText[meta.month - 1]}
              {showYear && ", " + meta.year}
            </h3>
          )}
          {showToday && (
            <h3 className="text-foreground mt-6 mb-2 ml-1 text-xl leading-none font-semibold">
              Today
            </h3>
          )}
          {showYes && (
            <h3 className="text-foreground mt-6 mb-2 ml-1 text-xl leading-none font-semibold">
              Yesterday
            </h3>
          )}

          {/* entry card */}
          <div className="entry-card-shadow bg-entry-card mb-4 flex flex-col overflow-hidden rounded-lg transition-shadow hover:shadow-md">
            {/* TODO picture loading css animation */}
            <div className="my-1 px-1">
              <ImageList
                imgSrc={entry.content
                  .filter((node) => node.type === NodeType.IMAGE)
                  .map((node) => node.content as string)}
              />
            </div>

            {/* text content */}
            <div
              ref={cardRef}
              className={`relative mx-4 my-3 overflow-hidden transition-all duration-500 ease-in-out`}
              onClick={() => setExpanded(!expanded)}
            >
              <div
                className={`${hasMore && !expanded ? "opacity-100 delay-500" : "opacity-0"} absolute right-0 bottom-[1px] flex h-5 w-5 items-center justify-center transition-opacity duration-100`}
              >
                <div className="more-arrow-blur relative">
                  <Icon className="relative z-10 h-[14px] w-[14px]">
                    <MoreArrow />
                  </Icon>
                </div>
              </div>
              <div className="text-foreground text-lg leading-6 font-normal">
                {filterContent(entry.content).map((node, index) => {
                  switch (node.type) {
                    case NodeType.TEXT:
                      return <span key={index}>{node.content}</span>;
                    case NodeType.BREAK:
                      return <br key={index} />;
                    case NodeType.EMOJI:
                      return (
                        <span
                          key={index}
                          draggable={false}
                          contentEditable={false}
                          className={emojiClassName(node.content ?? "")}
                        ></span>
                      );
                    default:
                      return <></>;
                  }
                })}
              </div>
            </div>

            {/* footer */}
            <div className="border-border mx-1 flex items-center justify-between border-t px-3 py-1">
              <div className="flex-1">
                <div className="text-more-arrow flex items-center space-x-1 text-sm">
                  <span>{formatDate(entry.createdAt)}</span>
                  {showTime && <span>· {formatTime(entry.createdAt)}</span>}
                </div>
              </div>
              <div onClick={onEdit}>
                <Icon className="h-5 w-5">
                  <More className="fill-more-arrow" />
                </Icon>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
