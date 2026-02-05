import Image from 'next/image'
import React from 'react'

interface BirthdaySavedProps {
  pointsAwarded?: number | null;
  onContinue?: () => void;
}

export default function BirthdaySaved({ pointsAwarded, onContinue }: BirthdaySavedProps) {
  return (
    <div className="w-full flex justify-center">
      <div className="bg-white border border-[#E1E3E5] rounded-xl px-6 py-6 w-full max-w-[360px] text-center">
        
        {/* Icon */}
        <div className="mb-4">
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/birthday-update.svg`}
            alt="Birthday Gift"
            width={80}
            height={80}
            className="mx-auto min-w-[80px] min-h-[80px]"
          />
        </div>

        {/* Title & subtitle */}
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[#22c55e]">
            Birthday Updated
          </h3>
          <p className="text-sm text-[#616161] mt-1">
            Your birthday has been saved successfully!
          </p>
        </div>

        {/* Points info: show earned now or future message */}
        <div className="mb-6">
          {pointsAwarded != null && pointsAwarded > 0 ? (
            <p className="text-sm text-[#616161]">
              You earned{' '}
              <span className="text-lg font-semibold text-[#22c55e]">
                {pointsAwarded} points
              </span>
              {' '}for your birthday!
            </p>
          ) : (
            <>
              <p className="text-sm text-[#616161]">
                You&apos;ll earn points on your birthday each year (based on your store&apos;s Ways to Earn settings).
              </p>
              <p className="text-xs text-[#616161] mt-1">
                Points are awarded once per year on your birth date.
              </p>
            </>
          )}
        </div>

        {/* Button */}
        <button type="button" className="custom-btn mx-auto w-[120px]" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  )
}
