import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const GET = () => {
  headers();
  console.log("API route called");
  const date = new Date().toTimeString();
  console.log("date in api route", date);
  return NextResponse.json({ message: date });
};
