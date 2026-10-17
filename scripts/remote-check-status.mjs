import { execSync } from "node:child_process";

const remoteCmd = `
echo "=== CURRENT SYMLINK ==="
ls -ld /home/u188101251/production-app/current
echo ""
echo "=== ROLLBACK SYMLINK ==="
ls -ld /home/u188101251/production-app/rollback*
echo ""
echo "=== SHA IN CURRENT ==="
cat /home/u188101251/production-app/current/.release-sha 2>/dev/null || echo "No .release-sha"
cat /home/u188101251/production-app/current/.build-id 2>/dev/null || echo "No .build-id"
echo ""
echo "=== SHARED MEDIA CHECK ==="
ls -ld /home/u188101251/production-app/shared/media/portfolio/videos
echo "Files in shared/media/portfolio/videos:"
ls -1 /home/u188101251/production-app/shared/media/portfolio/videos

echo ""
echo "=== CURRENT SYMLINK TO MEDIA ==="
ls -ld /home/u188101251/production-app/current/public/media/portfolio/videos
echo ""
echo "=== HTACCESS CHECK ==="
ls -la /home/u188101251/production-app/current/public/.htaccess
cat /home/u188101251/production-app/current/public/.htaccess
`;

try {
  const res = execSync(
    `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o StrictHostKeyChecking=no -p 65002 u188101251@147.93.100.126 "bash -s"`,
    {
      input: remoteCmd,
      encoding: "utf8",
    }
  );
  console.log(res);
} catch (e) {
  console.error("SSH error:", e.message);
  if (e.stdout) console.log("STDOUT:", e.stdout);
  if (e.stderr) console.error("STDERR:", e.stderr);
}
