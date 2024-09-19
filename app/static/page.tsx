import React from "react";

const StaticPage = async () => {
  const time = await fetch("http://localhost:3000/api/dynamic", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await time.json();
  console.log("Static Page Data:", data);

  return (
    <div>
      <p>{data.message}</p>
    </div>
  );
};

export default StaticPage;
