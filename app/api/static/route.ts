import { NextResponse } from "next/server";

export const GET = () => {
  console.log("API route called");
  const date = new Date().toTimeString();
  console.log("date in api route", date);
  return NextResponse.json({ message: date });
};
