import { Schema } from "mongoose";

const Provider = new Schema({
  logo_path: { type: String },
  provider_name: { type: String },
});

const Cast = new Schema({
  name: { type: String },
  character_name: { type: String },
  url_small_image: { type: String },
  imdb_code: { type: String },
});

const Torrent = new Schema({
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

const Review = new Schema({
  author: { type: String },
  author_details: {
    type: new Schema({
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

const Movie = new Schema({
  yts_id: { type: Number },
  tmdb_id: { type: Number },
  imdb_id: { type: Number },

  budget: { type: Number },
  description_full: { type: String },
  genres: { type: [String] },
  language: { type: String },
  mpa_rating: { type: String },
  providers: { type: [Provider] },

  runtime: { type: Number },
  rating: { type: Number },
  revenue: { type: Number },
  summary: { type: String },
  title: { type: String },
  year: { type: Number },
  yt_trailer: { type: String },

  poster: { type: String },
  backdrop: { type: String },

  reviews: { type: [Review] },
  cast: { type: [Cast] },
  torrents: { type: [Torrent] },
});

export default Movie;
