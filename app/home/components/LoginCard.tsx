"use client";

import Image from "next/image";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type LoginCardProps = {
  storeOrigin?: string;
  headerColor?: string;
};

export default function LoginCard({
  storeOrigin = "",
  headerColor = "#B87333",
}: LoginCardProps) {
  const origin = storeOrigin.replace(/\/+$/, "");
  const loginUrl = origin ? `${origin}/login.php` : "/login.php";
  const createAccountUrl = origin
    ? `${origin}/login.php?action=create_account`
    : "/login.php?action=create_account";

  const navigateTo = (url: string) => {
    if (typeof window === "undefined") return;
    try {
      (window.top || window).location.href = url;
    } catch {
      window.location.href = url;
    }
  };

  return (
    <div className="card !p-0">
      <div className="flex gap-2 items-end">
        <div className="px-3">
          <Image
            src={`${BASE_PATH}/images/join-now.svg`}
            alt="Points"
            width={120}
            height={105}
          />
        </div>
        <div className="flex-1 pr-4 py-4">
          <h4 className="text-[13px] text-center text-gray-800 mb-3 leading-snug">
            Sign up now and discover our rewards program
          </h4>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigateTo(createAccountUrl);
            }}
            className="custom-btn w-full"
          >
            Join Now
          </button>
          <p className="text-[13px] mt-3 text-gray-700 text-center">
            Already a Member?{" "}
            <button
              type="button"
              className="font-semibold underline decoration-2 underline-offset-1 cursor-pointer focus:outline-none hover:opacity-90"
              style={{ color: headerColor }}
              onClick={(e) => {
                e.stopPropagation();
                navigateTo(loginUrl);
              }}
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
