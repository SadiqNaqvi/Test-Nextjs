import MovieCard from "@/Components/MovieCard";
import { Suspense } from "react";

const fetchData = async () => {
    const url = `https://api.themoviedb.org/3/search/movie?query=deadpool&include_adult=false&language=en-US&page=1`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZWYxNDUyZTMzNjQ1NWY0YTU0NjQyYzU4OTJhMjkyYSIsIm5iZiI6MTcyNDg0MTc4MS4yNzQ2NTIsInN1YiI6IjY2Mjk2YjFlMjI2YzU2MDE3ZTY4MWUxYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.doimHzcXtTa8g1ehebwMOHWa6ZqUbyd75iPYrJP1H9k'
        }
    };
    try {
        const res = await fetch(url, options);
        const resp = await res.json();
        return { success: true, response: resp }
    }
    catch (err) {
        console.error('error:' + err);
        return { success: false, response: err.message };
    };
}

const Component = async () => {
    const data = await fetchData();
    if (!data.success) return <div>No data found! Error: {data.response}</div>

    return <div className="movieDataPage">
        {data.response.results.map(el => (
            <MovieCard key={el.id} title={el.title} id={el.id} image={el.poster_path} />
        ))}
    </div>
}

export default function ServerPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Component />
        </Suspense>
    )
}