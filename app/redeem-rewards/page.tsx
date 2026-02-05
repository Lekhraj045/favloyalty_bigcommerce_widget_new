"use client";

import WidgetWrapper from "@/components/WidgetWrapper";
import { getHeaderStyle, useWidgetTheme } from "@/contexts/WidgetThemeContext";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import CouponsPage from "./coupons/page";
import MethodsPage from "./methods/page";

type WidgetConfig = {
  apiUrl?: string;
  channelId?: string;
  storeHash?: string;
  customerId?: string | number;
  currentCustomerJwt?: string | null;
};

type PointsHeaderState = {
  points: number;
  pointsUnit: string;
};

function getConfig(): WidgetConfig {
  if (typeof window === "undefined") return {};
  return (
    (window as unknown as { FavLoyaltyWidgetConfig?: WidgetConfig })
      .FavLoyaltyWidgetConfig ?? {}
  );
}

const COUPONS_TAB_INDEX = 1;

export default function RedeemRewardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useWidgetTheme();
  const headerStyle = getHeaderStyle(theme);

  const tabParam = searchParams.get("tab");
  const initialTabIndex = tabParam === "coupons" ? COUPONS_TAB_INDEX : 0;
  const [selectedTabIndex, setSelectedTabIndex] = useState(initialTabIndex);

  useEffect(() => {
    setSelectedTabIndex(tabParam === "coupons" ? COUPONS_TAB_INDEX : 0);
  }, [tabParam]);

  const [config, setConfig] = useState<WidgetConfig>(() => getConfig());
  const [headerPoints, setHeaderPoints] = useState<PointsHeaderState | null>(
    null
  );
  const [pointsLoading, setPointsLoading] = useState(true);
  const [reopenTrigger, setReopenTrigger] = useState(0);

  // Keep config in sync and refetch when widget is reopened
  useEffect(() => {
    setConfig(getConfig());
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type === "fav-loyalty-customer") {
        setConfig((prev) => ({
          ...prev,
          customerId: data.customerId ?? prev.customerId,
          customerEmail: data.customerEmail ?? prev.customerEmail,
        }));
      }
      if (data?.type === "fav-loyalty-widget-opened") {
        setReopenTrigger((t) => t + 1);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Fetch current customer points for header whenever config changes or widget reopens
  useEffect(() => {
    const apiUrl = config?.apiUrl?.replace(/\/$/, "");
    const storeHash = config?.storeHash;
    const channelId = config?.channelId;
    const customerId = config?.customerId;

    if (
      !apiUrl ||
      !storeHash ||
      !channelId ||
      customerId == null ||
      String(customerId).trim() === ""
    ) {
      setPointsLoading(false);
      setHeaderPoints(null);
      return;
    }

    setPointsLoading(true);
    const body = {
      storeHash,
      channelId,
      customerId: String(customerId).trim(),
    };

    let cancelled = false;
    fetch(`${apiUrl}/api/widget/current-customer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && typeof data.points === "number") {
          setHeaderPoints({
            points: data.points,
            pointsUnit: data.pointsUnit ?? "Points",
          });
        } else {
          setHeaderPoints(null);
        }
      })
      .catch(() => {
        if (!cancelled) setHeaderPoints(null);
      })
      .finally(() => {
        if (!cancelled) setPointsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    config?.apiUrl,
    config?.storeHash,
    config?.channelId,
    config?.customerId,
    reopenTrigger,
  ]);

  let pointsLabel = "Redeem rewards with your points";
  if (pointsLoading) {
    pointsLabel = "Loading your points…";
  } else if (headerPoints) {
    pointsLabel = `You have ${headerPoints.points.toFixed(2)} ${
      headerPoints.pointsUnit
    }`;
  }

  const header = (
    <div className="text-white p-4 relative rounded-t-2xl" style={headerStyle}>
      <div className="flex gap-2">
        <div className="mt-[5px]">
          <button className="cursor-pointer" onClick={() => router.back()}>
            <ArrowLeft size={18} />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Redeem Rewards</h3>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px] text-white">
              {pointsLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <WidgetWrapper header={header}>
      {/* Body */}
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
              <Tab>Methods</Tab>
              <Tab>Coupons</Tab>
            </TabList>

            <TabPanel>
              <MethodsPage />
            </TabPanel>
            <TabPanel>
              <CouponsPage />
            </TabPanel>
          </Tabs>
        </motion.div>
      </div>
    </WidgetWrapper>
  );
}
