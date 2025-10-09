import {
  MediaItemType,
  ExtraMovieData,
  FullCollectionData,
  FullCompanyDetails,
  FullEpisodeDetails,
  FullMovieDetails,
  FullPersonDetails,
  FullSeasonDetails,
  FullShowDetails,
  GeneralCastData,
  GeneralCrewData,
  GeneralVideoResult,
  PersonWork,
  RefinedCast,
  RefinedCollection,
  RefinedCollectionData,
  RefinedCompanyData,
  RefinedCrew,
  RefinedEpisodeData,
  RefinedGeneralContentData,
  RefinedGeneralData,
  RefinedMovieData,
  RefinedPersonData,
  RefinedSearchData,
  RefinedSeasonData,
  RefinedShowData,
} from "../type/external";
import { movie_genres, show_genres } from "./constant";

export const refineString = (str: string) => {
  if (!str) return "";

  return str
    .slice(0, 100)
    .replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, "-")
    .replace(/^_+|-+$/g, "");
};

export const convertGenresIntoId = (
  genres: string,
  type: "movie" | "show"
): string => {
  const clean = refineString(genres).toLowerCase().replaceAll("-", "");
  const genArr = clean.split(",");

  const refinedGenres = () => {
    switch (type) {
      case "movie":
        return genArr.map((el) => movie_genres[el]);
      case "show":
        return genArr.map((el) => show_genres[el]);
      default:
        return genArr;
    }
  };

  return refinedGenres().join(",");
};

const sortSearchData = (data: any[]) => {
  if (!data[0].popularity) return data;
  return data.sort((a: any, b: any) => b?.popularity - a?.popularity);
};

export const refineSearchData = (
  data: any[],
  media: string = "all"
): RefinedSearchData[] => {
  const sortedData = sortSearchData(data);
  return sortedData.map((el) => ({
    name: el.name || el.title || "",
    id: el.id.toString(),
    image: el.poster_path || el.profile_path || el.logo_path || "",
    media_type: el.media_type === "tv" ? "show" : el.media_type || media,
  }));
};

type searchResult = {
  title: string;
  name: string;
  id: string;
  first_air_date: Date;
  release_date: Date;
  poster_path: string | null;
  media_type: "movie" | "tv" | "person";
  known_for: [];
};

type SearchData = searchResult & {
  media_type: "person";
  known_for: searchResult[];
};

export const refineMediaItemsFromSearch = (
  data: SearchData[]
): MediaItemType[] => {
  return data.reduce((acc, item) => {
    if (item.media_type === "person")
      return [...acc, ...refineMediaItemsFromSearch(item.known_for)];
    else if (!item.release_date && !item.first_air_date) return acc;

    const dataToAdd = {
      title: item.media_type === "movie" ? item.title : item.name,
      poster: item.poster_path ?? "",
      year: new Date(
        item.media_type === "movie" ? item.release_date : item.first_air_date
      ).getFullYear(),
      media_type: item.media_type === "tv" ? "show" : "movie",
      tmdb_id: `${item.id}`,
    };
    return [...acc, dataToAdd];
  }, [] as any[]);
};

const refineTrailers = (videos: GeneralVideoResult[]) =>
  videos.filter(
    (el: GeneralVideoResult) =>
      el.type === "Trailer" &&
      el.site === "YouTube" && { name: el.name, key: el.key }
  );

const refineCast = (cast: any[]): RefinedCast[] =>
  cast
    .sort((a: any, b: any) => a.order - b.order)
    .slice(0, 10)
    .map((el: any) => ({
      id: el.id.toString(),
      name: el.name,
      character: el.character || el.roles[0].character || "",
      poster: el.profile_path || "",
    }));

const refineCrew = (crew: GeneralCrewData[], type: string) =>
  crew
    .filter((el) => el.job === type)
    .map((el) => ({
      id: el.id.toString(),
      name: el.name,
    }));

const refineRating = (rating: number) => Math.round(rating * 10) / 10;

export const refineGeneralData = (data: any[]): RefinedGeneralData[] => {
  return data
    .sort(
      (a, b) => b.vote_average + b.vote_count - (a.vote_average + a.vote_count)
    )
    .map((el) => ({
      id: el.id.toString(),
      poster: el.poster_path,
      rating: refineRating(el.vote_average).toString(),
      title: el.title || el.name,
      type: el.media_type === "tv" ? "show" : "movie",
      year: el.release_date
        ? new Date(el.release_date).getFullYear()
        : new Date(el.first_air_date).getFullYear(),
    }));
};

export const refineGeneralContent = (
  data: any[]
): RefinedGeneralContentData[] => {
  return data
    .sort(
      (a, b) => b.vote_average + b.vote_count - (a.vote_average + a.vote_count)
    )
    .map((el) => ({
      backdrop: el.backdrop_path || "",
      overview: el.overview,
      poster: el.poster_path || "",
      rating: refineRating(el.vote_average),
      title: el.title || el.name,
      tmdb_id: el.id.toString(),
      media_type: el.media_type,
      release_date: el.release_date
        ? new Date(el.release_date).getTime()
        : new Date(el.first_air_date).getTime(),
    }));
};

