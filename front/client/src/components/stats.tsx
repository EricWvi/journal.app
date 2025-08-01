import React from "react";
import {
  Calendar,
  Description,
  Entries,
  Icon,
  Number,
  Quote,
  VerticalBar,
} from "@/components/ui/icon";
import {
  useGetEntryDate,
  useGetEntriesCount,
  useGetWordsCount,
} from "@/hooks/use-metas";

const Stats = () => {
  const { data: entryCount } = useGetEntriesCount(new Date().getFullYear());
  const { data: wordCount } = useGetWordsCount();
  const { data: entryDates } = useGetEntryDate();
  return (
    <div className="flex items-center space-x-2">
      <div className="mr-4 flex flex-col">
        <div className="flex items-center leading-none">
          <Icon className="mr-[6px] ml-[2px] h-4 w-4">
            <Entries />
          </Icon>
          <Number>{entryCount ?? 0}</Number>
        </div>
        <Description>Entries This Year</Description>
      </div>

      <VerticalBar className="h-6" />

      <div className="mr-4 flex flex-col">
        <div className="flex items-center leading-none">
          <Icon className="mr-[6px] ml-[2px] h-4 w-4">
            <Quote />
          </Icon>
          <Number>{wordCount ?? 0}</Number>
        </div>
        <Description>Words Written</Description>
      </div>

      <VerticalBar className="h-6" />

      <div className="mr-4 flex flex-col">
        <div className="flex items-center leading-none">
          <Icon className="mr-[6px] ml-[2px] h-4 w-4">
            <Calendar />
          </Icon>
          <Number>{entryDates?.length ?? 0}</Number>
        </div>
        <Description>Days Journaled</Description>
      </div>
    </div>
  );
};

export default Stats;
