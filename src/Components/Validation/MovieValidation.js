// MovieValidation.js
import * as yup from 'yup';

const ReviewValidation = yup.object().shape({
  comment: yup
    .string()
    .required('Comment is required')
    .max(150, 'Comment should be less than 150 characters'),
  rating: yup.number().required('Select a rating'),
});

// Regex to validate duration input like "2Hr 35Min", "2hr 35min", "2 Hr", "35 Min"
const durationRegex = /^((\d+)\s*Hr\s*)?((\d+)\s*Min)?$/i;
const durationRequiredMessage = 'Please enter duration, e.g., 2Hr 35Min, 2Hr, or 35Min';
const durationMatchMessage = 'Duration must be format: 2Hr 35Min, 2Hr, or 35Min';

const episodeSchema = yup.object().shape({
  episodeNumber: yup
    .number()
    .typeError('Episode number must be a number')
    .required('Episode number is required')
    .min(1, 'Episode number must be at least 1'),
  title: yup.string().nullable(), // Title remains optional
  desc: yup.string().nullable(), // Description is optional
  duration: yup
    .string()
    .required(durationRequiredMessage)
    .matches(durationRegex, durationMatchMessage)
    .test( // Ensure it's not just whitespace or empty
        'duration-format-check-ep',
        durationMatchMessage,
        value => !value || (durationRegex.test(value) && value.trim().length > 0)
    ),
  video: yup
    .string()
    .url('Please enter a valid video URL')
    .required('Episode video URL is required'),
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
    time: yup // Represents total duration for Movie/WebSeries
      .string()
      .required(durationRequiredMessage)
      .matches(durationRegex, durationMatchMessage)
      .test( // Ensure it's not just whitespace or empty
        'duration-format-check-main',
        durationMatchMessage,
        value => !value || (durationRegex.test(value) && value.trim().length > 0)
      ),
    language: yup.string().required('Please enter a language'),
    year: yup
      .number()
      .typeError('Please enter a valid year')
      .required('Please enter year of release')
      .min(1888, 'Year must be after 1888') // Oldest film known
      .max(new Date().getFullYear() + 5, 'Year seems too far in the future'), // Allow a little future buffer
    category: yup.string().required('Please select category'),
    desc: yup
      .string()
      .required('Please enter a description')
      .max(1000, 'Description should be less than 1000 characters'),

    // ****** UPDATED: browseBy (dropdown) is now required ******
    browseBy: yup.string().required('Please select a "Browse By" value (e.g., Hollywood)'),

    // ****** NEW: thumbnailInfo (optional text input) ******
    thumbnailInfo: yup
      .string()
      .nullable() // Allow it to be empty/null
      .max(50, 'Thumbnail info should be short (max 50 chars)'), // Optional max length

    // ---- Movie Specific Fields ----
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
    downloadUrl: yup.string().when('type', {
      is: 'Movie',
      then: (schema) =>
        schema
          .url('Please enter a valid download URL')
          .nullable() // Optional
          .transform(value => value === '' ? null : value), // Treat empty string as null
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

    // ---- WebSeries Specific Fields ----
    episodes: yup.array().when('type', {
      is: 'WebSeries',
      then: (schema) =>
        schema
          .of(episodeSchema) // Use the updated episodeSchema
          .min(1, 'At least one episode is required for a WebSeries')
          .required('Please add episodes for the WebSeries'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

    // ---- Common Optional Fields ----
    // Removed browseByOptional
    // Removed custom test for browseBy-validation
});


export { ReviewValidation, movieValidation };
