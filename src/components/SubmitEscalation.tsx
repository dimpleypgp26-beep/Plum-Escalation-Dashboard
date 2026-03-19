"use client";

import { useState } from "react";

interface PipelineResult {
  status: string;
  is_escalation: boolean;
  reason?: string;
  pipeline?: {
    ai_analysis: {
      summary: string;
      account_name: string;
      issue_type: string;
      action_needed: string;
      urgent: string;
      sentiment: string;
    };
    priority_scoring: {
      score: number;
      priority: string;
    };
    owner_assignment: string;
    sla: {
      deadline: string;
      is_breaching: boolean;
    };
  };
  escalation?: {
    id: string;
    title: string;
    priority: string;
    priorityScore: number;
    owner: string;
    category: string;
    slaDeadline: string;
  };
}

const SAMPLE_MESSAGES = [
  {
    label: "Urgent Claim Delay (Enterprise)",
    data: {
      message: "Dear Plum Team, Our employee Ankit Verma (ID: EMP-4521) submitted a claim CLM-2024-8901 on Feb 15th for hospitalization at Max Hospital. It has been 30 days and the claim is still showing 'Under Review'. This is completely unacceptable. We are a 5000+ employee company and if this is not resolved in 24 hours, we will escalate to IRDAI and consider not renewing our policy. Please treat this as highest priority.",
      sender_name: "Priya Mehta",
      sender_email: "priya.mehta@infosys.com",
      source: "Email" as const,
      account_name: "Infosys Ltd",
      account_size: "Enterprise" as const,
    },
  },
  {
    label: "Cashless Failure (Mid-Market)",
    data: {
      message: "Hi, I'm at Apollo Hospital right now with my mother for emergency surgery and the cashless request was REJECTED saying our policy is not active. But we renewed last month! The hospital is asking for a deposit of 3 lakhs. This is extremely urgent, please help immediately!",
      sender_name: "Vikram Singh",
      sender_email: "vikram@freshworks.com",
      source: "WhatsApp" as const,
      account_name: "Freshworks",
      account_size: "Mid-Market" as const,
    },
  },
  {
    label: "Onboarding Issue (SME)",
    data: {
      message: "We signed up 3 weeks ago and none of our 50 employees have received their health cards or login credentials for the Plum portal. Our HR team has sent multiple emails but no response. We need this resolved as onboarding was promised within 5 business days.",
      sender_name: "Deepa Nair",
      sender_email: "deepa@razorpay.com",
      source: "Slack" as const,
      account_name: "Razorpay",
      account_size: "SME" as const,
    },
  },
  {
    label: "Routine Query (Low Priority)",
    data: {
      message: "Hi, I just wanted to check if dental treatment is covered under our plan. Could you please share the list of covered procedures? Thanks!",
      sender_name: "Amit Kumar",
      sender_email: "amit@startup.io",
      source: "Email" as const,
      account_name: "TechStartup.io",
      account_size: "Startup" as const,
    },
  },
];

