"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";

export default function AnnouncementsSliderArea() {
    return (
        <>
            <div className="w-full">
                <Swiper
                    modules={[Pagination, Autoplay]}
                    spaceBetween={0}
                    slidesPerView={1}
                    pagination={{
                        clickable: true,
                        bulletClass: "swiper-pagination-bullet",
                        bulletActiveClass: "swiper-pagination-bullet-active",
                    }}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                    }}
                    loop={true}
                    className="announcements-swiper"
                >
                    <SwiperSlide>
                        <div className="w-full h-[120px] relative rounded-lg overflow-hidden cursor-pointer">
                            <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/default_announcement.jpg`} alt="Points" fill />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="w-full h-[120px] relative rounded-lg overflow-hidden cursor-pointer">
                        <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/default_announcement.jpg`} alt="Points" fill />
                        </div>
                    </SwiperSlide>
                </Swiper>
            </div>

            <style jsx global>{`
        .announcements-swiper .swiper-pagination {
          position: inherit;
          bottom: inherit;
        }
        .announcements-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #DEDEDE;
          opacity: 1;
          margin: 0 4px;
        }
        .announcements-swiper .swiper-pagination-bullet-active {
          background: #392D5D;
        }
      `}</style>
        </>
    );
}

