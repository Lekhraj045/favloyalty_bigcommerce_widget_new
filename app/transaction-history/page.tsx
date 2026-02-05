"use client";

import React, { useEffect, useRef, useState } from "react";
import WidgetWrapper from "@/components/WidgetWrapper";
import { getHeaderStyle, useWidgetTheme } from "@/contexts/WidgetThemeContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type WidgetConfig = {
  apiUrl?: string;
  channelId?: string;
  storeHash?: string;
  customerId?: string | number;
  currentCustomerJwt?: string | null;
};

type Summary = {
  available: number;
  earned: number;
  spent: number;
};

type TransactionItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  amount: string;
  points?: number;
};

function getConfig(): WidgetConfig {
  if (typeof window === "undefined") return {};
  return (
    (window as unknown as { FavLoyaltyWidgetConfig?: WidgetConfig })
      .FavLoyaltyWidgetConfig ?? {}
  );
}

export default function TransactionHistoryPage() {
  const router = useRouter();
  const [config, setConfig] = useState<WidgetConfig>(() => getConfig());
  const refetchRef = useRef<(() => void) | null>(null);
  const [summary, setSummary] = useState<Summary>({
    available: 0,
    earned: 0,
    spent: 0,
  });
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pointsLogoSrc, setPointsLogoSrc] = useState<string>("point-icon1.svg");
  const [pointsUnit, setPointsUnit] = useState<string>("Points");
  const [pointsLogoReady, setPointsLogoReady] = useState(false);
  const [reopenTrigger, setReopenTrigger] = useState(0);

  // Keep config in sync with parent (e.g. when loader sends customerId via postMessage)
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
        refetchRef.current?.();
        setReopenTrigger((t) => t + 1);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

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
      jwt &&
      jwt !== "null" &&
      jwt !== "undefined" &&
      typeof jwt === "string";

    if (!apiUrl || (!useJwt && !hasStoreAndChannel)) {
      setLoading(false);
      setError("Unable to load transaction history.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const url = `${apiUrl}/api/widget/transactions`;
    const body = useJwt
      ? { currentCustomerJwt: jwt, channelId: channelId ?? undefined }
      : {
          storeHash,
          channelId: channelId ?? undefined,
          customerId: customerId ?? "",
        };

    const doFetch = () => {
      setLoading(true);
      setError(null);
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return;
          if (data.success) {
            setSummary(data.summary ?? { available: 0, earned: 0, spent: 0 });
            setTransactions(data.transactions ?? []);
            if (data.pointsUnit && typeof data.pointsUnit === "string")
              setPointsUnit(data.pointsUnit);
          } else {
            setError(data.message ?? "Failed to load transactions.");
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError("Failed to load transaction history.");
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    refetchRef.current = doFetch;
    doFetch();

    return () => {
      cancelled = true;
      refetchRef.current = null;
    };
  }, [
    config?.apiUrl,
    config?.storeHash,
    config?.channelId,
    config?.customerId,
    config?.currentCustomerJwt,
  ]);

  // Fetch channel settings for dynamic points logo; don't show logo until fetched
  useEffect(() => {
    const apiUrl = config?.apiUrl?.replace(/\/$/, "");
    const storeHash = config?.storeHash;
    const channelId = config?.channelId;
    if (!apiUrl || !storeHash || !channelId) {
      setPointsLogoReady(true);
      return;
    }
    setPointsLogoReady(false);
    let cancelled = false;
    const url = `${apiUrl}/api/widget/channel-settings?storeHash=${encodeURIComponent(storeHash)}&channelId=${encodeURIComponent(String(channelId))}`;
    fetch(url, { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.success) return;
        if (data.pointsLogoSrc && typeof data.pointsLogoSrc === "string")
          setPointsLogoSrc(data.pointsLogoSrc);
        if (data.pointsUnit && typeof data.pointsUnit === "string")
          setPointsUnit(data.pointsUnit);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setPointsLogoReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [config?.apiUrl, config?.storeHash, config?.channelId, reopenTrigger]);

  const pointLogoUrl =
    pointsLogoSrc.startsWith("http") || pointsLogoSrc.startsWith("data:")
      ? pointsLogoSrc
      : `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/images/${pointsLogoSrc}`;
  const pointLogoIsExternal =
    pointsLogoSrc.startsWith("http") || pointsLogoSrc.startsWith("data:");

  const theme = useWidgetTheme();
  const headerStyle = getHeaderStyle(theme);

  const header = (
    <div
      className="text-white p-4 relative rounded-t-2xl"
      style={headerStyle}
    >
      <div className="flex gap-2">
        <div className="mt-[5px]">
          <button
            className="cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Transaction History</h3>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] text-white">
              Check your transaction history
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <WidgetWrapper header={header}>
      <div className="p-4 relative z-10">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col gap-4 h-full"
        >
          {/* Points summary card */}
          <div className="rounded-xl overflow-hidden">
            <div className="bg-linear-to-r from-violet-600 to-indigo-600 p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center min-w-[32px] min-h-[32px]">
                  {!pointsLogoReady ? (
                    <Loader2
                      className="w-5 h-5 text-white/80 animate-spin"
                      aria-hidden
                    />
                  ) : pointLogoIsExternal ? (
                    <img
                      src={pointLogoUrl}
                      alt={pointsUnit}
                      width={22}
                      height={22}
                      className="min-w-[22px] min-h-[22px] object-contain"
                    />
                  ) : (
                    <Image
                      src={pointLogoUrl}
                      alt={pointsUnit}
                      width={22}
                      height={22}
                      className="min-w-[22px] min-h-[22px]"
                    />
                  )}
                </div>
                <span className="text-sm font-medium">{pointsUnit} History</span>
              </div>

              {loading ? (
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col animate-pulse">
                      <div className="h-5 bg-white/20 rounded w-12 mx-auto" />
                      <div className="h-3 bg-white/10 rounded w-14 mx-auto mt-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="flex flex-col">
                    <div className="text-base font-semibold">
                      {Number(summary.available).toFixed(2)}
                    </div>
                    <div className="text-xs text-white/80">Available</div>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-base font-semibold text-emerald-300">
                      +{Number(summary.earned).toFixed(2)}
                    </div>
                    <div className="text-xs text-white/80">Earned</div>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-base font-semibold text-red-300">
                      -{Number(summary.spent).toFixed(2)}
                    </div>
                    <div className="text-xs text-white/80">Spent</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent transactions */}
          <div className="flex-1 overflow-hidden">
            <h3 className="text-md font-medium text-[#303030] mb-3">
              Recent Transactions
            </h3>

            <div className="space-y-3 h-[calc(100vh-286px)] overflow-y-auto custom-scroller">
              {error && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                  {error}
                </div>
              )}

              {loading && !error && (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-3 py-3 animate-pulse"
                    >
                      <div>
                        <div className="h-4 bg-gray-100 rounded w-32" />
                        <div className="mt-2 h-3 bg-gray-100 rounded w-24" />
                      </div>
                      <div className="h-4 bg-gray-100 rounded w-12" />
                    </div>
                  ))}
                </>
              )}

              {!loading && !error && transactions.length === 0 && (
                <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-6 text-center text-sm text-[#6B7280]">
                  No transactions yet.
                </div>
              )}

              {!loading && !error && transactions.length > 0 && (
                <>
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-3 py-3"
                    >
                      <div>
                        <div className="text-sm font-medium text-[#303030]">
                          {tx.title}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-[#6B7280]">
                          <span>{tx.date}</span>
                          <span className="text-[#9CA3AF]">{tx.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="min-w-[18px] min-h-[18px] flex items-center justify-center">
                          {!pointsLogoReady ? (
                            <Loader2
                              className="w-4 h-4 text-[#6B7280] animate-spin"
                              aria-hidden
                            />
                          ) : pointLogoIsExternal ? (
                            <img
                              src={pointLogoUrl}
                              alt={pointsUnit}
                              width={18}
                              height={18}
                              className="min-w-[18px] min-h-[18px] object-contain"
                            />
                          ) : (
                            <Image
                              src={pointLogoUrl}
                              alt={pointsUnit}
                              width={18}
                              height={18}
                              className="min-w-[18px] min-h-[18px]"
                            />
                          )}
                        </div>
                        <div
                          className={`text-xs ${
                            tx.amount.startsWith("-")
                              ? "text-red-500"
                              : "text-emerald-500"
                          }`}
                        >
                          {tx.amount}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </WidgetWrapper>
  );
}
