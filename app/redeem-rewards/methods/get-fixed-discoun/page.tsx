"use client";

import WidgetWrapper from "@/components/WidgetWrapper";
import { getHeaderStyle, useWidgetTheme } from "@/contexts/WidgetThemeContext";
import { ArrowLeft, Copy } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PointsRedeem from "./components/PointsRedeem";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

type WidgetConfig = {
  apiUrl?: string;
  channelId?: string;
  storeHash?: string;
  customerId?: string | number;
};

function getConfig(): WidgetConfig {
  if (typeof window === "undefined") return {};
  return (
    (window as unknown as { FavLoyaltyWidgetConfig?: WidgetConfig })
      .FavLoyaltyWidgetConfig ?? {}
  );
}

type RedeemCoupon = {
  _id?: string;
  redeemType?: string;
  coupon?: {
    active?: boolean;
    value?: number;
    discountAmount?: number;
    name?: string;
    hasExpiry?: boolean;
    expire?: string | null;
    restriction?: {
      maxReduption?: { status?: boolean; value?: number };
      minimumPurchaseAmount?: { status?: boolean; value?: number };
    };
  };
};

function fallbackCopyText(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    document.body.removeChild(textarea);
    return false;
  }
}

async function copyToClipboard(
  text: string,
  onSuccess: () => void
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      onSuccess();
      return;
    }
  } catch {
    /* clipboard blocked */
  }
  if (fallbackCopyText(text)) onSuccess();
}

