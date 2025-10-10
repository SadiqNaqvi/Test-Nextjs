import { NextResponse } from "next/server";

export const GET = async (res, { params: { username } }) => {
  const page = res.nextUrl.searchParams.get("o");

  try {
    const [profile, posts] = await Promise.all([
      fetch(
        `https://kemono.su/api/v1/patreon/user/${username}/posts?o=${page}`,
        { next: { revalidate: 0 }, headers: { Accept: "text/css" } }
      ).then((res) => res.json()),
      fetch(`https://kemono.su/api/v1/patreon/user/${username}/profile`, {
        next: { revalidate: 0 },
        headers: { Accept: "text/css" },
      }).then((res) => res.json()),
    ]);

    if (profile.error || posts.error)
      return NextResponse.json({
        result: null,
        success: false,
        error: profile.error || posts.error,
      });

    return NextResponse.json({
      result: {
        name: profile.name,
        service: profile.service,
        post_count: profile.post_count,
        posts,
      },
      success: true,
      error: null,
    });
  } catch (err) {
    return NextResponse.json({
      result: null,
      success: false,
      error: err.message,
    });
  }
};
