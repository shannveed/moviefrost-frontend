// src/Components/Home/BrowseSection.js
import React, { useEffect, useState, useRef } from 'react';
import Titles from '../Titles';
import { 
  BsCollectionFill, 
  BsCaretLeftFill, 
  BsCaretRightFill 
} from 'react-icons/bs';
import Movie from '../movie';
import Loader from '../Loader';
import { Empty } from '../Notifications/Empty';
import { getAllMoviesService } from '../../Redux/APIs/MoviesServices';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import MobileGridSwiper from '../MobileGridSwiper';

/*
  Re-usable section that receives:
    • title        – headline to show
    • browseList[] – list of "Browse By" values that should be accepted
    • link         – absolute path to the dedicated listing page (e.g., "/Korean")
    • excludeList[] – optional list of browseBy values to exclude from results
*/
function BrowseSection({ title, browseList = [], link = '/movies', excludeList = [] }) {
  const [movies, setMovies]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  
  // Swiper arrows (desktop/tablet)
  const prevEl = useRef(null);
  const nextEl = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // fetch once per browseBy value – in parallel
        const responses = await Promise.all(
          browseList.map((b) =>
            getAllMoviesService(
              '',   // category
              '',   // time
              '',   // language
              '',   // rate
              '',   // year
              b,    // browseBy
              '',   // search
              1     // pageNumber
            )
          )
        );

        // merge & deduplicate by _id
        const map = new Map();
        responses.forEach((r) =>
          r.movies.forEach((m) => map.set(m._id, m))
        );

        // Q3/Q4: filter out any items whose browseBy matches excludeList
        const excludeSet = new Set((excludeList || []).map(v => v.toLowerCase()));
        const merged = Array.from(map.values()).filter(
          (m) => !excludeSet.has((m?.browseBy || '').toLowerCase())
        );

        if (!cancelled) setMovies(merged);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => (cancelled = true);
  }, [browseList, excludeList]);

  if (loading) return <Loader />;
  if (error)   return <p className="text-border my-6">{error}</p>;

  return (
    <div className="my-8 mobile:my-4">
      {/* ---------- Heading + "Show more" ---------- */}
      <div className="flex items-center justify-between mb-6 mobile:mb-4 mobile:px-4">
        <Titles title={title} Icon={BsCollectionFill} />
        
        {movies.length > 0 && (
          <Link
            to={link}
            className="group flex items-center gap-1 text-sm font-medium text-white hover:text-customPurple transitions"
          >
            Show&nbsp;More
            <BsCaretRightFill className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* ---------- Content ---------- */}
      {movies.length ? (
        <>
          {/* Mobile 2x2 grid swiper */}
          <div className="sm:hidden">
            <MobileGridSwiper movies={movies.slice(0, 20)} />
          </div>

          {/* Desktop/tablet carousel */}
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
                640: { slidesPerView: 2, spaceBetween: 10 },
                768: { slidesPerView: 3, spaceBetween: 15 },
                1024: { slidesPerView: 4, spaceBetween: 20 },
                1280: { slidesPerView: 5, spaceBetween: 20 }
              }}
            >
              {movies.slice(0, 20).map((m) => (
                <SwiperSlide key={m._id}>
                  <Movie movie={m} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Swiper arrows – Q2: 4:15 aspect on mobile */}
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
        <Empty message={`No titles found in ${title}`} />
      )}
    </div>
  );
}

export default BrowseSection;
