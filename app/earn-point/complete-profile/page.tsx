"use client";

import WidgetWrapper from "@/components/WidgetWrapper";
import { getHeaderStyle, useWidgetTheme } from "@/contexts/WidgetThemeContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import DatepickerWeadingAnniversary from "./DatepickerWeadingAnniversary";
import ProfileCompleted from "./ProfileCompleted";

const NAME_MAX_LENGTH = 50;
const PHONE_MIN_LENGTH = 8;
const PHONE_MAX_LENGTH = 15;
const NAME_REGEX = /^[a-zA-Z\s]*$/;

type WidgetConfig = {
  apiUrl?: string;
  channelId?: string;
  storeHash?: string;
  customerId?: string | number;
  currentCustomerJwt?: string | null;
};

interface CompleteProfilePageProps {
  config?: WidgetConfig;
  onBack?: () => void;
}

type FormErrors = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  ageGroup?: string;
  gender?: string;
};

export default function CompleteProfilePage({
  config,
  onBack,
}: CompleteProfilePageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showProfileCompleted, setShowProfileCompleted] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ageGroup, setAgeGroup] = useState("0-18");
  const [gender, setGender] = useState("male");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState<number>(0);

  const theme = useWidgetTheme();
  const headerStyle = getHeaderStyle(theme);

  function validate(): boolean {
    const next: FormErrors = {};
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedFirst) {
      next.firstName = "First name is required";
    } else if (!NAME_REGEX.test(trimmedFirst)) {
      next.firstName = "Numbers and special characters are not allowed";
    } else if (trimmedFirst.length > NAME_MAX_LENGTH) {
      next.firstName = `First name must be at most ${NAME_MAX_LENGTH} characters`;
    }

    if (!trimmedLast) {
      next.lastName = "Last name is required";
    } else if (!NAME_REGEX.test(trimmedLast)) {
      next.lastName = "Numbers and special characters are not allowed";
    } else if (trimmedLast.length > NAME_MAX_LENGTH) {
      next.lastName = `Last name must be at most ${NAME_MAX_LENGTH} characters`;
    }

    if (!trimmedPhone) {
      next.phone = "Phone number is required";
    } else if (!/^\d+$/.test(trimmedPhone)) {
      next.phone = "Only numbers are allowed";
    } else if (
      trimmedPhone.length < PHONE_MIN_LENGTH ||
      trimmedPhone.length > PHONE_MAX_LENGTH
    ) {
      next.phone = `Phone number must be between ${PHONE_MIN_LENGTH} and ${PHONE_MAX_LENGTH} digits`;
    }

    if (!ageGroup) next.ageGroup = "Age group is required";
    if (!gender) next.gender = "Gender is required";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const handleSubmit = async () => {
    if (!validate()) return;
    const apiUrl = config?.apiUrl?.replace(/\/$/, "");
    const storeHash = config?.storeHash;
    const channelId = config?.channelId;
    const customerId = config?.customerId;
    const jwt = config?.currentCustomerJwt;
    const useJwt =
      jwt && typeof jwt === "string" && jwt !== "null" && jwt !== "undefined";
    const hasStoreAndChannel =
      !!storeHash && channelId != null && channelId !== "";

    if (!apiUrl || (!useJwt && !hasStoreAndChannel)) {
      setSubmitError("Unable to save profile. Missing configuration.");
      return;
    }

    setSubmitError(null);
    setSaving(true);
    try {
      const url = `${apiUrl}/api/widget/customer/profile`;
      const body = useJwt
        ? {
            currentCustomerJwt: jwt,
            channelId: channelId ?? undefined,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            contactNo: phoneNumber.trim(),
            ageGroup,
            gender,
            weddingAnniversary: selectedDate
              ? selectedDate.toISOString()
              : null,
          }
        : {
            storeHash,
            channelId,
            customerId,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            contactNo: phoneNumber.trim(),
            ageGroup,
            gender,
            weddingAnniversary: selectedDate
              ? selectedDate.toISOString()
              : null,
          };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setSubmitError(data.message || "Failed to save profile.");
        return;
      }
      setPointsAwarded(
        typeof data.pointsAwarded === "number" ? data.pointsAwarded : 0
      );
      setShowProfileCompleted(true);
    } catch {
      setSubmitError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const onFirstNameChange = (value: string) => {
    const filtered = value
      .replace(/[^a-zA-Z\s]/g, "")
      .slice(0, NAME_MAX_LENGTH);
    setFirstName(filtered);
    if (errors.firstName) setErrors((e) => ({ ...e, firstName: undefined }));
  };
  const onLastNameChange = (value: string) => {
    const filtered = value
      .replace(/[^a-zA-Z\s]/g, "")
      .slice(0, NAME_MAX_LENGTH);
    setLastName(filtered);
    if (errors.lastName) setErrors((e) => ({ ...e, lastName: undefined }));
  };
  const onPhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, PHONE_MAX_LENGTH);
    setPhoneNumber(digits);
    if (errors.phone) setErrors((e) => ({ ...e, phone: undefined }));
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
          <h3 className="text-lg font-semibold">Complete Profile</h3>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] text-white">
              Earn Points
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (showProfileCompleted) {
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
            <ProfileCompleted
              pointsAwarded={pointsAwarded}
              onViewMyPoints={onBack}
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
          <div className="card">
            <h3 className="text-sm font-medium text-[#303030]">
              Complete these details for rewards
            </h3>

            <div className="flex flex-col gap-4 mt-4">
              <div className="relative">
                <label className="block mb-1 text-[13px] text-gray-700">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => onFirstNameChange(e.target.value)}
                  className={`w-full h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] ${
                    errors.firstName ? "border-red-500" : "border-[#8a8a8a]"
                  }`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div className="relative">
                <label className="block mb-1 text-[13px] text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => onLastNameChange(e.target.value)}
                  className={`w-full h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] ${
                    errors.lastName ? "border-red-500" : "border-[#8a8a8a]"
                  }`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
                )}
              </div>

              <div className="relative">
                <label className="block mb-1 text-[13px] text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={(e) => onPhoneChange(e.target.value)}
                  className={`w-full h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] ${
                    errors.phone ? "border-red-500" : "border-[#8a8a8a]"
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="w-full custom-dropi relative">
                <label className="block mb-1 text-[13px] text-gray-700">
                  Age Group *
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => {
                    setAgeGroup(e.target.value);
                    if (errors.ageGroup)
                      setErrors((e2) => ({ ...e2, ageGroup: undefined }));
                  }}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none bg-[#fdfdfd] ${
                    errors.ageGroup
                      ? "border-red-500"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                  }`}
                >
                  <option value="0-18">0-18</option>
                  <option value="18-24">18-24</option>
                  <option value="24-32">24-32</option>
                  <option value="32-50">32-50</option>
                  <option value="50-70">50-70</option>
                </select>
                {errors.ageGroup && (
                  <p className="mt-1 text-xs text-red-500">{errors.ageGroup}</p>
                )}
              </div>

              <div className="w-full custom-dropi relative">
                <label className="block mb-1 text-[13px] text-gray-700">
                  Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                    if (errors.gender)
                      setErrors((e2) => ({ ...e2, gender: undefined }));
                  }}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none bg-[#fdfdfd] ${
                    errors.gender
                      ? "border-red-500"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                  }`}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-xs text-red-500">{errors.gender}</p>
                )}
              </div>

              <div className="w-full relative">
                <label className="block mb-1 text-[13px] text-gray-700">
                  Wedding Anniversary (Optional)
                </label>
                <DatepickerWeadingAnniversary
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />
              </div>

              {submitError && (
                <p className="text-sm text-red-500">{submitError}</p>
              )}
              <div className="relative w-full">
                <button
                  type="button"
                  className="custom-btn w-full flex items-center justify-center gap-2"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </WidgetWrapper>
  );
}
