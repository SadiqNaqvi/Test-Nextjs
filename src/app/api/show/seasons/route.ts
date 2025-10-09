import { refineSeasonData } from "@lib/refiner";
import { FullSeasonDetails, GeneralTMDBResponse } from "@type/external";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const id = params.get("id");
  const season = parseInt(params.get("s") || "1") || 1;

  if (!id)
    return NextResponse.json({
      status: false,
      response: "Invalid Show Id!",
    });

  const url = `https://api.themoviedb.org/3/tv/${id}/season/${season}?append_to_response=aggregate_credits%2Cvideos&language=en-US`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_API}`,
    },
  };

  try {
    const data: GeneralTMDBResponse<FullSeasonDetails> = await fetch(
      url,
      options
    ).then((res) => res.json());

    if (data.status_message)
      return NextResponse.json({
        status: false,
        response: data.status_message,
      });

    return NextResponse.json({
      status: true,
      response: refineSeasonData(data.response),
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ status: false, response: err.message });
  }
};
