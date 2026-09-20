import "server-only";
import nodemailer from "nodemailer";

function smtpConfigured() {
  return Boolean(process.env.DGS_SMTP_HOST && process.env.DGS_SMTP_USER && process.env.DGS_SMTP_PASSWORD);
}

export async function sendCareerApplicationEmail(input: {
  name: string; email: string; phone: string; position: string;
  location: string; experience: string; currentSalary: string;
  expectedSalary: string; noticePeriod: string; resumeName: string;
}) {
  if (!smtpConfigured()) return { sent: false, reason: "smtp-not-configured" };

  const transporter = nodemailer.createTransport({
    host: process.env.DGS_SMTP_HOST,
    port: Number(process.env.DGS_SMTP_PORT || 587),
    secure: process.env.DGS_SMTP_SECURE === "true",
    auth: { user: process.env.DGS_SMTP_USER, pass: process.env.DGS_SMTP_PASSWORD },
  });

  const to = process.env.DGS_CAREER_NOTIFICATION_TO || "hr@dgeniussolutions.com";
  const from = process.env.DGS_SMTP_FROM || process.env.DGS_SMTP_USER!;
  await transporter.sendMail({
    from,
    to,
    replyTo: input.email,
    subject: `New career application: ${input.position} — ${input.name}`,
    text: [
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Phone: ${input.phone}`,
      `Position: ${input.position}`,
      `Location: ${input.location}`,
      `Experience: ${input.experience}`,
      `Current salary: ${input.currentSalary}`,
      `Expected salary: ${input.expectedSalary}`,
      `Notice period: ${input.noticePeriod}`,
      `Resume: ${input.resumeName}`,
    ].join("\n"),
  });

  return { sent: true };
}
