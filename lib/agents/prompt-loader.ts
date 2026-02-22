import fs from "fs";
import path from "path";

const PROMPTS_DIR = path.join(process.cwd(), "prompts");

export function readPrompt(name: string): string {
  const filePath = path.join(PROMPTS_DIR, `${name}.prompt.md`);
  return fs.readFileSync(filePath, "utf-8");
}
