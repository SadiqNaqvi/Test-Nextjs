"use client";
import "./homepage.css";
import { Suspense } from "react";
import DataComponent from "@/component/DataComponent";

export default function page() {
  // const [search, setSearch] = useState('')
  return (
    <div className="mainPage">
      <div className="inputCont">
        {/* <input type="text" value={search} onChange={e => setSearch(e.target.value)} /> */}
        <button>Search</button>
      </div>
      <main>
        <Suspense fallback={"Loading..."}>
          <DataComponent name="deadpool" />
        </Suspense>
      </main>
    </div>
  )
}
