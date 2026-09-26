import { sendTestGoogleUpdateEmail } from "../lib/notifications/google-update-email.ts";

async function main() {
  console.log("Dispatching test Google Update Alert email...");
  const result = await sendTestGoogleUpdateEmail("ankur.vishwakarma@dgeniussolutions.com");
  console.log("Test Alert Result:", JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("Test email error:", err);
  process.exit(1);
});
