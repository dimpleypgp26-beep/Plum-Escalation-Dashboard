import { NextRequest, NextResponse } from "next/server";
import { escalations } from "@/lib/data";

// GET - Fetch all escalations (for n8n or any client)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const source = searchParams.get("source");

  let filtered = [...escalations];

  if (status) filtered = filtered.filter((e) => e.status === status);
  if (priority) filtered = filtered.filter((e) => e.priority === priority);
  if (source) filtered = filtered.filter((e) => e.source === source);

  return NextResponse.json({
    count: filtered.length,
    escalations: filtered,
  });
}

// POST - Webhook endpoint for n8n to push new escalations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ["title", "summary", "accountName", "source", "senderName"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // In production, this would write to a database
    // For the prototype, we acknowledge receipt
    const newEscalation = {
      id: `ESC-${String(escalations.length + 1001).padStart(4, "0")}`,
      ...body,
      status: "Open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Escalation received and queued for processing",
      escalation: newEscalation,
    });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
