// Run: node scripts/export-dummy-data.mjs
// Generates dummy-escalations.json with 120 realistic escalation records

import { writeFileSync } from "fs";

// ── Seeded RNG ──
function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
const rand = seededRandom(42);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const randDate = (s, e) => new Date(s.getTime() + rand() * (e.getTime() - s.getTime()));

const owners = ["Avik Bhandari","Vaishnavi Bhat","Vidushi M","Arun Saseedharan","Ipsita Sahu","Mikhel Dhiman","Susmita Roy","Rajorshi Chowdhury","Akshay Golechha","Prakrut Shah","Subash P","Manashi Das","Rather Faisal","Abhishek Ranjan","Nishita Kapoor"];
const companies = [
  {name:"Tata Consultancy Services",size:"Enterprise"},{name:"Wipro Technologies",size:"Enterprise"},{name:"Infosys BPO",size:"Enterprise"},{name:"Reliance Industries",size:"Enterprise"},{name:"Mahindra & Mahindra",size:"Enterprise"},{name:"Bharti Airtel",size:"Enterprise"},{name:"HCL Technologies",size:"Enterprise"},{name:"Godrej Consumer Products",size:"Enterprise"},{name:"Larsen & Toubro",size:"Enterprise"},{name:"Asian Paints",size:"Enterprise"},
  {name:"Zoho Corporation",size:"Mid-Market"},{name:"Freshworks Inc",size:"Mid-Market"},{name:"Razorpay Software",size:"Mid-Market"},{name:"PolicyBazaar",size:"Mid-Market"},{name:"Lenskart Solutions",size:"Mid-Market"},{name:"PharmEasy Health",size:"Mid-Market"},{name:"Urban Company",size:"Mid-Market"},{name:"Swiggy Pvt Ltd",size:"Mid-Market"},{name:"CRED Financial",size:"Mid-Market"},{name:"Meesho Technologies",size:"Mid-Market"},
  {name:"NxtWave Disruptive Tech",size:"SME"},{name:"Simplilearn Solutions",size:"SME"},{name:"Testbook Edu Solutions",size:"SME"},{name:"Upgrad Education",size:"SME"},{name:"Groww Investments",size:"SME"},{name:"Jupiter Money",size:"SME"},{name:"Zerodha Broking",size:"SME"},{name:"Leap Finance",size:"SME"},{name:"Park+ Technologies",size:"SME"},{name:"Pocket FM Audio",size:"SME"},
  {name:"CodeNation Innovation",size:"Startup"},{name:"Hyperface Technologies",size:"Startup"},{name:"BetterPlace Safety",size:"Startup"},{name:"Jar App Fintech",size:"Startup"},{name:"Kuku FM Audio",size:"Startup"},{name:"OneCode Technologies",size:"Startup"},{name:"Salt Fintech",size:"Startup"},{name:"Refyne Earned Wage",size:"Startup"},{name:"Rocketlane Project",size:"Startup"},{name:"Toplyne Growth",size:"Startup"},
];
const firstNames = ["Rahul","Priya","Arun","Sneha","Karan","Anita","Vikram","Deepa","Suresh","Meera","Rajesh","Pooja","Amit","Kavita","Sanjay","Divya","Nikhil","Swati","Manoj","Ritu","Gaurav","Neha","Ashok","Pallavi","Rohan","Jyoti","Tarun","Shilpa","Varun","Aarti"];
const lastNames = ["Sharma","Patel","Gupta","Singh","Kumar","Joshi","Verma","Nair","Reddy","Iyer","Chopra","Malhotra","Bhatia","Kapoor","Mehta","Agarwal","Sinha","Das","Mukherjee","Banerjee"];
const sources = ["Email","Slack","WhatsApp"];
const statuses = ["Open","In Progress","Blocked","Closed"];
const categories = ["Claim Delayed","Claim Rejected","Policy Issuance","Onboarding Issue","Health ID Missing","Portal/Tech Issue","Cashless Failure","Reimbursement Delay","Premium Discrepancy","Endorsement Pending","Renewal Issue","Service Complaint","Training Request","Account Data Error","Network Hospital Issue","TPA Coordination","Document Issue","Billing/Invoice Issue","Coverage Query","General Inquiry"];
const actions = ["Decision","Follow-up","Unblock","Acknowledgement","Investigation"];