export default function SubmitEscalation() {
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [source, setSource] = useState<"Email" | "Slack" | "WhatsApp">("Email");
  const [accountName, setAccountName] = useState("");
  const [accountSize, setAccountSize] = useState<"Enterprise" | "Mid-Market" | "SME" | "Startup">("SME");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState("");

  const loadSample = (idx: number) => {
    const sample = SAMPLE_MESSAGES[idx].data;
    setMessage(sample.message);
    setSenderName(sample.sender_name);
    setSenderEmail(sample.sender_email);
    setSource(sample.source);
    setAccountName(sample.account_name || "");
    setAccountSize(sample.account_size || "SME");
    setResult(null);
    setError("");
  };

  const handleSubmit = async () => {
    if (!message || !senderName || !senderEmail) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          sender_name: senderName,
          sender_email: senderEmail,
          source,
          account_name: accountName || undefined,
          account_size: accountSize,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to process");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(`Network error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const priorityColor: Record<string, string> = {
    Critical: "bg-red-100 text-red-800 border-red-200",
    High: "bg-orange-100 text-orange-800 border-orange-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Low: "bg-green-100 text-green-800 border-green-200",
  };

  return (
    <div className="space-y-6">
      {/* Sample Messages */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Test - Load Sample Message</h3>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_MESSAGES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => loadSample(idx)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Submit Escalation Message</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Paste the escalation email/message here..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Sender Name *</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Rahul Sharma"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Sender Email *</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="rahul@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Source *</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as typeof source)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="Email">Email</option>
                  <option value="Slack">Slack</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Company Ltd"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Account Size</label>
                <select
                  value={accountSize}
                  onChange={(e) => setAccountSize(e.target.value as typeof accountSize)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="Enterprise">Enterprise</option>
                  <option value="Mid-Market">Mid-Market</option>
                  <option value="SME">SME</option>
                  <option value="Startup">Startup</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing through AI pipeline...
                </span>
              ) : (
                "Process Escalation"
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Automation Pipeline Output</h3>

          {!result && !loading && (
            <div className="flex h-64 items-center justify-center text-sm text-gray-400">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="mt-2">Submit a message to see the AI pipeline in action</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto h-10 w-10 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="mt-3 text-sm text-gray-500">Running pipeline...</p>
                <div className="mt-2 space-y-1 text-xs text-gray-400">
                  <p>1. Detecting escalation keywords...</p>
                  <p>2. AI summarization & analysis...</p>
                  <p>3. Calculating priority score...</p>
                  <p>4. Assigning owner...</p>
                  <p>5. Setting SLA deadline...</p>
                </div>
              </div>
            </div>
          )}

          {result && result.status === "skipped" && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="font-medium text-yellow-800">Not an Escalation</p>
              <p className="mt-1 text-sm text-yellow-700">{result.reason}</p>
              <p className="mt-2 text-xs text-yellow-600">This message was filtered out at Step 1. Try including words like &quot;urgent&quot;, &quot;issue&quot;, &quot;delayed&quot;, etc.</p>
            </div>
          )}

          {result && result.status === "processed" && result.pipeline && result.escalation && (
            <div className="space-y-4 text-sm">
              {/* Pipeline Steps */}
              <div className="space-y-3">
                {/* Step 1: Detection */}
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">1</div>
                  <div>
                    <p className="font-medium text-gray-700">Escalation Detected</p>
                    <p className="text-xs text-gray-500">Keywords matched in message</p>
                  </div>
                </div>

                {/* Step 2: AI Analysis */}
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">2</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-700">AI Analysis</p>
                    <div className="mt-1 rounded-lg bg-gray-50 p-3 text-xs space-y-1">
                      <p><span className="text-gray-500">Summary:</span> {result.pipeline.ai_analysis.summary}</p>
                      <p><span className="text-gray-500">Issue Type:</span> <span className="font-medium">{result.pipeline.ai_analysis.issue_type}</span></p>
                      <p><span className="text-gray-500">Sentiment:</span> <span className="font-medium capitalize">{result.pipeline.ai_analysis.sentiment}</span></p>
                      <p><span className="text-gray-500">Urgent:</span> <span className={`font-medium ${result.pipeline.ai_analysis.urgent === "yes" ? "text-red-600" : "text-green-600"}`}>{result.pipeline.ai_analysis.urgent.toUpperCase()}</span></p>
                      <p><span className="text-gray-500">Action Needed:</span> {result.pipeline.ai_analysis.action_needed}</p>
                    </div>
                  </div>
                </div>

                {/* Step 3: Priority */}
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">3</div>
                  <div>
                    <p className="font-medium text-gray-700">Priority Scoring</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityColor[result.pipeline.priority_scoring.priority] || ""}`}>
                        {result.pipeline.priority_scoring.priority}
                      </span>
                      <span className="text-xs text-gray-500">Score: {result.pipeline.priority_scoring.score}/100</span>
                    </div>
                  </div>
                </div>

                {/* Step 4: Owner */}
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">4</div>
                  <div>
                    <p className="font-medium text-gray-700">Owner Assigned</p>
                    <p className="text-xs text-gray-600 mt-0.5">{result.pipeline.owner_assignment}</p>
                  </div>
                </div>

                {/* Step 5: SLA */}
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">5</div>
                  <div>
                    <p className="font-medium text-gray-700">SLA Deadline Set</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {new Date(result.pipeline.sla.deadline).toLocaleString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Final Record */}
              <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                <p className="text-xs font-semibold text-indigo-700 mb-2">Created Escalation Record</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-indigo-500">ID:</span> <span className="font-mono font-medium">{result.escalation.id}</span></div>
                  <div><span className="text-indigo-500">Title:</span> {result.escalation.title}</div>
                  <div><span className="text-indigo-500">Priority:</span> {result.escalation.priority} ({result.escalation.priorityScore}/100)</div>
                  <div><span className="text-indigo-500">Owner:</span> {result.escalation.owner}</div>
                  <div><span className="text-indigo-500">Category:</span> {result.escalation.category}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Automation Pipeline Architecture</h3>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          {[
            { label: "Email/Slack/WhatsApp", color: "bg-blue-100 text-blue-700 border-blue-200" },
            { label: "Webhook /api/ingest", color: "bg-purple-100 text-purple-700 border-purple-200" },
            { label: "Escalation Filter", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
            { label: "AI Summarization", color: "bg-green-100 text-green-700 border-green-200" },
            { label: "Priority Scoring", color: "bg-orange-100 text-orange-700 border-orange-200" },
            { label: "Owner Assignment", color: "bg-red-100 text-red-700 border-red-200" },
            { label: "SLA Tracking", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
            { label: "Dashboard", color: "bg-gray-800 text-white border-gray-700" },
          ].map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`rounded-lg border px-3 py-2 font-medium ${step.color}`}>
                {step.label}
              </div>
              {idx < 7 && <span className="text-gray-400 text-lg">&rarr;</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
