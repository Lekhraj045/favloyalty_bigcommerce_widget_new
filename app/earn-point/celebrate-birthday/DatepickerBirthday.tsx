"use client";

import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

interface DatepickerBirthdayProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
}

export default function DatepickerBirthday({ selectedDate, onDateChange }: DatepickerBirthdayProps) {
  
  // Set min and max dates for birthday (e.g., 100 years ago to today)
  const maxDate = new Date();
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 100);

  return (
    <div className="relative datepicker-area">
      <DatePicker
        selected={selectedDate}
        onChange={(date: Date | null) => onDateChange(date)}
        placeholderText="Select Date"
        className="w-full h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none transition-colors border-[#8a8a8a] bg-[#fdfdfd] cursor-text"
        dateFormat="MM/dd/yyyy"
        showYearDropdown
        showMonthDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={100}
        minDate={minDate}
        maxDate={maxDate}
        popperPlacement="bottom-start"
      />

      {/* Calendar Icon */}
      <Calendar
        size={18}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      />
    </div>
  );
}
