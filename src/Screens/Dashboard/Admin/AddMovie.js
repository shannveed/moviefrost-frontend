// Frontend/src/Screens/Dashboard/Admin/AddMovie.js
import React, { useState, useEffect, useMemo } from 'react';
import SideBar from '../SideBar';
import { Input, Message, Select } from '../../../Components/Usedinputs';
import Uploader from '../../../Components/Uploader';
import { ImUpload } from 'react-icons/im';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  createMovieAction,
  getDistinctBrowseByAction,
} from '../../../Redux/Actions/MoviesActions';
import { useForm, useFieldArray } from 'react-hook-form';
import { movieValidation } from '../../../Components/Validation/MovieValidation';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { Imagepreview } from '../../../Components/imagePreview';
import { InlineError } from '../../../Components/Notifications/Error';
import { parseDuration } from '../../../Context/Functionalities';
import { FaCheck, FaTimes } from 'react-icons/fa';

function AddMovie() {
  const [imageWithoutTitle, setImageWithoutTitle] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Categories
  const { categories } = useSelector((state) => state.categoryGetAll);

  // Distinct browseBy values
  const { browseBy: distinctBrowseBy } = useSelector(
    (state) => state.browseByDistinct
  );

  // Create movie state
  const { isLoading, isError, isSuccess } = useSelector(
    (state) => state.createMovie
  );

  // BrowseBy options (predefined + from server)
  const browseByOptions = useMemo(() => {
    const placeholder = [{ _id: '', title: 'Select Browse By...' }];

    const distinctNonEmpty = distinctBrowseBy
      ? distinctBrowseBy.filter((v) => v && v.trim() !== '')
      : [];

    const predefinedOptions = [
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

    const merged = Array.from(
      new Set([...distinctNonEmpty, ...predefinedOptions])
    );
    const finalOptions = merged.map((item) => ({ _id: item, title: item }));

    return [...placeholder, ...finalOptions];
  }, [distinctBrowseBy]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(movieValidation),
    defaultValues: {
      type: 'Movie',
      episodes: [],
      browseBy: '',
      thumbnailInfo: '',
      latest: false,
      previousHit: false,
      isPublished: false, // NEW: published by default
    },
  });

  const watchType = watch('type');
  const isPublished = watch('isPublished');

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

    const totalMinutes = parseDuration(data.time);
    if (totalMinutes === null) {
      toast.error(
        errors.time?.message ||
          'Invalid duration format. Use e.g., 2Hr 35Min or 145Min'
      );
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
      latest: !!data.latest,
      previousHit: !!data.previousHit,
      isPublished: !!data.isPublished, // send to backend
    };

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
      processedData.episodes = undefined;
      processedData.downloadUrl = data.downloadUrl || null;
    }

    dispatch(createMovieAction(processedData));
  };

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
        latest: false,
        previousHit: false,
        isPublished: false, // NEW: reset to published by default
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
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-bold">
          Create {watchType === 'WebSeries' ? 'Web Series' : 'Movie'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          {/* Type */}
          <div className="w-full grid md:grid-cols-2 gap-6">
            <div className="w-full">
              <Select
                label="Type"
                options={[
                  { _id: 'Movie', title: 'Movie' },
                  { _id: 'WebSeries', title: 'Web Series' },
                ]}
                name="type"
                register={register('type')}
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
              {errors.language && (
                <InlineError text={errors.language.message} />
              )}
            </div>
            <div className="w-full">
              <Input
                label="Year of Release"
                placeholder="e.g., 2024"
                type="number"
                bg={true}
                name="year"
                register={register('year')}
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

          {/* Category */}
          <div className="w-full grid md:grid-cols-2 gap-6 mt-4">
            <div className="w-full">
              <Select
                label="Category"
                options={
                  categories?.map((cat) => ({ _id: cat._id, title: cat.title })) ||
                  []
                }
                name="category"
                register={register('category')}
              />
              {errors.category && (
                <InlineError text={errors.category.message} />
              )}
            </div>
          </div>

          {/* Browse By & Thumbnail Info */}
          <div className="w-full grid md:grid-cols-2 gap-6 mt-4">
            <div className="w-full">
              <Select
                label="Browse By"
                options={browseByOptions}
                name="browseBy"
                register={register('browseBy')}
              />
              {errors.browseBy && (
                <InlineError text={errors.browseBy.message} />
              )}
            </div>
            <div className="w-full">
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
          </div>

          {/* Visibility & Flags */}
          <div className="w-full mt-6 p-4 bg-main border border-border rounded-lg">
            <h3 className="text-md font-semibold mb-4 text-white">
              Visibility & Flags
            </h3>

            {/* Publish / draft toggle */}
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
                  {isPublished
                    ? 'Visible to all users'
                    : 'Hidden from users (Draft)'}
                </p>
                <p className="text-dryGray text-xs">
                  When hidden, only admins can see this movie/web series.
                </p>
              </div>
              {/* Hidden checkbox bound to RHF */}
              <input
                type="checkbox"
                {...register('isPublished')}
                className="hidden"
              />
            </div>

            {/* Latest / PreviousHit flags */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  {...register('latest')}
                  className="w-4 h-4 accent-customPurple"
                />
                <span className="text-sm">
                  Mark as Latest (show on first page)
                </span>
              </label>
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  {...register('previousHit')}
                  className="w-4 h-4 accent-customPurple"
                />
                <span className="text-sm">
                  Mark as Previous-Hit (send to last page)
                </span>
              </label>
            </div>
            {errors.previousHit && (
              <InlineError text={errors.previousHit.message} />
            )}
          </div>

          {/* Movie-specific fields */}
          {watchType === 'Movie' && (
            <div className="w-full mt-4">
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
              <div className="w-full mt-4">
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
          )}

          {/* WebSeries-specific fields */}
          {watchType === 'WebSeries' && (
            <div className="w-full flex flex-col gap-4 mt-6">
              <h3 className="text-lg font-semibold">Episodes *</h3>
              {errors.episodes &&
                typeof errors.episodes !== 'string' &&
                !errors.episodes.message && (
                  <InlineError text="Please check episode fields for errors" />
                )}
              {errors.episodes?.message && (
                <InlineError text={errors.episodes.message} />
              )}

              {episodeFields.map((item, index) => (
                <div
                  key={item.id}
                  className="w-full p-4 border border-border rounded-lg bg-main"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">
                      Episode {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEpisode(index)}
                      className="text-red-500 hover:text-red-700 transition duration-300 font-semibold"
                      disabled={episodeFields.length <= 1}
                    >
                      Remove Episode
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Input
                        label="Episode Number *"
                        placeholder="1"
                        type="number"
                        bg={true}
                        name={`episodes.${index}.episodeNumber`}
                        register={register(
                          `episodes.${index}.episodeNumber`
                        )}
                      />
                      {errors.episodes?.[index]?.episodeNumber && (
                        <InlineError
                          text={errors.episodes[index].episodeNumber.message}
                        />
                      )}
                    </div>
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
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-2">
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
                    <div>
                      <Input
                        label="Video URL *"
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
            disabled={isLoading}
            className="w-full flex-rows gap-4 mt-8 py-4 hover:bg-dry border-2 border-customPurple transitions bg-customPurple text-white rounded"
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
      </div>
    </SideBar>
  );
}

export default AddMovie;