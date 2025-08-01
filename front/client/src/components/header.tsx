import { Icon, Search, More } from "@/components/ui/icon";
import Stats from "@/components/stats";
import { useEffect, useState } from "react";

interface HeaderProps {
  onSearchToggle: () => void;
  onCalendarToggle: () => void;
}

export default function Header({
  onSearchToggle,
  onCalendarToggle,
}: HeaderProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<{
    from: Date | undefined;
    to?: Date | undefined;
  }>({ from: undefined, to: undefined });

  const handleDateSelect = (
    range: { from: Date | undefined; to?: Date | undefined } | undefined,
  ) => {
    setDate(range ?? { from: undefined, to: undefined });
    setOpen(false);
  };

  return (
    <header>
      <Toolbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-10 mb-1 flex h-12 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-foreground text-3xl font-bold">Journal</h1>
            <div className="hidden items-center space-x-2 text-sm text-[hsl(215,4%,56%)] md:flex">
              <span>Today</span>
              <span className="text-xs">•</span>
              <span>{currentDate}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-search-icon flex h-8 w-8 items-center justify-center rounded-full">
              <Icon className="h-5 w-5">
                <Search />
              </Icon>
            </div>
            <div className="bg-search-icon flex h-8 w-8 items-center justify-center rounded-full">
              <Icon className="h-5 w-5">
                <More />
              </Icon>
            </div>
          </div>
        </div>

        <Stats />
      </div>
    </header>
  );
}

function Toolbar() {
  const [opacity, setOpacity] = useState(0);
  useEffect(() => {
    const container = document.querySelector("#scrollableDiv");
    if (!container) return;

    const handleScroll = () => {
      const scrollY = (container as HTMLElement).scrollTop;
      if (scrollY <= 80) {
        setOpacity(0);
      } else if (scrollY >= 100) {
        setOpacity(1);
      } else {
        const ratio = (scrollY - 80) / (100 - 80);
        setOpacity(ratio);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`toolbar-after apple-backdrop fixed top-0 z-50 h-auto w-full shrink-0 transition-opacity duration-300 ${opacity > 0.6 ? "" : "pointer-events-none"}`}
      style={{ opacity }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-10 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-foreground text-xl font-semibold">Journal</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-toolbar-icon flex h-7 w-7 items-center justify-center rounded-full">
              <Icon className="h-4 w-4">
                <Search />
              </Icon>
            </div>
            <div className="bg-toolbar-icon flex h-7 w-7 items-center justify-center rounded-full">
              <Icon className="h-4 w-4">
                <More />
              </Icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
