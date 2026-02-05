"use client";

import WidgetWrapper from "@/components/WidgetWrapper";
import { getHeaderStyle, useWidgetTheme } from "@/contexts/WidgetThemeContext";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import BirthdaySaved from "./BirthdaySaved";
import DatepickerBirthday from "./DatepickerBirthday";

type WidgetConfig = {
  apiUrl?: string;
  storeHash?: string;
  channelId?: string;
  customerId?: string;
};

interface CelebrateBirthdayPageProps {
  config?: WidgetConfig | null;
  onBack?: () => void;
}

export default function CelebrateBirthdayPage({
  config,
  onBack,
}: CelebrateBirthdayPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showBirthdaySaved, setShowBirthdaySaved] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const theme = useWidgetTheme();
  const headerStyle = getHeaderStyle(theme);

  const handleSubmit = async () => {
    if (!selectedDate) return;
    const apiUrl = config?.apiUrl?.replace(/\/$/, "");
    const storeHash = config?.storeHash;
    const channelId = config?.channelId;
    const customerId = config?.customerId;
    if (!apiUrl || !storeHash || !channelId || !customerId) {
      setSubmitError("Store or customer not available. Please try again.");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    const dob = selectedDate.toISOString().slice(0, 10);
    try {
      const res = await fetch(`${apiUrl}/api/widget/customer/birthday`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeHash, channelId, customerId, dob }),
      });
      const data = await res.json();
      if (data.success) {
        setPointsAwarded(
          typeof data.pointsAwarded === "number" ? data.pointsAwarded : 0
        );
        setShowBirthdaySaved(true);
      } else {
        setSubmitError(data.message || "Could not save birthday.");
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const header = (
    <div className="text-white p-4 relative rounded-t-2xl" style={headerStyle}>
      <div className="flex gap-2">
        <div className="mt-[5px]">
          <button className="cursor-pointer" onClick={onBack}>
            <ArrowLeft size={18} />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Celebrate Birthday</h3>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] text-white">
              Earn Points
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (showBirthdaySaved) {
    return (
      <WidgetWrapper header={header}>
        <div className="p-4 relative z-10 h-[calc(100vh-84px)] overflow-y-auto custom-scroller">
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            <BirthdaySaved
              pointsAwarded={pointsAwarded ?? undefined}
              onContinue={onBack}
            />
          </motion.div>
        </div>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper header={header}>
      {/* Body */}
      <div className="p-4 relative z-10 h-[calc(100vh-84px)] overflow-y-auto custom-scroller">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          <div className="border border-[#DEDEDE] bg-white rounded-xl p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="text-sm font-medium text-[#303030]">
                    What is your date of Birth?
                  </h3>
                  <p className="text-xs text-[#616161]">
                    You can only change your birthdate once per year.
                  </p>
                </div>

                <DatepickerBirthday
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />

                {submitError && (
                  <p className="text-sm text-red-600">{submitError}</p>
                )}
                <button
                  className={`custom-btn ${
                    selectedDate && !submitting ? "" : "disable"
                  }`}
                  onClick={handleSubmit}
                  disabled={!selectedDate || submitting}
                >
                  {submitting ? "Saving..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </WidgetWrapper>
  );
}
