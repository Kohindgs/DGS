import fs from "node:fs";

const data=JSON.parse(fs.readFileSync(new URL("../data/forms/definitions.approved.json",import.meta.url),"utf8"));
const form=data.forms.find((item)=>Number(item.fluentFormId)===3);
if(!form) throw new Error("Fluent Form 3 definition missing");

const expectedRoutes=[
  "/services/seo-services-in-mumbai/",
  "/services/seo-service-in-banglore/",
  "/services/seo-service-in-gurugram/",
  "/services/seo-service-pune/",
  "/services/seo-services-in-hyderabad/",
];

for(const route of expectedRoutes) {
  if(!form.sourceRoutes.includes(route)) throw new Error(`Form 3 missing route: ${route}`);
}

const service=form.fields.find((field)=>field.name==="dropdown");
const referral=form.fields.find((field)=>field.name==="dropdown_1");
if(!service||service.type!=="select") throw new Error("Form 3 service dropdown missing");
if(!referral||referral.type!=="select") throw new Error("Form 3 referral dropdown missing");

const serviceValues=service.options.map((option)=>option.value);
const expectedServices=["SEO","Advance SEO(GEO,AEO,LLM SEO)"];
if(JSON.stringify(serviceValues)!==JSON.stringify(expectedServices)) {
  throw new Error(`Unexpected service options: ${JSON.stringify(serviceValues)}`);
}

const expectedReferral=[
  "Google Ads","Google Search","Friend / Colleague","Twitter","Youtube",
  "Instagram","Facebook","LinkedIn","Podcast","Blog / Article","Other",
];
const referralValues=referral.options.map((option)=>option.value);
if(JSON.stringify(referralValues)!==JSON.stringify(expectedReferral)) {
  throw new Error(`Unexpected referral options: ${JSON.stringify(referralValues)}`);
}

const requiredNames=[
  "names[first_name]","names[last_name]","email","input_text","url","phone","dropdown","dropdown_1",
];
for(const name of requiredNames) {
  const field=form.fields.find((item)=>item.name===name);
  if(!field?.required) throw new Error(`Expected required field missing/not required: ${name}`);
}

const hidden=form.fields.find((item)=>item.name==="hidden");
if(hidden?.defaultValue!=="SEO Page") throw new Error("Form 3 hidden SEO Page context missing");
if(!form.captcha?.enabled||form.captcha.provider!=="recaptcha") throw new Error("Form 3 reCAPTCHA config missing");

console.log(JSON.stringify({
  ok:true,
  pilotFormId:3,
  title:form.title,
  routes:expectedRoutes.length,
  serviceOptions:serviceValues,
  referralOptions:referralValues.length,
  hiddenContext:hidden.defaultValue,
},null,2));
