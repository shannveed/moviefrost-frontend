// AddMovie.js
import React, { useState, useEffect } from 'react';
import SideBar from '../SideBar';
import { Input, Message, Select } from '../../../Components/Usedinputs';
import Uploader from '../../../Components/Uploader';
import { ImUpload } from 'react-icons/im';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createMovieAction, getDistinctBrowseByAction } from '../../../Redux/Actions/MoviesActions';
import { useForm, useFieldArray } from 'react-hook-form';
import { movieValidation } from '../../../Components/Validation/MovieValidation';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { Imagepreview } from '../../../Components/imagePreview';
import { InlineError } from '../../../Components/Notifications/Error';
import { parseDuration } from '../../../Context/Functionalities';

function AddMovie() {
  const [imageWithoutTitle, setImageWithoutTitle] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get all categories
  const { categories } = useSelector((state) => state.categoryGetAll);

  // Distinct browseBy values from the server
  const { browseBy: distinctBrowseBy, isLoading: browseByLoading } = useSelector(
    (state) => state.browseByDistinct
  );

  // Get createMovie state
  const { isLoading, isError, isSuccess } = useSelector(
    (state) => state.createMovie
  );

  // Q4: Predefined BrowseBy dropdown options
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

  // Format browseBy options for the Select component
const browseByOptions = React.useMemo(() => {
  // Placeholder
  const placeholder = [{ _id: '', title: 'Select Browse By...' }];

  // Filter out any empty strings from distinct
  const distinctNonEmpty = distinctBrowseBy
    ? distinctBrowseBy.filter((v) => v.trim() !== '')
    : [];

  // Define predefined options inside useMemo to avoid dependency issue
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

  // Merge distinct from server with our predefined list
  const merged = Array.from(new Set([...distinctNonEmpty, ...predefinedOptions]));

  // Convert each to { _id, title } type
  const finalOptions = merged.map((item) => ({ _id: item, title: item }));

  return [...placeholder, ...finalOptions];
}, [distinctBrowseBy]);

  // Validate movie
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(movieValidation),
    defaultValues: {
      type: 'Movie',
      episodes: [],
      browseBy: '',
      thumbnailInfo: '',
    },
  });

  const watchType = watch('type');

  const {
    fields: episodeFields,
    append: addEpisode,
    remove: removeEpisode,
  } = useFieldArray({
    control,
    name: 'episodes',
  });

  const onSubmit = (data) => {
    if (!imageWithoutTitle || !imageTitle) {
      toast.error('Please upload both title image and poster image.');
      return;
    }

    // Parse total duration
    const totalMinutes = parseDuration(data.time);
    if (totalMinutes === null) {
      toast.error(errors.time?.message || 'Invalid duration format. Use e.g., 2Hr 35Min');
      return;
    }

    // Ensure browseBy has a value selected (not placeholder)
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

    // Web Series
    if (data.type === 'WebSeries') {
      if (!data.episodes || data.episodes.length === 0) {
        toast.error('Please add at least one episode for a WebSeries.');
        return;
      }
      try {
        const episodes = data.episodes.map((ep, index) => {
          const epMinutes = parseDuration(ep.duration);
          if (epMinutes === null) {
            throw new Error(
              `Invalid duration format for Episode ${index + 1}. Use e.g., 45Min.`
            );
          }
          return { ...ep, duration: epMinutes, title: ep.title || '' };
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
      // Movie
      processedData.episodes = undefined;
      processedData.downloadUrl = data.downloadUrl || null;
    }

    dispatch(createMovieAction(processedData));
  };

  // Fetch distinct browseBy on mount
  useEffect(() => {
    dispatch(getDistinctBrowseByAction());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Movie/Series created successfully');
      reset({
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
        downloadUrl: '',
        episodes: [],
      });
      setImageWithoutTitle('');
      setImageTitle('');
      dispatch({ type: 'CREATE_MOVIE_RESET' });
    }
    if (isError) {
      toast.error(isError || 'An error occurred while creating.');
      dispatch({ type: 'CREATE_MOVIE_RESET' });
    }
  }, [isSuccess, isError, navigate, dispatch, reset]);

  return (
    <SideBar>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <h2 className="text-xl font-bold">
          Create {watchType === 'WebSeries' ? 'Web Series' : 'Movie'}
        </h2>

        {/* Type */}
        <div className="text-sm w-full">
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
        <div className="w-full grid md:grid-cols-2 gap-6">
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
        <div className="w-full grid md:grid-cols-2 gap-6">
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
        <div className="w-full grid md:grid-cols-2 gap-6">
          {/* Poster without text */}
          <div className="flex flex-col gap-2">
            <p className="text-border font-semibold text-sm">
              Poster Image (without text) *
            </p>
            <Uploader setImageUrl={setImageWithoutTitle} />
            {imageWithoutTitle && (
              <Imagepreview
                image={imageWithoutTitle}
                name="imageWithoutTitle"
              />
            )}
          </div>
          {/* Title with text */}
          <div className="flex flex-col gap-2">
            <p className="text-border font-semibold text-sm">
              Title Image (with text/logo) *
            </p>
            <Uploader setImageUrl={setImageTitle} />
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
            height="h-32"
          />
          {errors.desc && <InlineError text={errors.desc.message} />}
        </div>

        {/* Category */}
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

        {/* Q4: Browse By (dropdown) & Thumbnail Info */}
        <div className="w-full grid md:grid-cols-2 gap-6">
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
          <div className="w-full">
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
        </div>

        {/* Movie-Specific Fields */}
        {watchType === 'Movie' && (
          <>
            <div className="w-full grid md:grid-cols-2 gap-6">
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
            <div className="w-full">
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
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold border-b border-border pb-2">
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
                className="border border-border p-4 rounded-md flex flex-col gap-4 relative"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">
                    Episode {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeEpisode(index)}
                    className="text-red-500 hover:text-red-700 transition duration-300 font-semibold"
                    disabled={episodeFields.length <= 1}
                  >
                    Remove Episode
                  </button>
                </div>

                {/* Episode Number & Title */}
                <div className="w-full grid md:grid-cols-2 gap-4">
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
                <div className="w-full grid md:grid-cols-2 gap-4">
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

                {/* Episode Description */}
                <div className="w-full">
                  <Message
                    label="Description (Optional)"
                    placeholder="Brief summary of the episode..."
                    name={`episodes[${index}].desc`}
                    register={register(`episodes[${index}].desc`)}
                    height="h-24"
                  />
                  {errors.episodes?.[index]?.desc && (
                    <InlineError
                      text={errors.episodes[index].desc.message}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Add Another Episode */}
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
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300 self-start"
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
          disabled={isLoading || browseByLoading}
          className={`bg-customPurple w-full flex flex-row items-center justify-center gap-2 font-medium text-white py-4 rounded transition duration-300 ${
            (isLoading || browseByLoading) ? 'cursor-not-allowed opacity-50' : 'hover:bg-opacity-80'
          }`}
        >
          {isLoading ? (
            'Publishing...'
          ) : (
            <>
              <ImUpload /> Publish{' '}
              {watchType === 'WebSeries' ? 'Web Series' : 'Movie'}
            </>
          )}
        </button>
      </form>
    </SideBar>
  );
}

export default AddMovie;
