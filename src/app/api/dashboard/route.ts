import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getUserGamificationProgress } from "@/lib/gamification/actions";
import { checkUserBadges } from "@/lib/gamification/utils";
import { BADGES, getBadgeProgressDetails } from "@/config/gamification/badges";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get gamification progress
    const gamificationProgress = await getUserGamificationProgress();

    // Get job offers (excluding rejected)
    const { data: jobOffers, error: offersError } = await supabase
      .from("job_offers")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "rejected")
      .order("created_at", { ascending: false });

    if (offersError) {
      console.error("Error fetching job offers:", offersError);
    }

    // Get interviews for this week (Monday to Sunday)
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const { data: interviews, error: interviewsError } = await supabase
      .from("interviews")
      .select("*, job_offers!inner(company_name, position)")
      .eq("user_id", user.id)
      .eq("status", "scheduled")
      .gte("scheduled_at", startOfWeek.toISOString())
      .lt("scheduled_at", endOfWeek.toISOString())
      .order("scheduled_at", { ascending: true });

    if (interviewsError) {
      console.error("Error fetching interviews:", interviewsError);
    }

    // Get job offers that haven't been applied to (status: saved, contacted)
    const notAppliedOffers = (jobOffers || []).filter(
      (offer) => offer.status === "saved" || offer.status === "contacted"
    );

    // Get contacts that might need review (recent contacts without notes or with old notes)
    const { data: contacts, error: contactsError } = await supabase
      .from("job_offer_contacts")
      .select("*, job_offers!inner(company_name, position, status)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (contactsError) {
      console.error("Error fetching contacts:", contactsError);
    }

    // Get recent notes from job offers
    const offersWithNotes = (jobOffers || [])
      .filter((offer) => offer.notes && offer.notes.trim().length > 0)
      .map((offer) => {
        // Extract last note (most recent)
        const notes = offer.notes.split("\n\n").filter((n: string) => n.trim());
        const lastNote = notes[notes.length - 1] || "";
        return {
          id: offer.id,
          company_name: offer.company_name,
          position: offer.position,
          status: offer.status,
          last_note: lastNote,
          updated_at: offer.updated_at,
        };
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);

    // Get recent badges (last 5)
    const recentBadges = gamificationProgress.earnedBadges
      .map((badgeId) => {
        const badge = BADGES.find((b) => b.id === badgeId);
        const earnedAt = gamificationProgress.earnedBadgesData[badgeId];
        return badge ? { ...badge, earnedAt } : null;
      })
      .filter((b) => b !== null)
      .sort((a, b) => {
        if (!a?.earnedAt || !b?.earnedAt) return 0;
        return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
      })
      .slice(0, 5);

    // Get closest badges (not earned, sorted by progress)
    const allBadges = BADGES.map((badge) => {
      const earned = gamificationProgress.earnedBadges.includes(badge.id);
      const progressDetails = getBadgeProgressDetails(badge, gamificationProgress.eventCounts);
      // Get the first requirement's progress (or average if multiple)
      const firstRequirement = progressDetails[0] || { current: 0, required: 1, progress: 0 };
      const avgProgress = progressDetails.length > 0
        ? progressDetails.reduce((sum, p) => sum + p.progress, 0) / progressDetails.length
        : 0;
      
      return {
        ...badge,
        progress: earned ? 100 : avgProgress,
        current: firstRequirement.current,
        required: firstRequirement.required,
        earned,
      };
    });

    const closestBadges = allBadges
      .filter((badge) => !badge.earned && badge.progress > 0)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);

    return NextResponse.json({
      gamification: {
        xp: gamificationProgress.xp,
        level: gamificationProgress.level.order,
        nextLevel: gamificationProgress.nextLevel ? {
          order: gamificationProgress.nextLevel.order,
          xpRequired: gamificationProgress.nextLevel.requiredXp,
        } : null,
        progress: gamificationProgress.progress,
      },
      recentBadges: recentBadges,
      closestBadges: closestBadges,
      interviewsThisWeek: interviews || [],
      notAppliedOffers: notAppliedOffers || [],
      contactsToReview: contacts || [],
      recentNotes: offersWithNotes,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

