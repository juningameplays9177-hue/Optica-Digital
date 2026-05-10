/**
 * Executado em `npm install` (script prepare): aponta este repo para .githooks/
 * para que post-commit possa fazer push automático.
 */
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
if (!existsSync(join(root, ".git"))) {
  process.exit(0);
}
spawnSync("git", ["config", "core.hooksPath", ".githooks"], {
  cwd: root,
  stdio: "ignore",
  shell: process.platform === "win32"
});
