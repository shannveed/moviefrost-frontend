// Banner.js
import React, { memo, useCallback } from 'react';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import FlexMovieItems from '../FlexMovieItems';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import Loader from '../Loader';
import { RiMovie2Line } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { IfMovieLiked, LikeMovie } from '../../Context/Functionalities';
import OptimizedImage from '../OptimizedImage';

/*  ──────────────────────────────────────────────────────────
    Mobile-friendly Banner  
    • Large screens keep the existing full-screen overlay  
    • Mobile (&lt; 640 px) gets a compact bottom sheet with
      better spacing / contrast / tap targets
   ────────────────────────────────────────────────────────── */
const SwiperComponent = memo(({ sameClass, movies }) => {
  const { isLoading } = useSelector((state) => state.userLikeMovie);
  const dispatch          = useDispatch();
  const { userInfo }      = useSelector((state) => state.userLogin);

  /* Helpers */
  const isLiked = useCallback((movie) => IfMovieLiked(movie), []);
  const handleLikeMovie = useCallback(
    (movie) => {
      LikeMovie(movie, dispatch, userInfo);
    },
    [dispatch, userInfo]
  );

  return (
    <Swiper
      direction="vertical"
      slidesPerView={1}
      loop
      speed={1000}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
      }}
      modules={[Autoplay]}
      className={sameClass}
    >
      {movies?.slice(0, 8).map((movie, index) => (
        <SwiperSlide
          key={movie._id || index}
          className="relative rounded overflow-hidden"
        >
          {/* Poster */}
          <OptimizedImage
            src={movie?.image || '/images/c1.jpg'}
            alt={movie?.name || 'Movie banner'}
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />

          {/* ─────────────── DESKTOP/TABLET OVERLAY ─────────────── */}
          <div className="hidden sm:flex absolute linear-bg xl:pl-52 sm:pl-32 pl-8 top-0 bottom-0 right-0 left-0 flex-col justify-center lg:gap-8 md:gap-5 gap-4">
            <h1 className="xl:text-4xl truncate capitalize font-sans sm:text-xl text-lg font-bold">
              {movie?.name}
            </h1>

            <div className="flex gap-5 items-center text-dryGray">
              <FlexMovieItems movie={movie} />
            </div>

            <div className="flex gap-5 items-center">
              <Link
                to={`/movie/${movie?._id}`}
                className="bg-customPurple hover:text-main transitions text-white px-8 py-2 rounded font sm:text-sm text-xs"
                aria-label={`Watch ${movie?.name}`}
              >
                Watch
              </Link>

              <button
                onClick={() => handleLikeMovie(movie)}
                disabled={isLiked(movie) || isLoading}
                aria-label={
                  isLiked(movie)
                    ? `Remove ${movie?.name} from favorites`
                    : `Add ${movie?.name} to favorites`
                }
                className={`bg-white ${
                  isLiked(movie) ? 'text-customPurple' : 'text-white'
                } hover:text-customPurple transitions px-4 py-3 rounded text-sm bg-opacity-30`}
              >
                <FaHeart aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* ─────────────── MOBILE OVERLAY ─────────────── */}
          <div className="sm:hidden absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-4 py-3 flex flex-col gap-2">
            {/* title */}
            <h2 className="text-base font-semibold leading-5 line-clamp-2">
              {movie?.name}
            </h2>

            {/* meta */}
            <FlexMovieItems movie={movie} className="gap-3 !text-xs" />

            {/* actions */}
            <div className="flex items-center gap-3 mt-1">
              <Link
                to={`/movie/${movie?._id}`}
                className="flex-1 bg-customPurple hover:bg-opacity-80 transition text-white text-sm py-2 rounded text-center"
              >
                Watch
              </Link>

              <button
                onClick={() => handleLikeMovie(movie)}
                disabled={isLiked(movie) || isLoading}
                aria-label={
                  isLiked(movie)
                    ? `Remove ${movie?.name} from favorites`
                    : `Add ${movie?.name} to favorites`
                }
                className={`w-10 h-10 flex-colo rounded ${
                  isLiked(movie) ? 'bg-customPurple' : 'bg-white bg-opacity-30'
                } text-white`}
              >
                <FaHeart className="text-sm" aria-hidden="true" />
              </button>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
});
SwiperComponent.displayName = 'SwiperComponent';

function Banner({ movies = [], isLoading = false }) {
  /* 16 : 7 on ≥ 640 px,  16 : 10 on mobile for better aspect  */
  const sameClass =
    'w-full flex-colo xl:h-[530px] bg-dry lg:h-96 h-80 mobile:h-[calc(100vw*0.645)]';

  return (
    <section className="relative w-full" aria-label="Featured movies">
      {isLoading ? (
        <div className={sameClass}>
          <Loader />
        </div>
      ) : movies?.length > 0 ? (
        <SwiperComponent sameClass={sameClass} movies={movies} />
      ) : (
        <div className={sameClass}>
          <div className="flex-colo w-24 h-24 p-5 mb-4 rounded-full bg-dry text-customPurple text-4xl">
            <RiMovie2Line aria-hidden="true" />
          </div>
          <p className="text-border text-sm">
            It seems like we don't have any movies
          </p>
        </div>
      )}
    </section>
  );
}

export default memo(Banner);
