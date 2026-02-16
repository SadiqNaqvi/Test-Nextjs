import { GeneralTMDBResponse } from "@type/external";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const id = params.get("id");

  if (!id)
    return NextResponse.json({
      status: false,
      response: "Invalid Network Id!",
    });

  const url = `https://api.themoviedb.org/3/network/${id}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_API}`,
    },
    next: { revalidate: 0 },
  };

  try {
    const data: GeneralTMDBResponse = await fetch(url, options).then((res) =>
      res.json()
    );

    if (data.status_message)
      return NextResponse.json({
        status: false,
        response: data.status_message,
      });

    return NextResponse.json({ status: true, response: data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ status: false, response: err.message });
  }
};
