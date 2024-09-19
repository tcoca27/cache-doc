import { cookies } from "next/headers";
import Link from "next/link";
import React from "react";

const Dynamic1Page = async () => {
  cookies();
  const time = await fetch("http://localhost:3000/api/dynamic", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await time.json();
  console.log("Dynamic-1 Page Data:", data);

  return (
    <div className="flex flex-col text-center gap-10 text-lg">
      <h1>Dynamic 1</h1>
      <p>Response: {data.message}</p>
      <Link href="/dynamic-2">Go To Dynamic 2 - Soft</Link>
      <a href="/dynamic-2">Go To Dynamic 2 - Hard</a>
    </div>
  );
};

export default Dynamic1Page;