export const refineMovieData = (
  details: FullMovieDetails,
  cast: GeneralCastData[],
  crew: GeneralCrewData[],
  videos: GeneralVideoResult[],
  extra: ExtraMovieData
): Omit<RefinedMovieData, "media_id" | "popcorn_rating"> => {
  const {
    backdrop_path,
    belongs_to_collection,
    genres,
    homepage,
    id,
    imdb_id,
    origin_country,
    original_language,
    original_title,
    overview,
    poster_path,
    production_companies,
    release_date,
    runtime,
    spoken_languages,
    tagline,
    title,
    vote_average,
  } = details;

  const { Awards, Plot, Rated, imdbRating } = extra;

  const updatedCast: RefinedCast[] = refineCast(cast);

  const updatedCollection: RefinedCollection | null = belongs_to_collection
    ? {
        id: String(belongs_to_collection.id),
        name: belongs_to_collection.name,
        poster: belongs_to_collection.poster_path || "",
        backdrop: belongs_to_collection.backdrop_path || "",
      }
    : null;

  const updatedVideos = refineTrailers(videos);

  return {
    awards: Awards,
    backdrop: backdrop_path || "",
    cast: updatedCast,
    collection: updatedCollection,
    country: origin_country,
    directors: refineCrew(crew, "Director"),
    genres: genres.map((el) => el.name),
    homepage,
    imdb_id,
    imdb_rating: refineRating(Number(imdbRating)).toString(),
    language: original_language,
    original_title,
    plot: Plot,
    poster: poster_path || "",
    production_companies: production_companies.map((el) => ({
      id: el.id.toString(),
      name: el.name,
    })),
    rated: Rated,
    release_date: new Date(release_date).getTime(),
    runtime: `${runtime} min`,
    languages: spoken_languages.map((el) => el.english_name!),
    status: new Date() > new Date(release_date) ? "Released" : "To be released",
    overview,
    tagline,
    title,
    tmdb_id: id.toString(),
    tmdb_rating: refineRating(vote_average).toString(),
    trailers: updatedVideos,
    writers: refineCrew(crew, "Writer"),
    year: new Date(release_date).getFullYear(),
  };
};

export const refineShowData = (
  details: FullShowDetails,
  extra: ExtraMovieData
): Omit<RefinedShowData, "media_id" | "popcorn_rating"> => {
  const {
    name,
    tagline,
    backdrop_path,
    poster_path,
    first_air_date,
    original_name,
    genres,
    number_of_seasons,
    origin_country,
    networks,
    videos,
    homepage,
    in_production,
    original_language,
    spoken_languages,
    last_air_date,
    number_of_episodes,
    production_companies,
    seasons,
    status,
    overview,
    id,
    vote_average,
    created_by,
    aggregate_credits: { cast, crew },
  } = details;

  const { Awards, Plot, Rated, imdbID, imdbRating } = extra;

  const refinedVideos = refineTrailers(videos.results);

  const refinedSeasons = seasons
    .filter((el) => el.air_date && el.season_number)
    .map((el) => ({
      release_date: new Date(el.air_date!).getTime(),
      episode_count: el.episode_count,
      id: el.id.toString(),
      title: el.name,
      overview: el.overview,
      poster: el.poster_path || "",
      season_number: el.season_number,
      rating: refineRating(el.vote_average),
    }));

  const refinedDirector: RefinedCrew[] = crew
    .filter((el) => el.jobs.find((el) => el.job === "Director"))
    .map((el) => ({
      id: el.id.toString(),
      name: el.name,
    }));

  const refinedWriters: RefinedCrew[] = created_by.map((el) => ({
    name: el.name,
    id: el.id.toString(),
  }));

  return {
    awards: Awards,
    backdrop: backdrop_path || "",
    cast: refineCast(cast),
    country: origin_country,
    directors: refinedDirector,
    genres: genres.map((el) => el.name),
    homepage,
    imdb_id: imdbID,
    imdb_rating: refineRating(Number(imdbRating)).toString(),
    in_production,
    language: original_language,
    languages: spoken_languages.map((el) => el.english_name || el.name),
    last_release_date: new Date(last_air_date).getTime(),
    networks: networks.map(({ id, name }) => ({ id: id.toString(), name })),
    number_of_episodes,
    number_of_seasons,
    original_title: original_name,
    plot: Plot,
    poster: poster_path || "",
    production_companies: production_companies.map(({ id, name }) => ({
      id: id.toString(),
      name,
    })),
    rated: Rated,
    release_date: new Date(first_air_date).getTime(),
    seasons: refinedSeasons,
    status,
    overview,
    tagline,
    title: name,
    tmdb_id: id.toString(),
    tmdb_rating: refineRating(vote_average).toString(),
    trailers: refinedVideos,
    writers: refinedWriters,
    year: new Date(first_air_date).getFullYear(),
  };
};

