// MovieRates.js (updated for login reload)
import React, { useEffect, useState } from "react";
import Titles from "../Titles";
import { BsBookmarkStarFill } from "react-icons/bs";
import { Message, Select } from "../Usedinputs";
import Rating from "../Stars";
import { Empty } from "../Notifications/Empty";
import { ReviewValidation } from "../Validation/MovieValidation";
import { useDispatch, useSelector } from "react-redux";
import { InlineError } from "../Notifications/Error";
import { reviewMovieAction } from "../../Redux/Actions/MoviesActions";
import { useNavigate } from "react-router-dom"; // NEW: Import useNavigate
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-hot-toast";
import { adminReplyReviewAction } from "../../Redux/Actions/MoviesActions"; // NEW

// List of rating options
const Ratings = [
  { title: "0 - Poor", value: 0 },
  { title: "1 - Fair", value: 1 },
  { title: "2 - Good", value: 2 },
  { title: "3 - Very Good", value: 3 },
  { title: "4 - Excellent", value: 4 },
  { title: "5 - Masterpiece", value: 5 },
];

function MovieRates({ movie }) {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // NEW: For navigation with reload

  // We load createReview state
  const { isLoading, isError } = useSelector((state) => state.createReview);
  const { userInfo } = useSelector((state) => state.userLogin);

  // Admin reply loading
  const { isLoading: replyLoading, isError: replyError } = useSelector(
    (state) => state.adminReplyReview || {}
  );

  // validate review
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ReviewValidation),
  });

  // on submit review
  const onSubmit = (data) => {
    dispatch(
      reviewMovieAction({
        id: movie?._id,
        review: { ...data },
      })
    );
  };

  useEffect(() => {
    // if there's an error in createReview
    if (isError) {
      toast.error(isError);
      dispatch({ type: "CREATE_REVIEW_RESET" });
    }
    if (replyError) {
      toast.error(replyError);
      dispatch({ type: "ADMIN_REPLY_REVIEW_RESET" });
    }
  }, [isError, replyError, dispatch]);

  // For admin to reply to a specific review
  const [adminReplyText, setAdminReplyText] = useState("");
  const [activeReviewId, setActiveReviewId] = useState(null);

  const handleAdminReply = (reviewId) => {
    // dispatch an action
    if (!adminReplyText.trim()) return;
    dispatch(adminReplyReviewAction(movie._id, reviewId, adminReplyText));
    setAdminReplyText("");
    setActiveReviewId(null);
  };

  // NEW: Handle login click with full page reload
  const handleLoginClick = (e) => {
    e.preventDefault();
    window.location.href = '/login';
  };

  return (
    <div className="my-12 px-0">
      {/* Title Section */}
      <Titles title="Reviews" Icon={BsBookmarkStarFill} />

      {/* Review and Ratings Section */}
      <div className="mt-10 xl:grid flex-colo grid-cols-5 gap-12 bg-dry xs:p-10 py-10 px-4 sm:p-20 rounded">
        {/* Write Review Section */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="xl:col-span-2 w-full flex flex-col gap-8"
        >
          {/* Movie Review Title */}
          <h3 className="text-xl text-text font-semibold">
            Review "{movie?.name}"
          </h3>

          {/* Review Description */}
          <p className="text-sm leading-7 font-medium text-border">
            Write a review for this movie. It will be posted on this page.
          </p>

          {/* Rating Selection */}
          <div className="text-sm w-full">
            <Select
              label="Select Rating"
              options={Ratings}
              name="rating"
              register={{ ...register("rating") }}
            />
            <div className="flex mt-4 text-lg gap-2 text-star">
              <Rating value={watch("rating", false)} />
              {errors.rating && <InlineError text={errors.rating.message} />}
            </div>
          </div>

          {/* Message Input */}
          <div className="w-full">
            <Message
              name="comment"
              register={{ ...register("comment") }}
              label="Message"
              placeholder="Make it short and sweet...."
            />
            {errors.comment && <InlineError text={errors.comment.message} />}
          </div>

          {/* Submit */}
          {userInfo ? (
            <button
              type="submit"
              className="bg-customPurple text-white py-4 w-full flex-colo rounded"
            >
              {isLoading ? "Loading..." : "Submit"}
            </button>
          ) : (
            <button
              onClick={handleLoginClick} // NEW: Use reload handler instead of Link
              className="bg-main border border-border text-customPurple py-4 w-full inline-block text-center cursor-pointer"
            >
              Login to review this movie
            </button>
          )}
        </form>

        {/* REVIEWERS */}
        <div className="col-span-3 flex w-full flex-col gap-6">
          <h3 className="text-xl text-text font-semibold">
            Reviews ({movie?.numberOfReviews || 0})
          </h3>
          <div className="w-full flex flex-col bg-main gap-6 rounded-lg md:p-12 p-6 h-header overflow-y-scroll">
            {movie?.reviews?.length > 0 ? (
              movie?.reviews?.map((review) => (
                <div
                  key={review?._id}
                  className="md:grid flex flex-col w-full grid-cols-12 gap-6 bg-dry p-4 border border-gray-800 rounded-lg"
                >
                  {/* User Image */}
                  <div className="col-span-2 bg-main hidden md:block">
                    <img
                      src={
                        review?.userImage
                          ? review.userImage
                          : "/images/default-avatar.png"
                      }
                      alt={review.userName}
                      className="w-full h-24 rounded-lg object-cover"
                    />
                  </div>

                  <div className="col-span-7 flex flex-col gap-2">
                    <h2 className="font-semibold">{review?.userName}</h2>
                    <p className="text-sm leading-6 font-medium text-text">
                      {review?.comment}
                    </p>
                    {/* If admin replied already, show it */}
                    {review?.adminReply && (
                      <div className="mt-2 bg-black/40 p-2 rounded text-sm text-star">
                        <strong>Admin replied:</strong> {review.adminReply}
                      </div>
                    )}
                  </div>

                  {/* Rating or star column */}
                  <div className="col-span-3 flex-rows border-l border-border text-xs gap-1 text-star">
                    <Rating value={review?.rating} />
                  </div>

                  {/* Admin reply UI */}
                  {userInfo?.isAdmin && (
                    <div className="col-span-12 mt-4">
                      {/* Toggle the "Reply" input for this review */}
                      {activeReviewId === review._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="bg-main text-white border border-border p-2 w-full rounded"
                            placeholder="Type admin reply..."
                            value={adminReplyText}
                            onChange={(e) => setAdminReplyText(e.target.value)}
                          />
                          <button
                            onClick={() => handleAdminReply(review._id)}
                            className="bg-customPurple text-white py-2 px-4 rounded"
                          >
                            {replyLoading ? "Replying..." : "Reply"}
                          </button>
                          <button
                            onClick={() => {
                              setActiveReviewId(null);
                              setAdminReplyText("");
                            }}
                            className="bg-customPurple-500 text-white py-2 px-4 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveReviewId(review._id);
                            setAdminReplyText(review.adminReply || "");
                          }}
                          className="bg-main hover:bg-customPurple border border-customPurple text-white py-2 px-4 rounded"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <Empty message={`Be the first to rate "${movie?.name}"`} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieRates;
