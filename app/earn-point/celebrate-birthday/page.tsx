"use client";

import React, { useState } from 'react'
import WidgetWrapper from '@/components/WidgetWrapper'
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import DatepickerBirthday from './DatepickerBirthday';
import BirthdaySaved from './BirthdaySaved';

interface CelebrateBirthdayPageProps {
    onBack?: () => void;
}

export default function CelebrateBirthdayPage({ onBack }: CelebrateBirthdayPageProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showBirthdaySaved, setShowBirthdaySaved] = useState(false);

    const handleSubmit = () => {
        if (selectedDate) {
            setShowBirthdaySaved(true);
        }
    };
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

    if (showBirthdaySaved) {
        return (
            <WidgetWrapper header={header}>
                <div className="p-4 relative z-10 h-[calc(100vh-84px)] overflow-y-auto custom-scroller">
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className='flex flex-col gap-4'
                    >
                        <BirthdaySaved />
                    </motion.div>
                </div>
            </WidgetWrapper>
        );
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
                    <div className="border border-[#DEDEDE] bg-white rounded-xl p-4">
                        <div className='flex flex-col gap-4'>
                            <div className='flex flex-col gap-3'>
                                <div>
                                    <h3 className='text-sm font-medium text-[#303030]'>What is your date of Birth?</h3>
                                    <p className='text-xs text-[#616161]'>
                                        You can only change your birthdate once per year.
                                    </p>
                                </div>

                                <DatepickerBirthday selectedDate={selectedDate} onDateChange={setSelectedDate} />

                                <button 
                                    className={`custom-btn ${selectedDate ? '' : 'disable'}`}
                                    onClick={handleSubmit}
                                    disabled={!selectedDate}
                                >
                                    Submit
                                </button>

                            </div>

                        </div>
                    </div>
                </motion.div>
            </div>
        </WidgetWrapper>
    )
}
