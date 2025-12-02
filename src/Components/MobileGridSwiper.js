// src/Components/MobileGridSwiper.js
import React, {useMemo, useRef, useEffect } from 'react';
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

function MobileGridSwiper({ movies = [] }) {
  // Each slide contains up to 4 movies (2x2 grid)
  const slides = useMemo(() => chunkArray(movies, 4), [movies]);

  const swiperRef = useRef(null);
  const prevEl = useRef(null);
  const nextEl = useRef(null);

  // Wire navigation buttons to Swiper instance (mobile only)
  useEffect(() => {
    if (
      swiperRef.current &&
      swiperRef.current.swiper &&
      prevEl.current &&
      nextEl.current
    ) {
      const swiper = swiperRef.current.swiper;
      swiper.params.navigation.prevEl = prevEl.current;
      swiper.params.navigation.nextEl = nextEl.current;
      swiper.navigation.destroy();
      swiper.navigation.init();
      swiper.navigation.update();
    }
  }, [slides.length]);

  if (!slides.length) return null;

  const arrowBase =
    'absolute top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex-colo bg-customPurple/80 hover:bg-customPurple text-white rounded-full';

  return (
    <div className="relative w-full">
      <Swiper
        ref={swiperRef}
        modules={[Navigation]}
        navigation={{
          prevEl: prevEl.current,
          nextEl: nextEl.current,
        }}
        speed={250}
        loop={slides.length > 1}
      >
        {slides.map((group, idx) => (
          <SwiperSlide key={idx}>
            <div className="grid grid-cols-2 gap-2">
              {group.map((m) => (
                <Movie key={m._id} movie={m} />
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Small, circular arrows – mobile only, but work for all sections */}
      {slides.length > 1 && (
        <>
          <button
            ref={prevEl}
            aria-label="Previous"
            className={`${arrowBase} left-2`}
          >
            <BsCaretLeftFill className="text-sm" />
          </button>
          <button
            ref={nextEl}
            aria-label="Next"
            className={`${arrowBase} right-2`}
          >
            <BsCaretRightFill className="text-sm" />
          </button>
        </>
      )}
    </div>
  );
}

export default MobileGridSwiper;
