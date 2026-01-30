"use client";

import AnnouncementsSliderArea from "@/components/AnnouncementsSlider";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function HomePage() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const toggleWidget = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Header */}
            <div
                className="text-white p-4 pb-8 relative rounded-t-2xl"
                style={{ backgroundColor: "#62a63f" }}
            >
                <button
                    className="absolute right-4 top-4 text-white text-medium cursor-pointer"
                    onClick={toggleWidget}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                    </svg>
                </button>

                <h3 className="text-lg font-semibold">Welcomess</h3>

                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] text-white">
                        John
                    </span>
                    <span
                        className="text-xs bg-white px-2 py-0.5 rounded"
                        style={{ color: "#62a63f" }}
                    >
                        Gold user 2x
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="px-4 pb-4 space-y-4 -mt-5 relative z-10 h-[calc(100vh-68px)] overflow-y-auto custom-scroller">
                {/* Points Card */}
                <div className="border border-[#DEDEDE] bg-white rounded-xl p-4">
                    <div className="flex items-center gap-2" style={{ color: "#62a63f" }}>
                        <span className="text-xl">
                            <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/point-icon1.svg`} alt="Points" width={20} height={20} />

                        </span>
                        <span className="text-xl font-semibold">200</span>
                        <span className="text-sm">Points</span>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                        <p className="text-xs" style={{ color: "#62a63f" }}>
                            Equals to 100 INR
                        </p>

                        <div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push('/transaction-history');
                                }}
                                className="flex items-center gap-1 cursor-pointer"
                            >
                                <span className="text-xs text-gray-500">History</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                    <path d="M3 3v5h5" />
                                    <path d="M12 7v5l4 2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push('/earn-point');
                    }}
                    className="w-full bg-white border border-[#DEDEDE] rounded-xl p-3 flex items-center gap-2 text-[13px] font-medium cursor-pointer"
                >
                    <span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="12" x2="12" y1="2" y2="22" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </span>
                    Earn more points
                </button>

                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push('/redeem-rewards');
                    }}
                    className="w-full bg-white border border-[#DEDEDE] rounded-xl p-3 flex items-center gap-2 text-[13px] font-medium cursor-pointer"
                >
                    <span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="8" width="18" height="4" rx="1" />
                            <path d="M12 8v13" />
                            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                            <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                        </svg>
                    </span>
                    Redeem points for rewards
                </button>

                {/* Refer Card */}
                <div className="border border-[#DEDEDE] bg-white rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[13px] font-medium">
                            <span>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 22 22"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g clipPath="url(#clip0_461_4754)">
                                        <path
                                            d="M17.8788 5.23402C17.7152 5.23427 17.5571 5.17474 17.4342 5.06662C15.7382 3.57573 13.558 2.75238 11.2998 2.75002C9.16799 2.75339 7.10297 3.49431 5.45525 4.84702C5.3867 4.90328 5.30774 4.94549 5.22288 4.97123C5.13802 4.99697 5.04892 5.00575 4.96066 4.99706C4.87241 4.98837 4.78673 4.96238 4.70852 4.92058C4.63032 4.87877 4.56111 4.82197 4.50485 4.75342C4.44859 4.68487 4.40638 4.60591 4.38064 4.52105C4.3549 4.43619 4.34612 4.34709 4.35481 4.25884C4.37237 4.0806 4.46001 3.91664 4.59845 3.80302C6.48798 2.25264 8.85567 1.40363 11.2998 1.40002C13.8855 1.40232 16.3821 2.34466 18.3243 4.05142C18.4271 4.14216 18.4999 4.26201 18.533 4.39507C18.566 4.52813 18.5579 4.6681 18.5095 4.7964C18.4612 4.9247 18.375 5.03528 18.2624 5.11344C18.1497 5.1916 18.016 5.23366 17.8788 5.23402Z"
                                            fill="#62a63f"
                                        ></path>
                                        <path
                                            d="M7.0251 5.00004H4.7751C4.59608 5.00004 4.42439 4.92893 4.2978 4.80234C4.17121 4.67575 4.1001 4.50406 4.1001 4.32504V2.07504C4.10022 1.94163 4.13987 1.81124 4.21404 1.70034C4.28822 1.58945 4.3936 1.50302 4.51687 1.45198C4.64013 1.40094 4.77576 1.38758 4.90662 1.41357C5.03748 1.43957 5.1577 1.50376 5.2521 1.59804L7.5021 3.84804C7.59638 3.94244 7.66057 4.06266 7.68657 4.19352C7.71256 4.32438 7.6992 4.46001 7.64816 4.58327C7.59712 4.70654 7.51069 4.81192 7.3998 4.88609C7.2889 4.96027 7.15851 4.99992 7.0251 5.00004ZM11.4081 21.2C8.82239 21.1982 6.32566 20.2558 4.3836 18.5486C4.31694 18.4901 4.26246 18.4191 4.22326 18.3395C4.18406 18.26 4.16092 18.1735 4.15515 18.085C4.14939 17.9964 4.16111 17.9077 4.18965 17.8237C4.21819 17.7397 4.26299 17.6622 4.3215 17.5955C4.38 17.5289 4.45106 17.4744 4.53062 17.4352C4.61018 17.396 4.69668 17.3729 4.78519 17.3671C4.96393 17.3555 5.13997 17.4153 5.2746 17.5334C6.97007 19.0246 9.15016 19.848 11.4081 19.85C13.54 19.8467 15.605 19.1058 17.2527 17.753C17.3911 17.6394 17.569 17.5855 17.7473 17.603C17.9255 17.6206 18.0895 17.7082 18.2031 17.8466C18.3167 17.9851 18.3707 18.163 18.3531 18.3412C18.3356 18.5195 18.2479 18.6834 18.1095 18.797C16.22 20.3474 13.8523 21.1964 11.4081 21.2Z"
                                            fill="#62a63f"
                                        ></path>
                                        <path
                                            d="M17.8248 21.2C17.7362 21.2002 17.6484 21.1827 17.5665 21.1487C17.4846 21.1148 17.4103 21.0649 17.3478 21.002L15.0978 18.752C15.0035 18.6576 14.9393 18.5374 14.9133 18.4066C14.8873 18.2757 14.9007 18.1401 14.9517 18.0168C15.0028 17.8935 15.0892 17.7882 15.2001 17.714C15.311 17.6398 15.4414 17.6002 15.5748 17.6H17.8248C18.0038 17.6 18.1755 17.6712 18.3021 17.7977C18.4287 17.9243 18.4998 18.096 18.4998 18.275V20.525C18.4998 20.7041 18.4287 20.8757 18.3021 21.0023C18.1755 21.1289 18.0038 21.2 17.8248 21.2Z"
                                            fill="#62a63f"
                                        ></path>
                                        <path
                                            d="M5 11.3C6.24264 11.3 7.25 10.2927 7.25 9.05005C7.25 7.80741 6.24264 6.80005 5 6.80005C3.75736 6.80005 2.75 7.80741 2.75 9.05005C2.75 10.2927 3.75736 11.3 5 11.3Z"
                                            fill="#62a63f"
                                        ></path>
                                        <path
                                            d="M7.025 12.2H2.975C2.31874 12.2005 1.68949 12.4614 1.22544 12.9254C0.761388 13.3895 0.500477 14.0187 0.5 14.675L0.5 15.125C0.5 15.4976 0.8024 15.8 1.175 15.8H8.825C9.00402 15.8 9.17571 15.7289 9.3023 15.6023C9.42888 15.4757 9.5 15.304 9.5 15.125V14.675C9.49952 14.0187 9.23861 13.3895 8.77456 12.9254C8.31051 12.4614 7.68126 12.2005 7.025 12.2Z"
                                            fill="#62a63f"
                                        ></path>
                                        <path
                                            d="M17.6001 11.3C18.8427 11.3 19.8501 10.2927 19.8501 9.05005C19.8501 7.80741 18.8427 6.80005 17.6001 6.80005C16.3575 6.80005 15.3501 7.80741 15.3501 9.05005C15.3501 10.2927 16.3575 11.3 17.6001 11.3Z"
                                            fill="#62a63f"
                                        ></path>
                                        <path
                                            d="M19.6251 12.2H15.5751C14.9188 12.2005 14.2896 12.4614 13.8255 12.9254C13.3615 13.3895 13.1006 14.0187 13.1001 14.675V15.125C13.1001 15.4976 13.4025 15.8 13.7751 15.8H21.4251C21.6041 15.8 21.7758 15.7289 21.9024 15.6023C22.029 15.4757 22.1001 15.304 22.1001 15.125V14.675C22.0996 14.0187 21.8387 13.3895 21.3747 12.9254C20.9106 12.4614 20.2814 12.2005 19.6251 12.2Z"
                                            fill="#62a63f"
                                        ></path>
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_461_4754">
                                            <rect
                                                width="21.6"
                                                height="21.6"
                                                fill="white"
                                                transform="translate(0.5 0.5)"
                                            ></rect>
                                        </clipPath>
                                    </defs>
                                </svg>
                            </span>
                            Refer & Earn
                        </div>
                        <button className="cursor-pointer">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                                <path d="M12 7v5l4 2" />
                            </svg>
                        </button>
                    </div>

                    <p className="text-xs text-gray-500">Get 100 Bonus Points</p>

                    <div className="flex gap-2 mt-2">
                        <input
                            type="email"
                            placeholder="Friend's email address"
                            className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                        />
                        <button
                            className="border rounded-lg px-4 text-xs font-medium cursor-pointer"
                            style={{
                                borderColor: "#62a63f",
                                color: "#62a63f",
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>

                {/* Banner */}
                <div className="rounded-xl overflow-hidden">
                    <AnnouncementsSliderArea />
                </div>
            </div>
        </>
    )
}