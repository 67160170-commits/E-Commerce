import fs from "node:fs";
import crypto from "node:crypto";

const target = ".env.local";
const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
if (!/^SESSION_SECRET\s*=/m.test(current)) {
  fs.writeFileSync(target, `${current.trimEnd()}\nSESSION_SECRET=${crypto.randomBytes(48).toString("hex")}\n`);
  console.log("Created a private SESSION_SECRET in .env.local (ignored by Git). Existing settings preserved.");
} else {
  console.log("SESSION_SECRET already configured; existing settings preserved.");
}
