import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Missing owner or repo" },
      { status: 400 }
    );
  }

  try {
    const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`;
    const response = await fetch(readmeUrl);

    if (!response.ok) {
      // Try with main branch if master fails
      const readmeUrlMain = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
      const responseMain = await fetch(readmeUrlMain);
      if (!responseMain.ok) {
        throw new Error(
          "Failed to fetch README from both master and main branches"
        );
      }
      const content = await responseMain.text();
      return NextResponse.json({ content });
    }

    const content = await response.text();
    return NextResponse.json({ content });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch README: ${errorMessage}` },
      { status: 500 }
    );
  }
}
