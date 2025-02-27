
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DateSelector = ({ availableDates, selectedDate, onDateSelect }: any) => {
  return (
    <Select value={selectedDate} onValueChange={onDateSelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Date" />
      </SelectTrigger>
      <SelectContent>
        {availableDates.map((date: string) => (
          <SelectItem key={date} value={date}>
            {date}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DateSelector;
