import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all job offers for the user
  const { data: allOffers, error } = await supabase
    .from("job_offers")
    .select("status, created_at")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching job offers stats:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate stats
  const active = allOffers?.filter(
    (offer) =>
      !["rejected", "accepted"].includes(offer.status)
  ).length || 0;

  const interviews = allOffers?.filter(
    (offer) => offer.status === "interview"
  ).length || 0;

  // Calculate response rate (applied + interviewed + offer + accepted / total applied)
  const applied = allOffers?.filter(
    (offer) =>
      ["applied", "interview", "offer", "accepted"].includes(offer.status)
  ).length || 0;
  const totalApplied = allOffers?.filter(
    (offer) => ["applied", "interview", "offer", "accepted", "rejected"].includes(offer.status)
  ).length || 0;
  const responseRate = totalApplied > 0 ? Math.round((applied / totalApplied) * 100) : 0;

  // Calculate weekly streak - consecutive days with activity
  let weeklyStreak = 0;
  try {
    // Get all user events from the last 30 days to calculate streak
    const { data: userEvents, error: eventsError } = await supabase
      .from("user_events")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false });

    if (!eventsError && userEvents && userEvents.length > 0) {
      // Group events by date (day only, ignoring time)
      const daysWithActivity = new Set<string>();
      userEvents.forEach((event) => {
        const eventDate = new Date(event.created_at);
        // Use UTC date to avoid timezone issues
        const dateKey = `${eventDate.getUTCFullYear()}-${String(eventDate.getUTCMonth() + 1).padStart(2, '0')}-${String(eventDate.getUTCDate()).padStart(2, '0')}`;
        daysWithActivity.add(dateKey);
      });

      // Calculate consecutive days starting from today going backwards
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      
      let currentDate = new Date(today);
      let consecutiveDays = 0;
      let foundFirstActivity = false;
      
      // Check up to 30 days back
      for (let i = 0; i < 30; i++) {
        const dateKey = `${currentDate.getUTCFullYear()}-${String(currentDate.getUTCMonth() + 1).padStart(2, '0')}-${String(currentDate.getUTCDate()).padStart(2, '0')}`;
        
        if (daysWithActivity.has(dateKey)) {
          consecutiveDays++;
          foundFirstActivity = true;
        } else {
          // If we've already found activity and now there's a gap, streak is broken
          if (foundFirstActivity) {
            break;
          }
          // If we haven't found activity yet, continue checking backwards
        }
        
        // Move to previous day
        currentDate.setUTCDate(currentDate.getUTCDate() - 1);
      }
      
      weeklyStreak = consecutiveDays;
    }
  } catch (error) {
    console.error("Error calculating weekly streak:", error);
    weeklyStreak = 0;
  }

  return NextResponse.json({
    active,
    interviews,
    responseRate,
    weeklyStreak,
  });
}

