import { refinePersonData } from "@lib/refiner";
import { FullPersonDetails, GeneralGetReturn, GeneralTMDBResponse } from "@type/external";
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
    next: { revalidate: 0 },
  };

  try {
    const data: GeneralGetReturn<FullPersonDetails> =
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
      response: refinePersonData(data.response),
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ status: false, response: err.message });
  }
};
