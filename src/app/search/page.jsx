import MovieCard from "@/Components/MovieCard";

export default async function SearchPage() {

    // process.env.NODE_ENV -- output : development | production
    // __NEXT_PRIVATE_ORIGIN -- output: hostname

    // const data = await fetch(`${process.env.__NEXT_PRIVATE_ORIGIN}/api/search`);

    console.log("Mode: " + process.env.NODE_ENV);
    console.log("Host: " + process.env.__NEXT_PRIVATE_ORIGIN);

    const res = await fetch(`https://testlalaapp.vercel.app/api/search?q=Deadpool`);
    const resp = await res.json();

    if (!resp.success)
        return <div>Error : {resp.data}</div>

    return (
        <div className="movieDataPage">
            {resp.data.results.map(el => (
                <MovieCard key={el.id} title={el.title} image={el.poster_path} id={el.id} />
            ))}
        </div>
    )

}