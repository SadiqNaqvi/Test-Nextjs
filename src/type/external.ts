export type GeneralTMDBResponse<T = unknown> = {
  response: T;
  status_message: string;
};

export type GeneralPersonData = {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  media_type?: string;
  name: string;
  popularity: number;
  profile_path: string | null;
};

type GeneralCreditData = GeneralPersonData & {
  credit_id: string;
  original_name: string;
};

export type GeneralCastData = GeneralCreditData & {
  cast_id: number;
  character: string;
  order: number;
};

export type GeneralShowCast = GeneralPersonData & {
  original_name: string;
  roles: {
    credit_id: string;
    character: string;
    episode_count: number;
  }[];
  total_episode_count: number;
  order: number;
};

export type GeneralCrewData = GeneralCreditData & {
  department: string;
  job: string;
};

export type GeneralShowCrew = GeneralPersonData & {
  original_name: string;
  jobs: { credit_id: string; job: string; episode_count: number }[];
  department: string;
  total_episode_count: number;
};

export type GeneralContent = {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  media_type?: string;
  original_language: string;
  overview: string;
  popularity: number;
  
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
};

export type GeneralMovieData = GeneralContent & {
  original_title: string;
  release_date: string;
  title: string;
  video: boolean;
};

export type GeneralShowData = GeneralContent & {
  origin_country: string[];
  original_name: string;
  first_air_date: string;
  name: string;
};

export type GeneralCollectionData = {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
};

export type GeneralGetReturn<T = unknown> = {
  success: boolean,
  error: string,
  response: T | null
}

export type GeneralReturnType<T = any> = {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
};

export type GeneralVideoResult = {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
};

export type GeneralCompanyData = {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
};

export type GeneralCountryDetails = {
  english_name?: string;
  iso_639_1?: string;
  iso_3166_1?: string;
  name: string;
};

