"use client";

import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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

type RedeemType =
  | "purchase"
  | "freeShipping"
  | "freeProduct"
  | "storeCredit"
  | "orderPoint";

type RestrictionItem = {
  value?: string;
  imgUrl?: string;
  pointRequired?: string;
};

type RedeemCoupon = {
  _id?: string;
  redeemType: RedeemType;
  coupon?: {
    active?: boolean;
    value?: number;
    discountAmount?: number;
    name?: string;
    restriction?: {
      selectedItems?: {
        status?: boolean;
        items?: RestrictionItem[];
      };
      selectedCollections?: {
        status?: boolean;
        collections?: Array<{ value?: string; imgUrl?: string }>;
      };
    };
  };
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

function getMethodIcon(redeemType: RedeemType): string {
  switch (redeemType) {
    case "purchase":
      return `${BASE_PATH}/images/flat-discount.svg`;
    case "storeCredit":
      return `${BASE_PATH}/images/get-fixed-discount.svg`;
    case "freeShipping":
      return `${BASE_PATH}/images/free-shipping.svg`;
    case "freeProduct":
      return `${BASE_PATH}/images/free-product.svg`;
    default:
      return `${BASE_PATH}/images/flat-discount.svg`;
  }
}

function getMethodDisplayName(coupon: RedeemCoupon): string {
  if (coupon.coupon?.name) return coupon.coupon.name;
  const c = coupon.coupon;
  switch (coupon.redeemType) {
    case "purchase":
      return c?.discountAmount != null
        ? `Flat ${c.discountAmount}% off`
        : "Percentage Discount";
    case "storeCredit":
      return c?.discountAmount != null
        ? `$${c.discountAmount} off`
        : "Get Fixed Discount";
    case "freeShipping":
      return "Free Shipping";
    case "freeProduct":
      return "Get Free Products";
    case "orderPoint":
      return "Order Points";
    default:
      return "Reward";
  }
}

function getMethodSubtitle(coupon: RedeemCoupon): string {
  const c = coupon.coupon;
  switch (coupon.redeemType) {
    case "freeProduct": {
      const items = c?.restriction?.selectedItems?.items;
      if (items?.length) {
        const points = items.map((i) => i.pointRequired).filter(Boolean);
        if (points.length === 1) return `${points[0]} Points`;
        if (new Set(points).size === 1) return `${points[0]} Points`;
        return "Points vary by product";
      }
      return "1 to 1 Points";
    }
    default:
      return c?.value != null ? `${c.value} Points` : "Points";
  }
}

function getMethodHref(
  redeemType: RedeemType,
  couponId: string | undefined
): string {
  const base = "/redeem-rewards/methods";
  const q = couponId ? `?couponId=${encodeURIComponent(couponId)}` : "";
  switch (redeemType) {
    case "purchase":
      return `${base}/flat-discount${q}`;
    case "storeCredit":
      return `${base}/get-fixed-discoun${q}`;
    case "freeShipping":
      return `${base}/free-shipping${q}`;
    case "freeProduct":
      return `${base}/free-product${q}`;
    default:
      return "#";
  }
}

function hasProductRestriction(coupon: RedeemCoupon): boolean {
  const status = coupon.coupon?.restriction?.selectedItems?.status;
  const items = coupon.coupon?.restriction?.selectedItems?.items;
  return !!(status && Array.isArray(items) && items.length > 0);
}

function getRestrictionItems(coupon: RedeemCoupon): RestrictionItem[] {
  return coupon.coupon?.restriction?.selectedItems?.items ?? [];
}

export default function MethodsPage() {
  const [config, setConfig] = useState<WidgetConfig>(() => getConfig());
  const [coupons, setCoupons] = useState<RedeemCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);
  const [customerPoints, setCustomerPoints] = useState<number | null>(null);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

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
    if (!apiUrl || !storeHash || !channelId) {
      setCoupons([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
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
          body?.message || `Failed to load redeem methods (${res.status})`
        );
      }
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load methods");
      setCoupons([]);
    } finally {
      setLoading(false);
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

  // Fetch current customer's points so we can validate methods before navigation
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
      setCustomerPoints(null);
      return;
    }
    const body = {
      storeHash,
      channelId,
      customerId: String(customerId).trim(),
    };
    fetch(`${apiUrl}/api/widget/current-customer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.points === "number") {
          setCustomerPoints(data.points);
        } else {
          setCustomerPoints(null);
        }
      })
      .catch(() => {
        setCustomerPoints(null);
      });
  }, [
    config?.apiUrl,
    config?.storeHash,
    config?.channelId,
    config?.customerId,
  ]);

  const toggleAccordion = (id: string) => {
    setOpenAccordionId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="p-4 h-[calc(100vh-130px)] overflow-y-auto custom-scroller flex items-center justify-center">
        <p className="text-sm text-[#616161]">Loading methods…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 h-[calc(100vh-130px)] overflow-y-auto custom-scroller flex items-center justify-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-[calc(100vh-130px)] overflow-y-auto custom-scroller">
      <div className="flex flex-col gap-4">
        {coupons.length === 0 ? (
          <p className="text-sm text-[#616161]">No redeem methods available.</p>
        ) : (
          coupons.map((coupon) => {
            const couponId = coupon._id ?? "";
            const href = getMethodHref(coupon.redeemType, couponId);
            const hasRestriction = hasProductRestriction(coupon);
            const restrictionItems = getRestrictionItems(coupon);
            const accordionOpen = openAccordionId === couponId;
            const isLink = href !== "#";

            const requiredPoints =
              coupon.coupon?.value != null ? Number(coupon.coupon.value) : 0;
            const errorMessage = cardErrors[couponId];

            const cardContent = (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] bg-linear-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                    <Image
                      src={getMethodIcon(coupon.redeemType)}
                      alt={getMethodDisplayName(coupon)}
                      width={30}
                      height={30}
                      className="min-w-[30px] min-h-[30px]"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-[#303030]">
                      {getMethodDisplayName(coupon)}
                    </h3>
                    <p className="text-xs text-[#616161]">
                      {getMethodSubtitle(coupon)}
                    </p>
                  </div>
                </div>
                {isLink && (
                  <div className="shrink-0">
                    <ChevronRight size={18} />
                  </div>
                )}
              </>
            );

            const handleMethodClick: React.MouseEventHandler<
              HTMLAnchorElement
            > = (e) => {
              // Only enforce for coupon-like methods that consume points
              if (
                customerPoints == null ||
                requiredPoints <= 0 ||
                coupon.redeemType === "freeProduct" ||
                coupon.redeemType === "orderPoint"
              ) {
                return;
              }
              if (customerPoints < requiredPoints) {
                e.preventDefault();
                setCardErrors((prev) => ({
                  ...prev,
                  [couponId]:
                    requiredPoints === 1
                      ? "You do not have enough points to use this reward."
                      : `You need at least ${requiredPoints} points to use this reward.`,
                }));
              } else {
                // Clear any previous error for this card when allowed
                setCardErrors((prev) => {
                  const next = { ...prev };
                  delete next[couponId];
                  return next;
                });
              }
            };

            return (
              <div
                key={couponId}
                className="border border-[#DEDEDE] bg-white rounded-xl overflow-hidden hover:shadow-sm transition-all duration-300"
              >
                {isLink ? (
                  <Link
                    href={href}
                    className="p-4 flex items-center justify-between hover:no-underline text-inherit"
                    onClick={handleMethodClick}
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <div className="p-4 flex items-center justify-between">
                    {cardContent}
                  </div>
                )}

                {errorMessage && (
                  <div className="px-4 pb-3 pt-1 text-xs text-red-600 bg-[#fff7f7] border-t border-[#fecaca]">
                    {errorMessage}
                  </div>
                )}

                {hasRestriction && (
                  <div className="border-t border-[#DEDEDE]">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(couponId)}
                      className="w-full p-4 flex items-center justify-between cursor-pointer text-left hover:bg-[#fafafa] transition-colors"
                    >
                      <span className="text-sm font-medium text-[#303030]">
                        Restricted use - {accordionOpen ? "hide" : "show"}{" "}
                        details
                      </span>
                      {accordionOpen ? (
                        <ChevronUp size={16} className="text-[#616161]" />
                      ) : (
                        <ChevronDown size={16} className="text-[#616161]" />
                      )}
                    </button>
                    {accordionOpen && (
                      <div className="px-4 pb-4">
                        <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                          <p className="text-[13px] text-[#303030] font-medium mb-3">
                            Applies to {restrictionItems.length} selected
                            product
                            {restrictionItems.length !== 1 ? "s" : ""}:
                          </p>
                          <div className="flex flex-col gap-2">
                            {restrictionItems.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#E5E5E5]"
                              >
                                {item.imgUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.imgUrl}
                                    alt={item.value ?? "Product"}
                                    width={30}
                                    height={30}
                                    className="min-w-[30px] min-h-[30px] object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-[30px] h-[30px] min-w-[30px] min-h-[30px] bg-[#f0f0f0] rounded" />
                                )}
                                <p className="text-[13px] text-[#303030] flex-1 truncate">
                                  {item.value ?? "Product"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
