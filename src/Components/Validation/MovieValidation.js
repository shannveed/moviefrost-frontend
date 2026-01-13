// Frontend/src/Components/Validation/MovieValidation.js
import * as yup from 'yup';

const ReviewValidation = yup.object().shape({
  comment: yup
    .string()
    .required('Comment is required')
    .max(150, 'Comment should be less than 150 characters'),
  rating: yup.number().required('Select a rating'),
});

// Regex to validate duration input like "2Hr 35Min", "2 hr", "35 Min"
const durationRegex = /^((\d+)\s*Hr\s*)?((\d+)\s*Min)?$/i;
const durationRequiredMessage =
  'Please enter duration, e.g., 2Hr 35Min, 2Hr, or 35Min';
const durationMatchMessage =
  'Duration must be format: 2Hr 35Min, 2Hr, or 35Min';

const episodeSchema = yup.object().shape({
  // ✅ NEW: season support
  seasonNumber: yup
    .number()
    .typeError('Season number must be a number')
    .required('Season number is required')
    .min(1, 'Season number must be at least 1'),

  episodeNumber: yup
    .number()
    .typeError('Episode number must be a number')
    .required('Episode number is required')
    .min(1, 'Episode number must be at least 1'),

  title: yup.string().nullable(),
  desc: yup.string().nullable(),

  duration: yup
    .string()
    .required(durationRequiredMessage)
    .matches(durationRegex, durationMatchMessage)
    .test(
      'duration-format-check-ep',
      durationMatchMessage,
      (value) => !value || (durationRegex.test(value) && value.trim().length > 0)
    ),

  // ✅ 3 servers per episode
  video: yup
    .string()
    .url('Please enter a valid video URL for Server 1')
    .required('Episode server 1 URL is required'),

  videoUrl2: yup
    .string()
    .url('Please enter a valid video URL for Server 2')
    .required('Episode server 2 URL is required'),

  videoUrl3: yup
    .string()
    .url('Please enter a valid video URL for Server 3')
    .required('Episode server 3 URL is required'),
});

const movieValidation = yup
  .object()
  .shape({
    type: yup
      .string()
      .oneOf(['Movie', 'WebSeries'], 'Invalid type selected')
      .required('Please select type (Movie or WebSeries)'),

    name: yup
      .string()
      .required('Please enter a name')
      .max(100, 'Name should be less than 100 characters'),

    time: yup
      .string()
      .required(durationRequiredMessage)
      .matches(durationRegex, durationMatchMessage)
      .test(
        'duration-format-check-main',
        durationMatchMessage,
        (value) => !value || (durationRegex.test(value) && value.trim().length > 0)
      ),

    language: yup.string().required('Please enter a language'),

    year: yup
      .number()
      .typeError('Please enter a valid year')
      .required('Please enter year of release')
      .min(1888, 'Year must be after 1888')
      .max(new Date().getFullYear() + 5, 'Year seems too far in the future'),

    category: yup.string().required('Please select category'),

    desc: yup
      .string()
      .required('Please enter a description')
        .max(5000, 'Description should be less than 5000 characters'),

        seoTitle: yup
  .string()
  .nullable()
  .max(100, 'SEO title should be less than 100 characters'),

seoDescription: yup
  .string()
  .nullable()
  .max(300, 'SEO description should be less than 300 characters'),


    browseBy: yup
      .string()
      .required('Please select a "Browse By" value (e.g., Hollywood)'),

    thumbnailInfo: yup
      .string()
      .nullable()
      .max(50, 'Thumbnail info should be short (max 50 chars)'),

    // Movie Specific Fields (3 servers)
    video: yup.string().when('type', {
      is: 'Movie',
      then: (schema) =>
        schema
          .url('Please enter a valid video URL for Server 1')
          .required('Movie server 1 URL is required'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

    videoUrl2: yup.string().when('type', {
      is: 'Movie',
      then: (schema) =>
        schema
          .url('Please enter a valid second server URL')
          .required('Movie server 2 URL is required'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

    // ✅ NEW: Movie Server 3
    videoUrl3: yup.string().when('type', {
      is: 'Movie',
      then: (schema) =>
        schema
          .url('Please enter a valid third server URL')
          .required('Movie server 3 URL is required'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

    downloadUrl: yup.string().when('type', {
      is: 'Movie',
      then: (schema) =>
        schema
          .url('Please enter a valid download URL')
          .nullable()
          .transform((value) => (value === '' ? null : value)),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

    // WebSeries Specific Fields
    episodes: yup.array().when('type', {
      is: 'WebSeries',
      then: (schema) =>
        schema
          .of(episodeSchema)
          .min(1, 'At least one episode is required for a WebSeries')
          .required('Please add episodes for the WebSeries'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

    // Flags
    latest: yup.boolean(),

    previousHit: yup
      .boolean()
      .test(
        'not-both',
        'Latest and PreviousHit cannot both be selected',
        function (value) {
          const { latest } = this.parent;
          return !(latest && value);
        }
      ),

    // publish flag
    isPublished: yup.boolean().default(true),
  })
  .test(
    'not-both-flags',
    'Movie cannot be both Latest and PreviousHit',
    function (value) {
      return !(value.latest && value.previousHit);
    }
  );

export { ReviewValidation, movieValidation };
