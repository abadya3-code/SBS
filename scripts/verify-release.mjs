import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
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
if (fs.existsSync(path.join(root, "client/public/__manus__"))) failures.push("Manus generated debug files must not be included in the Railway release.");

// node_modules is expected to exist after `pnpm install` in CI. The real release
// safety rule is that it must not be tracked by Git or included in the source.
// Check tracked files when Git metadata is available instead of rejecting a
// normal installed dependency directory.
if (fs.existsSync(path.join(root, ".git"))) {
  try {
    const tracked = execFileSync("git", ["ls-files", "-z"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\0")
      .filter(Boolean);
    if (tracked.some((file) => file.split(/[\\/]/).includes("node_modules"))) {
      failures.push("Tracked node_modules content must not be included in the repository.");
    }
  } catch {
    // Git may not be available in an isolated image build. Ignore this optional
    // source-control check; .gitignore/.railwayignore are checked below.
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (packageJson.scripts?.["db:migrate"] !== "pnpm db:migrate:drizzle && pnpm db:migrate:domain") {
  failures.push("db:migrate must execute both Drizzle and SBTS domain migrations.");
}
if (!packageJson.engines?.node?.includes("22")) failures.push("Node.js 22 must be pinned in package.json engines.");

const allowedBuildDependencies = new Set(packageJson.pnpm?.onlyBuiltDependencies ?? []);
for (const dependency of ["@tailwindcss/oxide", "esbuild"]) {
  if (!allowedBuildDependencies.has(dependency)) {
    failures.push(`pnpm.onlyBuiltDependencies must include ${dependency}.`);
  }
}

const railway = JSON.parse(fs.readFileSync(path.join(root, "railway.json"), "utf8"));
if (railway.deploy?.healthcheckPath !== "/health") failures.push("Railway healthcheckPath must be /health.");
if (!String(railway.deploy?.preDeployCommand ?? "").includes("pnpm db:migrate")) failures.push("Railway pre-deploy must run database migrations.");
if (!String(railway.build?.buildCommand ?? "").includes("--frozen-lockfile")) failures.push("Railway build must use the frozen pnpm lockfile.");
if (!String(railway.deploy?.startCommand ?? "").includes("node dist/index.js")) failures.push("Railway must start Node directly with dist/index.js.");

const buildCommand = String(railway.build?.buildCommand ?? "");
const releaseCheckIndex = buildCommand.indexOf("pnpm release:check");
const installIndex = buildCommand.indexOf("pnpm install");
if (releaseCheckIndex < 0 || installIndex < 0 || releaseCheckIndex > installIndex) {
  failures.push("Railway release:check must run before pnpm install to validate the source checkout.");
}

const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
if (!/^\.env$/m.test(gitignore)) failures.push(".gitignore must ignore .env.");
if (!/(?:^|\n)(?:\*\*\/)?node_modules\/?(?:\n|$)/m.test(gitignore)) failures.push(".gitignore must ignore node_modules.");

const railwayIgnore = fs.readFileSync(path.join(root, ".railwayignore"), "utf8");
if (!railwayIgnore.includes("node_modules")) failures.push(".railwayignore must ignore node_modules.");

const result = {
  version: packageJson.version,
  filesChecked: required.length,
  status: failures.length ? "failed" : "passed",
  failures,
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