export const refineSeasonData = (
  season: FullSeasonDetails
): RefinedSeasonData => {
  const {
    id,
    overview,
    air_date,
    episodes,
    name,
    poster_path,
    season_number,
    vote_average,
    aggregate_credits: { cast, crew },
  } = season;

  const refinedDirectors: RefinedCrew[] = crew
    .filter((el) => el.jobs.find((el) => el.job === "Director"))
    .map((el) => ({
      id: el.id.toString(),
      name: el.name,
    }));

  const refinedWriters: RefinedCrew[] = crew
    .filter((el) => el.jobs.find((el) => el.job === "Writer"))
    .map((el) => ({
      id: el.id.toString(),
      name: el.name,
    }));

  const refineEpisodes = episodes
    .filter((el) => el.air_date)
    .map((el) => ({
      release_date: new Date(el.air_date).getTime(),
      episode_number: el.episode_number,
      id: el.id.toString(),
      title: el.name,
      overview: el.overview,
      poster: el.still_path || "",
      rating: refineRating(el.vote_average),
      runtime: `${el.runtime} mins`,
      season_number: el.season_number,
      show_id: el.show_id.toString(),
    }));

  return {
    cast: refineCast(cast),
    directors: refinedDirectors,
    episodes: refineEpisodes,
    id: id.toString(),
    overview,
    poster: poster_path || "",
    rating: refineRating(vote_average),
    release_date: new Date(air_date).getTime(),
    season_number,
    title: name,
    writers: refinedWriters,
  };
};

export const refineEpisodeData = (
  episode: FullEpisodeDetails
): RefinedEpisodeData => {
  const {
    air_date,
    credits: { cast, crew },
    episode_number,
    id,
    name,
    overview,
    runtime,
    season_number,
    still_path,
    vote_average,
  } = episode;

  return {
    cast: refineCast(cast),
    directors: refineCrew(crew, "Director"),
    episode_number,
    id: id.toString(),
    overview,
    poster: still_path,
    rating: refineRating(vote_average),
    release_date: new Date(air_date).getTime(),
    runtime: `${runtime} mins`,
    season_number,
    title: name,
    writers: refineCrew(crew, "Writer"),
  };
};

export const refinePersonData = (
  person: FullPersonDetails
): RefinedPersonData => {
  const {
    biography,
    birthday,
    combined_credits: { cast, crew },
    deathday,
    known_for_department,
    gender,
    imdb_id,
    id,
    name,
    place_of_birth,
    profile_path,
    homepage,
  } = person;

  const refineCredits = (
    credit: typeof cast | typeof crew,
    type: string
  ): PersonWork[] =>
    credit
      .sort((a, b) => b.popularity - a.popularity)
      .map((el) => ({
        backdrop: el.backdrop_path || "",
        tmdb_id: el.id.toString(),
        media_type: el.media_type
          ? el.media_type === "tv"
            ? "show"
            : el.media_type
          : "",
        overview: el.overview,
        poster: el.poster_path || "",
        rating: refineRating(el.vote_average),
        title: (el.name as string) || (el.title as string),
        worked_as: type === "cast" ? el.character : el.job,
        release_date: el.release_date
          ? new Date(el.release_date).getTime()
          : new Date(el.first_air_date).getTime(),
      }))
      .filter((el) => new Date(el.release_date) < new Date());

  const refinedCast = refineCredits(
    cast.filter((el) => !el.character.toLowerCase().includes("self")),
    "cast"
  );

  return {
    biography,
    birth: new Date(birthday).getTime(),
    credits: {
      cast: refinedCast,
      crew: refineCredits(crew, "crew"),
    },
    death: deathday ? new Date(deathday).getTime() : null,
    department: known_for_department,
    gender,
    imdb_id,
    links: homepage ? [{ label: "homepage", value: homepage }] : [],
    name,
    place_of_birth,
    place_of_death: "",
    profile: profile_path || "",
    tmdb_id: id.toString(),
  };
};

export const refineCollectionData = (
  collection: FullCollectionData
): RefinedCollectionData => {
  const { backdrop_path, id, name, overview, parts, poster_path } = collection;

  const refinedParts = refineGeneralContent(parts);

  return {
    backdrop: backdrop_path || "",
    overview,
    rating: refineRating(
      refinedParts.reduce((prev, el) => prev + el.rating, 0) /
        refinedParts.length
    ),
    parts: refinedParts,
    poster: poster_path || "",
    title: name,
    tmdb_id: id.toString(),
  };
};

export const refineCompanyData = (
  company: FullCompanyDetails
): RefinedCompanyData => {
  const {
    headquarters,
    homepage,
    id,
    logo_path,
    name,
    description,
    parent_company,
    origin_country,
  } = company;
  return {
    description: description || "",
    headquarters,
    homepage,
    tmdb_id: id.toString(),
    origin_country,
    parent_company: parent_company
      ? { tmdb_id: parent_company.id.toString(), name: parent_company.name }
      : null,
    poster: logo_path || "",
    title: name,
  };
};
