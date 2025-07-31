// EditMovie.js
import React, { useState, useEffect } from 'react';
import SideBar from '../SideBar';
import { Input, Message, Select } from '../../../Components/Usedinputs';
import Uploader from '../../../Components/Uploader';
import { ImUpload } from 'react-icons/im';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { movieValidation } from '../../../Components/Validation/MovieValidation';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { Imagepreview } from '../../../Components/imagePreview';
import { InlineError } from '../../../Components/Notifications/Error';
import {
  getMovieByIdAction,
  updateMovieAction,
  getDistinctBrowseByAction,
} from '../../../Redux/Actions/MoviesActions';
import { parseDuration, formatTime } from '../../../Context/Functionalities';
import Loader from '../../../Components/Loader';
import { RiMovie2Line } from 'react-icons/ri';

function EditMovie() {
  const [imageWithoutTitle, setImageWithoutTitle] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: movieId } = useParams();

  // Categories
  const { categories } = useSelector((state) => state.categoryGetAll);

  // Distinct browseBy
  const { browseBy: distinctBrowseBy, isLoading: browseByLoading } = useSelector(
    (state) => state.browseByDistinct
  );

  const {
    isLoading: movieLoading,
    isError: movieError,
    movie,
  } = useSelector((state) => state.getMovieById);

  const {
    isLoading: updateLoading,
    isError: updateError,
    isSuccess: updateSuccess,
  } = useSelector((state) => state.updateMovie);

  // Predefined additional browseBy options
  const preDefinedExtraBrowseBy = [
    "Hollywood (English)",
    "Hollywood (Hindi Dubbed)",
    "Bollywood",
    "South Indian (Hindi Dubbed)",
    "Korean (English Dubbed)",
    "Korean Dramas (English Dubbed)",
    "Pakistan Movies",
    "Turkish Movies (English Dubbed)",
    "Turkish Dramas (English Dubbed)",
    "Blockbuster Movies",
    "Hollywood Web Series (English)",
    "Hollywood Web Series (Hindi Dubbed)",
    "Bollywood Web Series"
  ];

  // Merge distinct with predefined
