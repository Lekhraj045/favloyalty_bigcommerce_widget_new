"use client";

import React from 'react'
import WidgetWrapper from '@/components/WidgetWrapper'
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import DatepickerBirthday from './DatepickerBirthday';

interface CelebrateBirthdayPageProps {
    onBack?: () => void;
}

export default function CelebrateBirthdayPage({ onBack }: CelebrateBirthdayPageProps) {
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
                    <h3 className="text-lg font-semibold">Celebrate Birthday</h3>

                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] text-white">
                            Earn Points
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <WidgetWrapper header={header}>
            {/* Body */}
            <div className="p-4 relative z-10 h-[calc(100vh-205px)] overflow-y-auto custom-scroller">
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className='flex flex-col gap-4'
                >
                    <div className="border border-[#DEDEDE] bg-white rounded-xl p-4">
                        <div className='flex flex-col gap-4'>
                            <div className='flex flex-col'>
                                <h3 className='text-sm font-medium text-[#303030]'>What is your date of Birth?</h3>
                                <DatepickerBirthday />
                            </div>

                        </div>
                    </div>
                </motion.div>
            </div>
        </WidgetWrapper>
    )
}
