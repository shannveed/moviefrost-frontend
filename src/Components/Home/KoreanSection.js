// Frontend/src/Components/Home/KoreanSection.js
import React, { useEffect, useRef, useState } from 'react';
import Titles from '../Titles';
import {
  BsCollectionFill,
  BsCaretLeftFill,
  BsCaretRightFill,
} from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Loader from '../Loader';
import Movie from '../movie';
import { getAllMoviesService } from '../../Redux/APIs/MoviesServices';
import MobileGridSwiper from '../MobileGridSwiper';
import { Empty } from '../Notifications/Empty';

const BROWSE_VALUES = ['Korean (English)'];

// Simple in-memory cache
const koreanCache = {
  movies: [],
  error: null,
  loaded: false,
};

function KoreanSection() {
  const [movies, setMovies] = useState(koreanCache.movies || []);
  const [loading, setLoading] = useState(!koreanCache.loaded);
  const [error, setError] = useState(koreanCache.error || null);

  const prevEl = useRef(null);
  const nextEl = useRef(null);

  useEffect(() => {
    if (koreanCache.loaded) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const responses = await Promise.all(
          BROWSE_VALUES.map((b) =>
            getAllMoviesService('', '', '', '', '', b, '', 1)
          )
        );

        const map = new Map();
        responses.forEach((res) => {
          (res.movies || []).forEach((m) => map.set(m._id, m));
        });

        const merged = Array.from(map.values());

        if (!cancelled) {
          setMovies(merged);
          setLoading(false);
        }

        koreanCache.movies = merged;
        koreanCache.error = null;
        koreanCache.loaded = true;
      } catch (e) {
        const message = e?.message || 'Failed to load Korean section';
        if (!cancelled) {
          setError(message);
          setLoading(false);
        }
        koreanCache.error = message;
        koreanCache.loaded = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasMovies = movies.length > 0;
  const showLoader = loading && !hasMovies;

  return (
    <div className="my-8 mobile:my-4">
      <div className="flex items-center justify-between mb-6 mobile:mb-4 mobile:px-4">
        <Titles title="Korean" Icon={BsCollectionFill} />
        {hasMovies && (
          <Link
            to="/Korean"
            className="group flex items-center gap-1 text-sm font-medium text-white hover:text-customPurple transitions"
            aria-label="Show more Korean titles"
          >
            Show&nbsp;More
            <BsCaretRightFill className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {showLoader ? (
        <Loader />
      ) : error ? (
        <p className="text-red-500 text-sm mobile:px-4">{error}</p>
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
        <Empty message="No titles found in Korean" />
      )}
    </div>
  );
}

export default KoreanSection;
