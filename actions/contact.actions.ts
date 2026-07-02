import connectDB from "@/lib/db";
import Contact from "@/models/Contact";

/** Admin only — get all contact messages, newest first */
export async function getAllContactsAdmin() {
  await connectDB();
  const messages = await Contact.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(messages));
}
