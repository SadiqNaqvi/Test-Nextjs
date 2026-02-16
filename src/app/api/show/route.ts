import { refineShowData } from "@lib/refiner";
import {
  ExtraMovieData,
  FullShowDetails,
  GeneralGetReturn,
  GeneralTMDBResponse,
} from "@type/external";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const id = params.get("id");

  if (!id)
    return NextResponse.json({
      status: false,
      response: "Invalid Show Id!",
    });

  const url = `https://api.themoviedb.org/3/tv/${id}?append_to_response=aggregate_credits%2Cvideos&language=en-US`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_API}`,
    },
    cache: "no-cache",
  };

  try {
    const data: GeneralGetReturn<FullShowDetails> =
      await fetch(url, options)
        .then((res) => res.json())
        .then((res) => ({ response: res, error: "", success: true }))
        .catch(err => ({ error: err.message, success: false, response: null }));

    if (!data.success || !data.response)
      return NextResponse.json({
        status: false,
        response: data.error,
      });

    const extra: ExtraMovieData & { Error: String } = await fetch(
      `http://www.omdbapi.com/?apikey=${process.env.OMDB_API}
      &t=${data.response.name}
      &y=${new Date(data.response.first_air_date).getFullYear()}&plot=full`
    ).then((res) => res.json());

    if (extra.Response === "False")
      return NextResponse.json({ status: false, response: extra.Error });

    return NextResponse.json({
      status: true,
      response: refineShowData(data.response, extra),
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ status: false, response: err.message });
  }
};
