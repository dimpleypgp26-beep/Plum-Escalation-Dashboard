// ── Automation Engine: AI Processing, Priority Scoring, Owner Assignment, SLA ──

export interface IngestPayload {
  message: string;
  sender_name: string;
  sender_email: string;
  source: "Email" | "Slack" | "WhatsApp";
  account_name?: string;
  account_size?: "Enterprise" | "Mid-Market" | "SME" | "Startup";
}

export interface AIAnalysis {
  summary: string;
  account_name: string;
  issue_type: string;
  action_needed: string;
  urgent: "yes" | "no";
  sentiment: string;
}

export interface ProcessedEscalation {
  id: string;
  title: string;
  summary: string;
  accountName: string;
  accountSize: "Enterprise" | "Mid-Market" | "SME" | "Startup";
  category: string;
  source: "Email" | "Slack" | "WhatsApp";
  priority: "Critical" | "High" | "Medium" | "Low";
  priorityScore: number;
  status: "Open";
  owner: string;
  actionNeeded: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  responseTime: null;
  resolutionTime: null;
  isBreachingSLA: boolean;
  rawMessage: string;
  senderName: string;
  senderEmail: string;
  aiAnalysis: AIAnalysis;
}

// ── Step 1: Filter - Is this an escalation? ──
const ESCALATION_KEYWORDS = [
  "urgent", "escalat", "issue", "claim stuck", "pending", "delayed",
  "no update", "not renewing", "frustrated", "unresolved", "complaint",
  "breach", "overdue", "critical", "immediate", "help needed", "stuck",
  "rejected", "denied", "cashless", "reimbursement", "wrong", "error",
  "missing", "not working", "broken", "failure", "dissatisfied",
  "unhappy", "angry", "terrible", "worst", "unacceptable", "legal",
  "ombudsman", "IRDAI", "media", "social media", "twitter", "linkedin"
];

export function isEscalation(message: string): boolean {
  const lower = message.toLowerCase();
  return ESCALATION_KEYWORDS.some((kw) => lower.includes(kw));
}

