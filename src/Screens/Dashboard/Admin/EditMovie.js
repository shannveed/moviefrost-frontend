// Frontend/src/Screens/Dashboard/Admin/EditMovie.js
import React, { useEffect, useMemo, useState } from 'react';
import SideBar from '../SideBar';
import { Input, Message } from '../../../Components/Usedinputs';
import Uploader from '../../../Components/Uploader';
import { ImUpload } from 'react-icons/im';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  useForm,
  useFieldArray,
  Controller,
  useWatch,
} from 'react-hook-form';
import { movieValidation } from '../../../Components/Validation/MovieValidation';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { Imagepreview } from '../../../Components/imagePreview';
import { InlineError } from '../../../Components/Notifications/Error';
import {
  getMovieByIdAction,
  updateMovieAction,
  getDistinctBrowseByAction,
} from '../../../Redux/Actions/MoviesActions';
import { parseDuration, formatTime } from '../../../Context/Functionalities';
import Loader from '../../../Components/Loader';

const buildEpisodeTemplate = (episodeNumber = 1) => ({
  seasonNumber: 1,
  episodeNumber,
  title: '',
  duration: '',
  video: '',
  videoUrl2: '',
  videoUrl3: '',
  desc: '',
});

function EditMovie() {
  const [imageWithoutTitle, setImageWithoutTitle] = useState('');
  const [imageTitle, setImageTitle] = useState('');

  const dispatch = useDispatch();
  const { id: movieId } = useParams();

  const { categories = [] } = useSelector((state) => state.categoryGetAll || {});
  const { browseBy: distinctBrowseBy = [], isLoading: browseByLoading } =
    useSelector((state) => state.browseByDistinct || {});

  const {
    isLoading: movieLoading,
    isError: movieError,
    movie,
  } = useSelector((state) => state.getMovieById || {});

  const {
    isLoading: updateLoading,
    isError: updateError,
    isSuccess: updateSuccess,
  } = useSelector((state) => state.updateMovie || {});

  const browseByOptions = useMemo(() => {
    const distinct = Array.isArray(distinctBrowseBy) ? distinctBrowseBy : [];
    const distinctNonEmpty = distinct.filter((v) => v && String(v).trim() !== '');

    const predefined = [
      'Hollywood (English)',
      'Hollywood (Hindi Dubbed)',
      'Bollywood',
      'South Indian (Hindi Dubbed)',
      'Korean (English Dubbed)',
      'Korean Dramas (English Dubbed)',
      'Pakistan Movies',
      'Turkish Movies (English Dubbed)',
      'Turkish Dramas (English Dubbed)',
      'Blockbuster Movies',
      'Hollywood Web Series (English)',
      'Hollywood Web Series (Hindi Dubbed)',
      'Bollywood Web Series',
      'WWE Wrestling',
    ];

    return Array.from(new Set([...distinctNonEmpty, ...predefined]));
  }, [distinctBrowseBy]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(movieValidation),
    defaultValues: {
      type: 'Movie',

      name: '',
      time: '',
      language: '',
      year: '',
      category: '',
      browseBy: '',
      thumbnailInfo: '',
      desc: '',

      video: '',
      videoUrl2: '',
      videoUrl3: '',
      downloadUrl: '',

      episodes: [],

      latest: false,
      previousHit: false,
      isPublished: true,
    },
  });

  const watchType = useWatch({ control, name: 'type' });
  const isPublished = useWatch({ control, name: 'isPublished' });

  const {
    fields: episodeFields,
    append: addEpisode,
    remove: removeEpisode,
    replace: replaceEpisodes,
  } = useFieldArray({
    control,
    name: 'episodes',
  });

  // Fetch browseBy and movie
  useEffect(() => {
    dispatch(getDistinctBrowseByAction());
    dispatch(getMovieByIdAction(movieId));
  }, [dispatch, movieId]);

  // Populate form when movie loads
  useEffect(() => {
    if (!movie?._id) return;
    if (String(movie._id) !== String(movieId)) return;

    const formattedTime = movie.time ? formatTime(movie.time) : '';

    const formattedEpisodes =
      movie.type === 'WebSeries' && Array.isArray(movie.episodes)
        ? movie.episodes.map((ep) => ({
            _id: ep._id,
            seasonNumber: ep.seasonNumber || 1,
            episodeNumber: ep.episodeNumber || 1,
            title: ep.title || '',
            duration: ep.duration ? formatTime(ep.duration) : '',
            video: ep.video || '',
            videoUrl2: ep.videoUrl2 || '',
            videoUrl3: ep.videoUrl3 || '',
            desc: ep.desc || '',
          }))
        : [];

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
      videoUrl3: movie.videoUrl3 || '',

      downloadUrl: movie.downloadUrl || '',

      latest: !!movie.latest,
      previousHit: !!movie.previousHit,
      isPublished: typeof movie.isPublished === 'boolean' ? movie.isPublished : true,
      episodes: formattedEpisodes,
    });

    setImageWithoutTitle(movie.image || '');
    setImageTitle(movie.titleImage || '');

    replaceEpisodes(formattedEpisodes);
  }, [movie, movieId, reset, replaceEpisodes]);

  // ✅ Fix switching between Movie and WebSeries
  useEffect(() => {
    if (watchType === 'WebSeries') {
      if (!episodeFields.length) {
        addEpisode(buildEpisodeTemplate(1));
      }

      setValue('video', '');
      setValue('videoUrl2', '');
      setValue('videoUrl3', '');
      setValue('downloadUrl', '');
      clearErrors(['video', 'videoUrl2', 'videoUrl3', 'downloadUrl']);
    } else {
      if (episodeFields.length) {
        replaceEpisodes([]);
      }
      clearErrors(['episodes']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchType]);

  // Update success/error
  useEffect(() => {
    if (updateSuccess) {
      toast.success(`"${movie?.name || 'Item'}" updated successfully!`);
      dispatch({ type: 'UPDATE_MOVIE_RESET' });
      dispatch(getMovieByIdAction(movieId));
    }

    if (updateError) {
      toast.error(updateError || 'Failed to update');
      dispatch({ type: 'UPDATE_MOVIE_RESET' });
    }
  }, [updateSuccess, updateError, dispatch, movieId, movie?.name]);

  const onSubmit = (data) => {
    if (!imageWithoutTitle || !imageTitle) {
      toast.error('Please ensure both title image and poster image are set.');
      return;
    }

    const totalMinutes = parseDuration(data.time);
    if (totalMinutes === null) {
      toast.error(
        errors.time?.message || 'Invalid duration format. Use e.g., 2Hr 35Min'
      );
      return;
    }

    if (!data.category) {
      toast.error('Please select a category.');
      return;
    }
    if (!data.browseBy) {
      toast.error('Please select a "Browse By" value.');
      return;
    }

    let payload = {
      ...data,
      time: totalMinutes,
      image: imageWithoutTitle,
      titleImage: imageTitle,
      thumbnailInfo: (data.thumbnailInfo || '').trim(),
      latest: !!data.latest,
      previousHit: !!data.previousHit,
      isPublished: !!data.isPublished,
    };

    if (data.type === 'WebSeries') {
      if (!Array.isArray(data.episodes) || data.episodes.length === 0) {
        toast.error('Please add at least one episode for a WebSeries.');
        return;
      }

      try {
        const episodes = data.episodes.map((ep, idx) => {
          const epMinutes = parseDuration(ep.duration);
          if (epMinutes === null) {
            throw new Error(
              `Invalid duration format for Episode ${idx + 1}. Use e.g., 45Min`
            );
          }

          return {
            _id: ep._id,
            seasonNumber: Math.max(1, Number(ep.seasonNumber) || 1),
            episodeNumber: Number(ep.episodeNumber),
            title: ep.title || '',
            duration: epMinutes,
            desc: ep.desc || '',
            video: (ep.video || '').trim(),
            videoUrl2: (ep.videoUrl2 || '').trim(),
            videoUrl3: (ep.videoUrl3 || '').trim(),
          };
        });

        payload.episodes = episodes;

        payload.video = undefined;
        payload.videoUrl2 = undefined;
        payload.videoUrl3 = undefined;
        payload.downloadUrl = undefined;
      } catch (e) {
        toast.error(e.message || 'Invalid episode data');
        return;
      }
    } else {
      payload.episodes = undefined;

      payload.video = (data.video || '').trim();
      payload.videoUrl2 = (data.videoUrl2 || '').trim();
      payload.videoUrl3 = (data.videoUrl3 || '').trim();
      payload.downloadUrl = data.downloadUrl?.trim()
        ? data.downloadUrl.trim()
        : null;
    }

    dispatch(updateMovieAction(movieId, payload));
  };

  const selectClass =
    'w-full bg-main border border-border rounded px-3 py-3 text-white text-sm outline-none focus:border-customPurple';

  if (movieLoading || browseByLoading) {
    return (
      <SideBar>
        <Loader />
      </SideBar>
    );
  }

  if (movieError) {
    return (
      <SideBar>
        <div className="flex-colo w-full min-h-screen">
          <p className="text-border text-sm">Error loading movie: {movieError}</p>
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
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-bold">Edit "{movie?.name || 'Movie/Series'}"</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          {/* ✅ Type (fixed values: Movie / WebSeries) */}
          <div className="w-full grid md:grid-cols-2 gap-6">
            <div className="w-full">
              <label className="text-border font-semibold text-sm">Type</label>

              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <select {...field} className={`${selectClass} mt-2`}>
                    <option value="Movie">Movie</option>
                    <option value="WebSeries">Web Series</option>
                  </select>
                )}
              />

              {errors.type && <InlineError text={errors.type.message} />}
            </div>
          </div>

          {/* Name & Duration */}
          <div className="w-full grid md:grid-cols-2 gap-6 mt-4">
            <div className="w-full">
              <Input
                label="Name"
                placeholder="Movie/Series Name"
                type="text"
                bg={true}
                name="name"
                register={register('name')}
              />
              {errors.name && <InlineError text={errors.name.message} />}
            </div>

            <div className="w-full">
              <Input
                label="Total Duration"
                placeholder="e.g., 2Hr 35Min"
                type="text"
                bg={true}
                name="time"
                register={register('time')}
              />
              {errors.time && <InlineError text={errors.time.message} />}
            </div>
          </div>

          {/* Language & Year */}
          <div className="w-full grid md:grid-cols-2 gap-6 mt-4">
            <div className="w-full">
              <Input
                label="Language"
                placeholder="Language"
                type="text"
                bg={true}
                name="language"
                register={register('language')}
              />
              {errors.language && <InlineError text={errors.language.message} />}
            </div>

            <div className="w-full">
              <Input
                label="Year of Release"
                placeholder="e.g., 2024"
                type="number"
                bg={true}
                name="year"
                register={register('year', { valueAsNumber: true })}
              />
              {errors.year && <InlineError text={errors.year.message} />}
            </div>
          </div>

          {/* Images */}
          <div className="w-full grid md:grid-cols-2 gap-6 mt-6">
            <div className="flex flex-col gap-2">
              <p className="text-border font-semibold text-sm">
                Poster Image (without text) *
              </p>
              <Uploader setImageUrl={setImageWithoutTitle} />
              {imageWithoutTitle && (
                <Imagepreview image={imageWithoutTitle} name="posterImage" />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-border font-semibold text-sm">
                Title Image (with text/logo) *
              </p>
              <Uploader setImageUrl={setImageTitle} />
              {imageTitle && (
                <Imagepreview image={imageTitle} name="titleImage" />
              )}
            </div>
          </div>

          {/* Description */}
          <div className="w-full mt-4">
            <Message
              label="Description"
              placeholder="Make it short and sweet"
              name="desc"
              register={register('desc')}
            />
            {errors.desc && <InlineError text={errors.desc.message} />}
          </div>
<Input
  label="SEO Title (optional)"
  placeholder="Max 100 characters"
  type="text"
  bg={true}
  name="seoTitle"
  register={register('seoTitle')}
/>

<Input
  label="SEO Description (optional)"
  placeholder="Max 300 characters"
  type="text"
  bg={true}
  name="seoDescription"
  register={register('seoDescription')}
/>
          {/* Category & Browse By */}
          <div className="w-full grid md:grid-cols-2 gap-6 mt-4">
            <div className="w-full">
              <label className="text-border font-semibold text-sm">
                Category
              </label>
              <select {...register('category')} className={`${selectClass} mt-2`}>
                <option value="">Select Category...</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.title}>
                    {cat.title}
                  </option>
                ))}
              </select>
              {errors.category && (
                <InlineError text={errors.category.message} />
              )}
            </div>

            <div className="w-full">
              <label className="text-border font-semibold text-sm">
                Browse By
              </label>
              <select {...register('browseBy')} className={`${selectClass} mt-2`}>
                <option value="">Select Browse By...</option>
                {browseByOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {errors.browseBy && (
                <InlineError text={errors.browseBy.message} />
              )}
            </div>
          </div>

          {/* Thumbnail Info */}
          <div className="w-full mt-4">
            <Input
              label="Thumbnail Info (optional)"
              placeholder="e.g., New, HD, CAM"
              type="text"
              bg={true}
              name="thumbnailInfo"
              register={register('thumbnailInfo')}
            />
            {errors.thumbnailInfo && (
              <InlineError text={errors.thumbnailInfo.message} />
            )}
          </div>

          {/* Visibility & Flags */}
          <div className="w-full mt-6 p-4 bg-main border border-border rounded-lg">
            <h3 className="text-md font-semibold mb-4 text-white">
              Visibility & Flags
            </h3>

            <div className="flex items-center gap-4 mb-4">
              <button
                type="button"
                onClick={() => setValue('isPublished', !isPublished)}
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-colors ${
                  isPublished
                    ? 'border-green-500 bg-green-500/20 text-green-500'
                    : 'border-red-500 bg-red-500/20 text-red-500'
                }`}
              >
                {isPublished ? <FaCheck size={16} /> : <FaTimes size={16} />}
              </button>

              <div>
                <p className="text-white font-medium">
                  {isPublished ? 'Visible to all users' : 'Hidden from users (Draft)'}
                </p>
                <p className="text-dryGray text-xs">
                  When hidden, only admins can see this movie/web series.
                </p>
              </div>

              <input
                type="checkbox"
                {...register('isPublished')}
                className="hidden"
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  {...register('latest')}
                  className="w-4 h-4 accent-customPurple"
                />
                <span className="text-sm">Mark as Latest (show on first page)</span>
              </label>

              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  {...register('previousHit')}
                  className="w-4 h-4 accent-customPurple"
                />
                <span className="text-sm">Mark as Previous-Hit (send to last page)</span>
              </label>
            </div>

            {errors.previousHit && (
              <InlineError text={errors.previousHit.message} />
            )}
          </div>

          {/* Movie Fields */}
          {watchType === 'Movie' && (
            <div className="w-full mt-6">
              <div className="w-full grid md:grid-cols-2 gap-6">
                <div className="w-full">
                  <Input
                    label="Video URL (Server 1) *"
                    placeholder="https://..."
                    type="text"
                    bg={true}
                    name="video"
                    register={register('video')}
                  />
                  {errors.video && <InlineError text={errors.video.message} />}
                </div>

                <div className="w-full">
                  <Input
                    label="Video URL (Server 2) *"
                    placeholder="https://..."
                    type="text"
                    bg={true}
                    name="videoUrl2"
                    register={register('videoUrl2')}
                  />
                  {errors.videoUrl2 && (
                    <InlineError text={errors.videoUrl2.message} />
                  )}
                </div>
              </div>

              <div className="w-full grid md:grid-cols-2 gap-6 mt-4">
                <div className="w-full">
                  <Input
                    label="Video URL (Server 3) *"
                    placeholder="https://..."
                    type="text"
                    bg={true}
                    name="videoUrl3"
                    register={register('videoUrl3')}
                  />
                  {errors.videoUrl3 && (
                    <InlineError text={errors.videoUrl3.message} />
                  )}
                </div>

                <div className="w-full">
                  <Input
                    label="Download URL (optional)"
                    placeholder="https://..."
                    type="text"
                    bg={true}
                    name="downloadUrl"
                    register={register('downloadUrl')}
                  />
                  {errors.downloadUrl && (
                    <InlineError text={errors.downloadUrl.message} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* WebSeries Fields */}
          {watchType === 'WebSeries' && (
            <div className="w-full flex flex-col gap-4 mt-6">
              <h3 className="text-lg font-semibold text-white">Episodes *</h3>

              {errors.episodes?.message && (
                <InlineError text={errors.episodes.message} />
              )}

              {episodeFields.map((field, index) => (
                <div
                  key={field.id}
                  className="w-full p-4 border border-border rounded-lg bg-main"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">
                      Episode {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEpisode(index)}
                      className="text-red-500 hover:text-red-700 transition duration-300 font-semibold text-sm"
                      disabled={episodeFields.length <= 1}
                    >
                      Remove Episode
                    </button>
                  </div>

                  <input
                    type="hidden"
                    defaultValue={field._id || ''}
                    {...register(`episodes.${index}._id`)}
                  />

                  <div className="grid md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Input
                        label="Season Number *"
                        placeholder="1"
                        type="number"
                        bg={true}
                        name={`episodes.${index}.seasonNumber`}
                        register={register(`episodes.${index}.seasonNumber`, {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.episodes?.[index]?.seasonNumber && (
                        <InlineError
                          text={errors.episodes[index].seasonNumber.message}
                        />
                      )}
                    </div>

                    <div>
                      <Input
                        label="Episode Number *"
                        placeholder="1"
                        type="number"
                        bg={true}
                        name={`episodes.${index}.episodeNumber`}
                        register={register(`episodes.${index}.episodeNumber`, {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.episodes?.[index]?.episodeNumber && (
                        <InlineError
                          text={errors.episodes[index].episodeNumber.message}
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Input
                        label="Episode Title (optional)"
                        placeholder="Episode title"
                        type="text"
                        bg={true}
                        name={`episodes.${index}.title`}
                        register={register(`episodes.${index}.title`)}
                      />
                    </div>

                    <div>
                      <Input
                        label="Duration *"
                        placeholder="e.g., 45Min"
                        type="text"
                        bg={true}
                        name={`episodes.${index}.duration`}
                        register={register(`episodes.${index}.duration`)}
                      />
                      {errors.episodes?.[index]?.duration && (
                        <InlineError
                          text={errors.episodes[index].duration.message}
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Input
                        label="Video URL (Server 1) *"
                        placeholder="https://..."
                        type="text"
                        bg={true}
                        name={`episodes.${index}.video`}
                        register={register(`episodes.${index}.video`)}
                      />
                      {errors.episodes?.[index]?.video && (
                        <InlineError text={errors.episodes[index].video.message} />
                      )}
                    </div>

                    <div>
                      <Input
                        label="Video URL (Server 2) *"
                        placeholder="https://..."
                        type="text"
                        bg={true}
                        name={`episodes.${index}.videoUrl2`}
                        register={register(`episodes.${index}.videoUrl2`)}
                      />
                      {errors.episodes?.[index]?.videoUrl2 && (
                        <InlineError
                          text={errors.episodes[index].videoUrl2.message}
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Input
                        label="Video URL (Server 3) *"
                        placeholder="https://..."
                        type="text"
                        bg={true}
                        name={`episodes.${index}.videoUrl3`}
                        register={register(`episodes.${index}.videoUrl3`)}
                      />
                      {errors.episodes?.[index]?.videoUrl3 && (
                        <InlineError
                          text={errors.episodes[index].videoUrl3.message}
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-2">
                    <Message
                      label="Description (optional)"
                      placeholder="Episode description"
                      name={`episodes.${index}.desc`}
                      register={register(`episodes.${index}.desc`)}
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
                  addEpisode(buildEpisodeTemplate(episodeFields.length + 1))
                }
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300 self-start text-sm"
              >
                Add Another Episode
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={updateLoading}
            className="w-full flex-rows gap-4 mt-8 py-4 hover:bg-dry border-2 border-customPurple transitions bg-customPurple text-white rounded disabled:opacity-60"
          >
            {updateLoading ? (
              'Updating...'
            ) : (
              <>
                <ImUpload /> Update {watchType === 'WebSeries' ? 'Web Series' : 'Movie'}
              </>
            )}
          </button>
        </form>
      </div>
    </SideBar>
  );
}

export default EditMovie;