export type FullMovieDetails = {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: GeneralCollectionData | null;
  budget: number;
  credits: { cast: GeneralCastData[]; crew: GeneralCrewData[] };
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string;
  id: number;
  imdb_id: string;
  origin_country: string[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  production_companies: GeneralCompanyData[];
  production_countries: GeneralCountryDetails[];
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: GeneralCountryDetails[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  videos: { id: number; results: GeneralVideoResult[] };
  vote_average: number;
  vote_count: number;
};

export type FullShowDetails = {
  adult: boolean;
  backdrop_path: string | null;
  created_by: {
    id: number;
    credit_id: string;
    name: string;
    original_name: string;
    gender: number;
    profile_path: string | null;
  }[];
  episode_run_time: number[];
  first_air_date: string;
  genres: { id: number; name: string }[];
  homepage: string;
  id: number;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: string;
    episode_number: number;
    episode_type: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string | null;
  };
  name: string;
  next_episode_to_air: any | null;
  networks: GeneralCompanyData[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  production_companies: GeneralCompanyData[];
  production_countries: GeneralCountryDetails[];
  seasons: {
    air_date: string | null;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    vote_average: number;
  }[];
  spoken_languages: GeneralCountryDetails[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
  videos: { results: GeneralVideoResult[] };
  aggregate_credits: {
    cast: GeneralShowCast[];
    crew: GeneralShowCrew[];
  };
};

export type FullSeasonDetails = {
  _id: string;
  air_date: string;
  episodes: {
    air_date: string;
    episode_number: number;
    episode_type: string;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string;
    vote_average: number;
    vote_count: number;
    crew: any[];
    guest_stars: any[];
  }[];
  name: string;
  overview: string;
  id: number;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
  aggregate_credits: {
    cast: GeneralShowCast[];
    crew: GeneralShowCrew[];
  };
};

export type FullEpisodeDetails = {
  air_date: string;
  crew: any[];
  episode_number: number;
  guest_stars: any[];
  name: string;
  overview: string;
  id: number;
  production_code: string;
  runtime: number;
  season_number: number;
  still_path: string;
  vote_average: number;
  vote_count: number;
  credits: {
    cast: Omit<GeneralCastData, "cast_id">[];
    crew: GeneralCrewData[];
    guest_stars: any[];
  };
};

export type FullCompanyDetails = {
  description?: string;
  headquarters: string;
  homepage: string;
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
  parent_company?: GeneralCompanyData | null;
};

export type ExtraMovieData = {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: {
    Source: string;
    Value: string;
  }[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD?: string;
  BoxOffice?: string;
  Production?: string;
  Website?: string;
  totalSeasons?: string;
  Response: string;
};

export type FullCollectionData = GeneralCollectionData & {
  parts: GeneralMovieData[];
};

export type FullPersonDetails = GeneralPersonData & {
  also_known_as: string[];
  biography: string;
  birthday: string;
  deathday: string | null;
  homepage: string | null;
  imdb_id: string;
  place_of_birth: string;
  combined_credits: {
    cast: Array<
      (GeneralMovieData | GeneralShowData) & {
        character: string;
        credit_id: string;
        [key: string]: any;
      }
    >;
    crew: Array<
      (GeneralMovieData | GeneralShowData) & {
        credit_id: string;
        department: string;
        job: string;
        [key: string]: any;
      }
    >;
  };
};

export type RefinedCast = {
  id: string;
  name: string;
  poster: string | null;
  character: string;
};

export type RefinedCrew = {
  name: string;
  id: string;
};

export type RefinedCollection = {
  id: string;
  name: string;
  poster: string;
  backdrop: string;
};

export type RefinedMovieData = {
  awards: string;
  backdrop: string;
  cast: RefinedCast[];
  collection: RefinedCollection | null;
  country: string[];
  directors: RefinedCrew[];
  genres: string[];
  homepage: string;
  imdb_id: string;
  imdb_rating: string;
  media_id: string;
  language: string;
  languages: string[];
  original_title: string;
  plot: string;
  popcorn_rating: number;
  poster: string;
  production_companies: {
    name: string;
    id: string;
  }[];
  rated: string;
  release_date: number;
  runtime: string;
  status: string;
  overview: string;
  tagline: string;
  title: string;
  tmdb_id: string;
  tmdb_rating: string;
  trailers: { name: string; key: string }[];
  writers: RefinedCrew[];
  year: number;
};

export type RefinedShowData = {
  awards: string;
  backdrop: string;
  cast: RefinedCast[];
  country: string[];
  directors: RefinedCrew[];
  genres: string[];
  homepage: string;
  imdb_id: string;
  imdb_rating: string;
  media_id: string;
  in_production: boolean;
  language: string;
  languages: string[];
  last_release_date: number;
  networks: {
    id: string;
    name: string;
  }[];
  number_of_episodes: number;
  number_of_seasons: number;
  original_title: string;
  plot: string;
  poster: string;
  popcorn_rating: number;
  production_companies: {
    id: string;
    name: string;
  }[];
  rated: string;
  release_date: number;
  seasons: {
    release_date: number;
    episode_count: number;
    id: string;
    title: string;
    overview: string;
    poster: string;
    season_number: number;
    rating: number;
  }[];
  status: string;
  overview: string;
  tagline: string;
  title: string;
  tmdb_id: string;
  tmdb_rating: string;
  trailers: { name: string; key: string }[];
  writers: RefinedCrew[];
  year: number;
};

export type RefinedSeasonData = {
  cast: RefinedCast[];
  directors: RefinedCrew[];
  episodes: {
    release_date: number;
    episode_number: number;
    id: string;
    title: string;
    overview: string;
    poster: string;
    rating: number;
    runtime: string;
    season_number: number;
    show_id: string;
  }[];
  id: string;
  overview: string;
  poster: string;
  rating: number;
  release_date: number;
  season_number: number;
  title: string;
  writers: RefinedCrew[];
};

export type RefinedEpisodeData = {
  cast: RefinedCast[];
  directors: RefinedCrew[];
  episode_number: number;
  id: string;
  overview: string;
  poster: string;
  rating: number;
  release_date: number;
  runtime: string;
  season_number: number;
  title: string;
  writers: RefinedCrew[];
};

export type RefinedSearchData = {
  name: string;
  id: string;
  image: string;
  media_type: string;
};

export type RefinedGeneralData = {
  title: string;
  poster: string;
  year: number;
  id: string;
  rating: string;
  type: "movie" | "show";
};

export type RefinedGeneralContentData = {
  backdrop: string;
  tmdb_id: string;
  media_type?: string;
  overview: string;
  poster: string;
  rating: number;
  release_date: number;
  title: string;
};

export type PersonWork = RefinedGeneralData  & {
  worked_as: string;
};

export type RefinedPersonData = {
  biography: string;
  birth: number;
  credits: {
    cast: PersonWork[];
    crew: PersonWork[];
  };
  death: number | null;
  department: string;
  gender: number;
  imdb_id: string;
  links: { label: string; value: string }[];
  name: string;
  place_of_birth: string;
  place_of_death: string;
  profile: string;
  tmdb_id: string;
};

export type RefinedCollectionData = {
  backdrop: string;
  overview: string;
  parts: RefinedGeneralContentData[];
  poster: string;
  rating: number;
  title: string;
  tmdb_id: string;
};

export type RefinedCompanyData = {
  description: string;
  title: string;
  poster: string;
  headquarters: string;
  homepage: string;
  tmdb_id: string;
  origin_country: string;
  parent_company: {
    name: string;
    tmdb_id: string;
  } | null;
};

export type GeneralMovieReturn = GeneralReturnType<GeneralMovieData>;

export type GeneralShowReturn = GeneralReturnType<GeneralShowData>;

export type SearchCollectionReturn = GeneralReturnType<
  GeneralCollectionData & {
    adult: boolean;
    original_language: string;
    original_name: string;
  }
>;

export type SearchCompanyReturn = GeneralReturnType & {
  results: GeneralCompanyData[];
};

export type SearchPersonReturn = GeneralReturnType & {
  results: GeneralPersonData &
  {
    original_name: string;
    known_for: GeneralMovieData[];
  }[];
};

export type SortOptions = "popularity" | "rating" | "year" | "title";

export type MediaItemType = {
  title: string;
  poster: string;
  year: number;
  media_type: "movie" | "show";
  tmdb_id: string;
};
