"use client";

import React, { useState } from 'react'
import WidgetWrapper from '@/components/WidgetWrapper'
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import DatepickerWeadingAnniversary from './DatepickerWeadingAnniversary';
import ProfileCompleted from './ProfileCompleted';

interface CompleteProfilePageProps {
    onBack?: () => void;
}

export default function CompleteProfilePage({ onBack }: CompleteProfilePageProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showProfileCompleted, setShowProfileCompleted] = useState(false);

    const handleSubmit = () => {
        setShowProfileCompleted(true);
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
                    <h3 className="text-lg font-semibold">Complete Profile</h3>

                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] text-white">
                            Earn Points
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    if (showProfileCompleted) {
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
                        <ProfileCompleted />
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
                    <div className='card'>
                        <h3 className='text-sm font-medium text-[#303030]'>Complete these details for rewards</h3>

                        <div className='flex flex-col gap-4 mt-4'>
                            <div className="relative">
                                <label className="block mb-1 text-[13px] text-gray-700">
                                    First Name*
                                </label>
                                <input type="text" className="w-full h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] border-[#8a8a8a]" placeholder="Enter your first name" />
                            </div>

                            <div className="relative">
                                <label className="block mb-1 text-[13px] text-gray-700">
                                    Last Name*
                                </label>
                                <input type="text" className="w-full h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] border-[#8a8a8a]" placeholder="Enter your last name" />
                            </div>

                            <div className="relative">
                                <label className="block mb-1 text-[13px] text-gray-700">
                                    Phone Number*
                                </label>
                                <input type="text" className="w-full h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] border-[#8a8a8a]" placeholder="Enter your phone number" />
                            </div>

                            <div className="w-full custom-dropi relative">
                                <label className="block mb-1 text-[13px] text-gray-700">
                                    Age Group*
                                </label>
                                <select
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="0-18">0-18</option>
                                    <option value="18-24">18-24</option>
                                    <option value="24-32">24-32</option>
                                    <option value="32-50">32-50</option>
                                    <option value="50-70">50-70</option>

                                </select>
                            </div>

                            <div className="w-full custom-dropi relative">
                                <label className="block mb-1 text-[13px] text-gray-700">
                                    Gender*
                                </label>
                                <select
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="w-full relative">
                                <label className="block mb-1 text-[13px] text-gray-700">
                                    Wedding Anniversary (Optional)
                                </label>
                                <DatepickerWeadingAnniversary selectedDate={selectedDate} onDateChange={setSelectedDate} />
                            </div>

                            <div className="relative w-full">
                                <button 
                                    className="custom-btn w-full"
                                    onClick={handleSubmit}
                                >
                                    Save Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </WidgetWrapper>
    )
}