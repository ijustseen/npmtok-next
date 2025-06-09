import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const packageName = searchParams.get("packageName");

  if (!packageName) {
    return NextResponse.json(
      { error: "Package name is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("bookmarked_packages")
    .select("id")
    .eq("user_id", user.id)
    .eq("package->>name", packageName)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking bookmark:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (data) {
    return NextResponse.json({ isBookmarked: true, bookmarkId: data.id });
  } else {
    return NextResponse.json({ isBookmarked: false });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pkg = await request.json();

  const { data, error } = await supabase
    .from("bookmarked_packages")
    .insert({ user_id: user.id, package: pkg })
    .select("id")
    .single();

  if (error) {
    console.error("Error adding bookmark:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, bookmarkId: data.id });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { packageName } = await request.json();

  if (!packageName) {
    return NextResponse.json(
      { error: "Package name is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("bookmarked_packages")
    .delete()
    .eq("user_id", user.id)
    .eq("package->>name", packageName);

  if (error) {
    console.error("Error deleting bookmark:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
