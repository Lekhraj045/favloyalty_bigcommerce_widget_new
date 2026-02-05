"use client";

import WidgetWrapper from "@/components/WidgetWrapper";
import { getHeaderStyle, useWidgetTheme } from "@/contexts/WidgetThemeContext";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CelebrateBirthdayPage from "./celebrate-birthday/page";
import CompleteProfilePage from "./complete-profile/page";
import SubscribeNewsletterPage from "./subscribe-newsletter/page";

type WidgetConfig = {
  apiUrl?: string;
  channelId?: string;
  storeHash?: string;
  storeOrigin?: string;
  customerId?: string | number;
  customerEmail?: string;
  currentCustomerJwt?: string | null;
};

type PointsData = {
  points: number;
  pointsUnit: string;
  currency?: string;
  hasBirthday?: boolean;
  hasCompletedProfile?: boolean;
  hasSubscribedNewsletter?: boolean;
};

type WaysToEarnItem = { enabled: boolean; points: number };
type WaysToEarn = {
  birthday: WaysToEarnItem;
  profileCompletion: WaysToEarnItem;
  newsletter: WaysToEarnItem;
  everyPurchase: WaysToEarnItem;
};

const DEFAULT_WAYS_TO_EARN: WaysToEarn = {
  birthday: { enabled: false, points: 0 },
  profileCompletion: { enabled: false, points: 0 },
  newsletter: { enabled: false, points: 0 },
  everyPurchase: { enabled: false, points: 0 },
};

function getConfig(): WidgetConfig {
  if (typeof window === "undefined") return {};
  const fromWindow = (
    window as unknown as { FavLoyaltyWidgetConfig?: WidgetConfig }
  ).FavLoyaltyWidgetConfig;
  if (fromWindow) return fromWindow;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const raw = urlParams.get("config");
    if (raw) {
      const parsed = JSON.parse(decodeURIComponent(raw)) as WidgetConfig;
      return parsed ?? {};
    }
  } catch {
    // ignore
  }
  return {};
}

