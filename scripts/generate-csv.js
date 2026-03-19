// Generate CSV from the dummy data for Google Sheets
// Run: node scripts/generate-csv.js

const fs = require('fs');
const path = require('path');

// ── Real examples from the Plum assignment PDF ──
const realExamples = [
  {
    id: "ESC-0001",
    title: "Service Complaint - Post Policy Issuance Support Failure",
    summary: "Customer extremely disappointed with post-sale service. Claim reimbursement process is complex - portal issues, strict document format requirements, website failures. Requesting offline submission option. Threatening to not recommend Plum to HR community.",
    accountName: "Manufacturing SME Client",
    accountSize: "SME",
    category: "Service Complaint",
    source: "Email",
    priority: "High",
    priorityScore: 72,
    status: "Open",
    owner: "Avik Bhandari",
    actionNeeded: "Decision",
    createdAt: "2026-03-10T09:30:00Z",
    updatedAt: "2026-03-10T09:30:00Z",
    slaDeadline: "2026-03-10T21:30:00Z",
    responseTime: null,
    resolutionTime: null,
    isBreachingSLA: true,
    rawMessage: "Dear Avik, I am extremely disappointed with the level of service and support provided by your company post policy issuance. Your service appears to be effective only during the sales process. Once a claim arises, the support structure is practically non-existent. We recently had a claim under our policy and opted for reimbursement. The portal is highly complex, there are specific format requirements, and the website failed after uploading. I am seriously reconsidering my decision to choose your platform over a traditional offline agent.",
    senderName: "HR Manager",
    senderEmail: "hr@manufacturing-sme.com"
  },
  {
    id: "ESC-0002",
    title: "General Inquiry - Insurance Referral Request",
    summary: "Non-escalation: Someone's brother is looking for insurance for his firm. Simple referral/lead request, not an actual issue.",
    accountName: "Unknown",
    accountSize: "Startup",
    category: "General Inquiry",
    source: "Email",
    priority: "Low",
    priorityScore: 10,
    status: "Closed",
    owner: "Susmita Roy",
    actionNeeded: "Follow-up",
    createdAt: "2026-03-12T14:00:00Z",
    updatedAt: "2026-03-13T10:00:00Z",
    slaDeadline: "2026-03-14T14:00:00Z",
    responseTime: 2,
    resolutionTime: 20,
    isBreachingSLA: false,
    rawMessage: "Hi Avik, My brother is looking for an insurance for his firm. Can you reach out to him? Regards,",
    senderName: "Contact",
    senderEmail: "contact@referral.com"
  },
  {
    id: "ESC-0003",
    title: "Endorsement Pending - Employee Addition Delayed",
    summary: "Payment made on 20/02/2026 to add employee. Website says 3-5 working days but it's been 8+ days (28/02/2026). Still following up with no resolution.",
    accountName: "Client Company",
    accountSize: "SME",
    category: "Endorsement Pending",
    source: "Email",
    priority: "Medium",
    priorityScore: 45,
    status: "In Progress",
    owner: "Vaishnavi Bhat",
    actionNeeded: "Follow-up",
    createdAt: "2026-02-28T10:00:00Z",
    updatedAt: "2026-03-02T11:00:00Z",
    slaDeadline: "2026-03-01T10:00:00Z",
    responseTime: 4,
    resolutionTime: null,
    isBreachingSLA: true,
    rawMessage: "Dear All, We have made payment on 20/02/2026 to add an employee. As per your website/process it takes 3-5 working days which also has elapsed. Today is 28/02/2026 and still am following up. Wondering when will this get done? Warm Regards, Karan",
    senderName: "Karan",
    senderEmail: "karan@client-company.com"
  },
  {
    id: "ESC-0004",
    title: "General Inquiry - Request to Call",
    summary: "Very brief email - just 'Request to call'. No details about issue. Needs acknowledgement and callback.",
    accountName: "Unknown",
    accountSize: "SME",
    category: "General Inquiry",
    source: "Email",
    priority: "Low",
    priorityScore: 15,
    status: "Closed",
    owner: "Vidushi M",
    actionNeeded: "Acknowledgement",
    createdAt: "2026-03-14T16:00:00Z",
    updatedAt: "2026-03-14T17:30:00Z",
    slaDeadline: "2026-03-16T16:00:00Z",
    responseTime: 1.5,
    resolutionTime: 1.5,
    isBreachingSLA: false,
    rawMessage: "Dear Avik, Request to call. Regards.",
    senderName: "Client",
    senderEmail: "client@company.com"
  },
  {
    id: "ESC-0005",
    title: "Training Request - Dedicated App Training Needed",
    summary: "Employees haven't started using the Plum app. Tax invoices still pending. Previous common training session was not engaging. Requesting dedicated training for their team. Warning that benefits may go unused due to lack of awareness.",
    accountName: "Client Organization",
    accountSize: "Mid-Market",
    category: "Training Request",
    source: "Email",
    priority: "Medium",
    priorityScore: 38,
    status: "Open",
    owner: "Vidushi M",
    actionNeeded: "Follow-up",
    createdAt: "2026-03-08T11:00:00Z",
    updatedAt: "2026-03-08T11:00:00Z",
    slaDeadline: "2026-03-09T11:00:00Z",
    responseTime: null,
    resolutionTime: null,
    isBreachingSLA: true,
    rawMessage: "Hi Mr Avik, At the moment, I do not have any feedback to share, as none of our employees have started using the app yet. I have also requested the tax invoices, which are still pending. Additionally, I had requested a dedicated training session for our employees on how to use the Plum app. The session we attended was not very engaging, and our employees were unable to ask questions or fully understand the application. It would be appreciated if you could arrange a proper training session specifically for our team. Otherwise, the benefits may go unused due to lack of awareness. Looking forward to your support. Regards,",
    senderName: "HR Head",
    senderEmail: "hr@client-org.com"
  },
  {
    id: "ESC-0006",
    title: "Service Complaint - Dissatisfied with Survey & Past Escalations",
    summary: "Customer absolutely not satisfied. Refuses to recommend Plum in HR community. Won't fill survey due to unresolved past escalations. Strong negative sentiment.",
    accountName: "Dissatisfied Client",
    accountSize: "Mid-Market",
    category: "Service Complaint",
    source: "Email",
    priority: "High",
    priorityScore: 65,
    status: "Open",
    owner: "Avik Bhandari",
    actionNeeded: "Decision",
    createdAt: "2026-03-11T08:00:00Z",
    updatedAt: "2026-03-11T08:00:00Z",
    slaDeadline: "2026-03-11T20:00:00Z",
    responseTime: null,
    resolutionTime: null,
    isBreachingSLA: true,
    rawMessage: "I am absolutely not satisfied and trust me I am not going to put a good word for Plum to anyone in HR community. I don't want to waste my time in filling the survey as I have not seen any improvement for the past escalations as well. With Gratitude,",
    senderName: "HR Director",
    senderEmail: "hr.director@mid-market.com"
  },
  {
    id: "ESC-0007",
    title: "Cashless Failure - Emergency Medical Situation with Multiple Failures",
    summary: "Critical: Employee medical emergency (Rahul Gaur, Emp ID PM0227, Claim 82086141). Cashless facility issue due to missing Health ID. Multiple failures: lack of emergency support, unresponsive contact channels, unprofessional POC behavior, unanswered emails. Threatening legal action, IRDAI complaint, social media escalation, and non-renewal.",
    accountName: "Enterprise Client",
    accountSize: "Enterprise",
    category: "Cashless Failure",
    source: "Email",
    priority: "Critical",
    priorityScore: 95,
    status: "Open",
    owner: "Avik Bhandari",
    actionNeeded: "Decision",
    createdAt: "2026-03-15T07:00:00Z",
    updatedAt: "2026-03-15T07:00:00Z",
    slaDeadline: "2026-03-15T11:00:00Z",
    responseTime: null,
    resolutionTime: null,
    isBreachingSLA: true,
    rawMessage: "Dear Plum Team, I am writing to formally escalate the unacceptable service and deeply frustrating experience we encountered during a recent employee medical emergency involving Rahul Gaur (Emp ID: PM0227, Claim Number: 82086141). The entire process was unnecessarily complicated and highly stressful. Key failures: 1. Lack of Support in Emergency 2. Unresponsive Contact Channels 3. Unprofessional Behavior from POC 4. Failure to Issue Health IDs 5. Business POC Unavailability. We will not be renewing our policy with Plum. We will be forced to pursue legal avenues and share detailed accounts through word-of-mouth and public feedback channels.",
    senderName: "HR VP",
    senderEmail: "hr.vp@enterprise-client.com"
  },
  {
    id: "ESC-0008",
    title: "Claim Delayed - Awaiting IL Revert, Potential Social/IRDAI Escalation",
    summary: "Slack thread: Claim stuck awaiting revert from IL (insurer). User threatening social media escalation and IRDAI complaint. Claim needs to be processed as business exception per UW approval. Calls from user getting disconnected on hotline. Multiple team members involved over 15+ days.",
    accountName: "Sensitive Account",
    accountSize: "Mid-Market",
    category: "Claim Delayed",
    source: "Slack",
    priority: "Critical",
    priorityScore: 88,
    status: "In Progress",
    owner: "Vaishnavi Bhat",
    actionNeeded: "Unblock",
    createdAt: "2026-01-15T16:09:00Z",
    updatedAt: "2026-01-30T17:58:00Z",
    slaDeadline: "2026-01-15T20:09:00Z",
    responseTime: 1,
    resolutionTime: null,
    isBreachingSLA: true,
    rawMessage: "Slack Thread: Vidushi M (Jan 15): Any updates on this? | Vaishnavi Bhat (Jan 16): Awaiting revert from IL, will update on timeline. | Vidushi M (Jan 19): User not okay with delay, potential social media escalation, mentions IRDAI. | Vaishnavi Bhat (Jan 21): Claim to be processed as business exception, awaiting UW approval. TAT by next Friday. | Also calls from user getting disconnected on hotline. | Vidushi M (Jan 30): When will this be resolved? Informed user it would be settled this week. | Arun Saseedharan (Jan 30): @Avik Bhandari for your eyes - this might go as social escalation.",
    senderName: "Vidushi M",
    senderEmail: "vidushi@plumhq.com"
  },
  {
    id: "ESC-0009",
    title: "Account Data Error - Incorrect Onboarding Data, Full Restart Needed",
    summary: "Slack: All information provided are incorrect starting from premium to EIDs. Dashboard set up and policy placed but data is wrong. Entire onboarding needs to restart. Very sensitive customer. Multiple senior people tagged including Avik Bhandari.",
    accountName: "Sensitive Enterprise Customer",
    accountSize: "Enterprise",
    category: "Account Data Error",
    source: "Slack",
    priority: "Critical",
    priorityScore: 85,
    status: "Open",
    owner: "Akshay Golechha",
    actionNeeded: "Unblock",
    createdAt: "2025-11-11T12:27:00Z",
    updatedAt: "2025-11-11T12:27:00Z",
    slaDeadline: "2025-11-11T16:27:00Z",
    responseTime: null,
    resolutionTime: null,
    isBreachingSLA: true,
    rawMessage: "Slack Thread: Manashi (Nov 10): Need change - GWP (Exc GST) For All Products Sold should be INR 1,53,991 + GST for GMC & GPA. | Susmita (Nov 11): @Manashi All information provided are incorrect starting from premium to EIDs. Dashboard set up and policy is also placed. To change the EIDs now we have to take product help and the whole onboarding has to be restarted. This is a very sensitive customer. @Vakti Vedant Panda FYI @Manashi Please help manage any escalation here. @Akshay Golechha @Avik Bhandari @Prakrut",
    senderName: "Susmita Roy",
    senderEmail: "susmita@plumhq.com"
  },
  {
    id: "ESC-0010",
    title: "Claim Rejected - DUR Pendency, Exception Processing Needed",
    summary: "Slack: Multiple claims need fast-tracking. One claim (chirag.gupta) rejected as valid day care summary not provided. Claim to be processed as exception per discussion with Avik. DUR raised for consultation paper and self-attestation. BF5278 DUR Pendency closed but needs review.",
    accountName: "Key Account",
    accountSize: "Mid-Market",
    category: "Claim Rejected",
    source: "Slack",
    priority: "High",
    priorityScore: 70,
    status: "In Progress",
    owner: "Ipsita Sahu",
    actionNeeded: "Decision",
    createdAt: "2025-09-04T15:37:00Z",
    updatedAt: "2025-09-09T18:23:00Z",
    slaDeadline: "2025-09-05T03:37:00Z",
    responseTime: 1,
    resolutionTime: null,
    isBreachingSLA: true,
    rawMessage: "Slack Thread: Mikhel Dhiman (Sep 4): Following recent call where director was present, discussion didn't go as expected. Please draft email with claim details and next steps. Involve @Avik Bhandari to escalate with insurer. | Arun Chacko: Will review all open claims by tomorrow. | Ipsita Sahu: BF5278 DUR Pendency Closed - @Rajorshi can you review the DURs? | Arun Chacko (Sep 8): @Abhishek Ranjan Please fastrack claims. | Arun Chacko (Sep 9): First claim of chirag.gupta rejected as valid day care summary not provided. Will process as exception per Avik's discussion. | Subash P: Communicated to user about exception processing.",
    senderName: "Mikhel Dhiman",
    senderEmail: "mikhel@plumhq.com"
  }
];

