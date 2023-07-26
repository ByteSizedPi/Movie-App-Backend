export type Review = {
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

export type Provider = {
	logo_path: string;
	provider_name: string;
};

export type TMDBMovie = {
	id: number;
	imdb_id: string;
	poster_path: string;
	backdrop_path: string;
	overview: string;
	budget: number;
	revenue: number;
	title: string;
	genres: { name: string }[];
	release_date: string;
	runtime: number;
	status: string;
	vote_average: number;
	// reviews: Review[];
	// providers: Provider[];
};

export type TMDBPartialMovie = {
	id: number;
	poster_path: string;
	backdrop_path: string;
	title: string;
};

export type TMDBResponse = {
	data: { results: TMDBMovie[] } & { movie_results: TMDBMovie[] } & TMDBMovie;
};
