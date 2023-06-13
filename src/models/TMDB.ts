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
	reviews: Review[];
	providers: Provider[];
};

export type TMDBResponse = {
	data: { results: TMDBMovie[] } & { movie_results: TMDBMovie[] } & TMDBMovie;
};