// ── Additional generated data (from data.ts patterns) ──
const owners = [
  "Avik Bhandari", "Vaishnavi Bhat", "Vidushi M", "Arun Saseedharan",
  "Ipsita Sahu", "Mikhel Dhiman", "Susmita Roy", "Rajorshi Chowdhury",
  "Akshay Golechha", "Prakrut Shah", "Subash P", "Manashi Das",
  "Rather Faisal", "Abhishek Ranjan", "Nishita Kapoor"
];

const companies = [
  { name: "Tata Consultancy Services", size: "Enterprise" },
  { name: "Wipro Technologies", size: "Enterprise" },
  { name: "Infosys BPO", size: "Enterprise" },
  { name: "Reliance Industries", size: "Enterprise" },
  { name: "Mahindra & Mahindra", size: "Enterprise" },
  { name: "HCL Technologies", size: "Enterprise" },
  { name: "Godrej Consumer Products", size: "Enterprise" },
  { name: "Larsen & Toubro", size: "Enterprise" },
  { name: "Zoho Corporation", size: "Mid-Market" },
  { name: "Freshworks Inc", size: "Mid-Market" },
  { name: "Razorpay Software", size: "Mid-Market" },
  { name: "PolicyBazaar", size: "Mid-Market" },
  { name: "Lenskart Solutions", size: "Mid-Market" },
  { name: "PharmEasy Health", size: "Mid-Market" },
  { name: "Swiggy Pvt Ltd", size: "Mid-Market" },
  { name: "CRED Financial", size: "Mid-Market" },
  { name: "NxtWave Disruptive Tech", size: "SME" },
  { name: "Simplilearn Solutions", size: "SME" },
  { name: "Testbook Edu Solutions", size: "SME" },
  { name: "Upgrad Education", size: "SME" },
  { name: "Groww Investments", size: "SME" },
  { name: "Jupiter Money", size: "SME" },
  { name: "Zerodha Broking", size: "SME" },
  { name: "Park+ Technologies", size: "SME" },
  { name: "CodeNation Innovation", size: "Startup" },
  { name: "Hyperface Technologies", size: "Startup" },
  { name: "BetterPlace Safety", size: "Startup" },
  { name: "Jar App Fintech", size: "Startup" },
  { name: "Kuku FM Audio", size: "Startup" },
  { name: "Salt Fintech", size: "Startup" },
];

