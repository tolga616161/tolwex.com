import { randomBytes } from "crypto";

export function generateApiKey() {
  return randomBytes(24).toString("hex");
}
