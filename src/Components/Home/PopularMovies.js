// PopularMovies.js  ⟶  Carousel showing up to 20 latest movies with header “Show More” on the right
import React from 'react';
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

function PopularMovies({ isLoading, movies = [] }) {
  // Use fixed class selectors for navigation (reliable across renders)
  const prevClass = 'nav-prev-latest';
  const nextClass = 'nav-next-latest';

  return (
    <div className="my-8 mobile:my-4">
      {/* Header: “Latest” left, “Show More” right */}
      <div className="flex items-center justify-between mb-6 mobile:mb-4 mobile:px-4">
        <Titles title="Latest" Icon={BsCollectionFill} />
        {movies.length > 0 && (
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

      {/* Content */}
      {isLoading ? (
        <Loader />
      ) : movies.length > 0 ? (
        <div className="relative">
          <Swiper
            key="latest-section"
            modules={[Navigation, Autoplay]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop
            speed={800}
            spaceBetween={15}
            slidesPerView={2}
            navigation={{
              prevEl: `.${prevClass}`,
              nextEl: `.${nextClass}`,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = `.${prevClass}`;
              swiper.params.navigation.nextEl = `.${nextClass}`;
            }}
            breakpoints={{
              640:  { slidesPerView: 2, spaceBetween: 10 },
              768:  { slidesPerView: 3, spaceBetween: 15 },
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

          {/* Swiper arrows using CLASS selectors (reliable) */}
          <button
            aria-label="Previous"
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 mobile:w-6 mobile:h-6 flex-colo
                       bg-customPurple/70 hover:bg-customPurple text-white rounded-full ${prevClass}`}
          >
            <BsCaretLeftFill />
          </button>
          <button
            aria-label="Next"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 mobile:w-6 mobile:h-6 flex-colo
                       bg-customPurple/70 hover:bg-customPurple text-white rounded-full ${nextClass}`}
          >
            <BsCaretRightFill />
          </button>
        </div>
      ) : (
        <Empty message="It seems like we don't have any movies." />
      )}
    </div>
  );
}

export default PopularMovies;
