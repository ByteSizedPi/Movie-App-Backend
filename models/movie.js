const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema({
  logo_path: { type: String },
  provider_name: { type: String },
});

const castSchema = new mongoose.Schema({
  name: { type: String },
  character_name: { type: String },
  url_small_image: { type: String },
  imdb_code: { type: String },
});

const torrentSchema = new mongoose.Schema({
  url: { type: String },
  hash: { type: String },
  quality: { type: String },
  type: { type: String },
  seeds: { type: Number },
  peers: { type: Number },
  size: { type: String },
  size_bytes: { type: Number },
  date_uploaded: { type: String },
  date_uploaded_unix: { type: Number },
});

const reviewSchema = new mongoose.Schema({
  author: { type: String },
  author_details: {
    type: new mongoose.Schema({
      name: { type: String },
      username: { type: String },
      avatar_path: { type: String },
      rating: { type: String },
    }),
  },
  content: { type: String },
  created_at: { type: String },
  id: { type: String },
  updated_at: { type: String },
  url: { type: String },
});

const movieSchema = new mongoose.Schema({
  yts_id: { type: Number },
  tmdb_id: { type: Number },
  imdb_id: { type: Number },

  budget: { type: Number },
  description_full: { type: String },
  genres: { type: [String] },
  language: { type: String },
  mpa_rating: { type: String },
  providers: { type: [providerSchema] },

  runtime: { type: Number },
  rating: { type: Number },
  revenue: { type: Number },
  summary: { type: String },
  title: { type: String },
  year: { type: Number },
  yt_trailer: { type: String },

  poster: { type: String },
  backdrop: { type: String },

  reviews: { type: [reviewSchema] },
  cast: { type: [castSchema] },
  torrents: { type: [torrentSchema] },
});

module.exports = mongoose.model("Movie", movieSchema);