export default function GetFixedDiscountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponId = searchParams.get("couponId") ?? "";

  const [config, setConfig] = useState<WidgetConfig>(() => getConfig());
  const [redeemSetting, setRedeemSetting] = useState<RedeemCoupon | null>(null);
  const [customerPoints, setCustomerPoints] = useState<number>(0);
  const [currencyCode, setCurrencyCode] = useState<string>("INR");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedPoints, setSelectedPoints] = useState(1);
  const [amountInput, setAmountInput] = useState<string>("");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    couponCode: string;
    offerLabel: string;
    expiresAt: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setConfig(getConfig());
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type === "fav-loyalty-customer") {
        setConfig((prev) => ({
          ...prev,
          customerId:
            (data as { customerId?: string }).customerId ?? prev.customerId,
        }));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const fetchRedeemSettings = useCallback(async () => {
    const apiUrl = config?.apiUrl?.replace(/\/$/, "");
    const storeHash = config?.storeHash;
    const channelId = config?.channelId;
    const customerId = config?.customerId;
    if (!apiUrl || !storeHash || !channelId || !couponId) {
      setRedeemSetting(null);
      setLoading(false);
      if (couponId && (!apiUrl || !storeHash || !channelId)) {
        setLoadError("Widget configuration missing");
      }
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams({
        storeHash: String(storeHash),
        channelId: String(channelId),
      });
      if (customerId != null && String(customerId).trim() !== "") {
        params.set("customerId", String(customerId).trim());
      }
      const url = `${apiUrl}/api/widget/redeem-settings?${params.toString()}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.message || `Failed to load redeem method (${res.status})`
        );
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const found = list.find(
        (c: RedeemCoupon) => (c._id ?? "").toString() === couponId
      );
      setRedeemSetting(found ?? null);
      if (!found) setLoadError("Redeem method not found");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load");
      setRedeemSetting(null);
    } finally {
      setLoading(false);
    }
  }, [
    config?.apiUrl,
    config?.storeHash,
    config?.channelId,
    config?.customerId,
    couponId,
  ]);

  const fetchCustomerPoints = useCallback(async () => {
    const apiUrl = config?.apiUrl?.replace(/\/$/, "");
    const storeHash = config?.storeHash;
    const channelId = config?.channelId;
    const customerId = config?.customerId;
    if (!apiUrl || !storeHash || !channelId || customerId == null) return;
    try {
      const res = await fetch(`${apiUrl}/api/widget/current-customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeHash,
          channelId,
          customerId: String(customerId).trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success && typeof data.points === "number") {
        setCustomerPoints(data.points);
        if (typeof data.currency === "string" && data.currency) {
          setCurrencyCode(data.currency);
        }
      }
    } catch {
      /* ignore */
    }
  }, [
    config?.apiUrl,
    config?.storeHash,
    config?.channelId,
    config?.customerId,
  ]);

  useEffect(() => {
    fetchRedeemSettings();
  }, [fetchRedeemSettings]);

  useEffect(() => {
    if (config?.customerId != null && String(config.customerId).trim() !== "") {
      fetchCustomerPoints();
    }
  }, [config?.customerId, fetchCustomerPoints]);

  useEffect(() => {
    if (!redeemSetting?.coupon) return;
    const value = Number(redeemSetting.coupon.value) || 1;
    const maxRed =
      redeemSetting.coupon.restriction?.maxReduption?.status &&
      Number(redeemSetting.coupon.restriction?.maxReduption?.value) > 0
        ? Math.floor(
            Number(redeemSetting.coupon.restriction.maxReduption.value)
          )
        : null;
    const minP = Math.max(1, value);
    const maxP = Math.min(
      customerPoints,
      maxRed != null ? maxRed : customerPoints
    );
    const effectiveMax = Math.max(minP, maxP);
    setSelectedPoints((prev) => Math.min(effectiveMax, Math.max(minP, prev)));
  }, [redeemSetting, customerPoints]);

  // Keep amount input synced when selectedPoints changes
  useEffect(() => {
    if (!redeemSetting?.coupon) return;
    const value = Number(redeemSetting.coupon.value) || 1;
    const discount = Number(redeemSetting.coupon.discountAmount) || 0;
    if (!discount || !value) return;
    const amt = (selectedPoints / value) * discount;
    if (!Number.isFinite(amt)) return;
    setAmountInput(amt.toFixed(2));
  }, [redeemSetting, selectedPoints]);

  const handleRedeem = async () => {
    const apiUrl = config?.apiUrl?.replace(/\/$/, "");
    const storeHash = config?.storeHash;
    const channelId = config?.channelId;
    const customerId = config?.customerId;
    if (
      !apiUrl ||
      !storeHash ||
      !channelId ||
      customerId == null ||
      String(customerId).trim() === "" ||
      !couponId
    ) {
      setRedeemError("Missing store or customer. Please sign in.");
      return;
    }
    setRedeemError(null);
    setRedeeming(true);
    try {
      const res = await fetch(`${apiUrl}/api/widget/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeHash,
          channelId,
          customerId: String(customerId).trim(),
          redeemSettingId: couponId,
          pointsToRedeem: selectedPoints,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || `Redemption failed (${res.status})`);
      }
      if (!data.success) {
        throw new Error(data?.message || "Redemption failed");
      }
      setResult({
        couponCode: data.couponCode ?? "",
        offerLabel: data.offerLabel ?? "Loyalty reward",
        expiresAt: data.expiresAt ?? null,
      });
    } catch (err) {
      setRedeemError(err instanceof Error ? err.message : "Redemption failed");
    } finally {
      setRedeeming(false);
    }
  };

  const handleCopy = () => {
    const code = result?.couponCode ?? "";
    if (!code) return;
    copyToClipboard(code, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const theme = useWidgetTheme();
  const headerStyle = getHeaderStyle(theme);
  const coupon = redeemSetting?.coupon;
  const pointsPerUnit = Number(coupon?.value) || 10;
  const discountAmount = Number(coupon?.discountAmount) || 1;
  const maxRedemption =
    coupon?.restriction?.maxReduption?.status &&
    Number(coupon?.restriction?.maxReduption?.value) > 0
      ? Math.floor(Number(coupon.restriction.maxReduption.value))
      : null;
  const minPoints = Math.max(1, pointsPerUnit);
  const maxPoints = Math.min(
    customerPoints,
    maxRedemption != null ? maxRedemption : customerPoints
  );
  const effectiveMaxPoints = Math.max(minPoints, maxPoints);
  const currencyAmount = (selectedPoints / pointsPerUnit) * discountAmount;
  const expiryDays =
    coupon?.hasExpiry && coupon?.expire != null && coupon?.expire !== ""
      ? parseInt(String(coupon.expire), 10)
      : null;
  const offerLabel =
    coupon?.name || `Loyalty: $${currencyAmount.toFixed(2)} off`;

  const minAmount =
    (minPoints / pointsPerUnit) * discountAmount || discountAmount;
  const maxAmount =
    (effectiveMaxPoints / pointsPerUnit) * discountAmount || discountAmount;

  const header = (
    <div className="text-white p-4 relative rounded-t-2xl" style={headerStyle}>
      <div className="flex gap-2">
        <div className="mt-[5px]">
          <button
            type="button"
            className="cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {redeemSetting?.coupon?.name ?? "Quick Discount"}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] text-white">
              Swipe and get instant discount coupon
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <WidgetWrapper header={header}>
        <div className="p-4 flex items-center justify-center h-[calc(100vh-84px)]">
          <p className="text-sm text-[#616161]">Loading…</p>
        </div>
      </WidgetWrapper>
    );
  }

  if (loadError && !redeemSetting) {
    return (
      <WidgetWrapper header={header}>
        <div className="p-4 flex flex-col gap-4">
          <p className="text-sm text-red-600">{loadError}</p>
          <button
            type="button"
            className="custom-btn"
            onClick={() => router.push("/redeem-rewards")}
          >
            Back to Rewards
          </button>
        </div>
      </WidgetWrapper>
    );
  }

  if (result) {
    return (
      <WidgetWrapper header={header}>
        <div className="p-4 relative z-10 h-[calc(100vh-84px)] overflow-y-auto custom-scroller">
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            <div className="card flex flex-col gap-4">
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <h3 className="text-base font-medium text-[#303030] leading-tight">
                    {result.offerLabel}
                  </h3>
                  <p className="text-[13px] text-[#616161] mt-0.5">
                    FOR INDIVIDUAL ORDER
                  </p>
                </div>
              </div>
              <div className="border-t border-dashed border-[#d4d4d4]" />
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="border border-dashed border-[#a3a3a3] rounded-lg bg-[#f5f5f5] px-4 py-2 flex items-center gap-2 w-full max-w-[260px] justify-center">
                    <span className="text-[13px] font-medium text-[#303030] truncate">
                      {result.couponCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="shrink-0 p-0.5 rounded text-[#737373] hover:text-[#303030] hover:bg-[#e5e5e5] transition-colors"
                      aria-label="Copy code"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  {copied && (
                    <span className="text-xs text-[#16a34a] font-medium">
                      Copied!
                    </span>
                  )}
                </div>
                <Link
                  href="/redeem-rewards?tab=coupons"
                  className="custom-btn shrink-0 inline-flex items-center justify-center"
                >
                  View My Coupons
                </Link>
              </div>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-[#303030]">
                Please be ensured that:
              </h3>
              <div className="flex flex-col gap-1.5 mt-2">
                <p className="text-xs text-[#616161]">
                  {result.expiresAt
                    ? `The discount code expires on ${new Date(
                        result.expiresAt
                      ).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}`
                    : "The discount code does not expire"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </WidgetWrapper>
    );
  }

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
          <div className="flex flex-col gap-4">
            <div className="card">
              <h3 className="text-sm font-medium text-[#303030]">
                Select Points to Redeem
              </h3>
              <PointsRedeem
                min={minPoints}
                max={effectiveMaxPoints}
                value={selectedPoints}
                onChange={setSelectedPoints}
              />
              <p className="text-sm text-[#303030] text-center mt-1.5">
                {pointsPerUnit} points = {discountAmount} {currencyCode}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex flex-1 h-8 min-w-0 border border-[#d4d4d4] rounded-lg overflow-hidden bg-[#fdfdfd]">
                  <span className="flex items-center px-3 py-2.5 text-sm font-medium text-[#303030] border-r border-[#d4d4d4] bg-[#fafafa]">
                    {currencyCode}
                  </span>
                  <input
                    type="text"
                    value={amountInput}
                    onChange={(e) => {
                      let raw = e.target.value;

                      // Strip invalid characters but keep at most one dot
                      let cleanedRaw = raw.replace(/[^0-9.]/g, "");
                      const firstDot = cleanedRaw.indexOf(".");
                      if (firstDot !== -1) {
                        const before = cleanedRaw.slice(0, firstDot + 1);
                        const after = cleanedRaw
                          .slice(firstDot + 1)
                          .replace(/\./g, "");
                        // Limit to max 2 digits after dot
                        cleanedRaw = before + after.slice(0, 2);
                      }

                      // Always reflect (possibly cleaned) text for UX
                      setAmountInput(cleanedRaw);

                      // Allow empty / interim states (so backspace works)
                      if (cleanedRaw === "" || cleanedRaw === ".") return;

                      const num = parseFloat(cleanedRaw);
                      if (!Number.isFinite(num)) return;

                      let clamped = num;
                      if (clamped < minAmount) clamped = minAmount;
                      if (clamped > maxAmount) clamped = maxAmount;

                      const nextPoints =
                        pointsPerUnit > 0 && discountAmount > 0
                          ? Math.round(
                              (clamped / discountAmount) * pointsPerUnit
                            )
                          : selectedPoints;
                      const safePoints = Math.min(
                        effectiveMaxPoints,
                        Math.max(minPoints, nextPoints)
                      );
                      setSelectedPoints(safePoints);
                    }}
                    onBlur={() => {
                      // On blur, normalize to a valid, clamped amount string
                      const cleaned = amountInput.replace(/[^0-9.]/g, "");
                      const num = parseFloat(cleaned);
                      if (!Number.isFinite(num)) {
                        const amt =
                          (selectedPoints / pointsPerUnit) * discountAmount;
                        setAmountInput(
                          Number.isFinite(amt) ? amt.toFixed(2) : ""
                        );
                        return;
                      }
                      let clamped = num;
                      if (clamped < minAmount) clamped = minAmount;
                      if (clamped > maxAmount) clamped = maxAmount;
                      setAmountInput(clamped.toFixed(2));
                    }}
                    className="flex-1 min-w-0 w-full px-3 py-2.5 text-sm font-medium text-[#303030] bg-transparent outline-none"
                  />
                </div>
                <button
                  type="button"
                  className="custom-btn h-8!"
                  onClick={handleRedeem}
                  disabled={redeeming || selectedPoints < minPoints}
                >
                  {redeeming ? "Redeeming…" : "Redeem"}
                </button>
              </div>
              {redeemError && (
                <p className="text-sm text-red-600 mt-2">{redeemError}</p>
              )}
            </div>

            <div className="card">
              <h3 className="text-sm font-medium text-[#303030]">
                Please be ensured that:
              </h3>
              <div className="flex flex-col gap-1.5 mt-2">
                <p className="text-xs text-[#616161]">
                  {expiryDays != null && !Number.isNaN(expiryDays)
                    ? `The discount code expires in ${expiryDays} days.`
                    : "The discount code does not expire."}
                </p>
                <p className="text-xs text-[#616161]">
                  Conversion rate: {pointsPerUnit} points = {discountAmount}{" "}
                  {currencyCode}
                </p>
                <p className="text-xs text-[#616161]">
                  Minimum redemption: {minPoints} points{" "}
                  {((minPoints / pointsPerUnit) * discountAmount).toFixed(2)}{" "}
                  {currencyCode}
                </p>
                <p className="text-xs text-[#616161]">
                  Maximum {effectiveMaxPoints} points (
                  {(
                    (effectiveMaxPoints / pointsPerUnit) *
                    discountAmount
                  ).toFixed(2)}{" "}
                  {currencyCode}) can be redeemed at once.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </WidgetWrapper>
  );
}