const summaryTemplates = [
  "Employee claim has been pending for 30+ days with no status update from TPA. Client HR escalating internally.",
  "Hospitalized employee's cashless claim stuck at TPA level. Hospital threatening to convert to cash payment.",
  "Multiple claims from this account are past SLA. Client is a key account and threatening to not renew policy.",
  "Cashless approval for surgery pending 48hrs. Hospital needs confirmation today.",
  "Reimbursement submitted 3 weeks ago. All documents verified but payment not processed.",
  "Claim rejected for insufficient documentation but client says all docs were submitted via portal.",
  "Claim denied citing pre-existing condition. Employee joined policy 2 years ago with no exclusion clause.",
  "Daycare procedure claim rejected but procedure is listed in the policy schedule. Needs TPA correction.",
  "Payment made 10 days ago but policy document still not issued. Client needs it for compliance audit.",
  "Policy issued with incorrect member count. Multiple employees currently without coverage.",
  "All information provided during onboarding is incorrect. Entire onboarding needs to restart.",
  "Employees completed onboarding but cannot login to the Plum app. Support tickets unanswered.",
  "Health IDs pending for 20+ employees since onboarding. They cannot avail cashless hospitalization.",
  "Claims upload portal returning errors. Client unable to submit claim documents.",
  "Employee's cashless claim denied at network hospital. Employee had to pay from pocket.",
  "Emergency admission – cashless request submitted but no response for 24hrs. Family paying from savings.",
  "Reimbursement claim approved 45 days ago but payment still not received. Employee threatening legal action.",
  "Latest premium invoice shows rates higher than the signed agreement. Client refusing to pay.",
  "New joiner endorsements submitted 3 weeks ago. None processed. Employees have no coverage.",
  "Policy expires in 5 days. Renewal quote requested 3 weeks ago but not yet received.",
  "Client's HR reports rude behavior from support agent. Formal complaint filed.",
  "Relationship manager hasn't responded for 2 weeks. Client feels abandoned. Enterprise account.",
  "Client wants dedicated training session for employees. Common sessions not sufficient.",
  "Salesforce shows incorrect GWP data. Needs correction before quarter close.",
  "Hospital removed from network without notification. Client's employees have no nearby alternative.",
  "TPA not responding to hospital pre-auth queries. Multiple cashless requests stuck.",
  "Portal rejecting document uploads with format errors. Claims getting delayed.",
  "Client hasn't received invoices for 2 months. Accounts team can't process payment.",
  "Employee's maternity claim denied. HR thought maternity was covered. Needs urgent clarification.",
  "Existing client referring brother's company for insurance. Sales lead, not an escalation.",
];

const titleTemplates = [
  "Claim pending for over 30 days – no updates",
  "Urgent: Employee hospitalization claim stuck in processing",
  "Multiple claims delayed beyond TAT – account at risk",
  "Cashless claim approval delayed – patient still admitted",
  "Reimbursement claim pending since 3 weeks",
  "Claim rejected due to documentation – client disputing",
  "Pre-existing condition rejection – needs review",
  "Daycare claim rejected – valid procedure per policy",
  "Policy document not received after payment",
  "Incorrect policy details – wrong member count",
  "Onboarding data errors – all info incorrect",
  "Employee app access not working after onboarding",
  "Health IDs not issued – employees can't access cashless",
  "Claims portal down – unable to submit documents",
  "Cashless denied at hospital despite active policy",
  "Emergency cashless not processed – patient paying from pocket",
  "Reimbursement pending 45 days – way beyond SLA",
  "Premium invoice doesn't match agreed rates",
  "New joiner endorsements pending for 3 weeks",
  "Renewal quote not received – policy expiring in 5 days",
  "Unprofessional behavior from support staff",
  "No response from relationship manager for 2 weeks",
  "Dedicated training session needed for employees",
  "Wrong premium data in Salesforce",
  "Hospital removed from network without notification",
  "TPA not responding to hospital queries",
  "Document upload portal not accepting files",
  "Invoice not received for 2 months",
  "Maternity coverage clarification needed urgently",
  "Referral request for brother's company",
];

