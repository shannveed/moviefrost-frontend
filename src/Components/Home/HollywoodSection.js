// src/Components/Home/HollywoodSection.js
import React, { useEffect, useRef, useState } from 'react';
import Titles from '../Titles';
import { BsCollectionFill, BsCaretLeftFill, BsCaretRightFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Loader from '../Loader';
import Movie from '../movie';
import { getAllMoviesService } from '../../Redux/APIs/MoviesServices';
import MobileGridSwiper from '../MobileGridSwiper';

function HollywoodSection({ browseList = [] }) {
  const [movies, setMovies]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const prevEl = useRef(null);
  const nextEl = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const responses = await Promise.all(
          browseList.map((b) =>
            getAllMoviesService('', '', '', '', '', b, '', 1)
          )
        );

        const map = new Map();
        responses.forEach((res) => {
          res.movies.forEach((m) => map.set(m._id, m));
        });

        if (!cancelled) {
          setMovies(Array.from(map.values()));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load Hollywood section');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => (cancelled = true);
  }, [browseList]);

  return (
    <div className="my-8 mobile:my-4">
      <div className="flex items-center justify-between mb-6 mobile:mb-4 mobile:px-4">
        <Titles title="Hollywood" Icon={BsCollectionFill} />
        <Link
          to="/Hollywood"
          className="group flex items-center gap-1 text-sm font-medium text-white hover:text-customPurple transitions"
          aria-label="Show more Hollywood titles"
        >
          Show&nbsp;More
          <BsCaretRightFill className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <p className="text-border my-6">{error}</p>
      ) : movies.length > 0 ? (
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
              speed={800}
              spaceBetween={15}
              slidesPerView={2}
              breakpoints={{
                640:  { slidesPerView: 2, spaceBetween: 10 },
                768:  { slidesPerView: 3, spaceBetween: 15 },
                1024: { slidesPerView: 4, spaceBetween: 20 },
                1280: { slidesPerView: 5, spaceBetween: 20 },
              }}
            >
              {movies.slice(0, 20).map((m) => (
                <SwiperSlide key={m._id}>
                  <Movie movie={m} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Q2: 4:15 aspect on mobile */}
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
        <p className="text-border my-6">No titles found in Hollywood</p>
      )}
    </div>
  );
}

export default HollywoodSection;
