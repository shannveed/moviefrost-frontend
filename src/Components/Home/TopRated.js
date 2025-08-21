import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Titles from "../Titles";
import { Autoplay, Navigation } from "swiper/modules";
import { FaHeart } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  BsBookmarkStarFill,
  BsCaretLeftFill,
  BsCaretRightFill,
} from "react-icons/bs";
import Rating from "../Stars";
import "swiper/css";
import "swiper/css/navigation";
import Loader from "../Loader";
import { Empty } from "../Notifications/Empty";
import { IfMovieLiked, LikeMovie } from "../../Context/Functionalities";
import { useDispatch, useSelector } from "react-redux";

const SwiperTop = ({ prevEl, nextEl, movies }) => {
  const { isLoading } = useSelector((state) => state.userLikeMovie);
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.userLogin);

  const swiperRef = useRef(null);

  // If liked function
  const isLiked = (movie) => {
    return IfMovieLiked(movie);
  };

  useEffect(() => {
    if (
      swiperRef.current &&
      swiperRef.current.swiper &&
      swiperRef.current.swiper.params &&
      swiperRef.current.swiper.params.navigation
    ) {
      swiperRef.current.swiper.params.navigation.prevEl = prevEl.current;
      swiperRef.current.swiper.params.navigation.nextEl = nextEl.current;

      // Re-initialize navigation
      swiperRef.current.swiper.navigation.destroy();
      swiperRef.current.swiper.navigation.init();
      swiperRef.current.swiper.navigation.update();
    }
  }, [prevEl, nextEl]);

  return (
    <Swiper
      ref={swiperRef}
      modules={[Navigation, Autoplay]}
      spaceBetween={40}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      speed={1000}
      navigation={{
        prevEl: prevEl.current,
        nextEl: nextEl.current,
      }}
      breakpoints={{
        0: {
          slidesPerView: 1,
          spaceBetween: 0, // No space on mobile
        },
        300: {
          slidesPerView: 1,
          spaceBetween: 0, // No space on mobile
        },
        501: {
          slidesPerView: 2,
          spaceBetween: 10,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1000: {
          slidesPerView: 5,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 5,
          spaceBetween: 20,
        },
        1280: {
          slidesPerView: 5,
          spaceBetween: 20,
        },
      }}
    >
      {movies?.map((movie, index) => (
        <SwiperSlide key={index}>
          <div className="border border-border mobile:border-0 p-2 mobile:p-0 hover:scale-95 transitions relative rounded mobile:rounded-none overflow-hidden group">
            <Link to={`/movie/${movie?._id}`}>
              <img
                src={movie?.titleImage ? movie.titleImage : "/images/c3.jpg"}
                alt={movie?.name}
                className="w-full h-80 above-1000:h-[calc(100vw/5*1.3)] mobile:h-[calc(100vw*1.519)] object-cover rounded-md mobile:rounded-none" 
              />
            </Link>
            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center gap-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 mobile:px-2">
              {/* Like Button */}
              <button
                onClick={(e) => {
                  LikeMovie(movie, dispatch, userInfo);
                }}
                disabled={isLiked(movie) || isLoading}
                className={`absolute top-4 right-4 mobile:top-2 mobile:right-2 w-9 h-9 mobile:w-7 mobile:h-7 flex-colo transitions hover:bg-customPurple rounded-full ${
                  isLiked(movie) ? "bg-customPurple" : "bg-white bg-opacity-30"
                } text-white z-10`} 
              >
                <FaHeart className="mobile:text-sm" />
              </button>

              {/* Movie Name - Link inside the overlay */}
              <Link to={`/movie/${movie?._id}`} className="w-full">
                <p className="font-semibold text-md mobile:text-sm truncate line-clamp-2 text-white hover:text-customPurple transition">
                  {movie?.name}
                </p>
              </Link>
              {/* Rating */}
              <div className="flex gap-1 text-yellow-500">
                <Rating value={movie?.rate} />
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

function TopRated({ movies, isLoading }) {
  const nextEl = useRef(null);
  const prevEl = useRef(null);

  const arrowButtonClasses =
    "absolute top-1/2 -translate-y-1/2 z-20 hover:bg-dry transition text-sm rounded w-8 h-14 mobile:w-6 mobile:h-10 flex items-center justify-center bg-customPurple text-white opacity-70 hover:opacity-100";

  return (
    <div className="my-12 mobile:my-6">
      <div className="mobile:px-0">
        <Titles title="Top Rated" Icon={BsBookmarkStarFill} />
      </div>

      <div className="mt-10 mobile:mt-6 relative">
        {isLoading ? (
          <Loader />
        ) : movies?.length > 0 ? (
          <SwiperTop nextEl={nextEl} prevEl={prevEl} movies={movies} />
        ) : (
          <div className="mt-6">
            <Empty message="It seems like we don't have any top rated movies" />
          </div>
        )}

        {movies?.length > 0 && !isLoading && (
          <>
            <button className={`${arrowButtonClasses} left-0 ml-1 mobile:ml-0`} ref={prevEl}>
              <BsCaretLeftFill size={20} className="mobile:text-base"/>
            </button>
            <button className={`${arrowButtonClasses} right-0 mr-1 mobile:mr-0`} ref={nextEl}>
              <BsCaretRightFill size={20} className="mobile:text-base"/>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default TopRated;
