export type YTSMovie = {
	id: number;
	imdb_code: string;
	description_full: string;
	genres: string[];
	language: string;
	mpa_rating: string;
	rating: number;
	runtime: number;
	title_english: string;
	year: number;
	yt_trailer_code: string;
	cast: {
		name: string;
		character_name: string;
		url_small_image?: string;
		imdb_code: string;
	}[];
	torrents: {
		url: string;
		hash: string;
		quality: string;
		type: string;
		seeds: number;
		peers: number;
		size: string;
		size_bytes: number;
		date_uploaded: string;
		date_uploaded_unix: number;
	}[];
};

export type YTSResponse = {
	data: { data: { movies: YTSMovie[] } & { movie: YTSMovie } };
};
