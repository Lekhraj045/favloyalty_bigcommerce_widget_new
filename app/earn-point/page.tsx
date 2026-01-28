"use client";

import React, { useState } from 'react'
import WidgetWrapper from '@/components/WidgetWrapper'
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import Image from 'next/image';
import CelebrateBirthdayPage from './celebrate-birthday/page';
import CompleteProfilePage from './complete-profile/page';
import SubscribeNewsletterPage from './subscribe-newsletter/page';

    
export default function EarnPointPage() {
    const router = useRouter();
    const [showCelebrateBirthday, setShowCelebrateBirthday] = useState(false);
    const [showCompleteProfile, setShowCompleteProfile] = useState(false);
    const [showSubscribeNewsletter, setShowSubscribeNewsletter] = useState(false);
    const header = (
        <div
            className="text-white p-4 relative rounded-t-2xl"
            style={{ backgroundColor: "#62a63f" }}
        >
            <div className='flex gap-2'>
                <div className='mt-[5px]'>
                    <button className='cursor-pointer' onClick={() => router.back()}>
                        <ArrowLeft size={18} />
                    </button>
                </div>

                <div>
                    <h3 className="text-lg font-semibold">Earn Points</h3>

                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm">
                            You have 100.00 Points
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    if (showCelebrateBirthday) {
        return <CelebrateBirthdayPage onBack={() => setShowCelebrateBirthday(false)} />;
    }

    if (showCompleteProfile) {
        return <CompleteProfilePage onBack={() => setShowCompleteProfile(false)} />;
    }

    if (showSubscribeNewsletter) {
        return <SubscribeNewsletterPage onBack={() => setShowSubscribeNewsletter(false)} />;
    }

    return (
        <WidgetWrapper header={header}>
            {/* Body */}
            <div className="p-4 relative z-10 h-[calc(100%-82px)] overflow-y-auto custom-scroller">
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className='flex flex-col gap-4'
                >
                    <div 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowCelebrateBirthday(true);
                        }}
                        className="border border-[#DEDEDE] bg-white rounded-xl p-4 flex items-center gap-3 justify-between hover:shadow-sm transition-all duration-300 cursor-pointer"
                    >
                        <div className='flex items-center gap-3'>
                            <div className='w-[40px] h-[40px] bg-linear-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center'>
                                <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/birthday-gift-icon.svg`} alt="Birthday Gift" width={30} height={30} />
                            </div>

                            <div className='flex flex-col'>
                                <h3 className='text-sm font-medium text-[#303030]'>
                                    Birthday Gift
                                </h3>
                                <p className='text-xs text-[#616161]'>
                                    Earn 100 points
                                </p>
                            </div>
                        </div>

                        <div>
                            <ChevronRight size={18} />
                        </div>
                    </div>

                    <div 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowCompleteProfile(true);
                        }}
                        className="border border-[#DEDEDE] bg-white rounded-xl p-4 flex items-center gap-3 justify-between hover:shadow-sm transition-all duration-300 cursor-pointer"
                    >
                        <div className='flex items-center gap-3'>
                            <div className='w-[40px] h-[40px] bg-linear-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center'>
                                <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/complete-profile-icon.svg`} alt="Complete Profile" width={30} height={30} className='min-w-[30px] min-h-[30px]' />
                            </div>

                            <div className='flex flex-col'>
                                <h3 className='text-sm font-medium text-[#303030]'>
                                    Complete Profile
                                </h3>
                                <p className='text-xs text-[#616161]'>
                                    Earn 50 points
                                </p>
                            </div>
                        </div>

                        <div>
                            <ChevronRight size={18} />
                        </div>
                    </div>

                    <div 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowSubscribeNewsletter(true);
                        }}
                        className="border border-[#DEDEDE] bg-white rounded-xl p-4 flex items-center gap-3 justify-between hover:shadow-sm transition-all duration-300 cursor-pointer"
                    >
                        <div className='flex items-center gap-3'>
                            <div className='w-[40px] h-[40px] bg-linear-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center'>
                                <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/subscribe-newsletter-icon.svg`} alt="subscribe newsletter" width={30} height={30} className='min-w-[30px] min-h-[30px]' />
                            </div>

                            <div className='flex flex-col'>
                                <h3 className='text-sm font-medium text-[#303030]'>
                                    Subscribe to Newsletter
                                </h3>
                                <p className='text-xs text-[#616161]'>
                                    Earn 100 points
                                </p>
                            </div>
                        </div>

                        <div>
                            <ChevronRight size={18} />
                        </div>
                    </div>

                    <div className="border border-[#DEDEDE] bg-white rounded-xl p-4 flex items-center gap-3 justify-between hover:shadow-sm transition-all duration-300 cursor-pointer">
                        <div className='flex items-center gap-3'>
                            <div className='w-[40px] h-[40px] bg-linear-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center'>
                                <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/purchase-product-icon.svg`} alt="purchase purchase" width={30} height={30} className='min-w-[30px] min-h-[30px]' />
                            </div>

                            <div className='flex flex-col'>
                                <h3 className='text-sm font-medium text-[#303030]'>
                                    Purchase a Product
                                </h3>
                                <p className='text-xs text-[#616161]'>
                                    Earn 10 Points on each INR Spent
                                </p>
                            </div>
                        </div>

                        <div>
                            <ChevronRight size={18} />
                        </div>
                    </div>

                    <div className="border border-[#DEDEDE] bg-white rounded-xl p-4 flex items-center gap-3 justify-between hover:shadow-sm transition-all duration-300 cursor-no-drop opacity-80">
                        <div className='flex items-center gap-3'>
                            <div className='w-[40px] h-[40px] bg-linear-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center'>
                                <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/purchase-product-icon.svg`} alt="purchase purchase" width={30} height={30} className='min-w-[30px] min-h-[30px]' />
                            </div>

                            <div className='flex flex-col'>
                                <h3 className='text-sm font-medium text-[#303030] flex items-center gap-1'>
                                    Purchase a Product
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">
                                        Used
                                    </span>
                                </h3>
                                <p className='text-xs text-[#616161]'>
                                    Earn 10 Points on each INR Spent
                                </p>
                            </div>
                        </div>

                        <div>
                            <ChevronRight size={18} />
                        </div>
                    </div>
                </motion.div>
            </div>
        </WidgetWrapper>
    )
}