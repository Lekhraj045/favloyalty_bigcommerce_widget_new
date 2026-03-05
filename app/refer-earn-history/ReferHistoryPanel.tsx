"use client";

import Image from "next/image";

export type ReferralItem = {
  id: string;
  referredEmail: string;
  status: string;
  referralPoints: number;
  createdAt: string;
  completedAt: string | null;
};

type ReferHistoryPanelProps = {
  referrals: ReferralItem[];
  loading: boolean;
  pointsUnit: string;
  pointLogoUrl: string;
  pointLogoIsExternal: boolean;
  rewardsEarned: number;
  completedCount: number;
  pendingCount: number;
};

export function ReferHistoryPanel({
  referrals,
  loading,
  pointsUnit,
  pointLogoUrl,
  pointLogoIsExternal,
  rewardsEarned,
  completedCount,
  pendingCount,
}: ReferHistoryPanelProps) {
  return (
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
              <p className="text-xs text-white">Rewards you&apos;ve earned</p>
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
              <div className="text-xs text-white/80">Total Referrals</div>
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
            Points earned from successful referrals. Keep sharing to unlock more
            benefits!
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
          {loading &&
            [1, 2].map((i) => (
              <div
                key={i}
                className="border border-[#E5E7EB] bg-white rounded-xl p-3 animate-pulse flex items-center justify-between"
              >
                <div className="h-10 w-24 bg-gray-100 rounded" />
                <div className="h-6 w-16 bg-gray-100 rounded" />
              </div>
            ))}
          {!loading && referrals.length === 0 && (
            <div className="border border-[#E5E7EB] bg-white rounded-xl p-6 text-center text-sm text-[#6B7280]">
              You haven&apos;t referred anyone yet.
            </div>
          )}
          {!loading &&
            referrals.map((r) => {
              const displayName =
                r.referredEmail.indexOf("@") > 0
                  ? r.referredEmail.slice(0, r.referredEmail.indexOf("@"))
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
                        {r.referralPoints} {pointsUnit.toLowerCase()} when
                        completed
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
