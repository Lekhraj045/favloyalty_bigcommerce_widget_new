"use client";

import React from 'react'
import WidgetWrapper from '@/components/WidgetWrapper'
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function TransactionHistoryPage() {
    const router = useRouter();
    const summary = {
        available: 250,
        earned: 250,
        spent: 0,
    };

    const transactions = [
        {
            id: 1,
            title: 'Profile Completion',
            date: '27/1/2026',
            time: 'GMT+5:30',
            amount: '+50.00',
        },
        {
            id: 2,
            title: 'Newsletter Bonus',
            date: '23/1/2026',
            time: 'GMT+5:30',
            amount: '+100.00',
        },
        {
            id: 3,
            title: 'Sign Up Bonus',
            date: '23/1/2026',
            time: 'GMT+5:30',
            amount: '+100.00',
        },
        {
            id: 4,
            title: 'Sign Up Bonus',
            date: '23/1/2026',
            time: 'GMT+5:30',
            amount: '+100.00',
        },
        {
            id: 5,
            title: 'Sign Up Bonus',
            date: '23/1/2026',
            time: 'GMT+5:30',
            amount: '+100.00',
        },
        {
            id: 6,
            title: 'Sign Up Bonus',
            date: '23/1/2026',
            time: 'GMT+5:30',
            amount: '+100.00',
        },


    ];

    const header = (
        <div
            className="text-white p-4 relative rounded-t-2xl"
            style={{ backgroundColor: "#62a63f" }}
        >
            <div className='flex gap-2'>
                <div className='mt-[5px]'>
                    <button 
                        className='cursor-pointer'
                        onClick={() => router.back()}
                    >
                        <ArrowLeft size={18} />
                    </button>
                </div>

                <div>
                    <h3 className="text-lg font-semibold">Transaction Historys</h3>

                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] text-white">
                            Check your transaction history
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <WidgetWrapper header={header}>
            {/* Body */}
            <div className="p-4 relative z-10">
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className='flex flex-col gap-4 h-full'
                >
                    {/* Points summary card */}
                    <div className="rounded-xl overflow-hidden">
                        <div className="bg-linear-to-r from-violet-600 to-indigo-600 p-4 text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                                    <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/point-icon1.svg`} alt="Transaction History" width={22} height={22} className='min-w-[22px] min-h-[22px]' />
                                </div>
                                <span className="text-sm font-medium">Points History</span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 text-center text-xs">
                                <div className="flex flex-col">
                                    <div className="text-base font-semibold">
                                        {summary.available.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-white/80">Available</div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="text-base font-semibold text-emerald-300">
                                        +{summary.earned.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-white/80">Earned</div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="text-base font-semibold text-red-300">
                                        -{summary.spent.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-white/80">Spent</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent transactions */}
                    <div className='flex-1 overflow-hidden'>
                        <h3 className="text-md font-medium text-[#303030] mb-3">
                            Recent Transactions
                        </h3>

                        <div className="space-y-3 h-[calc(100vh-270px)] overflow-y-auto custom-scroller">
                            {transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-3 py-3"
                                >
                                    <div>
                                        <div className="text-sm font-medium text-[#303030]">
                                            {tx.title}
                                        </div>
                                        <div className="mt-1 flex items-center gap-2 text-[11px] text-[#6B7280]">
                                            <span>{tx.date}</span>
                                            <span className="text-[#9CA3AF]">{tx.time}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div>
                                            <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/point-icon1.svg`} alt="Transaction History" width={18} height={18} className='min-w-[18px] min-h-[18px]' />
                                        </div>
                                        <div className="text-xs text-emerald-500">
                                            {tx.amount}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </WidgetWrapper>
    )
}