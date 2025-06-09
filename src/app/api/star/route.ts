import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getSupabaseUser() {
  const supabase = await createClient();
  return supabase.auth.getUser();
}

async function getGithubToken() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.provider_token;
}

// Check if a repository is starred
export async function GET(request: Request) {
  const {
    data: { user },
  } = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getGithubToken();
  if (!token) {
    return NextResponse.json(
      { error: "GitHub token not found" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Owner and repo are required" },
      { status: 400 }
    );
  }

  const response = await fetch(
    `https://api.github.com/user/starred/${owner}/${repo}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "NPMTok",
      },
    }
  );

  if (response.status === 204) {
    return NextResponse.json({ isStarred: true });
  } else if (response.status === 404) {
    return NextResponse.json({ isStarred: false });
  } else {
    const errorBody = await response.text();
    console.error(
      `GitHub API error when checking star for ${owner}/${repo}. Status: ${response.status}. Body: ${errorBody}`
    );
    return NextResponse.json(
      { error: "Failed to check star status" },
      { status: response.status }
    );
  }
}

// Star a repository
export async function POST(request: Request) {
  const {
    data: { user },
  } = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getGithubToken();
  if (!token) {
    return NextResponse.json(
      { error: "GitHub token not found" },
      { status: 401 }
    );
  }

  const { owner, repo } = await request.json();

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Owner and repo are required" },
      { status: 400 }
    );
  }

  const response = await fetch(
    `https://api.github.com/user/starred/${owner}/${repo}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Length": "0",
        "User-Agent": "NPMTok",
      },
    }
  );

  if (response.status === 204) {
    return NextResponse.json({ success: true });
  }

  const errorBody = await response.text();
  console.error(
    `GitHub API error when starring ${owner}/${repo}. Status: ${response.status}. Body: ${errorBody}`
  );

  if (response.status === 404) {
    return NextResponse.json(
      { error: "Repository not found on GitHub or you lack access." },
      { status: 404 }
    );
  }

  if (response.status === 401 || response.status === 403) {
    return NextResponse.json(
      { error: "Authentication failed. Please try logging out and back in." },
      { status: response.status }
    );
  }

  return NextResponse.json(
    { error: "Failed to star repository." },
    { status: 500 }
  );
}

// Unstar a repository
export async function DELETE(request: Request) {
  const {
    data: { user },
  } = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getGithubToken();
  if (!token) {
    return NextResponse.json(
      { error: "GitHub token not found" },
      { status: 401 }
    );
  }

  const { owner, repo } = await request.json();

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Owner and repo are required" },
      { status: 400 }
    );
  }

  const response = await fetch(
    `https://api.github.com/user/starred/${owner}/${repo}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "NPMTok",
      },
    }
  );

  if (response.status === 204) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json(
      { error: "Failed to unstar repository" },
      { status: response.status }
    );
  }
}
