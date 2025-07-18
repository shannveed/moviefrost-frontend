import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { likeMovieAction } from "../Redux/Actions/userActions";
import { trackGuestFavoriteAttempt, trackGuestAction } from "../utils/analytics";

// Check if movie is added to favorites
const IfMovieLiked = (movie) => {
  const { likedMovies } = useSelector((state) => state.userGetFavoriteMovies);
  return likedMovies?.find((likedMovie) => likedMovie?._id === movie?._id);
};

// Like movie functionality
const LikeMovie = (movie, dispatch, userInfo) => {
  if (!userInfo) {
    trackGuestFavoriteAttempt(movie.name, movie._id);
    toast.error("Please login to add to favorites");
    return;
  }
  
  dispatch(
    likeMovieAction({
      movieId: movie._id,
    })
  );
};

// Download video URL functionality
const DownloadVideo = (url, userInfo = null) => {
  if (!userInfo) {
    trackGuestAction('download_attempt', { url: url });
  }
  
  try {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Download failed. Please try again later.');
  }
};

// Format time in minutes to "XHr YMin"
export const formatTime = (minutes) => {
  if (!minutes) return '';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  let timeStr = '';
  if (hrs > 0) timeStr += `${hrs}Hr `;
  if (mins > 0) timeStr += `${mins}Min`;
  return timeStr.trim();
};

// Parse duration string like "2Hr 35Min" to total minutes
export const parseDuration = (durationStr) => {
  const regex = /(?:(\d+)\s*Hr)?\s*(?:(\d+)\s*Min)?/i;
  const match = regex.exec(durationStr);
  if (match) {
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    if (isNaN(hours) && isNaN(minutes)) {
      return null;
    }
    return hours * 60 + minutes;
  } else {
    return null;
  }
};

export { IfMovieLiked, LikeMovie, DownloadVideo };
