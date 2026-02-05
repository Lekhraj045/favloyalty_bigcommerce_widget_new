"use client";

import WidgetWrapper from "@/components/WidgetWrapper";
import { getHeaderStyle, useWidgetTheme } from "@/contexts/WidgetThemeContext";
import { ArrowLeft, Loader2, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import SuccessfullySubscribed from "./SuccessfullySubscribed";

type WidgetConfig = {
  apiUrl?: string;
  channelId?: string;
  storeHash?: string;
  customerId?: string | number;
  customerEmail?: string;
  currentCustomerJwt?: string | null;
};

interface SubscribeNewsletterPageProps {
  config?: WidgetConfig;
  onBack: () => void;
}

export default function SubscribeNewsletterPage({
  config,
  onBack,
}: SubscribeNewsletterPageProps) {
  const [showSuccessfullySubscribed, setShowSuccessfullySubscribed] =
    useState(false);
  const [pointsAwarded, setPointsAwarded] = useState<number>(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const theme = useWidgetTheme();
  const headerStyle = getHeaderStyle(theme);

  const handleSubscribe = async () => {
    const email =
      config?.customerEmail &&
      typeof config.customerEmail === "string" &&
      config.customerEmail.trim()
        ? config.customerEmail.trim()
        : null;
    if (!email) {
      setSubmitError("Please sign in to subscribe to the newsletter.");
      return;
    }

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
      setSubmitError("Unable to award points. Missing configuration.");
      return;
    }

    setSubmitError(null);
    setSubmitting(true);

    const STOREFRONT_RESULT_TIMEOUT_MS = 15000;

    return new Promise<void>((resolve) => {
      const onResult = (event: MessageEvent) => {
        const data = event.data;
        if (data?.type !== "fav-loyalty-subscribe-newsletter-result") return;
        window.removeEventListener("message", onResult);
        clearTimeout(timeoutId);
        if (data.success) {
          // Storefront subscription succeeded; award loyalty points via our backend
          const url = `${apiUrl}/api/widget/customer/newsletter-subscribe`;
          const body = useJwt
            ? { currentCustomerJwt: jwt, channelId: channelId ?? undefined }
            : { storeHash, channelId, customerId };
          fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
            .then((res) => res.json().catch(() => ({})))
            .then((result) => {
              setPointsAwarded(
                typeof result.pointsAwarded === "number"
                  ? result.pointsAwarded
                  : 0
              );
              setShowSuccessfullySubscribed(true);
            })
            .catch(() => {
              setSubmitError("Subscribed! Points could not be applied.");
            })
            .finally(() => {
              setSubmitting(false);
              resolve();
            });
        } else {
          setSubmitError(
            data.error || "Failed to subscribe to newsletter. Please try again."
          );
          setSubmitting(false);
          resolve();
        }
      };

      window.addEventListener("message", onResult);
      const timeoutId = window.setTimeout(() => {
        window.removeEventListener("message", onResult);
        setSubmitError(
          "Request timed out. Please ensure you are on the store page and try again."
        );
        setSubmitting(false);
        resolve();
      }, STOREFRONT_RESULT_TIMEOUT_MS);

      try {
        window.parent.postMessage(
          { type: "fav-loyalty-subscribe-newsletter", email },
          "*"
        );
      } catch {
        window.removeEventListener("message", onResult);
        clearTimeout(timeoutId);
        setSubmitError("Something went wrong. Please try again.");
        setSubmitting(false);
        resolve();
      }
    });
  };

  const header = (
    <div className="text-white p-4 relative rounded-t-2xl" style={headerStyle}>
      <div className="flex gap-2">
        <div className="mt-[5px]">
          <button className="cursor-pointer" onClick={() => onBack()}>
            <ArrowLeft size={18} />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Subscribe to Newsletter</h3>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] text-white">
              Earn 100 Points
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (showSuccessfullySubscribed) {
    return (
      <SuccessfullySubscribed
        pointsAwarded={pointsAwarded}
        onBack={onBack}
      />
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
            <div className="flex flex-col gap-4">
              {/* Main Heading */}
              <div className="text-center">
                <h2 className="text-lg font-bold text-[#303030] mb-2">
                  Stay in the Loop!
                </h2>
                <p className="text-sm text-[#616161] px-2">
                  Subscribe to our newsletter and be the first to know about:
                </p>
              </div>

              {/* Loyalty Program Card */}
              <div className="bg-white border border-[#E1E3E5] bg-gradient-to-br from-[#F6F9FE] to-white rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#392d5d] flex items-center justify-center shrink-0">
                    <Trophy className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-[#303030] mb-1">
                      Quick & Easy Rewards
                    </h3>
                    <p className="text-xs text-[#616161]">
                      One click to subscribe and instantly earn points!
                    </p>
                  </div>
                </div>
              </div>

              {submitError && (
                <p className="text-sm text-red-600">{submitError}</p>
              )}
              {/* Subscribe Button */}
              <button
                className="w-full custom-btn flex items-center justify-center gap-2"
                onClick={handleSubscribe}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe & Earn Points"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </WidgetWrapper>
  );
}
