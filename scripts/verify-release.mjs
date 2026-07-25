import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "package.json",
  "pnpm-lock.yaml",
  "railway.json",
  ".env.example",
  "README.md",
  "client/index.html",
  "server/_core/index.ts",
  "drizzle/schema.ts",
  "drizzle/0016_sprint4_certificate_quality_governance.sql",
  "scripts/apply-sbts-domain-migrations.ts",
  "patches/wouter@3.7.1.patch",
];

const failures = [];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing required file: ${file}`);
}

if (fs.existsSync(path.join(root, ".env"))) failures.push(".env must not be committed or included in the release root.");
if (fs.existsSync(path.join(root, "node_modules"))) failures.push("node_modules must not be included in the release.");
if (fs.existsSync(path.join(root, "client/public/__manus__"))) failures.push("Manus generated debug files must not be included in the Railway release.");

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (packageJson.scripts?.["db:migrate"] !== "pnpm db:migrate:drizzle && pnpm db:migrate:domain") {
  failures.push("db:migrate must execute both Drizzle and SBTS domain migrations.");
}
if (!packageJson.engines?.node?.includes("22")) failures.push("Node.js 22 must be pinned in package.json engines.");

const railway = JSON.parse(fs.readFileSync(path.join(root, "railway.json"), "utf8"));
if (railway.deploy?.healthcheckPath !== "/health") failures.push("Railway healthcheckPath must be /health.");
if (!String(railway.deploy?.preDeployCommand ?? "").includes("pnpm db:migrate")) failures.push("Railway pre-deploy must run database migrations.");
if (!String(railway.build?.buildCommand ?? "").includes("--frozen-lockfile")) failures.push("Railway build must use the frozen pnpm lockfile.");

const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
if (!/^\.env$/m.test(gitignore)) failures.push(".gitignore must ignore .env.");

const result = {
  version: packageJson.version,
  filesChecked: required.length,
  status: failures.length ? "failed" : "passed",
  failures,
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
