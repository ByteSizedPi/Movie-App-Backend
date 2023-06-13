import { Observable } from 'rxjs';
import { TMDBMovie } from './TMDB';
import { YTSMovie } from './YTS';

type Review = {
	author: string;
	author_details: {
		name: string;
		username: string;
		avatar_path: string;
		rating: string;
	};
	content: string;
	created_at: string;
	id: string;
	updated_at: string;
	url: string;
};

export type Movie = {
	yts_id: number;
	tmdb_id: number;
	imdb_id: string;

	budget: number;
	description_full: string;
	genres: string[];
	language: string;
	mpa_rating: string;
	providers: {
		logo_path: string;
		provider_name: string;
	}[];
	rating: number;
	revenue: number;
	reviews: Review[];
	runtime: number;
	summary: string;
	title: string;
	year: number;
	yt_trailer: string;

	poster: string;
	backdrop: string;

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

export type TMDBFunc = (param?: any) => Observable<TMDBMovie>;
export type YTSFunc = (param?: any) => Observable<YTSMovie>;
