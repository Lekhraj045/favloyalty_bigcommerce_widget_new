"use client";

import WidgetWrapper from "@/components/WidgetWrapper";
import { getHeaderStyle, useWidgetTheme } from "@/contexts/WidgetThemeContext";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { ReferFaqsPanel } from "./ReferFaqsPanel";
import { ReferHistoryPanel } from "./ReferHistoryPanel";

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
              <ReferHistoryPanel
                referrals={referrals}
                loading={loading}
                pointsUnit={pointsUnit}
                pointLogoUrl={pointLogoUrl}
                pointLogoIsExternal={pointLogoIsExternal}
                rewardsEarned={rewardsEarned}
                completedCount={completedCount}
                pendingCount={pendingCount}
              />
            </TabPanel>

            <TabPanel>
              <ReferFaqsPanel
                expandedFaq={expandedFaq}
                onExpandedChange={setExpandedFaq}
              />
            </TabPanel>
          </Tabs>
        </motion.div>
      </div>
    </WidgetWrapper>
  );
}
