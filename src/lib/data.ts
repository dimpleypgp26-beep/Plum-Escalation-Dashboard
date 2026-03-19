export type Priority = "Critical" | "High" | "Medium" | "Low";
export type Status = "Open" | "In Progress" | "Blocked" | "Closed";
export type Source = "Email" | "Slack" | "WhatsApp";
export type ActionNeeded = "Decision" | "Follow-up" | "Unblock" | "Acknowledgement" | "Investigation";
export type IssueCategory =
  | "Claim Delayed"
  | "Claim Rejected"
  | "Policy Issuance"
  | "Onboarding Issue"
  | "Health ID Missing"
  | "Portal/Tech Issue"
  | "Cashless Failure"
  | "Reimbursement Delay"
  | "Premium Discrepancy"
  | "Endorsement Pending"
  | "Renewal Issue"
  | "Service Complaint"
  | "Training Request"
  | "Account Data Error"
  | "Network Hospital Issue"
  | "TPA Coordination"
  | "Document Issue"
  | "Billing/Invoice Issue"
  | "Coverage Query"
  | "General Inquiry";

export interface Escalation {
  id: string;
  title: string;
  summary: string;
  accountName: string;
  accountSize: "Enterprise" | "Mid-Market" | "SME" | "Startup";
  category: IssueCategory;
  source: Source;
  priority: Priority;
  priorityScore: number;
  status: Status;
  owner: string;
  actionNeeded: ActionNeeded;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  responseTime: number | null; // hours
  resolutionTime: number | null; // hours
  isBreachingSLA: boolean;
  rawMessage: string;
  senderName: string;
  senderEmail: string;
}

// ── Realistic Plum Insurance names and companies ──

const owners = [
  "Avik Bhandari", "Vaishnavi Bhat", "Vidushi M", "Arun Saseedharan",
  "Ipsita Sahu", "Mikhel Dhiman", "Susmita Roy", "Rajorshi Chowdhury",
  "Akshay Golechha", "Prakrut Shah", "Subash P", "Manashi Das",
  "Rather Faisal", "Abhishek Ranjan", "Nishita Kapoor"
];

const companies = [
  { name: "Tata Consultancy Services", size: "Enterprise" as const },
  { name: "Wipro Technologies", size: "Enterprise" as const },
  { name: "Infosys BPO", size: "Enterprise" as const },
  { name: "Reliance Industries", size: "Enterprise" as const },
  { name: "Mahindra & Mahindra", size: "Enterprise" as const },
  { name: "Bharti Airtel", size: "Enterprise" as const },
  { name: "HCL Technologies", size: "Enterprise" as const },
  { name: "Godrej Consumer Products", size: "Enterprise" as const },
  { name: "Larsen & Toubro", size: "Enterprise" as const },
  { name: "Asian Paints", size: "Enterprise" as const },
  { name: "Zoho Corporation", size: "Mid-Market" as const },
  { name: "Freshworks Inc", size: "Mid-Market" as const },
  { name: "Razorpay Software", size: "Mid-Market" as const },
  { name: "PolicyBazaar", size: "Mid-Market" as const },
  { name: "Lenskart Solutions", size: "Mid-Market" as const },
  { name: "PharmEasy Health", size: "Mid-Market" as const },
  { name: "UrbanClap (Urban Company)", size: "Mid-Market" as const },
  { name: "Swiggy Pvt Ltd", size: "Mid-Market" as const },
  { name: "CRED Financial", size: "Mid-Market" as const },
  { name: "Meesho Technologies", size: "Mid-Market" as const },
  { name: "NxtWave Disruptive Tech", size: "SME" as const },
  { name: "Simplilearn Solutions", size: "SME" as const },
  { name: "Testbook Edu Solutions", size: "SME" as const },
  { name: "Upgrad Education", size: "SME" as const },
  { name: "Groww Investments", size: "SME" as const },
  { name: "Jupiter Money", size: "SME" as const },
  { name: "Zerodha Broking", size: "SME" as const },
  { name: "Leap Finance", size: "SME" as const },
  { name: "Park+ Technologies", size: "SME" as const },
  { name: "Pocket FM Audio", size: "SME" as const },
  { name: "CodeNation Innovation", size: "Startup" as const },
  { name: "Hyperface Technologies", size: "Startup" as const },
  { name: "BetterPlace Safety", size: "Startup" as const },
  { name: "Jar App Fintech", size: "Startup" as const },
  { name: "Kuku FM Audio", size: "Startup" as const },
  { name: "OneCode Technologies", size: "Startup" as const },
  { name: "Salt Fintech", size: "Startup" as const },
  { name: "Refyne Earned Wage", size: "Startup" as const },
  { name: "Rocketlane Project", size: "Startup" as const },
  { name: "Toplyne Growth", size: "Startup" as const },
];

const senderFirstNames = [
  "Rahul", "Priya", "Arun", "Sneha", "Karan", "Anita", "Vikram", "Deepa",
  "Suresh", "Meera", "Rajesh", "Pooja", "Amit", "Kavita", "Sanjay",
  "Divya", "Nikhil", "Swati", "Manoj", "Ritu", "Gaurav", "Neha",
  "Ashok", "Pallavi", "Rohan", "Jyoti", "Tarun", "Shilpa", "Varun", "Aarti"
];

