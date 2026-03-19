import { NextResponse } from "next/server";
import { escalations } from "@/lib/data";
import { checkSLABreach } from "@/lib/automation";
import type { NudgeMessage } from "@/lib/automation";

// GET /api/nudge - SLA Monitoring & Nudge Generation
// In production, this would run on a cron (Vercel Cron Jobs)
// Returns all escalations that are breaching SLA with nudge messages
export async function GET() {
  const now = new Date();
  const nudges: NudgeMessage[] = [];

  const activeEscalations = escalations.filter((e) => e.status !== "Closed");

  for (const esc of activeEscalations) {
    const isBreach = checkSLABreach(esc.slaDeadline, esc.status);

    if (isBreach) {
      const created = new Date(esc.createdAt);
      const slaDeadline = new Date(esc.slaDeadline);
      const hoursOpen = Math.round((now.getTime() - created.getTime()) / (1000 * 60 * 60));
      const hoursOverSLA = Math.round((now.getTime() - slaDeadline.getTime()) / (1000 * 60 * 60));

      nudges.push({
        escalationId: esc.id,
        owner: esc.owner,
        title: esc.title,
        priority: esc.priority,
        hoursOpen,
        hoursOverSLA,
        message: `Reminder: Escalation ${esc.id} "${esc.title}" has been open for ${hoursOpen}h and is ${hoursOverSLA}h past SLA. Owner: ${esc.owner}. Priority: ${esc.priority}.`,
        severity: hoursOverSLA > 8 ? "critical" : "warning",
      });
    }
  }

  // Sort: critical first, then by hours over SLA
  nudges.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "critical" ? -1 : 1;
    return b.hoursOverSLA - a.hoursOverSLA;
  });

  // Group by owner for notification routing
  const byOwner: Record<string, NudgeMessage[]> = {};
  for (const nudge of nudges) {
    if (!byOwner[nudge.owner]) byOwner[nudge.owner] = [];
    byOwner[nudge.owner].push(nudge);
  }

  return NextResponse.json({
    timestamp: now.toISOString(),
    total_active: activeEscalations.length,
    total_breaching: nudges.length,
    breach_rate: `${Math.round((nudges.length / activeEscalations.length) * 100)}%`,
    nudges,
    by_owner: byOwner,
    note: "In production, these nudges would be sent via Slack/Email automatically using Vercel Cron Jobs.",
  });
}
