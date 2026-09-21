import "server-only";
import nodemailer from "nodemailer";
import type { FormDefinition } from "@/lib/forms/types";

function configured() {
  return Boolean(
    process.env.DGS_SMTP_HOST &&
    process.env.DGS_SMTP_USER &&
    process.env.DGS_SMTP_PASSWORD
  );
}

export async function sendNativeFormNotification(input:{
  definition:FormDefinition;
  route:string;
  fields:Record<string,string>;
}) {
  if(!configured()) return {sent:false,reason:"smtp-not-configured"};

  const transporter=nodemailer.createTransport({
    host:process.env.DGS_SMTP_HOST,
    port:Number(process.env.DGS_SMTP_PORT||587),
    secure:process.env.DGS_SMTP_SECURE==="true",
    auth:{
      user:process.env.DGS_SMTP_USER,
      pass:process.env.DGS_SMTP_PASSWORD,
    },
  });

  const recipient =
    process.env.DGS_FORM_NOTIFICATION_TO ||
    process.env.DGS_CAREER_NOTIFICATION_TO ||
    process.env.DGS_SMTP_USER!;

  const from=process.env.DGS_SMTP_FROM||process.env.DGS_SMTP_USER!;
  const replyTo=input.fields.email||undefined;

  const visibleLines=input.definition.fields
    .filter((field)=>!field.hidden && field.type!=="captcha")
    .map((field)=>`${field.label}: ${input.fields[field.name]||""}`);

  await transporter.sendMail({
    from,
    to:recipient,
    replyTo,
    subject:`New website lead: ${input.definition.title}`,
    text:[
      `Form: ${input.definition.title}`,
      `Route: ${input.route}`,
      "",
      ...visibleLines,
    ].join("\n"),
  });

  return {sent:true};
}