const categories = [
  "Claim Delayed", "Claim Rejected", "Policy Issuance", "Onboarding Issue",
  "Health ID Missing", "Portal/Tech Issue", "Cashless Failure", "Reimbursement Delay",
  "Premium Discrepancy", "Endorsement Pending", "Renewal Issue", "Service Complaint",
  "Training Request", "Account Data Error", "Network Hospital Issue", "TPA Coordination",
  "Document Issue", "Billing/Invoice Issue", "Coverage Query", "General Inquiry"
];

const sources = ["Email", "Slack", "WhatsApp"];
const priorities = ["Critical", "High", "Medium", "Low"];
const statuses = ["Open", "In Progress", "Blocked", "Closed"];
const actions = ["Decision", "Follow-up", "Unblock", "Acknowledgement", "Investigation"];

const senderNames = [
  "Rahul Sharma", "Priya Mehta", "Ankit Verma", "Deepa Nair", "Vikram Singh",
  "Neha Gupta", "Karan Patel", "Sneha Iyer", "Rohit Joshi", "Meera Krishnan",
  "Arjun Reddy", "Pooja Bansal", "Saurabh Mishra", "Kavita Rao", "Aditya Kapoor",
  "Ritika Saxena", "Varun Malhotra", "Nandini Desai", "Harsh Agarwal", "Divya Pillai",
  "Siddharth Bhatt", "Anjali Menon", "Rajesh Kumar", "Sunita Devi", "Manish Tiwari",
  "Preeti Chauhan", "Nikhil Jain", "Swati Pandey", "Amit Thakur", "Ruchi Srivastava"
];

