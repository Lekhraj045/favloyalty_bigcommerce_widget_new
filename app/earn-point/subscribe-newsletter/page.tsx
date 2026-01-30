"use client";

import React, { useState } from 'react'
import WidgetWrapper from '@/components/WidgetWrapper'
import { ArrowLeft, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import SuccessfullySubscribed from './SuccessfullySubscribed';

export default function SubscribeNewsletterPage({ onBack }: { onBack: () => void }) {
    const [showSuccessfullySubscribed, setShowSuccessfullySubscribed] = useState(false);

    const handleSubscribe = () => {
        setShowSuccessfullySubscribed(true);
    };
    const header = (
        <div
            className="text-white p-4 relative rounded-t-2xl"
            style={{ backgroundColor: "#62a63f" }}
        >
            <div className='flex gap-2'>
                <div className='mt-[5px]'>
                    <button className='cursor-pointer' onClick={() => onBack()}>
                        <ArrowLeft size={18} />
                    </button>
                </div>

                <div>
                    <h3 className="text-lg font-semibold">Subscribe to Newsletter</h3>

                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] text-white">
                            Earn 100 Points
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    if (showSuccessfullySubscribed) {
        return <SuccessfullySubscribed onBack={() => setShowSuccessfullySubscribed(false)} />;
    }

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
                    <div className='card'>
                        <div className='flex flex-col gap-4'>
                            {/* Main Heading */}
                            <div className='text-center'>
                                <h2 className='text-lg font-bold text-[#303030] mb-2'>
                                    Stay in the Loop!
                                </h2>
                                <p className='text-sm text-[#616161] px-2'>
                                Subscribe to our newsletter and be the first to know about:
                                </p>
                            </div>

                            {/* Loyalty Program Card */}
                            <div className='bg-white border border-[#E1E3E5] bg-gradient-to-br from-[#F6F9FE] to-white rounded-xl p-4'>
                                <div className='flex items-start gap-3'>
                                    <div className='w-12 h-12 rounded-full bg-[#392d5d] flex items-center justify-center shrink-0'>
                                        <Trophy className='text-white' size={24} />
                                    </div>
                                    <div className='flex-1'>
                                        <h3 className='text-base font-bold text-[#303030] mb-1'>
                                            Quick & Easy Rewards
                                        </h3>
                                        <p className='text-xs text-[#616161]'>
                                            One click to subscribe and instantly earn points!
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Subscribe Button */}
                            <button 
                                className='w-full custom-btn'
                                onClick={handleSubscribe}
                            >
                                Subscribe & Earn Points
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </WidgetWrapper>
    )
}