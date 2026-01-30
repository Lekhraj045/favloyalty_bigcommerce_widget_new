"use client";

import React from 'react'
import WidgetWrapper from '@/components/WidgetWrapper'
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import MethodsPage from './methods/page';
import CouponsPage from './coupons/page';

export default function EarnPointPage() {
    const router = useRouter();

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
                    <h3 className="text-lg font-semibold">Redeem Rewards</h3>

                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] text-white">
                            You have 250.00 Points
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <WidgetWrapper header={header}>
            {/* Body */}
            <div className="relative z-10">
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className='flex flex-col gap-4'
                >

                    <Tabs className="customTab">
                        <TabList>
                            <Tab>Methods</Tab>
                            <Tab>Coupons</Tab>
                        </TabList>

                        <TabPanel>
                            <MethodsPage />
                        </TabPanel>
                        <TabPanel>
                            <CouponsPage />
                        </TabPanel>
                    </Tabs>
                </motion.div>
            </div>
        </WidgetWrapper>
    )
}