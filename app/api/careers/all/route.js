import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

export async function GET() {
  const username = process.env.ONET_USERNAME;
  const password = process.env.ONET_PASSWORD;

  if (!username || !password) {
    return NextResponse.json({ error: "Missing O*NET credentials." }, { status: 500 });
  }

  try {
    const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");

    const res = await fetch(`https://services.onetcenter.org/ws/online/occupations`, {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        Accept: "application/xml",
      },
    });

    const xml = await res.text();
    const result = await parseStringPromise(xml, { explicitArray: false });

    const occupations = result?.occupations?.occupation || [];

    return NextResponse.json({
      occupation: Array.isArray(occupations) ? occupations.map(o => ({
        title: o.title,
        code: o.code,
      })) : [],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch careers." }, { status: 500 });
  }
}
