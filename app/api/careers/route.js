import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  const username = process.env.ONET_USERNAME;
  const password = process.env.ONET_PASSWORD;

  if (!username || !password) {
    return NextResponse.json({ error: "Missing O*NET credentials." }, { status: 500 });
  }

  try {
    const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");

    const res = await fetch(`https://services.onetcenter.org/ws/online/occupations?keyword=${encodeURIComponent(query)}&start=0&end=9`, {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        Accept: "application/xml",
      },
    });

    const xml = await res.text();
    const result = await parseStringPromise(xml, { explicitArray: false });

    const list = result?.occupations?.occupation || [];
    const occupations = Array.isArray(list) ? list : [list];

    return NextResponse.json({
      occupation: occupations.map((o) => ({
        title: o.title,
        code: o.code,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch O*NET data." }, { status: 500 });
  }
}
