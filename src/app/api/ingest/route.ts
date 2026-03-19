import { NextRequest, NextResponse } from "next/server";
import { processEscalation, isEscalation } from "@/lib/automation";
import type { IngestPayload } from "@/lib/automation";

// POST /api/ingest - Main webhook endpoint
// Receives a raw message, runs AI analysis, scores priority, assigns owner
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as IngestPayload;

    // Validate required fields
    if (!body.message || !body.sender_name || !body.sender_email || !body.source) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["message", "sender_name", "sender_email", "source"],
          example: {
            message: "Our claim has been pending for 30 days...",
            sender_name: "Rahul Sharma",
            sender_email: "rahul@example.com",
            source: "Email",
            account_name: "TCS",
            account_size: "Enterprise",
          },
        },
        { status: 400 }
      );
    }

    // Step 1: Check if this is an escalation
    const escalationDetected = isEscalation(body.message);

    if (!escalationDetected) {
      return NextResponse.json({
        status: "skipped",
        reason: "Message does not appear to be an escalation",
        is_escalation: false,
        tip: "Include words like: urgent, issue, delayed, complaint, escalation, stuck, etc.",
      });
    }

    // Step 2: Process through the full pipeline
    const apiKey = process.env.OPENAI_API_KEY;
    const escalation = await processEscalation(body, apiKey);

    return NextResponse.json({
      status: "processed",
      is_escalation: true,
      pipeline: {
        ai_analysis: escalation.aiAnalysis,
        priority_scoring: {
          score: escalation.priorityScore,
          priority: escalation.priority,
        },
        owner_assignment: escalation.owner,
        sla: {
          deadline: escalation.slaDeadline,
          is_breaching: escalation.isBreachingSLA,
        },
      },
      escalation,
    });
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json(
      { error: "Failed to process escalation", details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/ingest - Show endpoint documentation
export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/ingest",
    description: "Submit a message for AI-powered escalation processing",
    pipeline: [
      "1. Escalation Detection (keyword filtering)",
      "2. AI Summarization (OpenAI GPT-4o-mini or fallback)",
      "3. Priority Scoring (multi-factor: urgency, sentiment, account size, issue severity, delay detection)",
      "4. Owner Assignment (rule-based routing to Plum team members)",
      "5. SLA Deadline Calculation (Critical: 4h, High: 12h, Medium: 24h, Low: 48h)",
    ],
    required_fields: {
      message: "The raw escalation message text",
      sender_name: "Name of the person sending the escalation",
      sender_email: "Email of the sender",
      source: "One of: Email, Slack, WhatsApp",
    },
    optional_fields: {
      account_name: "Company/account name",
      account_size: "One of: Enterprise, Mid-Market, SME, Startup",
    },
    example_curl: `curl -X POST ${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000"}/api/ingest -H "Content-Type: application/json" -d '{"message":"Our claim CLM-2024-4567 has been pending for 30 days with no update. This is urgent and we are considering not renewing our policy.","sender_name":"Rahul Sharma","sender_email":"rahul@tataconsultancy.com","source":"Email","account_name":"TCS","account_size":"Enterprise"}'`,
  });
}
