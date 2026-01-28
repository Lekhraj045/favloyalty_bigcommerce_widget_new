"use client";

import React, { useState } from 'react'
import WidgetWrapper from '@/components/WidgetWrapper'
import { ArrowLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

export default function EarnPointPage() {
    const [isAccordionOpen, setIsAccordionOpen] = useState(true);

    const header = (
        <div
            className="text-white p-4 relative rounded-t-2xl"
            style={{ backgroundColor: "#62a63f" }}
        >
            <div className='flex gap-2'>
                <div className='mt-[5px]'>
                    <button className='cursor-pointer'>
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

                        <TabPanel className="p-4 h-[calc(100vh-130px)] overflow-y-auto custom-scroller">
                            <div className='flex flex-col gap-4'>
                                <div className="border border-[#DEDEDE] bg-white rounded-xl p-4 flex items-center gap-3 justify-between hover:shadow-sm transition-all duration-300 cursor-pointer">
                                    <div className='flex items-center gap-3'>
                                        <div className='w-[40px] h-[40px] bg-linear-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center'>
                                            <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/get-fixed-discount.svg`} alt="Get Fixed Discount" width={30} height={30} className='min-w-[30px] min-h-[30px]' />
                                        </div>

                                        <div className='flex flex-col'>
                                            <h3 className='text-sm font-medium text-[#303030]'>
                                                Get Fixed Discount
                                            </h3>
                                            <p className='text-xs text-[#616161]'>
                                                Swipe & Get Quick Discount
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
                                            <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/flat-discount.svg`} alt="Flat Discount" width={30} height={30} className='min-w-[30px] min-h-[30px]' />
                                        </div>

                                        <div className='flex flex-col'>
                                            <h3 className='text-sm font-medium text-[#303030]'>
                                                Flat 100% off
                                            </h3>
                                            <p className='text-xs text-[#616161]'>
                                                23 Points
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <ChevronRight size={18} />
                                    </div>
                                </div>

                                <div className="border border-[#DEDEDE] bg-white rounded-xl hover:shadow-sm transition-all duration-300 cursor-pointer">
                                    <div className='p-4 flex items-center gap-3 justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <div className='w-[40px] h-[40px] bg-linear-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center'>
                                                <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/free-product.svg`} alt="Get Free Products" width={30} height={30} className='min-w-[30px] min-h-[30px]' />
                                            </div>

                                            <div className='flex flex-col'>
                                                <h3 className='text-sm font-medium text-[#303030]'>
                                                    Get Free Products
                                                </h3>
                                                <p className='text-xs text-[#616161]'>
                                                    1 to 1 Points
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                    <div className='border-t border-[#DEDEDE]'>
                                        <div
                                            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                                            className='p-4 flex items-center justify-between cursor-pointer'
                                        >
                                            <span className='text-sm font-medium text-[#303030]'>
                                                Restricted use - {isAccordionOpen ? 'hide' : 'show'} details
                                            </span>
                                            {isAccordionOpen ? (
                                                <ChevronUp size={16} className='text-[#616161]' />
                                            ) : (
                                                <ChevronDown size={16} className='text-[#616161]' />
                                            )}
                                        </div>

                                        {isAccordionOpen && (
                                            <div className='px-4 pb-4'>
                                                <div className='bg-gray-50 rounded-lg border border-gray-100 p-3'>
                                                    <p className='text-[13px] text-[#303030] font-medium mb-3'>
                                                        Applies to 2 selected products:
                                                    </p>

                                                    <div className='flex flex-col gap-2'>
                                                        <div className='flex items-center gap-3 p-3 rounded-lg bg-white border border-[#E5E5E5]'>
                                                            <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/product1.jpg`} alt="Product 1" width={30} height={30} className='min-w-[30px] min-h-[30px]' />
                                                            <p className='text-[13px] text-[#303030] flex-1 truncate'>
                                                                The 3p Fulfilled Snowboard - Default Title asca casca
                                                            </p>
                                                        </div>

                                                        <div className='flex items-center gap-3 p-3 bg-white rounded-lg border border-[#E5E5E5]'>
                                                            <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/product2.jpg`} alt="Product 2" width={30} height={30} className='min-w-[30px] min-h-[30px]' />
                                                            <p className='text-[13px] text-[#303030] flex-1 truncate'>
                                                                The Collection Snowboard: Hydrogen casca casca
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <h2>Coupons content</h2>
                        </TabPanel>
                    </Tabs>
                </motion.div>
            </div>
        </WidgetWrapper>
    )
}