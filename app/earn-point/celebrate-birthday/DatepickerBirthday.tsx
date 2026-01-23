"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

export default function DatepickerBirthday() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <div className="relative w-[280px]">
      <DatePicker
        selected={selectedDate}
        onChange={(date: Date | null) => setSelectedDate(date as Date)}
        placeholderText="Select Date"
        className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Calendar Icon */}
      <Calendar
        size={18}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      />
    </div>
  );
}
