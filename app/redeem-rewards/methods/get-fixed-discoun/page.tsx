"use client";

import React, { useState } from 'react'
import WidgetWrapper from '@/components/WidgetWrapper'
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import PointsRedeem from './components/PointsRedeem';

export default function GetFixedDiscountPage() {
    const router = useRouter();
    const [redeemAmount, setRedeemAmount] = useState('1');

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
                    <h3 className="text-lg font-semibold">Quick Discount</h3>

                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] text-white">
                            Swipe and get instant discount coupon
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
                    <div className='flex flex-col gap-4'>
                        <div className='card'>
                            <h3 className='text-sm font-medium text-[#303030]'>
                                Select Points to Redeem
                            </h3>
                            <PointsRedeem />

                            <p className='text-sm text-[#303030] text-center mt-1.5'>10 points = 1 INR</p>

                            <div className='flex items-center gap-3 mt-4'>
                                <div className='flex flex-1 h-8 min-w-0 border border-[#d4d4d4] rounded-lg overflow-hidden bg-[#fdfdfd]'>
                                    <span className='flex items-center px-3 py-2.5 text-sm font-medium text-[#303030] border-r border-[#d4d4d4] bg-[#fafafa]'>
                                        INR
                                    </span>
                                    <input
                                        type='number'
                                        min={1}
                                        value={redeemAmount}
                                        onChange={(e) => setRedeemAmount(e.target.value)}
                                        className='flex-1 min-w-0 w-full px-3 py-2.5 text-sm font-medium text-[#303030] bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                        placeholder='0'
                                    />
                                </div>
                                <button
                                    type='button'
                                    className='custom-btn h-8!'
                                    onClick={() => router.push('/redeem-rewards/methods/get-fixed-discoun/point-coupon')}
                                >
                                    Redeem
                                </button>
                            </div>

                        </div>

                        <div className='card'>
                            <h3 className='text-sm font-medium text-[#303030]'>Please be ensured that:
                            </h3>

                            <div className='flex flex-col gap-1.5 mt-2'>
                                <p className='text-xs text-[#616161]'>
                                    The discount code expires in 3 days.
                                </p>

                                <p className='text-xs text-[#616161]'>
                                    Conversion rate: 10 points = 1 INR
                                </p>

                                <p className='text-xs text-[#616161]'>
                                    Minimum redemption: 10 points 1.00 INR
                                </p>

                                <p className='text-xs text-[#616161]'>
                                    Maximum 23 points (2.30 INR) can be redeemed at once.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </WidgetWrapper>
    )
}