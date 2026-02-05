"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export type AnnouncementItem = {
  image: string;
  link: string | null;
};

export type AnnouncementsSliderProps = {
  announcements?: AnnouncementItem[];
};

export default function AnnouncementsSliderArea({ announcements = [] }: AnnouncementsSliderProps) {
  if (!announcements?.length) return null;

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
          loop={announcements.length > 1}
          className="announcements-swiper"
        >
          {announcements.map((announcement, index) => {
            const content = (
              <div className="w-full h-[120px] relative rounded-lg overflow-hidden cursor-pointer">
                <img
                  src={announcement.image}
                  alt={`Announcement ${index + 1}`}
                  className="h-full w-full object-cover"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            );
            return (
              <SwiperSlide key={index}>
                {announcement.link ? (
                  <a
                    href={announcement.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </SwiperSlide>
            );
          })}
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
          background: #dedede;
          opacity: 1;
          margin: 0 4px;
        }
        .announcements-swiper .swiper-pagination-bullet-active {
          background: #392d5d;
        }
      `}</style>
    </>
  );
}
