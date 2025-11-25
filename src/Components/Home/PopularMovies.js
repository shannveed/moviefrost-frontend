// Frontend/src/Components/Home/PopularMovies.js
import React, { useRef } from 'react';
import Titles from '../Titles';
import { BsCollectionFill, BsCaretLeftFill, BsCaretRightFill } from 'react-icons/bs';
import Movie from '../movie';
import { Empty } from '../Notifications/Empty';
import Loader from '../Loader';
import { Link } from 'react-router-dom';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import MobileGridSwiper from '../MobileGridSwiper';

function PopularMovies({ isLoading, movies = [] }) {
  const prevEl = useRef(null);
  const nextEl = useRef(null);

  const hasMovies = movies && movies.length > 0;
  const showLoader = isLoading && !hasMovies;

  return (
    <div className="my-8 mobile:my-4">
      <div className="flex items-center justify-between mb-6 mobile:mb-4 mobile:px-4">
        <Titles title="Latest" Icon={BsCollectionFill} />
        {hasMovies && (
          <Link
            to="/movies"
            className="group flex items-center gap-1 text-sm font-medium text-white hover:text-customPurple transitions"
            aria-label="Show more latest movies"
          >
            Show&nbsp;More
            <BsCaretRightFill className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {showLoader ? (
        <Loader />
      ) : hasMovies ? (
        <>
          <div className="sm:hidden">
            <MobileGridSwiper movies={movies.slice(0, 20)} />
          </div>

          <div className="hidden sm:block relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation={{
                prevEl: prevEl.current,
                nextEl: nextEl.current,
              }}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = prevEl.current;
                swiper.params.navigation.nextEl = nextEl.current;
              }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop
              speed={200}
              spaceBetween={15}
              slidesPerView={2}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 10 },
                768: { slidesPerView: 3, spaceBetween: 15 },
                1024: { slidesPerView: 4, spaceBetween: 20 },
                1280: { slidesPerView: 5, spaceBetween: 20 },
              }}
            >
              {movies.slice(0, 20).map((movie) => (
                <SwiperSlide key={movie._id}>
                  <Movie movie={movie} />
                </SwiperSlide>
              ))}
            </Swiper>

            <button
              ref={prevEl}
              aria-label="Previous"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 mobile:w-mobile-arrow mobile:h-mobile-arrow flex-colo
                        bg-customPurple/70 hover:bg-customPurple text-white rounded-full mobile:rounded-md"
            >
              <BsCaretLeftFill />
            </button>
            <button
              ref={nextEl}
              aria-label="Next"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 mobile:w-mobile-arrow mobile:h-mobile-arrow flex-colo
                        bg-customPurple/70 hover:bg-customPurple text-white rounded-full mobile:rounded-md"
            >
              <BsCaretRightFill />
            </button>
          </div>
        </>
      ) : (
        <Empty message="It seems like we don't have any movies." />
      )}
    </div>
  );
}

export default PopularMovies;
