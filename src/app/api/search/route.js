export const GET = async () => {
  const url = `https://api.themoviedb.org/3/search/movie?query=deadpool&include_adult=false&language=en-US&page=1`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZWYxNDUyZTMzNjQ1NWY0YTU0NjQyYzU4OTJhMjkyYSIsIm5iZiI6MTcyNDg0MTc4MS4yNzQ2NTIsInN1YiI6IjY2Mjk2YjFlMjI2YzU2MDE3ZTY4MWUxYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.doimHzcXtTa8g1ehebwMOHWa6ZqUbyd75iPYrJP1H9k",
    },
  };

  let data;
  let success = false;
  try {
    const resp = await fetch(url, options);
    data = await resp.json();
    success = true;
  } catch (err) {
    console.log("error")
    console.log(err.message);
    data = err.message;
  }

  return new Response(JSON.stringify({ success, data }));
};
