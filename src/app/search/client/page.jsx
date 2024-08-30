"use client"
import { useState } from "react";

export default function ClientPage() {
    const [data, setData] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const url = `https://api.themoviedb.org/3/search/movie?query=deadpool&include_adult=false&language=en-US&page=1`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZWYxNDUyZTMzNjQ1NWY0YTU0NjQyYzU4OTJhMjkyYSIsIm5iZiI6MTcyNDg0MTc4MS4yNzQ2NTIsInN1YiI6IjY2Mjk2YjFlMjI2YzU2MDE3ZTY4MWUxYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.doimHzcXtTa8g1ehebwMOHWa6ZqUbyd75iPYrJP1H9k'
        }
    };

    fetch(url, options)
        .then(res => res.text())
        .then(json => setData(json))
        .catch(err => { console.table('error: ' + err); setError(err.message) })
        .finally(() => setLoading(false))

    if (loading) return <div>Loading...</div>
    if (!loading && !data) return <div>No Data Found! Error: {error}</div>
    return <div>{data}</div>
}
