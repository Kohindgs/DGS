import fs from "fs";

const results = JSON.parse(fs.readFileSync("service_forms_qa_results.json", "utf8"));
console.log("| Form ID | Form | Route | HTTP | Form Visible | Validation | Submit | DB Lead | Submission | Email Kohin | CC/BCC | QA Cleanup | Result |");
console.log("|---|---|---|---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|");
for (const r of results) {
  const fId = r.formId;
  const fName = r.name;
  const route = r.route;
  const http = r.httpStatus;
  const fVis = r.formLoaded ? "YES" : "NO";
  const val = r.validationPass ? "PASS" : "FAIL";
  const sub = r.submitOk ? "PASS" : "FAIL";
  const dbLead = r.dbLeadCreated ? "YES" : "NO";
  const dbSub = Boolean(r.submissionId) ? "YES" : "NO";
  const emailK = r.recipient === "kohin@dgeniussolutions.com" && r.notificationStatus === "sent" ? "PASS" : "FAIL";
  const ccBcc = r.ccNone && r.bccNone ? "NONE" : "FAIL";
  const clean = r.cleanedSpam ? "SPAM (0)" : "FAIL";
  const res = r.finalResult;
  console.log(`| ${fId} | ${fName} | \`${route}\` | ${http} | ${fVis} | ${val} | ${sub} | ${dbLead} | ${dbSub} | ${emailK} | ${ccBcc} | ${clean} | **${res}** |`);
}
