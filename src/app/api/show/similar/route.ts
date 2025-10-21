import { refineGeneralData } from "@lib/refiner";
import { GeneralGetReturn, GeneralReturnType, GeneralTMDBResponse } from "@type/external";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const id = params.get("id");
  const page = parseInt(params.get("p") || "1") || 1;

  if (!id)
    return NextResponse.json({
      status: false,
      response: "Invalid Show Id!",
    });

  const url = `https://api.themoviedb.org/3/tv/${id}/similar?language=en-US&page=${page}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_API}`,
    },
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
        results: refineGeneralData(
          data.response.results.filter((el) => el.id !== id)
        ),
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ status: false, response: err.message });
  }
};