const senderLastNames = [
  "Sharma", "Patel", "Gupta", "Singh", "Kumar", "Joshi", "Verma", "Nair",
  "Reddy", "Iyer", "Chopra", "Malhotra", "Bhatia", "Kapoor", "Mehta",
  "Agarwal", "Sinha", "Das", "Mukherjee", "Banerjee"
];

// ── Escalation templates by category ──

interface EscalationTemplate {
  category: IssueCategory;
  titles: string[];
  summaries: string[];
  rawMessages: string[];
  actionNeeded: ActionNeeded[];
}

const templates: EscalationTemplate[] = [
  {
    category: "Claim Delayed",
    titles: [
      "Claim pending for over 30 days – no updates",
      "Urgent: Employee hospitalization claim stuck in processing",
      "Multiple claims delayed beyond TAT – account at risk",
      "Cashless claim approval delayed – patient still admitted",
      "Reimbursement claim pending since 3 weeks",
    ],
    summaries: [
      "Employee claim #CLM-XXXX has been pending for 30+ days with no status update from TPA. Client HR escalating internally.",
      "Hospitalized employee's cashless claim stuck at TPA level. Hospital threatening to convert to cash payment. Immediate intervention needed.",
      "3 claims from this account are past SLA. Client is a key enterprise account and threatening to not renew policy.",
      "Cashless approval for surgery pending 48hrs. Hospital needs confirmation today or patient pays out of pocket.",
      "Reimbursement submitted 3 weeks ago. All documents verified but payment not processed. Employee following up daily with HR.",
    ],
    rawMessages: [
      "Dear Avik, We have 3 pending claims that have crossed the 30-day mark. Despite multiple follow-ups, we haven't received any updates. Our employees are getting frustrated and this reflects poorly on our HR team. Please intervene.",
      "Hi team, URGENT - Our employee Rahul Gaur is currently admitted at Apollo Hospital. The cashless request was sent 48 hours ago but no approval yet. The hospital says they'll convert to reimbursement if not approved by today. Claim Number: 82086141.",
      "Avik, This is unacceptable. We've had 3 claims stuck for weeks now. If this isn't resolved by EOW, we'll have to reconsider our partnership with Plum for next year's renewal.",
      "Dear All, Employee surgery was scheduled yesterday. Cashless still not approved. Hospital is asking the patient to arrange funds. This is a medical emergency.",
      "Hi Mr Avik, My reimbursement claim was submitted on Feb 5th with all required documents. It's been 3 weeks and the status still shows 'Under Review'. Can someone please expedite?",
    ],
    actionNeeded: ["Unblock", "Unblock", "Decision", "Unblock", "Follow-up"],
  },
  {
    category: "Claim Rejected",
    titles: [
      "Claim rejected due to documentation – client disputing",
      "Pre-existing condition rejection – needs review",
      "Daycare claim rejected – valid procedure per policy",
      "Rejection reversed but payment still pending",
      "Bulk rejection for an account – possible system issue",
    ],
    summaries: [
      "Claim rejected for insufficient documentation but client says all docs were submitted via portal. Possible upload failure.",
      "Claim denied citing pre-existing condition. Employee joined policy 2 years ago with no exclusion clause. Client requesting policy review.",
      "Daycare procedure claim rejected saying 'not covered'. However, the procedure is listed in the policy schedule. Needs TPA correction.",
      "Previously rejected claim was approved on appeal last week, but reimbursement amount hasn't been credited. Employee frustrated.",
      "5 claims from same account rejected in one batch. Pattern suggests automated rule may have incorrectly flagged them.",
    ],
    rawMessages: [
      "We uploaded all documents through the portal and even emailed backup copies. The rejection saying 'documents missing' is incorrect. Please investigate the portal submission.",
      "The employee disclosed no pre-existing conditions at enrollment and the policy has a 2-year waiting period which has passed. This rejection needs to be reconsidered.",
      "Dear team, the daycare procedure (D&C) is clearly listed in our policy schedule as a covered benefit. The rejection is incorrect. Please get this reversed ASAP.",
      "The claim was approved on appeal 10 days ago but the payment hasn't been processed. How much longer do we need to wait?",
      "5 of our employee claims were rejected at the same time with the same generic reason. This seems like a system error, not individual claim issues.",
    ],
    actionNeeded: ["Investigation", "Decision", "Unblock", "Follow-up", "Investigation"],
  },
  {
    category: "Policy Issuance",
    titles: [
      "Policy document not received after payment",
      "Incorrect policy details – wrong member count",
      "Policy renewal delayed beyond expiry date",
      "New policy setup taking too long – employees uninsured",
      "Policy endorsement for new joiners pending 2 weeks",
    ],
    summaries: [
      "Payment made 10 days ago but policy document still not issued. Client needs it for compliance audit next week.",
      "Policy issued with 150 members but actual count is 200. 50 employees currently without coverage. Urgent correction needed.",
      "Policy expired 5 days ago. Renewal paperwork submitted 3 weeks prior but not processed. Employees at risk.",
      "New account signed 2 weeks ago. Policy still not activated. 300+ employees without health coverage.",
      "15 new joiners added via endorsement 2 weeks ago. Still not reflecting in system. These employees can't access cashless.",
    ],
    rawMessages: [
      "Dear All, We have made payment on 20/02/2026 to add an employee. As per your website/process it takes 3-5 working days which also has elapsed. Today is 28/02/2026 and still am following up. Wondering when will this get done?",
      "The policy we received has incorrect member data. We submitted 200 members but only 150 are listed. Please fix this immediately as 50 employees have no coverage.",
      "Our policy expired on March 1st. We submitted renewal docs on Feb 10th. It's now March 6th and still no renewed policy. Our employees are uninsured.",
      "We signed with Plum two weeks ago for 300 employees. When will the policy be active? Our employees need coverage.",
      "We sent the endorsement list for 15 new joiners on March 3rd. These employees still can't access cashless facilities.",
    ],
    actionNeeded: ["Follow-up", "Unblock", "Unblock", "Unblock", "Follow-up"],
  },
  {
    category: "Onboarding Issue",
    titles: [
      "Onboarding data errors – all info incorrect from premiums to EIDs",
      "Employee app access not working after onboarding",
      "Bulk upload failed – 500 employees not added",
      "Onboarding training session requested",
      "Member data mismatch after migration",
    ],
    summaries: [
      "All information provided during onboarding is incorrect – from premium amounts to Employee IDs. Dashboard was set up and policy placed but data is wrong. Entire onboarding needs to restart.",
      "Employees completed onboarding 1 week ago but cannot login to the Plum app. Support tickets unanswered.",
      "HR uploaded 500 employee records via bulk upload. System showed success but only 200 were processed. Remaining 300 missing.",
      "Client requesting dedicated training session for employees on using Plum app. Common Thursday sessions are not sufficient for their needs.",
      "After migrating from old insurer, 40% of member data has mismatched names/DOBs. Needs bulk correction.",
    ],
    rawMessages: [
      "@Manashi: All the information provided are incorrect starting from premium to EIDs. Dashboard was set up and policy is also placed. To change the EIDs now we have to take product help and the whole onboarding has to be restarted. This is a very sensitive customer.",
      "None of our employees can login to the Plum app since onboarding last week. We've raised 3 support tickets with no response.",
      "We uploaded our entire employee list (500 people) but your system only registered 200. The remaining 300 employees are showing as uninsured.",
      "Hi Mr Avik, I had requested a dedicated training session for our employees on how to use the Plum app. The common training session was not very engaging and our employees were unable to ask questions. Please arrange a proper session.",
      "After migration, many employee records have wrong details. We need a bulk correction before claims start getting rejected for name mismatches.",
    ],
    actionNeeded: ["Unblock", "Investigation", "Unblock", "Follow-up", "Unblock"],
  },
  {
    category: "Health ID Missing",
    titles: [
      "Health IDs not issued – employees can't access cashless",
      "Bulk health ID generation failed",
      "Health ID delay causing cashless rejection at hospital",
      "Health cards not received for 3 months",
      "E-cards showing wrong employee details",
    ],
    summaries: [
      "Health IDs pending for 20+ employees since onboarding. They cannot avail cashless hospitalization. HR team getting daily complaints.",
      "Batch health ID generation for 100 new members failed silently. No IDs issued, no error notification sent.",
      "Employee denied cashless at hospital because Health ID is not in insurer system. ID was requested 4 weeks ago.",
      "Physical health cards requested 3 months ago. Neither physical nor e-cards received. Multiple follow-ups ignored.",
      "E-cards issued with wrong employee names and policy numbers. Cannot be used at hospitals.",
    ],
    rawMessages: [
      "Over twenty emails from our HR team regarding the issuance of Health IDs went unanswered. The delay in policy and ID issuance extended significantly beyond the promised timeline, directly causing the cashless processing issue during this emergency.",
      "We requested Health IDs for our 100 new joiners last month. The batch request seems to have failed – none of them received IDs and we got no notification about the failure.",
      "Our employee went to the hospital for a scheduled procedure. The hospital says the Health ID is not in their system. We applied for it 4 weeks ago!",
      "We've been asking for health cards for 3 months now. Email after email goes unanswered. Our employees don't even have proof of insurance.",
      "The e-cards you sent have wrong names on them. Raj Kumar's card shows 'Raju K' and the policy number is from a different company. These are unusable.",
    ],
    actionNeeded: ["Unblock", "Investigation", "Unblock", "Follow-up", "Unblock"],
  },
  {
    category: "Portal/Tech Issue",
    titles: [
      "Claims portal down – unable to submit documents",
      "Bulk upload tool throwing errors consistently",
      "Dashboard showing incorrect premium data",
      "App crashes when employees try to find hospitals",
      "Password reset not working for HR admin",
    ],
    summaries: [
      "Claims upload portal returning 500 errors for past 3 days. Client unable to submit claim documents. Multiple claims getting delayed.",
      "HR bulk upload tool fails every time with timeout error. Client has 200 endorsements stuck waiting.",
      "Client's premium dashboard showing amounts that don't match the agreed-upon rates. Creating confusion during budget reconciliation.",
      "Multiple employees reporting app crashes when searching for network hospitals. Android-specific issue.",
      "HR admin locked out after password reset. Reset emails not being delivered. Can't manage employee records.",
    ],
    rawMessages: [
      "We are required to upload documents one by one through a highly complex portal. There are specific requirements regarding scan format, color vs black & white, and document placement. This entire process is extremely time-consuming. After completing the lengthy upload process, your website failed.",
      "Every time we try to use the bulk upload tool, it times out after 5 minutes. We have 200 endorsements to process and can't do them one by one.",
      "The premium amounts on our dashboard don't match what was quoted. We're seeing 1,53,991+GST but the agreement says 1,50,000+GST.",
      "Our employees across 3 cities have reported the app crashing when they try to search for network hospitals. This is only on Android.",
      "I've been locked out of the admin portal for 2 days. Password reset emails never arrive. I need to add 10 new employees urgently.",
    ],
    actionNeeded: ["Unblock", "Investigation", "Follow-up", "Investigation", "Unblock"],
  },
  {
    category: "Cashless Failure",
    titles: [
      "Cashless denied at hospital despite active policy",
      "Emergency cashless not processed – patient paying from pocket",
      "Hospital not recognizing Plum insurance – network issue",
      "Cashless pre-auth pending 72 hours for planned surgery",
      "Cashless converted to reimbursement without consent",
    ],
    summaries: [
      "Employee's cashless claim denied at a network hospital. Hospital says Plum/TPA not responding. Employee had to pay INR 2.5L from pocket.",
      "Emergency admission – cashless request submitted immediately but no response for 24hrs. Family paying from savings. Critical situation.",
      "Network hospital saying they don't have a tie-up with Plum's TPA anymore. 5 employees denied cashless in the same week.",
      "Pre-auth for planned knee surgery submitted 72hrs ago. Surgery scheduled tomorrow. No response from TPA.",
      "Hospital converted cashless to reimbursement citing 'no response from insurer within 4 hours'. Employee now stuck with INR 1.8L bill.",
    ],
    rawMessages: [
      "The entire process, from the admitted employee requiring surgery to securing the cashless facility, was unnecessarily complicated and highly stressful. I along with my team had to personally coordinate with the hospital, TPA, and various Plum contacts due to the non-issuance of the employee's Health ID.",
      "My team member was rushed to the hospital last night. We submitted cashless request immediately but 24 hours later there's no response. The family is paying from their own pocket for an emergency surgery.",
      "Three of our employees went to Fortis Noida this week and all were told Plum is not recognized. This is supposed to be a network hospital!",
      "Surgery is tomorrow morning. Pre-auth was submitted 3 days ago. No approval, no rejection, no response. The patient is anxious.",
      "The hospital said since your insurer didn't respond in 4 hours they had to convert to reimbursement. Now my employee has a 1.8 lakh bill to pay upfront.",
    ],
    actionNeeded: ["Unblock", "Unblock", "Investigation", "Unblock", "Unblock"],
  },
  {
    category: "Reimbursement Delay",
    titles: [
      "Reimbursement pending 45 days – way beyond SLA",
      "Partial reimbursement with no explanation",
      "Reimbursement approved but amount not credited",
      "Multiple reimbursements stuck at different stages",
      "NEFT details wrong – payment bounced back",
    ],
    summaries: [
      "Reimbursement claim approved 45 days ago but payment still not received. SLA is 15 working days. Employee threatening legal action.",
      "Employee received only 40% of claimed amount. No rejection letter or partial approval communication received.",
      "Reimbursement of INR 75,000 approved 3 weeks ago. NEFT not initiated yet. Employee has already paid interest on medical loan.",
      "Account has 8 pending reimbursements at various stages. Oldest is 60 days. Client losing trust in the process.",
      "Reimbursement payment bounced – bank details on file are wrong despite being submitted correctly. Need immediate correction and re-transfer.",
    ],
    rawMessages: [
      "It has been 45 days since my claim was approved. Your SLA says 15 working days. I will be forced to take legal action if the payment is not made this week.",
      "I claimed INR 1,20,000 but received only INR 48,000. Nobody informed me about any deductions or partial approval. I need a detailed breakdown.",
      "The claim was approved 3 weeks ago but the money hasn't come to my account. I had to take a loan to pay the hospital bill and I'm paying interest on it.",
      "We have 8 pending reimbursements. The oldest one is from January. This is completely unacceptable for an enterprise account.",
      "The reimbursement was processed but bounced back because the NEFT details are wrong. I submitted the correct details twice. Please fix and retransfer immediately.",
    ],
    actionNeeded: ["Unblock", "Investigation", "Follow-up", "Unblock", "Unblock"],
  },
  {
    category: "Premium Discrepancy",
    titles: [
      "Premium invoice doesn't match agreed rates",
      "GST calculation error on premium invoice",
      "Premium deducted for terminated employees",
      "Mid-term premium revision without notice",
      "Double premium charged for same month",
    ],
    summaries: [
      "Latest premium invoice shows rates 15% higher than the signed agreement. Client refusing to pay until corrected.",
      "GST applied at 18% on base premium but should be 18% on net premium after discount. Difference of INR 2.3L.",
      "Premium being charged for 12 employees who were terminated 2 months ago. Endorsement for removal was submitted on time.",
      "Client received notice of 20% premium increase mid-term. No prior discussion or clause in agreement for mid-term revision.",
      "February premium was debited twice from client's account. INR 4.5L overcharged. Immediate refund requested.",
    ],
    rawMessages: [
      "On SF - GWP (Exc GST) for all products sold should be 153991+GST. Its updated as 1,50,000+GST. Since I cannot make any further changes after marking it closed won, you'll have to do it.",
      "Your invoice shows GST calculated on the gross premium, not the net premium after discount. This is an overcharge of 2.3 lakhs.",
      "We sent the exit list 2 months ago but premium is still being charged for those 12 people. Please stop charging and refund the excess.",
      "We received a 20% premium increase notice. This was not discussed and our contract has no mid-term revision clause.",
      "You debited our account twice for February premium. That's 4.5 lakhs extra. Please refund immediately and confirm the correct amount.",
    ],
    actionNeeded: ["Follow-up", "Unblock", "Follow-up", "Decision", "Unblock"],
  },
  {
    category: "Endorsement Pending",
    titles: [
      "New joiner endorsements pending for 3 weeks",
      "Employee deletion not processed – still being charged",
      "Dependent addition rejected without reason",
      "Bulk endorsement file rejected by system",
      "Name correction endorsement stuck for a month",
    ],
    summaries: [
      "15 new joiner endorsements submitted 3 weeks ago. None processed. These employees have no insurance coverage.",
      "Termination endorsement for 8 employees submitted last month. Still reflecting as active. Premium still being charged.",
      "Employee tried adding spouse as dependent. Rejected without any communication about the reason.",
      "Bulk endorsement CSV for 50 new joiners keeps getting rejected by the system with a generic error message.",
      "Simple name correction request submitted 30 days ago. Employee can't use cashless because name doesn't match.",
    ],
    rawMessages: [
      "We submitted the endorsement for 15 new joiners 3 weeks ago. None of them have coverage. If anyone gets hospitalized, who is responsible?",
      "8 employees left the company. We submitted their exit endorsement. They're still showing as active and we're still being billed for them.",
      "My team member added their spouse. It was rejected. No one told us why. How do we fix this?",
      "The bulk endorsement upload keeps failing. We get 'Error: Invalid format' but the file matches the template you provided.",
      "It's been a month since we requested a simple name correction. My employee's name is spelled wrong on the policy and hospitals won't accept it.",
    ],
    actionNeeded: ["Unblock", "Follow-up", "Investigation", "Investigation", "Follow-up"],
  },
  {
    category: "Renewal Issue",
    titles: [
      "Renewal quote not received – policy expiring in 5 days",
      "Renewal terms significantly worse than current policy",
      "Account threatening to churn at renewal",
      "Renewal processing delayed – lapse in coverage",
      "Competitor offering better rates – need retention plan",
    ],
    summaries: [
      "Policy expires in 5 days. Renewal quote requested 3 weeks ago but not yet received. Client may have a gap in coverage.",
      "Renewal quote has 40% premium increase and reduced coverage. Client is a top enterprise account. Needs VP intervention.",
      "Enterprise client with 2000 employees explicitly said they will not renew unless service issues are fixed. Policy up for renewal in 30 days.",
      "Renewal was approved and payment made but policy hasn't been renewed in the system. Technically there's a lapse in coverage.",
      "Client received a competing offer from Star Health at 25% lower premium. Need a retention strategy and possible discount approval.",
    ],
    rawMessages: [
      "Our policy expires on March 25th. We asked for the renewal quote 3 weeks ago. Still nothing. If there's a gap in coverage, that's a compliance issue for us.",
      "The renewal quote is shocking – 40% increase and you've removed maternity cover? We need to discuss this at a senior level.",
      "Please note that our frustration with this experience is immense, and we will not be renewing our policy with Plum unless we receive assurance of an immediate investigation.",
      "We paid the renewal premium on Feb 28. It's March 10 and the system still shows the old policy as expired. Our employees are being denied cashless.",
      "Star Health offered us the same coverage at 25% less. I like Plum's platform but the numbers don't add up. What can you do?",
    ],
    actionNeeded: ["Unblock", "Decision", "Decision", "Unblock", "Decision"],
  },
  {
    category: "Service Complaint",
    titles: [
      "Unprofessional behavior from support staff",
      "No response from relationship manager for 2 weeks",
      "Support hotline always unreachable",
      "Repeated follow-ups with no resolution",
      "Client threatening negative reviews and legal action",
    ],
    summaries: [
      "Client's HR reports rude behavior from support agent. Agent told them 'I'm from onboarding team, can't help you much.' Formal complaint filed.",
      "Relationship manager hasn't responded to emails or calls for 2 weeks. Client feels abandoned. Enterprise account.",
      "Client tried calling support hotline 10 times over 3 days – calls either disconnected or go unanswered. No callback received.",
      "Client has followed up 15 times over the past month on the same issue. Each time told 'we'll look into it' with no resolution.",
      "Client threatening to pursue legal avenues and share experience through word-of-mouth and public feedback channels if not resolved.",
    ],
    rawMessages: [
      "In an urgent situation, my team was informed 'I am from the onboarding team, can't help you much.' This is unacceptable for a health insurance partner.",
      "I have not heard from our relationship manager in 2 weeks. Emails, calls, messages – all unanswered. Is anyone managing our account?",
      "The advertised toll-free number was unreachable. Despite repeated requests not to call the patient directly, a Plum representative called the patient and then failed to return calls for critical updates.",
      "This is my 15th follow-up email. Every time I'm told someone will look into it. Nothing happens. I'm done being patient.",
      "Unless we receive assurance of immediate investigation, we will be forced to pursue legal avenues and share detailed accounts through word-of-mouth and public feedback channels.",
    ],
    actionNeeded: ["Acknowledgement", "Follow-up", "Investigation", "Unblock", "Decision"],
  },
  {
    category: "Training Request",
    titles: [
      "Dedicated training session needed for employees",
      "HR admin training on portal features",
      "Claims process walkthrough for new account",
      "Refresher training for large team",
      "Wellness program orientation request",
    ],
    summaries: [
      "Client wants a dedicated training session instead of the common Thursday sessions. Employees couldn't engage properly in group setting.",
      "New HR admin needs training on the employer portal – endorsements, claims tracking, reports. Current admin leaving next week.",
      "Newly onboarded account needs a claims process walkthrough for their 500 employees. Want it before any claims arise.",
      "Annual refresher training needed for 1000+ employees across 4 offices. Last training was 11 months ago.",
      "Client wants orientation session for the wellness programs included in their policy. Employees unaware of mental health benefits.",
    ],
    rawMessages: [
      "I had requested a dedicated training session for our employees on how to use the Plum app. While there is a common training held every Thursday, the session we attended was not very engaging. Please arrange a proper training session.",
      "Our current HR admin is leaving next week. We need the new person trained on the portal ASAP – endorsements, claims, reports, everything.",
      "We just onboarded with Plum. Before any claims come in, can we do a walkthrough for our team of 500 on how the claims process works?",
      "It's been almost a year since our last training. We have many new employees who don't know how to use Plum. Can we schedule sessions across our 4 offices?",
      "Our policy includes mental health and wellness benefits but none of our employees know about them. Can we organize an orientation session?",
    ],
    actionNeeded: ["Follow-up", "Follow-up", "Follow-up", "Follow-up", "Follow-up"],
  },
  {
    category: "Account Data Error",
    titles: [
      "Wrong premium data in Salesforce",
      "Employee count mismatch between portal and policy",
      "Incorrect account manager mapped",
      "Revenue attribution error for the quarter",
      "Duplicate account entries causing confusion",
    ],
    summaries: [
      "Salesforce shows GWP as INR 1,50,000+GST but actual agreed amount is INR 1,53,991+GST. Needs correction before quarter close.",
      "Portal shows 450 active employees but policy document says 500. 50 employees potentially at risk of claim rejection.",
      "Wrong account manager mapped to enterprise client. Client getting routed to someone who doesn't know their account history.",
      "Revenue from this account attributed to wrong BU. Needs correction before quarterly review.",
      "Two entries for the same company in the system. Endorsements going to the wrong record. Causing processing delays.",
    ],
    rawMessages: [
      "On SF - GWP (Exc GST) for all products sold should be 153991+GST. Its updated as 1,50,000+GST. Please make the changes on SF for the GMC & GPA opp.",
      "Our portal shows 450 employees but the policy says 500. Which one is correct? We need this fixed before anyone files a claim.",
      "I keep getting connected to someone named Ravi who has no idea about our account. Our account manager was Sneha. Please fix the routing.",
      "The revenue from our account is showing under the wrong business unit. This needs to be corrected before the QBR.",
      "There seem to be two records for our company. Our endorsements went to the wrong one and didn't get processed.",
    ],
    actionNeeded: ["Follow-up", "Investigation", "Follow-up", "Follow-up", "Investigation"],
  },
  {
    category: "Network Hospital Issue",
    titles: [
      "Hospital removed from network without notification",
      "Hospital not honoring cashless for Plum",
      "No network hospitals within 50km of client office",
      "Hospital empanelment request pending 2 months",
      "Network hospital quality complaint",
    ],
    summaries: [
      "Preferred hospital removed from TPA network. Client's employees in that city have no nearby alternative. No prior notification given.",
      "Network hospital refusing to accept Plum cashless. Says TPA hasn't responded to their queries. 3 patients affected this week.",
      "Client's new office location has no Plum network hospitals within 50km. 200 employees affected. Requesting empanelment.",
      "Client requested empanelment of a specific hospital 2 months ago. No progress update. Hospital serves 80% of their employee base.",
      "Employees reporting poor treatment at a network hospital. Long wait times for cashless, dismissive staff. Client wants alternative empaneled.",
    ],
    rawMessages: [
      "Fortis in our area was removed from the network without telling us! Our employees found out when they went for treatment. This is unacceptable.",
      "Three employees went to Max Hospital this week. All were told 'Plum's TPA doesn't respond, we can't do cashless.' What's going on?",
      "We opened a new office in Jaipur. There are zero Plum network hospitals within 50km. 200 employees have no access to cashless.",
      "We requested Manipal Hospital empanelment 2 months ago. No update. Most of our employees in Bangalore prefer this hospital.",
      "Our employees are being treated poorly at City Hospital. 4-hour wait for cashless approval, rude staff. We need a better alternative.",
    ],
    actionNeeded: ["Investigation", "Unblock", "Follow-up", "Follow-up", "Follow-up"],
  },
  {
    category: "TPA Coordination",
    titles: [
      "TPA not responding to hospital queries",
      "TPA rejecting valid claims incorrectly",
      "TPA turnaround time consistently slow",
      "TPA contact person changed without notice",
      "TPA system outage affecting all claims",
    ],
    summaries: [
      "TPA not responding to hospital's pre-auth queries. Multiple cashless requests stuck. Hospital considering dropping Plum from network.",
      "TPA applying outdated rejection criteria. 10 valid claims rejected this month alone. Pattern suggests training or system issue.",
      "Average TPA turnaround for this account is 72hrs vs promised 24hrs. Client tracking and documenting every delay.",
      "TPA SPOC changed without informing client. New person unaware of account-specific arrangements. Causing processing delays.",
      "TPA system outage for 6 hours today. All claim processing halted. 15 cashless requests pending. No ETA for resolution.",
    ],
    rawMessages: [
      "The hospital called us saying Plum's TPA hasn't responded to their queries for 3 days. They're thinking of dropping Plum from their network.",
      "10 claims rejected this month – all for reasons that shouldn't apply to our policy. Is the TPA even aware of our policy terms?",
      "We've been tracking TPA response times. Average is 72 hours against the promised 24 hours. Here's the data for the last 3 months.",
      "Our new TPA contact has no idea about our special arrangements. Why were we not informed about the change? We need the previous person back.",
      "We heard the TPA system is down. We have 15 cashless requests pending and employees in hospitals. When will this be fixed?",
    ],
    actionNeeded: ["Unblock", "Investigation", "Decision", "Follow-up", "Unblock"],
  },
  {
    category: "Document Issue",
    titles: [
      "Document upload portal not accepting files",
      "Claim documents lost after submission",
      "Conflicting document requirements from TPA",
      "Physical document submission option needed",
      "Documents resubmitted 3 times – still showing incomplete",
    ],
    summaries: [
      "Portal rejecting document uploads with format errors. Client tried PDF, JPG, PNG – all rejected. Claims getting delayed.",
      "Client submitted claim documents via portal 2 weeks ago. System shows no submission. No proof of upload available.",
      "TPA asking for different document sets each time. First rejection said missing doc A, resubmission rejected for missing doc B.",
      "Client requesting offline/physical document submission option. Digital portal too complex for their SME HR team.",
      "Same documents resubmitted 3 times. Each time marked incomplete for different reasons. Client losing patience.",
    ],
    rawMessages: [
      "We are effectively fighting to submit documents to your platform rather than to the insurance company. The portal rejects every file format we try.",
      "We uploaded all documents 2 weeks ago. Now you're telling us there's no record of the submission? We don't have a receipt either!",
      "First you said we need the consultation paper. We sent it. Then you said we need the self-attestation. We sent that too. Now you want something else?",
      "I requested details of an offline submission address or a representative in Mumbai where we could physically hand over documents for onward submission. This request has not been addressed.",
      "This is the third time we're submitting the same documents. Each time a different 'missing document' is cited. This is going in circles.",
    ],
    actionNeeded: ["Unblock", "Investigation", "Follow-up", "Decision", "Unblock"],
  },
  {
    category: "Billing/Invoice Issue",
    titles: [
      "Invoice not received for 2 months",
      "Credit note pending from last quarter",
      "Invoice addressed to wrong entity",
      "Pro-rata calculation seems incorrect",
      "Payment received but not reflected in account",
    ],
    summaries: [
      "Client hasn't received invoices for Jan and Feb. Accounts team can't process payment without invoice. Premium technically overdue.",
      "Credit note of INR 3.2L promised after member reduction last quarter. Not received. Client deducting from next payment.",
      "Invoice issued to parent company instead of subsidiary. Client's finance team can't process. Needs reissuance.",
      "Pro-rata premium for mid-term additions seems 20% higher than expected. Client requesting calculation breakdown.",
      "Client transferred premium payment 10 days ago. NEFT confirmed but Plum system shows outstanding balance.",
    ],
    rawMessages: [
      "We haven't received invoices for January and February. Our accounts team cannot process payment without proper invoices. Please send immediately.",
      "You promised a credit note of 3.2 lakhs when we removed 30 members last quarter. We still haven't received it.",
      "The invoice is addressed to 'XYZ Group' but it should be 'XYZ Subsidiary Pvt Ltd'. Our finance can't process this. Please reissue.",
      "The pro-rata premium for our 20 mid-term additions seems too high. Can you share the detailed calculation?",
      "We transferred the premium 10 days ago. Here's the UTR number. But your system still shows we haven't paid. Please update.",
    ],
    actionNeeded: ["Follow-up", "Follow-up", "Follow-up", "Investigation", "Follow-up"],
  },
  {
    category: "Coverage Query",
    titles: [
      "Maternity coverage clarification needed urgently",
      "OPD benefit scope unclear to employees",
      "Room rent capping confusion at hospital",
      "Mental health coverage query from HR",
      "COVID treatment coverage question",
    ],
    summaries: [
      "Employee's maternity claim denied. HR thought maternity was covered. Need urgent clarification on policy terms and resolution.",
      "Employees confused about what OPD benefits cover. Dentist? Optician? Physio? HR needs a clear benefit sheet.",
      "Hospital charging room rent difference citing policy cap. Employee and HR believe there's no cap. Need policy confirmation.",
      "HR asking if therapy and counseling are covered. Employee needs ongoing mental health treatment. Policy terms unclear.",
      "Employee hospitalized for COVID. Hospital says coverage unclear post-2024. Need immediate confirmation for cashless processing.",
    ],
    rawMessages: [
      "One of our employees was told maternity isn't covered. We were under the impression it is. Can you clarify and fix this if it's an error?",
      "Our employees keep asking what OPD covers. Dental? Vision? Physiotherapy? We need a simple benefit summary we can share.",
      "The hospital is charging our employee extra for room rent saying there's a cap. Our HR says there's no cap. Who's right?",
      "An employee needs regular therapy sessions. Is counseling and mental health covered under our policy? We can't find clear information.",
      "Employee admitted with COVID. Hospital not sure if it's covered under the current policy. We need a YES or NO for cashless immediately.",
    ],
    actionNeeded: ["Decision", "Follow-up", "Investigation", "Follow-up", "Decision"],
  },
  {
    category: "General Inquiry",
    titles: [
      "Referral request for brother's company",
      "Request for a call – no details provided",
      "Feedback survey follow-up",
      "Wellness program inquiry",
      "Partnership opportunity discussion request",
    ],
    summaries: [
      "Existing client referring their brother's company for insurance. Wants Avik to reach out. Sales lead, not an escalation.",
      "Client sent a one-line email requesting a call. No details on the topic. Needs follow-up to understand intent.",
      "Client declining feedback survey citing unresolved past escalations. Indicates deeper dissatisfaction.",
      "Client interested in wellness programs for next year. Wants to understand options and pricing.",
      "Client's parent company interested in discussing group insurance partnership. Wants a meeting with senior leadership.",
    ],
    rawMessages: [
      "Hi Avik, My brother is looking for an insurance for his firm. Can you reach out to him? Regards.",
      "Dear Avik, Request to call. Regards.",
      "I am absolutely not satisfied and trust me I am not going to put a good word for Plum to anyone in HR community. I don't want to waste my time in filling the survey.",
      "We're interested in wellness programs for our employees next year. What options does Plum offer? Can we schedule a discussion?",
      "Our parent company is looking at group insurance for their 5000 employees. They'd like to meet with someone senior from Plum.",
    ],
    actionNeeded: ["Follow-up", "Follow-up", "Acknowledgement", "Follow-up", "Decision"],
  },
];