export default function EarnPointPage() {
  const router = useRouter();
  const [config, setConfig] = useState<WidgetConfig>(() => getConfig());
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [pointsLoading, setPointsLoading] = useState(true);
  const [waysToEarn, setWaysToEarn] =
    useState<WaysToEarn>(DEFAULT_WAYS_TO_EARN);
  const [waysToEarnLoading, setWaysToEarnLoading] = useState(true);
  const [showCelebrateBirthday, setShowCelebrateBirthday] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [showSubscribeNewsletter, setShowSubscribeNewsletter] = useState(false);
  const theme = useWidgetTheme();
  const headerStyle = getHeaderStyle(theme);

  // Keep config in sync and refetch when widget reopens
  const [reopenTrigger, setReopenTrigger] = useState(0);
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

  // Fetch customer points (and more later) from API when page loads
  useEffect(() => {
    const apiUrl = config?.apiUrl?.replace(/\/$/, "");
    const storeHash = config?.storeHash;
    const channelId = config?.channelId;
    const customerId = config?.customerId;
    const jwt = config?.currentCustomerJwt;

    const hasStoreAndChannel =
      !!storeHash &&
      channelId != null &&
      channelId !== "" &&
      channelId !== "null" &&
      channelId !== "undefined";
    const useJwt =
      jwt && jwt !== "null" && jwt !== "undefined" && typeof jwt === "string";

    if (!apiUrl || (!useJwt && !hasStoreAndChannel)) {
      setPointsLoading(false);
      setPointsData({
        points: 0,
        pointsUnit: "Points",
        currency: undefined,
        hasBirthday: false,
        hasCompletedProfile: false,
        hasSubscribedNewsletter: false,
      });
      return;
    }

    let cancelled = false;
    setPointsLoading(true);
    const url = `${apiUrl}/api/widget/current-customer`;
    const body = useJwt
      ? { currentCustomerJwt: jwt, channelId: channelId ?? undefined }
      : { storeHash, channelId: channelId ?? undefined, customerId };

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const hasBirthday = !!data.hasBirthday;
        const hasCompletedProfile = !!data.hasCompletedProfile;
        const hasSubscribedNewsletter = !!data.hasSubscribedNewsletter;
        if (data.success && data.inLoyaltyProgram) {
          setPointsData({
            points: typeof data.points === "number" ? data.points : 0,
            pointsUnit:
              typeof data.pointsUnit === "string" ? data.pointsUnit : "Points",
            currency:
              typeof data.currency === "string" ? data.currency : undefined,
            hasBirthday,
            hasCompletedProfile,
            hasSubscribedNewsletter,
          });
        } else {
          setPointsData({
            points: 0,
            pointsUnit: data.pointsUnit ?? "Points",
            currency:
              typeof data.currency === "string" ? data.currency : undefined,
            hasBirthday,
            hasCompletedProfile,
            hasSubscribedNewsletter,
          });
        }
      })
      .catch(() => {
        if (!cancelled)
          setPointsData({
            points: 0,
            pointsUnit: "Points",
            currency: undefined,
            hasBirthday: false,
            hasCompletedProfile: false,
            hasSubscribedNewsletter: false,
          });
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
    config?.currentCustomerJwt,
    reopenTrigger,
  ]);

  // Fetch ways to earn (from Ways to Earn page) for card visibility and points
  useEffect(() => {
    const apiUrl = config?.apiUrl?.replace(/\/$/, "");
    const storeHash = config?.storeHash;
    const channelId = config?.channelId;
    if (!apiUrl || !storeHash || !channelId) {
      setWaysToEarnLoading(false);
      return;
    }
    let cancelled = false;
    setWaysToEarnLoading(true);
    const url = `${apiUrl}/api/widget/channel-settings?storeHash=${encodeURIComponent(
      storeHash
    )}&channelId=${encodeURIComponent(String(channelId))}`;
    fetch(url, { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.success) return;
        const w = data.waysToEarn;
        if (w && typeof w === "object") {
          setWaysToEarn({
            birthday: {
              enabled: !!w.birthday?.enabled,
              points:
                typeof w.birthday?.points === "number" ? w.birthday.points : 0,
            },
            profileCompletion: {
              enabled: !!w.profileCompletion?.enabled,
              points:
                typeof w.profileCompletion?.points === "number"
                  ? w.profileCompletion.points
                  : 0,
            },
            newsletter: {
              enabled: !!w.newsletter?.enabled,
              points:
                typeof w.newsletter?.points === "number"
                  ? w.newsletter.points
                  : 0,
            },
            everyPurchase: {
              enabled: !!w.everyPurchase?.enabled,
              points:
                typeof w.everyPurchase?.points === "number"
                  ? w.everyPurchase.points
                  : 0,
            },
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setWaysToEarnLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [config?.apiUrl, config?.storeHash, config?.channelId, reopenTrigger]);

  const pointsLabel = pointsLoading
    ? "Loading..."
    : pointsData
    ? `You have ${Number(pointsData.points).toFixed(2)} ${
        pointsData.pointsUnit
      }`
    : "You have 0.00 Points";

  const header = (
    <div className="text-white p-4 relative rounded-t-2xl" style={headerStyle}>
      <div className="flex gap-2">
        <div className="mt-[5px]">
          <button className="cursor-pointer" onClick={() => router.back()}>
            <ArrowLeft size={18} />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Earn Points</h3>

          <div className="flex items-center gap-2 mt-1">
            {pointsLoading ? (
              <span className="text-sm inline-flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading...
              </span>
            ) : (
              <span className="text-sm">{pointsLabel}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (showCelebrateBirthday) {
    return (
      <CelebrateBirthdayPage
        config={config}
        onBack={() => {
          setShowCelebrateBirthday(false);
          setReopenTrigger((t) => t + 1);
        }}
      />
    );
  }

  if (showCompleteProfile) {
    return (
      <CompleteProfilePage
        config={config}
        onBack={() => {
          setShowCompleteProfile(false);
          setReopenTrigger((t) => t + 1);
        }}
      />
    );
  }

  if (showSubscribeNewsletter) {
    return (
      <SubscribeNewsletterPage
        config={config}
        onBack={() => {
          setShowSubscribeNewsletter(false);
          setReopenTrigger((t) => t + 1);
        }}
      />
    );
  }

  const currency = pointsData?.currency || "INR";
  const pointsUnit = pointsData?.pointsUnit || "Points";

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
          {waysToEarn.birthday.enabled && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (pointsData?.hasBirthday) return;
                setShowCelebrateBirthday(true);
              }}
              className={`border border-[#DEDEDE] bg-white rounded-xl p-4 flex items-center gap-3 justify-between transition-all duration-300 ${
                pointsData?.hasBirthday
                  ? "opacity-60 pointer-events-none cursor-default"
                  : "hover:shadow-sm cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-[40px] h-[40px] bg-linear-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/birthday-gift-icon.svg`}
                    alt="Birthday Gift"
                    width={30}
                    height={30}
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-medium text-[#303030]">
                      Birthday Gift
                    </h3>
                    {pointsData?.hasBirthday && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                        style={{
                          backgroundColor: "#dcfce7",
                          color: "#166534",
                        }}
                      >
                        Used
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#616161]">
                    Earn {waysToEarn.birthday.points} {pointsUnit.toLowerCase()}
                  </p>
                </div>
              </div>

              {!pointsData?.hasBirthday && (
                <div className="shrink-0">
                  <ChevronRight size={18} />
                </div>
              )}
            </div>
          )}

          {waysToEarn.profileCompletion.enabled && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (pointsData?.hasCompletedProfile) return;
                setShowCompleteProfile(true);
              }}
              className={`border border-[#DEDEDE] bg-white rounded-xl p-4 flex items-center gap-3 justify-between transition-all duration-300 ${
                pointsData?.hasCompletedProfile
                  ? "opacity-60 pointer-events-none cursor-default"
                  : "hover:shadow-sm cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-[40px] h-[40px] bg-linear-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/complete-profile-icon.svg`}
                    alt="Complete Profile"
                    width={30}
                    height={30}
                    className="min-w-[30px] min-h-[30px]"
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-medium text-[#303030]">
                      Complete Profile
                    </h3>
                    {pointsData?.hasCompletedProfile && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                        style={{
                          backgroundColor: "#dcfce7",
                          color: "#166534",
                        }}
                      >
                        Used
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#616161]">
                    Earn {waysToEarn.profileCompletion.points}{" "}
                    {pointsUnit.toLowerCase()}
                  </p>
                </div>
              </div>

              {!pointsData?.hasCompletedProfile && (
                <div className="shrink-0">
                  <ChevronRight size={18} />
                </div>
              )}
            </div>
          )}

          {waysToEarn.newsletter.enabled && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (pointsData?.hasSubscribedNewsletter) return;
                setShowSubscribeNewsletter(true);
              }}
              className={`border border-[#DEDEDE] bg-white rounded-xl p-4 flex items-center gap-3 justify-between transition-all duration-300 ${
                pointsData?.hasSubscribedNewsletter
                  ? "opacity-60 pointer-events-none cursor-default"
                  : "hover:shadow-sm cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-[40px] h-[40px] bg-linear-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/subscribe-newsletter-icon.svg`}
                    alt="subscribe newsletter"
                    width={30}
                    height={30}
                    className="min-w-[30px] min-h-[30px]"
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-medium text-[#303030]">
                      Subscribe to Newsletter
                    </h3>
                    {pointsData?.hasSubscribedNewsletter && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                        style={{
                          backgroundColor: "#dcfce7",
                          color: "#166534",
                        }}
                      >
                        Used
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#616161]">
                    Earn {waysToEarn.newsletter.points}{" "}
                    {pointsUnit.toLowerCase()}
                  </p>
                </div>
              </div>

              {!pointsData?.hasSubscribedNewsletter && (
                <div className="shrink-0">
                  <ChevronRight size={18} />
                </div>
              )}
            </div>
          )}

          {waysToEarn.everyPurchase.enabled && (
            <div
              onClick={() => {
                const origin =
                  config?.storeOrigin ||
                  (typeof window !== "undefined" &&
                    window.top &&
                    window.top.location &&
                    window.top.location.origin);
                if (origin) {
                  const homeUrl = origin.replace(/\/$/, "") + "/";
                  window.top!.location.href = homeUrl;
                }
              }}
              className="border border-[#DEDEDE] bg-white rounded-xl p-4 flex items-center gap-3 justify-between hover:shadow-sm transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-[40px] h-[40px] bg-linear-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/purchase-product-icon.svg`}
                    alt="purchase"
                    width={30}
                    height={30}
                    className="min-w-[30px] min-h-[30px]"
                  />
                </div>

                <div className="flex flex-col">
                  <h3 className="text-sm font-medium text-[#303030]">
                    Purchase a Product
                  </h3>
                  <p className="text-xs text-[#616161]">
                    Earn {waysToEarn.everyPurchase.points} {pointsUnit} on each{" "}
                    {currency} spent
                  </p>
                </div>
              </div>

              <div>
                <ChevronRight size={18} />
              </div>
            </div>
          )}

          {!waysToEarnLoading &&
            !waysToEarn.birthday.enabled &&
            !waysToEarn.profileCompletion.enabled &&
            !waysToEarn.newsletter.enabled &&
            !waysToEarn.everyPurchase.enabled && (
              <p className="text-sm text-[#616161] text-center py-4">
                No ways to earn are currently enabled.
              </p>
            )}
        </motion.div>
      </div>
    </WidgetWrapper>
  );
}
