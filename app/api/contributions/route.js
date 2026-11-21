import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const revalidate = 3600; // Cache on server for 1 hour

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || "SazWhatician";

  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
      {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent": "Portfolio-App",
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const contributions = data.contributions.map((c) => ({
        date: c.date,
        count: c.count,
      }));

      return NextResponse.json({
        username,
        total: data.total?.lastYear || contributions.reduce((a, b) => a + b.count, 0),
        contributions,
        source: "api",
      });
    }
  } catch (err) {
    console.error("Error fetching live GitHub contributions:", err);
  }

  // Graceful fallback to static cached snapshot
  try {
    const fallbackPath = path.join(process.cwd(), "public", "data", "github-contributions.json");
    if (fs.existsSync(fallbackPath)) {
      const fileData = JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
      return NextResponse.json({
        ...fileData,
        source: "cached_snapshot",
      });
    }
  } catch (err) {
    console.error("Error reading cached contributions fallback:", err);
  }

  return NextResponse.json(
    { error: "Failed to fetch GitHub contributions" },
    { status: 500 }
  );
}
