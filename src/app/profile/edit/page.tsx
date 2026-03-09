import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NavDrawer } from "@/components/nav-drawer";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-scheme-bg-muted/95">
      <NavDrawer title="Edit Profile">
        <Link
          href="/profile"
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          Cancel
        </Link>
      </NavDrawer>

      <div className="mx-auto max-w-xl px-4 py-6">
        <p className="text-center text-stone-500">
          Edit profile form coming soon. For now, use the back button.
        </p>
        <div className="mt-4 text-center">
          <Link
            href="/profile"
            className="text-scheme-primary hover:underline"
          >
            ← Back to Profile
          </Link>
        </div>
      </div>
    </main>
  );
}