const summaryTemplates = {
  "Claim Delayed": [
    "Claim #{claimId} pending for {days} days with no update. Employee {emp} hospitalized at {hospital}. HR escalating due to no response from claims team.",
    "Reimbursement claim submitted {days} days ago, still under review. Multiple follow-ups sent. Employee's family incurred out-of-pocket expenses.",
    "Group claim for {count} employees stuck in processing. TPA not responding. Account threatening to switch insurers if not resolved within {days} days."
  ],
  "Claim Rejected": [
    "Claim rejected citing pre-existing condition but employee disclosed condition during enrollment. Requesting review and exception processing.",
    "Day care claim rejected - valid day care summary not provided. Need to process as exception per management discussion.",
    "Cashless claim converted to reimbursement was rejected on technicality. Hospital confirmed treatment was covered under policy terms."
  ],
  "Cashless Failure": [
    "Emergency hospitalization at {hospital}. Cashless request rejected - system showing policy inactive despite renewal last month. Hospital demanding {amount} deposit.",
    "Cashless facility denied at network hospital. TPA system downtime caused failure. Patient had to pay out of pocket for surgery.",
    "Pre-authorized cashless for planned surgery denied at last minute. Patient already admitted. Hospital threatening to discharge."
  ],
  "Onboarding Issue": [
    "Signed up {days} days ago. None of the {count} employees received health cards or portal credentials. Multiple emails sent, no response.",
    "Policy issued but member data not uploaded correctly. {count} employees showing wrong names and DOBs. HR unable to distribute cards.",
    "Onboarding promised in 5 business days, now {days} days. New joinees cannot avail benefits. HR receiving daily complaints."
  ],
  "Health ID Missing": [
    "Health IDs not issued for {count} employees despite multiple follow-ups over {days} days. Employees unable to use cashless facility.",
    "E-cards showing error for entire department. {count} members affected. Some have medical appointments scheduled this week.",
    "Health ID generation failed for bulk upload of {count} members. System error not resolved. Blocking cashless claims."
  ],
  "Portal/Tech Issue": [
    "Portal login failing for all HR admins since {days} days. Unable to manage endorsements or view claims status. Urgent fix needed.",
    "Document upload failing repeatedly. Specific format requirements not clearly mentioned. Website crashed after lengthy upload process.",
    "Mobile app not loading member benefits. {count} employees reported the issue. App shows blank screen after login."
  ],
  "Service Complaint": [
    "Extremely disappointed with post-sale service. Support non-existent after policy issuance. Considering not recommending Plum to HR community.",
    "Multiple escalations raised over {days} days with no resolution. Customer refusing to fill satisfaction survey. Threatening negative publicity.",
    "Relationship manager unresponsive for {days} days. Account feels neglected. Board-level discussion about switching providers."
  ],
  "Renewal Issue": [
    "Renewal due in {days} days but no proposal received. Previous year had claim issues that need addressing before renewal discussion.",
    "Renewal quote received with {pct}% premium hike. Account pushing back. Competitor offering lower rates. Need retention strategy.",
    "Policy lapsed due to payment processing failure. Employees currently uncovered. Urgent reinstatement needed."
  ],
  "Reimbursement Delay": [
    "Reimbursement of Rs {amount} pending for {days} days. All documents submitted. No communication on status.",
    "{count} reimbursement claims from same account all stuck. Total outstanding: Rs {amount}. HR demanding immediate resolution.",
    "Reimbursement approved but payment not received for {days} days. Finance team confirmed no payment processed."
  ],
  "Premium Discrepancy": [
    "Premium charged doesn't match quote. Difference of Rs {amount}. Account requesting clarification and adjustment.",
    "GST calculation incorrect on premium invoice. Overcharged by Rs {amount}. Finance team flagged the discrepancy.",
    "Mid-term premium adjustment not reflecting after {count} member deletions. Account paying for more members than enrolled."
  ],
  "Endorsement Pending": [
    "Payment made {days} days ago to add {count} employees. Process should take 3-5 days but still pending. HR following up daily.",
    "Employee deletion request pending for {days} days. Account being charged for departed employees.",
    "Bulk endorsement of {count} new joinees submitted {days} days ago. No confirmation received. New employees can't avail benefits."
  ],
  "Network Hospital Issue": [
    "{hospital} removed from network without notice. {count} employees mid-treatment affected. Need urgent resolution.",
    "Network hospital refusing Plum cards citing non-payment from TPA. {count} cases affected this month.",
    "Hospital empanelment request pending for {days} days. Key hospital in {city} where majority employees are based."
  ],
  "TPA Coordination": [
    "TPA not processing claims within SLA. {count} claims pending beyond 15 days. Account escalating to management.",
    "TPA helpline unreachable for {days} days. Employees unable to get claim status updates.",
    "TPA provided incorrect pre-auth amount. Hospital billed the difference to patient. Need correction and patient communication."
  ],
  "Document Issue": [
    "Documents uploaded but system not accepting format. Color vs B&W and placement requirements unclear. Repeated uploads failing.",
    "Requested offline document submission option. No response in {days} days. Employee chasing Plum team for documents acceptance.",
    "Claim documents submitted via email as portal failed. No acknowledgement received for {days} days."
  ],
  "Billing/Invoice Issue": [
    "Tax invoices requested {days} days ago, still pending. Finance team needs for quarterly filing.",
    "Invoice shows incorrect GST number. Needs correction urgently for compliance. Requested {days} days ago.",
    "Credit note for member deletions not issued. Outstanding amount of Rs {amount} to be adjusted."
  ],
  "Coverage Query": [
    "HR asking about dental coverage under current plan. Need list of covered procedures for employee communication.",
    "Employee asking if maternity coverage applies to new joinees. Waiting period clarification needed.",
    "Query about room rent capping and its applicability across network hospitals."
  ],
  "General Inquiry": [
    "Request for a callback from Avik. No details provided about the nature of inquiry.",
    "Brother looking for insurance for his firm. Referral request, not an escalation.",
    "Requesting overview meeting to discuss policy utilization and upcoming renewal."
  ],
  "Training Request": [
    "Employees haven't started using Plum app. Previous training session not engaging. Requesting dedicated session for their team.",
    "New HR team joined. Need fresh training on portal, claims process, and employee communication. {count} HR members to be trained.",
    "Request for on-site training at {city} office for {count} employees on how to use health benefits."
  ],
  "Account Data Error": [
    "All information incorrect from premium to EIDs. Dashboard set up and policy placed with wrong data. Entire onboarding needs restart. Very sensitive customer.",
    "Employee names misspelled in {count} health cards. Cannot be used at hospitals. Urgent reissue needed.",
    "Wrong sum insured mapped to {count} employees. Some showing Rs 3L instead of Rs 5L. Active claims affected."
  ]
};

