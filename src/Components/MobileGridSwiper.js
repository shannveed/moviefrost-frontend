// src/Components/MobileGridSwiper.js
import React, { useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { BsCaretLeftFill, BsCaretRightFill } from 'react-icons/bs';
import Movie from './movie';

function chunkArray(arr, size = 4) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export default function MobileGridSwiper({ movies = [] }) {
  const prevEl = useRef(null);
  const nextEl = useRef(null);

  const slides = useMemo(() => chunkArray(movies, 4), [movies]);

  if (!slides.length) return null;

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation]}
        slidesPerView={1}
        spaceBetween={10}
        navigation={{
          prevEl: prevEl.current,
          nextEl: nextEl.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevEl.current;
          swiper.params.navigation.nextEl = nextEl.current;
        }}
        speed={700}
        loop={slides.length > 1}
      >
        {slides.map((group, idx) => (
          <SwiperSlide key={`mobile-4-grid-${idx}`}>
            <div className="grid grid-cols-2 gap-3">
              {group.map((m) => (
                <div key={m._id}>
                  <Movie movie={m} />
                </div>
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Q2: 4:15 aspect on mobile */}
      {slides.length > 1 && (
        <>
          <button
            ref={prevEl}
            aria-label="Previous"
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-6 h-16 mobile:w-mobile-arrow mobile:h-mobile-arrow flex items-center justify-center 
                       bg-customPurple/70 hover:bg-customPurple text-white rounded-md sm:hidden"
          >
            <BsCaretLeftFill size={18} />
          </button>
          <button
            ref={nextEl}
            aria-label="Next"
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-6 h-16 mobile:w-mobile-arrow mobile:h-mobile-arrow flex items-center justify-center 
                       bg-customPurple/70 hover:bg-customPurple text-white rounded-md sm:hidden"
          >
            <BsCaretRightFill size={18} />
          </button>
        </>
      )}
    </div>
  );
}
