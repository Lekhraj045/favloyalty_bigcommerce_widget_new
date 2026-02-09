"use client";

import WidgetWrapper from "@/components/WidgetWrapper";
import { getHeaderStyle, useWidgetTheme } from "@/contexts/WidgetThemeContext";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";

type WidgetConfig = {
  apiUrl?: string;
  channelId?: string;
  storeHash?: string;
  customerId?: string | number;
  currentCustomerJwt?: string | null;
};

type ReferralItem = {
  id: string;
  referredEmail: string;
  status: string;
  referralPoints: number;
  createdAt: string;
  completedAt: string | null;
};

const FAQS = [
  {
    q: "How long does it take for the referral points to be credited to my account?",
    a: "The time frame for points to be credited can vary. Typically, points are credited once your referred friend successfully signs up and completes their first order.",
  },
  {
    q: "What happens if my friend returns or cancels their order?",
    a: "In the event that your referred friend returns or cancels their order, the referral points may be reversed.",
  },
  {
    q: "How can I track the status of my referred friends and earned points?",
    a: "Once your friend successfully joins through your code and places his first order, you will get notification here and via email.",
  },
];

function getConfig(): WidgetConfig {
  if (typeof window === "undefined") return {};
  return (
    (window as unknown as { FavLoyaltyWidgetConfig?: WidgetConfig })
      .FavLoyaltyWidgetConfig ?? {}
  );
}

function getWidgetAuthBody(config: WidgetConfig) {
  const jwt = config?.currentCustomerJwt;
  const useJwt =
    jwt && jwt !== "null" && jwt !== "undefined" && typeof jwt === "string";
  if (useJwt) {
    return {
      currentCustomerJwt: jwt,
      channelId: config?.channelId ?? undefined,
    };
  }
  return {
    storeHash: config?.storeHash,
    channelId: config?.channelId ?? undefined,
    customerId: config?.customerId,
  };
}