const browseByOptions = React.useMemo(() => {
  const placeholder = [{ _id: '', title: 'Select Browse By...' }];

  const distinctNonEmpty = distinctBrowseBy
    ? distinctBrowseBy.filter((v) => v.trim() !== '')
    : [];

  // Define predefined options inside useMemo
  const predefinedOptions = [
    "Hollywood (English)",
    "Hollywood (Hindi Dubbed)",
    "Bollywood",
    "South Indian (Hindi Dubbed)",
    "Korean (English Dubbed)",
    "Korean Dramas (English Dubbed)",
    "Pakistan Movies",
    "Turkish Movies (English Dubbed)",
    "Turkish Dramas (English Dubbed)",
    "Blockbuster Movies",
    "Hollywood Web Series (English)",
    "Hollywood Web Series (Hindi Dubbed)",
    "Bollywood Web Series"
  ];

  const merged = Array.from(new Set([...distinctNonEmpty, ...predefinedOptions]));
  const finalOptions = merged.map((item) => ({ _id: item, title: item }));

  return [...placeholder, ...finalOptions];
}, [distinctBrowseBy]);


  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(movieValidation),
    defaultValues: {
      type: 'Movie',
      episodes: [],
      browseBy: '',
      thumbnailInfo: '',
      displayOrder: 'normal',
    },
  });

  const watchType = watch('type');

  const {
    fields: episodeFields,
    append: addEpisode,
    remove: removeEpisode,
    replace: replaceEpisodes,
  } = useFieldArray({
    control,
    name: 'episodes',
  });

  useEffect(() => {
    dispatch(getDistinctBrowseByAction());
    if (!movie || movie?._id !== movieId) {
      dispatch(getMovieByIdAction(movieId));
    }
  }, [dispatch, movieId, movie]);

  useEffect(() => {
    if (movie && movie._id === movieId) {
      const formattedTime = movie.time ? formatTime(movie.time) : '';
      let formattedEpisodes = [];
      if (movie.type === 'WebSeries' && movie.episodes) {
        formattedEpisodes = movie.episodes.map((ep) => ({
          ...ep,
          episodeNumber: ep.episodeNumber || '',
          title: ep.title || '',
          duration: ep.duration ? formatTime(ep.duration) : '',
          video: ep.video || '',
          desc: ep.desc || '',
        }));
      }

      reset({
        type: movie.type || 'Movie',
        name: movie.name || '',
        time: formattedTime,
        language: movie.language || '',
        year: movie.year || '',
        category: movie.category || '',
        browseBy: movie.browseBy || '',
        thumbnailInfo: movie.thumbnailInfo || '',
        desc: movie.desc || '',
        video: movie.video || '',
        videoUrl2: movie.videoUrl2 || '',
        downloadUrl: movie.downloadUrl || '',
        displayOrder: movie.latest
          ? 'latest'
          : movie.previousHit
          ? 'previousHit'
          : 'normal',
      });

      setImageWithoutTitle(movie.image || '');
      setImageTitle(movie.titleImage || '');

      if (movie.type === 'WebSeries') {
        replaceEpisodes(formattedEpisodes);
      } else {
        replaceEpisodes([]);
      }
    }
  }, [movie, movieId, reset, replaceEpisodes]);

  useEffect(() => {
    if (updateSuccess) {
      toast.success(`"${movie?.name || 'Item'}" updated successfully!`);
      dispatch({ type: 'UPDATE_MOVIE_RESET' });
      dispatch(getMovieByIdAction(movieId));
    }
    if (updateError) {
      toast.error(updateError || 'Failed to update movie/series.');
      dispatch({ type: 'UPDATE_MOVIE_RESET' });
    }
  }, [updateSuccess, updateError, dispatch, navigate, movieId, movie?.name]);

  const onSubmit = (data) => {
    if (!imageWithoutTitle || !imageTitle) {
      toast.error('Please ensure both title image and poster image are set.');
      return;
    }

    const totalMinutes = parseDuration(data.time);
    if (totalMinutes === null) {
      toast.error(errors.time?.message || 'Invalid duration format. Use e.g., 2Hr 35Min');
      return;
    }

    if (!data.browseBy || data.browseBy === '') {
      toast.error('Please select a "Browse By" value.');
      return;
    }

    let processedData = {
      ...data,
      time: totalMinutes,
      browseBy: data.browseBy,
      thumbnailInfo: data.thumbnailInfo || null,
      image: imageWithoutTitle,
      titleImage: imageTitle,
      category: data.category,
    };

    /* ordering flags */
    processedData.latest      = data.displayOrder === 'latest';
    processedData.previousHit = data.displayOrder === 'previousHit';

    if (data.type === 'WebSeries') {
      if (!data.episodes || data.episodes.length === 0) {
        toast.error('Please add at least one episode for a WebSeries.');
        return;
      }
      try {
        const episodes = data.episodes.map((ep, index) => {
          const epDuration = parseDuration(ep.duration);
          if (epDuration === null) {
            throw new Error(
              `Invalid duration format for Episode ${index + 1}. Use e.g., 45Min.`
            );
          }
          return { ...ep, duration: epDuration, title: ep.title || '' };
        });
        processedData.episodes = episodes;
        processedData.video = undefined;
        processedData.downloadUrl = undefined;
        processedData.videoUrl2 = undefined;
      } catch (error) {
        toast.error(error.message);
        return;
      }
    } else {
      processedData.episodes = undefined;
      processedData.downloadUrl = data.downloadUrl || null;
    }

    dispatch(updateMovieAction(movieId, processedData));
  };

  if (movieLoading || browseByLoading) {
    return (
      <SideBar>
        <div className="flex justify-center items-center h-96">
          <Loader />
        </div>
      </SideBar>
    );
  }

  if (movieError) {
    return (
      <SideBar>
        <div className="flex flex-col items-center justify-center h-96 text-red-500">
          <RiMovie2Line className="text-6xl mb-4" />
          <p>Error loading movie data: {movieError}</p>
          <button
            onClick={() => dispatch(getMovieByIdAction(movieId))}
            className="mt-4 px-4 py-2 bg-customPurple text-white rounded"
          >
            Retry
          </button>
        </div>
      </SideBar>
    );
  }

  return (
    <SideBar>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 above-1000:gap-4 above-1000:max-w-4xl above-1000:mx-auto">
        <h2 className="text-xl font-bold above-1000:text-lg">
          Edit "{movie?.name || 'Movie/Series'}"
        </h2>

        {/* Type */}
        <div className="text-sm w-full above-1000:w-1/2">
          <Select
            label="Type *"
            options={[
              { _id: 'Movie', title: 'Movie' },
              { _id: 'WebSeries', title: 'WebSeries' },
            ]}
            name="type"
            register={register('type')}
          />
          {errors.type && <InlineError text={errors.type.message} />}
        </div>

        {/* Name & Duration */}
        <div className="w-full grid md:grid-cols-2 gap-6 above-1000:gap-4">
          <div className="w-full">
            <Input
              label={
                watchType === 'WebSeries' ? 'Series Title *' : 'Movie Title *'
              }
              placeholder={
                watchType === 'WebSeries' ? 'e.g., Breaking Bad' : 'e.g., Inception'
              }
              type="text"
              bg
              name="name"
              register={register('name')}
            />
            {errors.name && <InlineError text={errors.name.message} />}
          </div>
          <div className="w-full">
            <Input
              label={watchType === 'WebSeries' ? 'Total Duration *' : 'Duration *'}
              placeholder="e.g., 2Hr 35Min or 55Min"
              type="text"
              bg
              name="time"
              register={register('time')}
            />
            {errors.time && <InlineError text={errors.time.message} />}
          </div>
        </div>

        {/* Language & Year */}
        <div className="w-full grid md:grid-cols-2 gap-6 above-1000:gap-4">
          <div className="w-full">
            <Input
              label="Language Used *"
              placeholder="e.g., English"
              type="text"
              bg
              name="language"
              register={register('language')}
            />
            {errors.language && <InlineError text={errors.language.message} />}
          </div>
          <div className="w-full">
            <Input
              label="Year of Release *"
              placeholder="e.g., 2023"
              type="number"
              bg
              name="year"
              register={register('year')}
            />
            {errors.year && <InlineError text={errors.year.message} />}
          </div>
        </div>

        {/* Images */}
        <div className="w-full grid md:grid-cols-2 gap-6 above-1000:gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-border font-semibold text-sm above-1000:text-xs">
              Poster Image (without text) *
            </p>
            <Uploader
              setImageUrl={setImageWithoutTitle}
              initialImage={imageWithoutTitle}
            />
            {imageWithoutTitle && (
              <Imagepreview
                image={imageWithoutTitle}
                name="imageWithoutTitle"
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-border font-semibold text-sm above-1000:text-xs">
              Title Image (with text/logo) *
            </p>
            <Uploader setImageUrl={setImageTitle} initialImage={imageTitle} />
            {imageTitle && (
              <Imagepreview image={imageTitle} name="imageTitle" />
            )}
          </div>
        </div>

        {/* Description */}
        <div className="w-full">
          <Message
            label="Description *"
            placeholder="Make it short and engaging..."
            name="desc"
            register={register('desc')}
            height="h-32 above-1000:h-24"
          />
          {errors.desc && <InlineError text={errors.desc.message} />}
        </div>

        {/* Category & Browse By */}
        <div className="w-full grid md:grid-cols-2 gap-6 above-1000:gap-4">
          <div className="text-sm w-full">
            <Select
              label="Category *"
              options={
                categories?.map((cat) => ({ _id: cat._id, title: cat.title })) || []
              }
              name="category"
              register={register('category')}
            />
            {errors.category && <InlineError text={errors.category.message} />}
          </div>
          <div className="text-sm w-full">
            <Select
              label="Browse By *"
              options={browseByOptions}
              name="browseBy"
              register={register('browseBy')}
              disabled={browseByLoading}
            />
            {errors.browseBy && <InlineError text={errors.browseBy.message} />}
          </div>
        </div>

        {/* Thumbnail Info */}
        <div className="w-full md:w-1/2">
          <Input
            label="Thumbnail Info (Optional)"
            placeholder="e.g., HD, New Episode"
            type="text"
            bg
            name="thumbnailInfo"
            register={register('thumbnailInfo')}
          />
          {errors.thumbnailInfo && (
            <InlineError text={errors.thumbnailInfo.message} />
          )}
        </div>

        {/* NEW - Display Order Selector */}
        <div className="w-full">
          <label className="text-border font-semibold text-sm above-1000:text-xs">
            Display Position *
          </label>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {['normal', 'latest', 'previousHit'].map((opt) => (
              <label
                key={opt}
                className={`flex items-center justify-center p-3 above-1000:p-2 rounded-md border-2 cursor-pointer transition ${
                  watch('displayOrder') === opt
                    ? 'border-customPurple bg-dry text-white'
                    : 'border-border hover:border-customPurple'
                }`}
              >
                <input
                  type="radio"
                  value={opt}
                  {...register('displayOrder')}
                  className="sr-only"
                />
                <span className="text-sm above-1000:text-xs font-medium capitalize">
                  {opt === 'normal' ? 'Default' : opt === 'latest' ? 'Latest (First)' : 'Previous Hit (Last)'}
                </span>
              </label>
            ))}
          </div>
          {errors.displayOrder && (
            <InlineError text={errors.displayOrder.message} />
          )}
        </div>

        {/* Movie-Specific Fields */}
        {watchType === 'Movie' && (
          <>
            <div className="w-full grid md:grid-cols-2 gap-6 above-1000:gap-4">
              <div className="w-full">
                <Input
                  label="Movie Video URL (Server 1) *"
                  placeholder="https://server1.com/video.mp4"
                  type="text"
                  bg
                  name="video"
                  register={register('video')}
                />
                {errors.video && <InlineError text={errors.video.message} />}
              </div>
              <div className="w-full">
                <Input
                  label="Movie Video URL (Server 2) *"
                  placeholder="https://server2.com/video.mp4"
                  type="text"
                  bg
                  name="videoUrl2"
                  register={register('videoUrl2')}
                />
                {errors.videoUrl2 && (
                  <InlineError text={errors.videoUrl2.message} />
                )}
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <Input
                label="Download URL (Optional)"
                placeholder="https://download.com/movie.mp4"
                type="text"
                bg
                name="downloadUrl"
                register={register('downloadUrl')}
              />
              {errors.downloadUrl && (
                <InlineError text={errors.downloadUrl.message} />
              )}
            </div>
          </>
        )}

        {/* WebSeries Fields */}
        {watchType === 'WebSeries' && (
          <div className="flex flex-col gap-4 above-1000:gap-3">
            <h3 className="text-lg font-semibold border-b border-border pb-2 above-1000:text-base">
              Episodes *
            </h3>
            {errors.episodes &&
              typeof errors.episodes !== 'string' &&
              !errors.episodes.message && (
                <InlineError text="Please check episode details for errors." />
            )}
            {errors.episodes?.message && (
              <InlineError text={errors.episodes.message} />
            )}

            {episodeFields.map((item, index) => (
              <div
                key={item.id}
                className="border border-border p-4 above-1000:p-3 rounded-md flex flex-col gap-4 above-1000:gap-3 relative"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white above-1000:text-sm">
                    Episode {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeEpisode(index)}
                    className="text-red-500 hover:text-red-700 transition duration-300 font-semibold text-sm"
                    disabled={episodeFields.length <= 1}
                  >
                    Remove Episode
                  </button>
                </div>

                {/* Episode Number & Title */}
                <div className="w-full grid md:grid-cols-2 gap-4 above-1000:gap-3">
                  <div className="w-full">
                    <Input
                      label="Episode Number *"
                      placeholder="1"
                      type="number"
                      bg
                      name={`episodes[${index}].episodeNumber`}
                      register={register(`episodes[${index}].episodeNumber`)}
                    />
                    {errors.episodes?.[index]?.episodeNumber && (
                      <InlineError
                        text={errors.episodes[index].episodeNumber.message}
                      />
                    )}
                  </div>
                  <div className="w-full">
                    <Input
                      label="Episode Title (Optional)"
                      placeholder="e.g., Pilot"
                      type="text"
                      bg
                      name={`episodes[${index}].title`}
                      register={register(`episodes[${index}].title`)}
                    />
                  </div>
                </div>

                {/* Episode Duration & Video */}
                <div className="w-full grid md:grid-cols-2 gap-4 above-1000:gap-3">
                  <div className="w-full">
                    <Input
                      label="Duration *"
                      placeholder="e.g., 45Min or 1Hr 15Min"
                      type="text"
                      bg
                      name={`episodes[${index}].duration`}
                      register={register(`episodes[${index}].duration`)}
                    />
                    {errors.episodes?.[index]?.duration && (
                      <InlineError
                        text={errors.episodes[index].duration.message}
                      />
                    )}
                  </div>
                  <div className="w-full">
                    <Input
                      label="Video URL *"
                      placeholder="https://server.com/episode1.mp4"
                      type="text"
                      bg
                      name={`episodes[${index}].video`}
                      register={register(`episodes[${index}].video`)}
                    />
                    {errors.episodes?.[index]?.video && (
                      <InlineError
                        text={errors.episodes[index].video.message}
                      />
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="w-full">
                  <Message
                    label="Description (Optional)"
                    placeholder="Brief summary of the episode..."
                    name={`episodes[${index}].desc`}
                    register={register(`episodes[${index}].desc`)}
                    height="h-24 above-1000:h-20"
                  />
                  {errors.episodes?.[index]?.desc && (
                    <InlineError text={errors.episodes[index].desc.message} />
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                addEpisode({
                  episodeNumber: episodeFields.length + 1,
                  title: '',
                  duration: '',
                  video: '',
                  desc: '',
                })
              }
              className="bg-green-600 hover:bg-green-700 text-white py-2 above-1000:py-1.5 px-4 above-1000:px-3 rounded transition duration-300 self-start text-sm"
            >
              Add Another Episode
            </button>
            {errors.episodes && typeof errors.episodes === 'string' && (
              <InlineError text={errors.episodes} />
            )}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={updateLoading || movieLoading || browseByLoading}
          className={`bg-customPurple w-full above-1000:w-auto above-1000:self-end flex flex-row items-center justify-center gap-2 font-medium text-white py-4 above-1000:py-3 px-8 rounded transition duration-300 ${
            (updateLoading || movieLoading || browseByLoading)
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-opacity-80'
          }`}
        >
          {updateLoading ? (
            'Updating...'
          ) : (
            <>
              <ImUpload /> Update{' '}
              {watchType === 'WebSeries' ? 'Web Series' : 'Movie'}
            </>
          )}
        </button>
      </form>
    </SideBar>
  );
}

export default EditMovie;
