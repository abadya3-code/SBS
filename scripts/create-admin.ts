import "dotenv/config";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { createUserWithPassword, getUserByEmail } from "../server/db/auth";
import { requireDb } from "../server/db/core";
import { seedAccessControl, seedWorkflows } from "../server/db/seed";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "SBTS Administrator";
  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before running pnpm admin:create.");
  }
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");

  await seedAccessControl();
  await seedWorkflows();
  const existing = await getUserByEmail(email);
  if (existing) {
    const db = await requireDb();
    await db.update(users).set({ role: "admin", userStatus: "active", name, approvedAt: new Date(), updatedAt: new Date() }).where(eq(users.openId, existing.openId));
    console.log(`Existing account ${email} promoted to active admin.`);
    return;
  }

  await createUserWithPassword({
    name,
    email,
    password,
    role: "admin",
    userStatus: "active",
    department: "System Administration",
    specialty: "Application Administration",
    employeeNumber: process.env.ADMIN_EMPLOYEE_NUMBER || "SBTS-ADMIN",
    createdByOpenId: "deployment-bootstrap",
  });
  console.log(`Admin account ${email} created.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
