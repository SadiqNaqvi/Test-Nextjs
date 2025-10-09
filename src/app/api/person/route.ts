import { refinePersonData } from "@lib/refiner";
import { FullPersonDetails, GeneralTMDBResponse } from "@type/external";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const id = params.get("id");

  if (!id)
    return NextResponse.json({
      status: false,
      response: "Invalid Person Id!",
    });

  const url = `https://api.themoviedb.org/3/person/${id}?append_to_response=combined_credits&language=en-US`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_API}`,
    },
  };

  try {
    const data: GeneralTMDBResponse<FullPersonDetails> = await fetch(
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
      response: refinePersonData(data.response),
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ status: false, response: err.message });
  }
};
