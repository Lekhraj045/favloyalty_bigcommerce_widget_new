"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import WidgetWrapper from "@/components/WidgetWrapper";
import { ArrowLeft, Copy } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const COUPON_CODE = "INR1OFF";

const modalProducts = [
  {
    image: `${basePath}/images/product2.jpg`,
    name: "The Inventory Not Tracked Snowboard - Default Title",
    price: "INR 949.95",
  },
  {
    image: `${basePath}/images/product1.jpg`,
    name: "The Out of Stock Snowboard - Default Title",
    price: "INR 885.95",
  },
];

function fallbackCopyText(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
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

async function copyToClipboard(text: string, onSuccess: () => void): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      onSuccess();
      return;
    }
  } catch {
    // Clipboard API blocked (e.g. in iframe) — use fallback
  }
  if (fallbackCopyText(text)) onSuccess();
}

export default function FlatDiscountPage() {
  const router = useRouter();
  const [showConfirmModal, setShowConfirmModal] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCancel = () => {
    router.push("/redeem-rewards");
  };

  const handleConfirm = () => {
    setShowConfirmModal(false);
    setConfirmed(true);
  };

  const handleCopy = () => {
    copyToClipboard(COUPON_CODE, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const header = (
    <div
      className="text-white p-4 relative rounded-t-2xl"
      style={{ backgroundColor: "#62a63f" }}
    >
      <div className="flex gap-2">
        <div className="mt-[5px]">
          <button type="button" className="cursor-pointer" onClick={() => router.back()}>
            <ArrowLeft size={18} />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Get 50% Discount</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] text-white">
              Coupon Code
            </span>
          </div>
        </div>
      </div>
    </div>
  );

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
          {/* Confirm Discount Creation Modal – render via portal so it appears above widget header */}
          {showConfirmModal &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
                style={{ zIndex: 99999 }}
                aria-modal="true"
                role="dialog"
              >
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                  <div>
                    <div className="p-4">
                      <h3 className="text-base font-bold text-[#303030]">
                        Confirm Discount Creation
                      </h3>
                      <p className="text-sm text-[#616161] mt-2">
                        Are you sure you want to create a 50% discount coupon?
                      </p>
                      <p className="text-sm text-[#62a63f] mt-3">
                        Points to be deducted:{" "}
                        <span className="font-semibold">2</span>
                      </p>
                    </div>
                    <div className="bg-[#fafafa] border-[#e5e5e5] border-t p-3">
                      <p className="text-sm font-medium text-[#303030] mb-2">
                        Applies to 2 selected products:
                      </p>
                      <div className="max-h-[200px] overflow-y-auto custom-scroller">
                        <div className="flex flex-col gap-2">
                          {modalProducts.map((product, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-3 rounded-lg border border-[#e5e5e5] bg-white"
                            >
                              <div className="w-12 h-12 min-w-12 min-h-12 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg border border-[#e5e5e5] overflow-hidden shrink-0">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-medium text-[#303030] truncate">
                                  {product.name}
                                </p>
                                <p className="text-[13px] font-medium text-[#62a63f   ] mt-0.5">
                                  {product.price}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 border-t border-[#e5e5e5] justify-center">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="custom-btn-default"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      className="custom-btn"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}

          {/* Success view after Confirm (2nd image) */}
          {confirmed && (
            <>
              <div className="card flex flex-col gap-4">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <h3 className="text-base font-medium text-[#303030] leading-tight">
                      Flat 50% off Coupon
                    </h3>
                    <p className="text-[13px] text-[#616161] mt-0.5">
                      FOR INDIVIDUAL ORDER
                    </p>
                  </div>
                </div>
                <div className="border-t border-dashed border-[#d4d4d4]" />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="border border-dashed border-[#a3a3a3] rounded-lg bg-[#f5f5f5] px-3 py-2 flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[#303030] truncate">
                        {COUPON_CODE}
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
                  <button type="button" className="custom-btn shrink-0">
                    Apply To Cart
                  </button>
                </div>
              </div>

              <div className="card">
                <h3 className="text-sm font-medium text-[#303030]">
                  Please be ensured that:
                </h3>
                <div className="flex flex-col gap-1.5 mt-2">
                  <p className="text-xs text-[#616161]">
                    The discount code expires in 30 days
                  </p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </WidgetWrapper>
  );
}
