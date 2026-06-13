"use client";

import { useState } from "react";
import { AboutPage } from "./AboutPage";
import { WorkPage } from "./WorkPage";

export function Portfolio() {
  const [page, setPage] = useState<"about" | "work">("about");

  return (
    <div className="size-full overflow-y-auto" style={{ fontFamily: "'Press Start 2P', monospace", background: "#F5EDD3" }}>
      {page === "about" ? <AboutPage onNav={setPage} /> : <WorkPage onNav={setPage} />}
    </div>
  );
}
