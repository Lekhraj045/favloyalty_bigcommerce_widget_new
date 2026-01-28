import Image from 'next/image'
import React from 'react'

export default function BirthdaySaved() {
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

        {/* Points info */}
        <div className="mb-6">
          <p className="text-sm text-[#616161]">
            You&apos;ll earn{' '}
            <span className="text-lg font-semibold text-[#22c55e]">
              100 points
            </span>
          </p>
          <p className="text-xs text-[#616161]">
            on January 1 (your birthday)!
          </p>
        </div>

        {/* Button */}
        <button className="custom-btn mx-auto w-[120px]">
          Continue
        </button>
      </div>
    </div>
  )
}
