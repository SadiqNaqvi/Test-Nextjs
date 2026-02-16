import { refineGeneralData } from "@lib/refiner";
import { GeneralGetReturn, GeneralReturnType, GeneralTMDBResponse } from "@type/external";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;

  const page = parseInt(params.get("p") || "1") || 1;
  const type = params.get("t") || "all"; // movie | person | tv | all

  const url = `https://api.themoviedb.org/3/trending/${type}/week?language=en-US&page=${page}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_API}`,
    },
    next: { revalidate: 0 },
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