export default function ReferEarnHistoryPage() {
  const router = useRouter();
  const theme = useWidgetTheme();
  const [config, setConfig] = useState<WidgetConfig>(() => getConfig());
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pointsUnit, setPointsUnit] = useState("Points");
  const [pointsLogoSrc, setPointsLogoSrc] = useState("point-icon1.svg");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  useEffect(() => {
    setConfig(getConfig());
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type === "fav-loyalty-customer") {
        setConfig((prev) => ({
          ...prev,
          customerId: data.customerId ?? prev.customerId,
        }));
      }
      if (data?.type === "fav-loyalty-widget-opened") {
        setConfig(getConfig());
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const apiUrl = config?.apiUrl?.replace(/\/$/, "");
    const hasAuth =
      (config?.currentCustomerJwt && config?.channelId) ||
      (config?.storeHash &&
        config?.channelId != null &&
        config?.channelId !== "");
    if (!apiUrl || !hasAuth) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const body = getWidgetAuthBody(config);
    fetch(`${apiUrl}/api/widget/referrals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.referrals)) {
          setReferrals(data.referrals);
        } else {
          setReferrals([]);
        }
      })
      .catch(() => {
        if (!cancelled) setReferrals([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    config?.apiUrl,
    config?.storeHash,
    config?.channelId,
    config?.customerId,
    config?.currentCustomerJwt,
  ]);

  useEffect(() => {
    const apiUrl = config?.apiUrl?.replace(/\/$/, "");
    const storeHash = config?.storeHash;
    const channelId = config?.channelId;
    if (!apiUrl || !storeHash || !channelId) return;
    let cancelled = false;
    const url = `${apiUrl}/api/widget/channel-settings?storeHash=${encodeURIComponent(storeHash)}&channelId=${encodeURIComponent(String(channelId))}`;
    fetch(url, { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.success) return;
        if (data.pointsUnit && typeof data.pointsUnit === "string")
          setPointsUnit(data.pointsUnit);
        if (data.pointsLogoSrc && typeof data.pointsLogoSrc === "string")
          setPointsLogoSrc(data.pointsLogoSrc);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [config?.apiUrl, config?.storeHash, config?.channelId]);

  const headerStyle = getHeaderStyle(theme);
  const completedCount = referrals.filter(
    (r) => r.status === "Completed",
  ).length;
  const pendingCount = referrals.length - completedCount;
  const rewardsEarned = referrals
    .filter((r) => r.status === "Completed")
    .reduce((sum, r) => sum + (r.referralPoints || 0), 0);

  const pointLogoUrl =
    pointsLogoSrc.startsWith("http") || pointsLogoSrc.startsWith("data:")
      ? pointsLogoSrc
      : `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/images/${pointsLogoSrc}`;
  const pointLogoIsExternal =
    pointsLogoSrc.startsWith("http") || pointsLogoSrc.startsWith("data:");

  const header = (
    <div className="text-white p-4 relative rounded-t-2xl" style={headerStyle}>
      <div className="flex gap-2">
        <div className="mt-[5px]">
          <button
            type="button"
            className="cursor-pointer"
            onClick={() => router.back()}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Refer and Earn History</h3>
          <p className="text-sm mt-1 text-white/90">
            View your referrals and FAQs
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <WidgetWrapper header={header}>
      <div className="relative z-10">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          <Tabs
            className="customTab"
            selectedIndex={selectedTabIndex}
            onSelect={(index) => setSelectedTabIndex(index)}
          >
            <TabList>
              <Tab>History</Tab>
              <Tab>FAQs</Tab>
            </TabList>

            <TabPanel>
              <div className="p-4 h-[calc(100vh-130px)] overflow-y-auto custom-scroller space-y-4">
                {/* Rewards summary card */}
                <div className="bg-linear-to-r from-violet-600 to-indigo-600 text-white rounded-xl">
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex items-center gap-2 px-4 pt-4">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        {pointLogoIsExternal ? (
                          <img
                            src={pointLogoUrl}
                            alt={pointsUnit}
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        ) : (
                          <Image
                            src={pointLogoUrl}
                            alt={pointsUnit}
                            width={24}
                            height={24}
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-white">
                          Rewards you&apos;ve earned
                        </p>
                        <p className="text-2xl font-semibold text-white">
                          {loading ? "—" : rewardsEarned}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="flex flex-col">
                        <div className="text-base font-semibold">
                          {loading ? "—" : referrals.length}
                        </div>
                        <div className="text-xs text-white/80">
                          Total Referrals
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <div className="text-base font-semibold">
                          {loading ? "—" : completedCount}
                        </div>
                        <div className="text-xs text-white/80">Completed</div>
                      </div>

                      <div className="flex flex-col">
                        <div className="text-base font-semibold">
                          {loading ? "—" : pendingCount}
                        </div>
                        <div className="text-xs text-white/80">Pending</div>
                      </div>
                    </div>

                    <hr className="border-t border-white/20 flex-1" />

                    <p className="text-xs text-white px-4 pb-4">
                      Points earned from successful referrals. Keep sharing to
                      unlock more benefits!
                    </p>
                  </div>
                </div>

                {/* Past Referrals */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-[#303030]">
                      Past Referrals:
                    </h4>
                    <span className="text-xs text-[#6B7280]">
                      {referrals.length} Total
                    </span>
                  </div>
                  <div className="space-y-3">
                    {loading && (
                      <>
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="border border-[#E5E7EB] bg-white rounded-xl p-3 animate-pulse flex items-center justify-between"
                          >
                            <div className="h-10 w-24 bg-gray-100 rounded" />
                            <div className="h-6 w-16 bg-gray-100 rounded" />
                          </div>
                        ))}
                      </>
                    )}
                    {!loading && referrals.length === 0 && (
                      <div className="border border-[#E5E7EB] bg-white rounded-xl p-6 text-center text-sm text-[#6B7280]">
                        You haven&apos;t referred anyone yet.
                      </div>
                    )}
                    {!loading &&
                      referrals.map((r) => {
                        const displayName =
                          r.referredEmail.indexOf("@") > 0
                            ? r.referredEmail.slice(
                                0,
                                r.referredEmail.indexOf("@"),
                              )
                            : r.referredEmail;
                        const invitedDate = r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "";
                        const isCompleted = r.status === "Completed";
                        return (
                          <div
                            key={r.id}
                            className="border border-[#E5E7EB] bg-white rounded-xl p-3 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[#303030] truncate">
                                  {displayName}
                                </p>
                                <p className="text-xs text-[#6B7280] truncate">
                                  {r.referredEmail}
                                </p>
                                {invitedDate && (
                                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                                    Invited: {invitedDate}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-0.5 shrink-0">
                              <span
                                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                  isCompleted
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {r.status === "Pending"
                                  ? "Pending"
                                  : r.status === "Referred Claimed"
                                    ? "Signed up"
                                    : r.status}
                              </span>
                              <div className="flex items-center gap-1 mt-1">
                                {pointLogoIsExternal ? (
                                  <img
                                    src={pointLogoUrl}
                                    alt=""
                                    width={14}
                                    height={14}
                                    className="object-contain"
                                  />
                                ) : (
                                  <Image
                                    src={pointLogoUrl}
                                    alt=""
                                    width={14}
                                    height={14}
                                  />
                                )}
                                <span className="text-base font-medium text-[#303030]">
                                  {isCompleted ? r.referralPoints : 0}
                                </span>
                              </div>
                              {!isCompleted && (
                                <p className="text-[10px] text-[#6B7280]">
                                  {r.referralPoints} {pointsUnit.toLowerCase()}{" "}
                                  when completed
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </TabPanel>

            <TabPanel>
              <div className="p-4 h-[calc(100vh-130px)] overflow-y-auto custom-scroller space-y-2">
                {FAQS.map((faq, index) => {
                  const isOpen = expandedFaq === index;
                  return (
                    <div
                      key={index}
                      className="border border-[#E5E7EB] bg-[#F9FAFB] rounded-xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isOpen ? null : index)}
                        className="w-full px-4 py-3 text-left flex items-center justify-between gap-2"
                      >
                        <span className="text-sm font-medium text-[#303030]">
                          {faq.q}
                        </span>
                        <span
                          className={`shrink-0 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-3 pt-0">
                          <p className="text-sm text-[#6B7280] leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabPanel>
          </Tabs>
        </motion.div>
      </div>
    </WidgetWrapper>
  );
}