const rawMessages = [
  "Dear Avik, We have 3 pending claims that have crossed the 30-day mark. Despite multiple follow-ups, we haven't received any updates. Our employees are getting frustrated.",
  "Hi team, URGENT - Our employee is currently admitted at Apollo Hospital. The cashless request was sent 48 hours ago but no approval yet.",
  "Avik, This is unacceptable. We've had 3 claims stuck for weeks now. If this isn't resolved by EOW, we'll reconsider our partnership.",
  "Dear All, Employee surgery was scheduled yesterday. Cashless still not approved. Hospital is asking the patient to arrange funds.",
  "Hi Mr Avik, My reimbursement claim was submitted on Feb 5th with all required documents. It's been 3 weeks and still Under Review.",
  "We uploaded all documents through the portal. The rejection saying documents missing is incorrect. Please investigate.",
  "The employee disclosed no pre-existing conditions at enrollment and the 2-year waiting period has passed. This rejection needs reconsideration.",
  "The daycare procedure is clearly listed in our policy schedule as a covered benefit. The rejection is incorrect.",
  "We made payment on 20/02/2026 to add an employee. As per your process it takes 3-5 working days which has elapsed. Still following up.",
  "The policy we received has incorrect member data. We submitted 200 members but only 150 are listed. 50 employees have no coverage.",
  "All the information provided are incorrect from premium to EIDs. Dashboard was set up but data is wrong. Onboarding needs to restart.",
  "None of our employees can login to the Plum app since onboarding last week. We've raised 3 support tickets with no response.",
  "Over twenty emails regarding Health IDs went unanswered. The delay directly caused cashless processing issues during an emergency.",
  "We are effectively fighting to submit documents to your platform. The portal rejects every file format we try.",
  "The entire process from admission to securing cashless was unnecessarily complicated due to non-issuance of Health ID.",
  "My team member was rushed to hospital last night. Cashless request submitted immediately but 24 hours later no response.",
  "It has been 45 days since my claim was approved. Your SLA says 15 working days. I will take legal action if payment is not made.",
  "On SF - GWP for all products sold should be 153991+GST. Its updated as 1,50,000+GST. Please make the changes.",
  "We submitted endorsement for 15 new joiners 3 weeks ago. None have coverage. If anyone gets hospitalized, who is responsible?",
  "Our policy expires on March 25th. We asked for renewal quote 3 weeks ago. Still nothing. Gap in coverage is a compliance issue.",
  "In an urgent situation, my team was informed 'I am from the onboarding team, can't help you much.' This is unacceptable.",
  "I have not heard from our relationship manager in 2 weeks. Emails, calls, messages all unanswered.",
  "I requested a dedicated training session. The common Thursday session was not engaging. Please arrange proper training.",
  "On SF - GWP (Exc GST) for all products sold should be 153991+GST. Please make the changes on SF for GMC & GPA opp.",
  "Fortis in our area was removed from the network without telling us! Employees found out when they went for treatment.",
  "The hospital says Plum's TPA hasn't responded to queries for 3 days. They're thinking of dropping Plum from network.",
  "We are required to upload documents one by one through a complex portal. After completing the upload, your website failed.",
  "We haven't received invoices for January and February. Our accounts team cannot process payment without proper invoices.",
  "One of our employees was told maternity isn't covered. We were under the impression it is. Please clarify.",
  "Hi Avik, My brother is looking for insurance for his firm. Can you reach out to him? Regards.",
];

function computeScore(size, cat, days, src) {
  let s = 0;
  s += {Enterprise:40,"Mid-Market":30,SME:20,Startup:10}[size]||10;
  if(["Cashless Failure","Claim Delayed","Health ID Missing","Claim Rejected","Renewal Issue"].includes(cat)) s+=30;
  else if(["Reimbursement Delay","Policy Issuance","Onboarding Issue","TPA Coordination","Service Complaint"].includes(cat)) s+=20;
  else s+=10;
  if(days>14) s+=20; else if(days>7) s+=10; else if(days>3) s+=5;
  if(src==="WhatsApp") s+=5; else if(src==="Slack") s+=3;
  return Math.min(s,100);
}
function scoreToPriority(s) { return s>=75?"Critical":s>=55?"High":s>=35?"Medium":"Low"; }

const escalations = [];
for (let i = 0; i < 120; i++) {
  const tIdx = i % titleTemplates.length;
  const company = pick(companies);
  const owner = pick(owners);
  const source = pick(sources);
  const fn = pick(firstNames), ln = pick(lastNames);
  const cat = pick(categories);
  const action = pick(actions);
  const created = randDate(new Date("2026-01-15"), new Date("2026-03-18"));
  const now = new Date("2026-03-19");
  const daysOpen = Math.floor((now - created) / 864e5);
  const status = daysOpen>20&&rand()>0.4?"Closed":daysOpen>10&&rand()>0.6?"Blocked":daysOpen>5&&rand()>0.5?"In Progress":rand()>0.6?"In Progress":pick(statuses);
  const respTime = status!=="Open"?Math.floor(rand()*48+1):null;
  const resTime = status==="Closed"?Math.floor(rand()*daysOpen*24+24):null;
  const updated = randDate(created, now);
  const slaDl = new Date(created.getTime()+48*36e5);
  const breach = status!=="Closed"&&now>slaDl;
  const score = computeScore(company.size, cat, daysOpen, source);

  escalations.push({
    id: `ESC-${String(1001+i).padStart(4,"0")}`,
    title: titleTemplates[tIdx],
    summary: summaryTemplates[tIdx],
    accountName: company.name,
    accountSize: company.size,
    category: cat,
    source,
    priority: scoreToPriority(score),
    priorityScore: score,
    status,
    owner,
    actionNeeded: action,
    createdAt: created.toISOString(),
    updatedAt: updated.toISOString(),
    slaDeadline: slaDl.toISOString(),
    responseTime: respTime,
    resolutionTime: resTime,
    isBreachingSLA: breach,
    rawMessage: rawMessages[tIdx],
    senderName: `${fn} ${ln}`,
    senderEmail: `${fn.toLowerCase()}.${ln.toLowerCase()}@${company.name.toLowerCase().replace(/[^a-z]/g,"").slice(0,15)}.com`,
  });
}

writeFileSync("public/dummy-escalations.json", JSON.stringify(escalations, null, 2));
console.log(`Exported ${escalations.length} escalation records to public/dummy-escalations.json`);
