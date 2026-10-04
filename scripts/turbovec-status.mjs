import path from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const python = process.env.DGS_TURBOVEC_PYTHON || (process.platform === "win32"
  ? path.join(root, ".venv-turbovec", "Scripts", "python.exe")
  : path.join(root, ".venv-turbovec", "bin", "python"));

const child = spawn(python, [path.join(root, "scripts", "turbovec-service.py")], {
  cwd: root,
  env: process.env,
  stdio: ["pipe", "inherit", "inherit"],
});
child.stdin.end(JSON.stringify({ command: "status" }));
child.on("close", (code) => process.exit(code || 0));
