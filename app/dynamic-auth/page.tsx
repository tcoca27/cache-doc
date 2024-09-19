import { cookies } from "next/headers";
import Link from "next/link";
import React from "react";

const Dynamic1Page = async () => {
  cookies();
  const time = await fetch("http://localhost:3000/api/dynamic", {
    next: { revalidate: 10 },
    headers: {
      Authorization: "Bearer " + "token",
      "Content-Type": "application/json",
    },
  });
  const data = await time.json();
  console.log("Dynamic-Auth Page Data:", data);

  return (
    <div className="flex flex-col text-center gap-10 text-lg">
      <h1>Dynamic Auth</h1>
      <p>Response: {data.message}</p>
      <Link href="/dynamic-1">Go To Dynamic 1 - Soft</Link>
      <Link href="/dynamic-2">Go To Dynamic 2 - Soft</Link>
      <a href="/dynamic-1">Go To Dynamic 1 - Hard</a>
      <a href="/dynamic-2">Go To Dynamic 2 - Hard</a>
    </div>
  );
};

export default Dynamic1Page;
