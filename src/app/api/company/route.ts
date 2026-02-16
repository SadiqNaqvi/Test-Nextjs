import { refineCompanyData } from "@lib/refiner";
import { FullCompanyDetails, GeneralGetReturn, GeneralTMDBResponse } from "@type/external";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const id = params.get("id");

  if (!id)
    return NextResponse.json({
      status: false,
      response: "Invalid Company Id!",
    });

  const url = `https://api.themoviedb.org/3/company/${id}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_API}`,
    },
    next: { revalidate: 0 },
  };

  try {
    const data: GeneralGetReturn<FullCompanyDetails> =
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
      response: refineCompanyData(data.response),
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ status: false, response: err.message });
  }
};