// ── Deterministic random number generator (seeded) ──

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randomDate(start: Date, end: Date, rand: () => number): Date {
  return new Date(start.getTime() + rand() * (end.getTime() - start.getTime()));
}

function formatDate(d: Date): string {
  return d.toISOString();
}

// ── Priority scoring ──

function computePriorityScore(
  accountSize: string,
  category: IssueCategory,
  daysOpen: number,
  source: Source
): number {
  let score = 0;

  // Account size weight
  const sizeScores: Record<string, number> = { Enterprise: 40, "Mid-Market": 30, SME: 20, Startup: 10 };
  score += sizeScores[accountSize] || 10;

  // Category urgency
  const urgentCategories: IssueCategory[] = ["Cashless Failure", "Claim Delayed", "Health ID Missing", "Claim Rejected", "Renewal Issue"];
  const highCategories: IssueCategory[] = ["Reimbursement Delay", "Policy Issuance", "Onboarding Issue", "TPA Coordination", "Service Complaint"];
  if (urgentCategories.includes(category)) score += 30;
  else if (highCategories.includes(category)) score += 20;
  else score += 10;

  // Delay penalty
  if (daysOpen > 14) score += 20;
  else if (daysOpen > 7) score += 10;
  else if (daysOpen > 3) score += 5;

  // Source weight (WhatsApp = more personal/urgent)
  if (source === "WhatsApp") score += 5;
  else if (source === "Slack") score += 3;

  return Math.min(score, 100);
}