const hospitals = ["Max Hospital", "Apollo Hospital", "Fortis Hospital", "Medanta", "Manipal Hospital", "AIIMS", "Lilavati Hospital", "Kokilaben Hospital"];
const cities = ["Mumbai", "Bangalore", "Delhi", "Hyderabad", "Pune", "Chennai", "Kolkata", "Gurgaon"];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function fillTemplate(template) {
  return template
    .replace(/{claimId}/g, `CLM-2026-${randInt(1000, 9999)}`)
    .replace(/{days}/g, String(randInt(3, 45)))
    .replace(/{count}/g, String(randInt(5, 200)))
    .replace(/{emp}/g, rand(senderNames))
    .replace(/{hospital}/g, rand(hospitals))
    .replace(/{amount}/g, String(randInt(10000, 500000)))
    .replace(/{pct}/g, String(randInt(15, 45)))
    .replace(/{city}/g, rand(cities));
}

function generateEscalation(idx) {
  const company = rand(companies);
  const cat = rand(categories);
  const source = rand(sources);
  const templates = summaryTemplates[cat] || summaryTemplates["General Inquiry"];
  const summary = fillTemplate(rand(templates));
  const sender = rand(senderNames);

  // Priority scoring
  let score = randInt(10, 95);
  let priority;
  if (score >= 70) priority = "Critical";
  else if (score >= 50) priority = "High";
  else if (score >= 30) priority = "Medium";
  else priority = "Low";

  // Status distribution: 30% Open, 20% In Progress, 10% Blocked, 40% Closed
  const statusRoll = Math.random();
  let status;
  if (statusRoll < 0.30) status = "Open";
  else if (statusRoll < 0.50) status = "In Progress";
  else if (statusRoll < 0.60) status = "Blocked";
  else status = "Closed";

  // Dates
  const daysAgo = randInt(1, 60);
  const created = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const updated = new Date(created.getTime() + randInt(1, Math.min(daysAgo, 10)) * 24 * 60 * 60 * 1000);

  const slaHours = { Critical: 4, High: 12, Medium: 24, Low: 48 };
  const deadline = new Date(created.getTime() + slaHours[priority] * 60 * 60 * 1000);
  const isBreaching = status !== "Closed" && new Date() > deadline;

  const responseTime = status !== "Open" ? randInt(1, 24) : null;
  const resolutionTime = status === "Closed" ? randInt(24, 480) : null;

  const owner = rand(owners);

  return {
    id: `ESC-${String(idx).padStart(4, "0")}`,
    title: `${cat} - ${company.name}`,
    summary,
    accountName: company.name,
    accountSize: company.size,
    category: cat,
    source,
    priority,
    priorityScore: score,
    status,
    owner,
    actionNeeded: rand(actions),
    createdAt: created.toISOString(),
    updatedAt: updated.toISOString(),
    slaDeadline: deadline.toISOString(),
    responseTime,
    resolutionTime,
    isBreachingSLA: isBreaching,
    rawMessage: summary,
    senderName: sender,
    senderEmail: `${sender.toLowerCase().replace(/ /g, ".")}@${company.name.toLowerCase().replace(/[^a-z]/g, "")}.com`
  };
}

