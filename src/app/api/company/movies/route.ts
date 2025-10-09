import { movie_sort as sortObj } from "@lib/constant";
import { refineGeneralData } from "@lib/refiner";
import {
  GeneralReturnType,
  GeneralTMDBResponse,
  SortOptions,
} from "@type/external";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const id = params.get("id");
  const sort: SortOptions = (params.get("sort") as SortOptions) || "popularity";
  const sort_by = sortObj[sort] || sortObj.popularity;
  const page = parseInt(params.get("p") || "1") || 1;

  if (!id)
    return NextResponse.json({
      status: false,
      response: "Invalid Company Id!",
    });

  const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=${sort_by}&with_companies=${id}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_API}`,
    },
  };

  try {
    const data: GeneralTMDBResponse<GeneralReturnType> = await fetch(
      url,
      options
    ).then((r) => r.json());

    if (data.status_message)
      return NextResponse.json({
        status: false,
        response: data.status_message,
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
