import { movie_sort as sortObj } from "@lib/constant";
import { convertGenresIntoId, refineGeneralData } from "@lib/refiner";
import {
  GeneralGetReturn,
  GeneralReturnType,
  SortOptions
} from "@type/external";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const genreParams = params.get("g");
  const genres = genreParams ? convertGenresIntoId(genreParams, "movie") : null;
  const cast = params.get("c");
  const sort: SortOptions = (params.get("sort") as SortOptions) || "popularity";
  const sort_by = sortObj[sort] || sortObj.popularity;
  const page = parseInt(params.get("p") || "1") || 1;
  const year = params.get("y");

  const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=${sort_by}
  ${genres ? `&with_genres=${genres}` : ""}
    ${year ? `&with_year=${year}` : ""}
  ${cast ? `&with_cast=${cast}` : ""}`;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_API}`,
    },
    cache: "no-cache",
  };

  try {
    const data: GeneralGetReturn<GeneralReturnType> =
      await fetch(url, options)
        .then((res) => res.json())
        .then((res) => ({ response: res, error: "", success: true }))
        .catch(err => ({ error: err.message, success: false, response: null }));

    if (!data.success || !data.response)
      return NextResponse.json({
        status: false,
        response: data.error,
      });

    return NextResponse.json({
      status: true,
      response: {
        ...data.response,
        results: refineGeneralData(data.response.results),
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ status: false, response: err.message });
  }
};
