"use client";

import React from 'react'
import WidgetWrapper from '@/components/WidgetWrapper'
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

interface SuccessfullySubscribedProps {
    onBack?: () => void;
}

export default function SuccessfullySubscribed({ onBack }: SuccessfullySubscribedProps) {
    const header = (
        <div
            className="text-white p-4 relative rounded-t-2xl"
            style={{ backgroundColor: "#62a63f" }}
        >
            <div className='flex gap-2'>
                <div className='mt-[5px]'>
                    <button
                        className='cursor-pointer'
                        onClick={onBack}
                    >
                        <ArrowLeft size={18} />
                    </button>
                </div>

                <div>
                    <h3 className="text-lg font-semibold">Succesfully Subscribed</h3>

                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] text-white">
                            Earn 100 Points
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <WidgetWrapper header={header}>
            {/* Body */}
            <div className="p-4 relative z-10 h-[calc(100vh-84px)] overflow-y-auto custom-scroller">
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className='flex flex-col gap-4'
                >
                    <div className="card text-center">

                        {/* Icon */}
                        <div className="mb-4">
                            <Image
                                src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/subscribe-newsletter.svg`}
                                alt="Birthday Gift"
                                width={80}
                                height={80}
                                className="mx-auto min-w-[80px] min-h-[80px]"
                            />
                        </div>

                        {/* Title & subtitle */}
                        <div className="mb-4">
                            <h3 className="text-base font-semibold text-[#22c55e]">
                                Succesfully Subscribed
                            </h3>
                        </div>

                        {/* Points info */}
                        <div className="mb-6">
                            <p className="text-sm text-[#616161]">
                                You&apos;ve earned <span className="text-lg font-semibold text-[#22c55e]">
                                    100 points
                                </span>
                            </p>
                            <p className="text-xs text-[#616161]">
                                for subscribing to our newsletter!
                            </p>
                        </div>

                        {/* Button */}
                        <button className="custom-btn mx-auto w-[120px]">
                            View My Points
                        </button>
                    </div>
                </motion.div>
            </div>
        </WidgetWrapper>
    )
}