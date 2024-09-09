import Link from "next/link";

export default function MovieCard({ id, image, title }) {
    return (
        <Link href={`/movie/${id}`}>
            <div className="movieCard">
                <img src={`https://image.tmdb.org/t/p/w300${image}`} alt="" />
                <h3>{title}</h3>
            </div>
        </Link>
    )
}