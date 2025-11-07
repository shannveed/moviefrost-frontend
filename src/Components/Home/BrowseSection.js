// src/Components/Home/BrowseSection.js
import React, { useEffect, useState, useMemo } from 'react';
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
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

/*
  Re-usable section that:
    • defers fetching until visible (performance)
    • now uses CLASS-BASED navigation selectors (fixes arrows)
*/
function BrowseSection({ title, browseList = [], link = '/movies' }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Visibility (defer work until section is in view)
  const [sectionRef, inView] = useIntersectionObserver({
    rootMargin: '200px',
    threshold: 0.01
  });

  // safe array
  const browseSet = useMemo(
    () => (Array.isArray(browseList) ? browseList : []),
    [browseList]
  );

  // slug for unique navigation class names
  const slug = useMemo(
    () =>
      String(title || 'browse')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
    [title]
  );
  const prevClass = `nav-prev-${slug}`;
  const nextClass = `nav-next-${slug}`;

  useEffect(() => {
    let cancelled = false;
    if (!inView || hasFetched || browseSet.length === 0) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // fetch once per browseBy value – in parallel
        const responses = await Promise.all(
          browseSet.map((b) =>
            getAllMoviesService(
              '', // category
              '', // time
              '', // language
              '', // rate
              '', // year
              b, // browseBy
              '', // search
              1 // pageNumber
            )
          )
        );

        // merge & deduplicate by _id
        const map = new Map();
        responses.forEach((r) => r.movies.forEach((m) => map.set(m._id, m)));
        if (!cancelled) {
          setMovies(Array.from(map.values()));
          setHasFetched(true);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [inView, hasFetched, browseSet]);

  // If not in view and never fetched, render a light placeholder
  if (!inView && !hasFetched) {
    return (
      <div ref={sectionRef} className="my-8 mobile:my-4">
        <div className="flex items-center justify-between mb-6 mobile:mb-4 mobile:px-4">
          <Titles title={title} Icon={BsCollectionFill} />
        </div>
        <div className="h-40 flex items-center justify-center text-border text-sm">
          Loading when visible…
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div ref={sectionRef} className="my-8 mobile:my-4">
        <div className="flex items-center justify-between mb-6 mobile:mb-4 mobile:px-4">
          <Titles title={title} Icon={BsCollectionFill} />
        </div>
        <Loader />
      </div>
    );
  }

  if (error)
    return (
      <div ref={sectionRef} className="my-8 mobile:my-4">
        <div className="flex items-center justify-between mb-6 mobile:mb-4 mobile:px-4">
          <Titles title={title} Icon={BsCollectionFill} />
        </div>
        <p className="text-border my-6">{error}</p>
      </div>
    );

  return (
    <div ref={sectionRef} className="my-8 mobile:my-4">
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
        <div className="relative">
          <Swiper
            // give Swiper a stable key per section to ensure re-init if needed
            key={slug}
            modules={[Navigation, Autoplay]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop
            speed={800}
            spaceBetween={15}
            slidesPerView={2}
            navigation={{
              prevEl: `.${prevClass}`,
              nextEl: `.${nextClass}`
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = `.${prevClass}`;
              swiper.params.navigation.nextEl = `.${nextClass}`;
            }}
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
        <Empty message={`No titles found in ${title}`} />
      )}
    </div>
  );
}

export default React.memo(BrowseSection);