function scoreToPriority(score: number): Priority {
  if (score >= 75) return "Critical";
  if (score >= 55) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

// ── Generate 120 escalation records ──

export function generateEscalations(): Escalation[] {
  const rand = seededRandom(42);
  const escalations: Escalation[] = [];
  const statuses: Status[] = ["Open", "In Progress", "Blocked", "Closed"];
  const sources: Source[] = ["Email", "Slack", "WhatsApp"];

  for (let i = 0; i < 120; i++) {
    const template = pick(templates, rand);
    const templateIdx = Math.floor(rand() * template.titles.length);
    const company = pick(companies, rand);
    const owner = pick(owners, rand);
    const source = pick(sources, rand);
    const firstName = pick(senderFirstNames, rand);
    const lastName = pick(senderLastNames, rand);

    const createdDate = randomDate(new Date("2026-01-15"), new Date("2026-03-18"), rand);
    const now = new Date("2026-03-19");
    const daysOpen = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    const status: Status = (() => {
      if (daysOpen > 20 && rand() > 0.4) return "Closed";
      if (daysOpen > 10 && rand() > 0.6) return "Blocked";
      if (daysOpen > 5 && rand() > 0.5) return "In Progress";
      if (rand() > 0.6) return "In Progress";
      return pick(statuses, rand);
    })();

    const hoursOpen = daysOpen * 24;
    const responseTime = status !== "Open" ? Math.floor(rand() * 48 + 1) : null;
    const resolutionTime = status === "Closed" ? Math.floor(rand() * hoursOpen + 24) : null;

    const updatedDate = randomDate(createdDate, now, rand);
    const slaHours = 48;
    const slaDeadline = new Date(createdDate.getTime() + slaHours * 60 * 60 * 1000);
    const isBreachingSLA = status !== "Closed" && now > slaDeadline;

    const priorityScore = computePriorityScore(company.size, template.category, daysOpen, source);
    const priority = scoreToPriority(priorityScore);

    const claimNum = `CLM-${String(82000000 + i * 137).slice(0, 8)}`;
    const summary = template.summaries[templateIdx].replace("#CLM-XXXX", `#${claimNum}`);

    escalations.push({
      id: `ESC-${String(1001 + i).padStart(4, "0")}`,
      title: template.titles[templateIdx],
      summary,
      accountName: company.name,
      accountSize: company.size,
      category: template.category,
      source,
      priority,
      priorityScore,
      status,
      owner,
      actionNeeded: template.actionNeeded[templateIdx],
      createdAt: formatDate(createdDate),
      updatedAt: formatDate(updatedDate),
      slaDeadline: formatDate(slaDeadline),
      responseTime,
      resolutionTime,
      isBreachingSLA,
      rawMessage: template.rawMessages[templateIdx],
      senderName: `${firstName} ${lastName}`,
      senderEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 15)}.com`,
    });
  }

  return escalations;
}

// Pre-generate and export
export const escalations = generateEscalations();