// ── Step 2: AI Summarization (OpenAI API) ──
export async function aiSummarize(message: string, apiKey: string): Promise<AIAnalysis> {
  const prompt = `You are an AI assistant for Plum Insurance (a health insurance company in India). Analyze this customer/HR escalation message and return ONLY valid JSON with these exact fields:
{
  "summary": "2-3 line summary of the issue",
  "account_name": "company name mentioned, or 'Unknown'",
  "issue_type": "one of: Claim Delayed, Claim Rejected, Cashless Failure, Reimbursement Delay, Policy Issuance, Onboarding Issue, Health ID Missing, Renewal Issue, Service Complaint, Portal/Tech Issue, Premium Discrepancy, Endorsement Pending, Network Hospital Issue, TPA Coordination, Document Issue, Billing/Invoice Issue, Coverage Query, General Inquiry",
  "action_needed": "one of: Decision, Follow-up, Unblock, Investigation, Acknowledgement",
  "urgent": "yes or no",
  "sentiment": "one of: angry, frustrated, neutral, polite"
}

Message: ${message}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in AI response");

    return JSON.parse(jsonMatch[0]) as AIAnalysis;
  } catch (error) {
    console.error("AI Summarization failed, using fallback:", error);
    return fallbackAnalysis(message);
  }
}

// Fallback analysis when OpenAI is unavailable
function fallbackAnalysis(message: string): AIAnalysis {
  const lower = message.toLowerCase();

  let issue_type = "General Inquiry";
  if (lower.includes("claim") && lower.includes("delay")) issue_type = "Claim Delayed";
  else if (lower.includes("claim") && (lower.includes("reject") || lower.includes("denied"))) issue_type = "Claim Rejected";
  else if (lower.includes("cashless")) issue_type = "Cashless Failure";
  else if (lower.includes("reimbursement")) issue_type = "Reimbursement Delay";
  else if (lower.includes("policy") && lower.includes("issu")) issue_type = "Policy Issuance";
  else if (lower.includes("onboard")) issue_type = "Onboarding Issue";
  else if (lower.includes("health id") || lower.includes("e-card")) issue_type = "Health ID Missing";
  else if (lower.includes("renewal") || lower.includes("renew")) issue_type = "Renewal Issue";
  else if (lower.includes("portal") || lower.includes("login") || lower.includes("app")) issue_type = "Portal/Tech Issue";
  else if (lower.includes("premium")) issue_type = "Premium Discrepancy";
  else if (lower.includes("endorse")) issue_type = "Endorsement Pending";
  else if (lower.includes("hospital") || lower.includes("network")) issue_type = "Network Hospital Issue";
  else if (lower.includes("complaint") || lower.includes("service")) issue_type = "Service Complaint";

  let sentiment: "angry" | "frustrated" | "neutral" | "polite" = "neutral";
  if (lower.includes("angry") || lower.includes("worst") || lower.includes("terrible") || lower.includes("unacceptable") || lower.includes("legal")) sentiment = "angry";
  else if (lower.includes("frustrated") || lower.includes("unhappy") || lower.includes("disappointed")) sentiment = "frustrated";
  else if (lower.includes("please") || lower.includes("kindly") || lower.includes("request")) sentiment = "polite";

  const urgent = lower.includes("urgent") || lower.includes("immediate") || lower.includes("asap") || lower.includes("critical") || sentiment === "angry" ? "yes" : "no";

  let action_needed = "Follow-up";
  if (lower.includes("decision") || lower.includes("approve")) action_needed = "Decision";
  else if (lower.includes("stuck") || lower.includes("block")) action_needed = "Unblock";
  else if (lower.includes("why") || lower.includes("reason") || lower.includes("investigate")) action_needed = "Investigation";

  // Extract company name (simple heuristic)
  const companyPatterns = [
    /(?:from|at|company|organization|org)\s+([A-Z][a-zA-Z\s&]+(?:Ltd|Inc|Corp|Pvt|Solutions|Tech|Industries|Group|Services)?)/,
    /([A-Z][a-zA-Z]+\s+(?:Technologies|Solutions|Industries|Services|Corp|Ltd|Inc|Pvt))/,
  ];
  let account_name = "Unknown";
  for (const pattern of companyPatterns) {
    const match = message.match(pattern);
    if (match) {
      account_name = match[1].trim();
      break;
    }
  }

  return {
    summary: `${issue_type} reported via message. ${urgent === "yes" ? "Marked as urgent." : ""} Customer sentiment: ${sentiment}. Requires ${action_needed.toLowerCase()}.`,
    account_name,
    issue_type,
    action_needed,
    urgent,
    sentiment,
  };
}

// ── Step 3: Priority Scoring Engine ──
interface ScoringInput {
  urgent: "yes" | "no";
  sentiment: string;
  accountSize: "Enterprise" | "Mid-Market" | "SME" | "Startup";
  issueType: string;
  source: string;
  message: string;
}

export function calculatePriorityScore(input: ScoringInput): { score: number; priority: "Critical" | "High" | "Medium" | "Low" } {
  let score = 0;

  // Urgency (0-25)
  if (input.urgent === "yes") score += 20;

  // Sentiment (0-20)
  if (input.sentiment === "angry") score += 20;
  else if (input.sentiment === "frustrated") score += 12;
  else if (input.sentiment === "neutral") score += 5;

  // Account size (0-20)
  const sizeScores: Record<string, number> = { Enterprise: 20, "Mid-Market": 14, SME: 8, Startup: 4 };
  score += sizeScores[input.accountSize] || 5;

  // Issue severity (0-20)
  const severityScores: Record<string, number> = {
    "Claim Rejected": 18, "Cashless Failure": 17, "Claim Delayed": 15,
    "Reimbursement Delay": 14, "Health ID Missing": 12, "Policy Issuance": 11,
    "Renewal Issue": 13, "Premium Discrepancy": 10, "Onboarding Issue": 9,
    "Network Hospital Issue": 12, "TPA Coordination": 10, "Portal/Tech Issue": 8,
    "Endorsement Pending": 7, "Service Complaint": 9, "Document Issue": 6,
    "Billing/Invoice Issue": 8, "Coverage Query": 4, "General Inquiry": 2,
  };
  score += severityScores[input.issueType] || 5;

  // Delay detection (0-10)
  const lower = input.message.toLowerCase();
  if (lower.includes("weeks") || lower.includes("month")) score += 10;
  else if (lower.includes("days") || lower.includes("week")) score += 6;

  // Escalation threat detection (0-5)
  if (lower.includes("legal") || lower.includes("irdai") || lower.includes("ombudsman")) score += 5;
  else if (lower.includes("social media") || lower.includes("twitter") || lower.includes("linkedin")) score += 4;
  else if (lower.includes("not renewing") || lower.includes("cancel")) score += 3;

  // Cap at 100
  score = Math.min(score, 100);

  // Map score to priority
  let priority: "Critical" | "High" | "Medium" | "Low";
  if (score >= 70) priority = "Critical";
  else if (score >= 50) priority = "High";
  else if (score >= 30) priority = "Medium";
  else priority = "Low";

  return { score, priority };
}

// ── Step 4: Owner Assignment ──
const OWNER_RULES: { match: (issueType: string, priority: string, urgent: string) => boolean; owner: string }[] = [
  { match: (t, p) => (t.includes("Claim") || t === "Cashless Failure" || t === "Reimbursement Delay") && (p === "Critical" || p === "High"), owner: "Avik Bhandari" },
  { match: (t) => t.includes("Claim") || t === "Cashless Failure" || t === "Reimbursement Delay", owner: "Susmita Roy" },
  { match: (t) => t === "Policy Issuance" || t === "Endorsement Pending" || t === "Renewal Issue", owner: "Vaishnavi Bhat" },
  { match: (t) => t === "Onboarding Issue" || t === "Health ID Missing", owner: "Vidushi M" },
  { match: (t) => t === "Portal/Tech Issue", owner: "Mikhel Dhiman" },
  { match: (t) => t === "Premium Discrepancy" || t === "Billing/Invoice Issue", owner: "Arun Saseedharan" },
  { match: (t) => t === "Network Hospital Issue" || t === "TPA Coordination", owner: "Ipsita Sahu" },
  { match: (_, p) => p === "Critical", owner: "Rajorshi Chowdhury" },
  { match: () => true, owner: "Susmita Roy" }, // default
];

export function assignOwner(issueType: string, priority: string, urgent: string): string {
  for (const rule of OWNER_RULES) {
    if (rule.match(issueType, priority, urgent)) return rule.owner;
  }
  return "Susmita Roy";
}

// ── Step 5: SLA Deadline Calculation ──
export function calculateSLADeadline(priority: "Critical" | "High" | "Medium" | "Low", createdAt: Date): string {
  const slaHours: Record<string, number> = {
    Critical: 4,
    High: 12,
    Medium: 24,
    Low: 48,
  };
  const deadline = new Date(createdAt.getTime() + slaHours[priority] * 60 * 60 * 1000);
  return deadline.toISOString();
}

// ── Step 6: SLA Breach Check ──
export function checkSLABreach(slaDeadline: string, status: string): boolean {
  if (status === "Closed") return false;
  return new Date() > new Date(slaDeadline);
}

// ── Step 7: Generate Nudge Messages ──
export interface NudgeMessage {
  escalationId: string;
  owner: string;
  title: string;
  priority: string;
  hoursOpen: number;
  hoursOverSLA: number;
  message: string;
  severity: "warning" | "critical";
}

export function generateNudge(escalation: ProcessedEscalation): NudgeMessage | null {
  if (escalation.status === "Closed" as string) return null;

  const now = new Date();
  const created = new Date(escalation.createdAt);
  const slaDeadline = new Date(escalation.slaDeadline);

  const hoursOpen = Math.round((now.getTime() - created.getTime()) / (1000 * 60 * 60));
  const hoursOverSLA = Math.round((now.getTime() - slaDeadline.getTime()) / (1000 * 60 * 60));

  if (hoursOverSLA <= 0) return null; // Not breached yet

  return {
    escalationId: escalation.id,
    owner: escalation.owner,
    title: escalation.title,
    priority: escalation.priority,
    hoursOpen,
    hoursOverSLA,
    message: `Reminder: Escalation ${escalation.id} "${escalation.title}" has been open for ${hoursOpen}h and is ${hoursOverSLA}h past SLA. Owner: ${escalation.owner}. Priority: ${escalation.priority}.`,
    severity: hoursOverSLA > 8 ? "critical" : "warning",
  };
}

// ── Master Processing Pipeline ──
let escalationCounter = 200;

export async function processEscalation(payload: IngestPayload, apiKey?: string): Promise<ProcessedEscalation> {
  // Step 1: AI Analysis
  let analysis: AIAnalysis;
  if (apiKey) {
    analysis = await aiSummarize(payload.message, apiKey);
  } else {
    analysis = fallbackAnalysis(payload.message);
  }

  // Step 2: Determine account size
  const accountSize = payload.account_size || "SME";
  const accountName = payload.account_name || analysis.account_name || "Unknown";

  // Step 3: Priority Scoring
  const { score, priority } = calculatePriorityScore({
    urgent: analysis.urgent,
    sentiment: analysis.sentiment,
    accountSize,
    issueType: analysis.issue_type,
    source: payload.source,
    message: payload.message,
  });

  // Step 4: Owner Assignment
  const owner = assignOwner(analysis.issue_type, priority, analysis.urgent);

  // Step 5: SLA
  const now = new Date();
  const slaDeadline = calculateSLADeadline(priority, now);

  // Step 6: Build record
  escalationCounter++;
  const id = `ESC-${String(escalationCounter).padStart(4, "0")}`;
  const title = `${analysis.issue_type} - ${accountName}`;

  return {
    id,
    title,
    summary: analysis.summary,
    accountName,
    accountSize,
    category: analysis.issue_type,
    source: payload.source,
    priority,
    priorityScore: score,
    status: "Open",
    owner,
    actionNeeded: analysis.action_needed,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    slaDeadline,
    responseTime: null,
    resolutionTime: null,
    isBreachingSLA: false,
    rawMessage: payload.message,
    senderName: payload.sender_name,
    senderEmail: payload.sender_email,
    aiAnalysis: analysis,
  };
}
