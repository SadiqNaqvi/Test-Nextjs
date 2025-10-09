import { refineGeneralData } from "@lib/refiner";
import { GeneralReturnType, GeneralTMDBResponse } from "@type/external";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const id = params.get("id");
  const page = parseInt(params.get("p") || "1") || 1;

  if (!id)
    return NextResponse.json({
      status: false,
      response: "Invalid Movie Id!",
    });

  const url = `https://api.themoviedb.org/3/movie/${id}/similar?language=en-US&page=${page}`;
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
    ).then((res) => res.json());

    if (data.status_message)
      return NextResponse.json({
        status: false,
        response: data.status_message,
      });

    return NextResponse.json({
      status: true,
      response: {
        ...data.response,
        results: refineGeneralData(
          data.response.results.filter((el: any) => String(el.id) !== id)
        ),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: false, response: err.message });
  }
};
