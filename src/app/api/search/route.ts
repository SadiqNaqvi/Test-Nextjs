import { refineMediaItemsFromSearch, refineSearchData } from "@lib/refiner";
import { GeneralTMDBResponse, SearchCompanyReturn } from "@type/external";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const query = params.get("q");
  const page = parseInt(params.get("p") || "1") || 1;
  const type = params.get("t") || "multi"; //collection | company | movie | person | show | cinements

  if (!query)
    return NextResponse.json({
      status: false,
      response: "Invalid Query!",
    });

  const url = `https://api.themoviedb.org/3/search/${
    type === "cinements" ? "multi" : type
  }?query=${query}&include_adult=false&language=en-US&page=${page}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_API}`,
    },
  };

  try {
    const data: GeneralTMDBResponse<SearchCompanyReturn> = await fetch(
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
        results:
          type === "cinements"
            ? refineMediaItemsFromSearch(data.response.results)
            : refineSearchData(
                data.response.results,
                type === "multi" ? "all" : type
              ),
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ status: false, response: err.message });
  }
};
