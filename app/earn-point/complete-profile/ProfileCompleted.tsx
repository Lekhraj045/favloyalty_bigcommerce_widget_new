import Image from "next/image";

interface ProfileCompletedProps {
  pointsAwarded?: number;
  onViewMyPoints?: () => void;
}

export default function ProfileCompleted({
  pointsAwarded = 0,
  onViewMyPoints,
}: ProfileCompletedProps) {
  return (
    <div className="card text-center">
      {/* Icon */}
      <div className="mb-4">
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/profile-completed.svg`}
          alt="Profile completed"
          width={80}
          height={80}
          className="mx-auto min-w-[80px] min-h-[80px]"
        />
      </div>

      {/* Title & subtitle */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#22c55e]">
          Profile Completed!
        </h3>
      </div>

      {/* Points info - dynamic */}
      <div className="mb-6">
        <p className="text-sm text-[#616161]">
          You&apos;ve earned{" "}
          <span className="text-lg font-semibold text-[#22c55e]">
            {pointsAwarded} points
          </span>
        </p>
        <p className="text-xs text-[#616161]">for completing your profile!</p>
      </div>

      {/* Button - redirects to earn points page */}
      <button
        type="button"
        className="custom-btn mx-auto w-[120px]"
        onClick={onViewMyPoints}
      >
        View My Points
      </button>
    </div>
  );
}