// Generate: 10 real examples + 110 generated = 120 total
const allData = [...realExamples];
for (let i = 11; i <= 120; i++) {
  allData.push(generateEscalation(i));
}

// ── Generate CSV ──
const headers = [
  "ID", "Title", "Summary", "Account Name", "Account Size", "Category",
  "Source", "Priority", "Priority Score", "Status", "Owner", "Action Needed",
  "Created At", "Updated At", "SLA Deadline", "Response Time (hrs)",
  "Resolution Time (hrs)", "SLA Breached", "Sender Name", "Sender Email", "Raw Message"
];

function escapeCSV(val) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const rows = [headers.join(",")];
for (const e of allData) {
  rows.push([
    e.id, e.title, e.summary, e.accountName, e.accountSize, e.category,
    e.source, e.priority, e.priorityScore, e.status, e.owner, e.actionNeeded,
    e.createdAt, e.updatedAt, e.slaDeadline, e.responseTime,
    e.resolutionTime, e.isBreachingSLA, e.senderName, e.senderEmail, e.rawMessage
  ].map(escapeCSV).join(","));
}

const csvPath = path.join(__dirname, "..", "public", "plum-escalations.csv");
fs.writeFileSync(csvPath, rows.join("\n"), "utf8");
console.log(`CSV generated: ${csvPath}`);
console.log(`Total rows: ${allData.length}`);
console.log(`Real examples from PDF: ${realExamples.length}`);
console.log(`Generated examples: ${allData.length - realExamples.length}`);
