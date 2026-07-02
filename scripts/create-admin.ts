/**
 * One-time CLI script to create the admin account.
 *
 * Usage:
 *   npm run create-admin -- --email admin@example.com --password "StrongPass123!" --name "Admin"
 *
 * This is the ONLY way to create an admin account — there is no public
 * registration endpoint, by design.
 */
import { config } from "dotenv";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin";

// Load environment variables from .env.local (Next.js convention),
// falling back to .env if present.
config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

function parseArgs() {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const value = args[i + 1];
      result[key] = value;
      i++;
    }
  }
  return result;
}

async function main() {
  const { email, password, name } = parseArgs();

  if (!email || !password || !name) {
    console.error(
      'Usage: npm run create-admin -- --email admin@example.com --password "StrongPass123!" --name "Admin Name"'
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to your .env.local file.");
    process.exit(1);
  }

  await mongoose.connect(uri);

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.error(`An admin with email "${email}" already exists.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);

  await Admin.create({
    email: email.toLowerCase(),
    password: hashed,
    name,
  });

  console.log(`✅ Admin account created for ${email}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to create admin:", err);
  process.exit(1);
});
