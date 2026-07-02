import type { Metadata } from "next";
import MessagesManager from "@/components/MessagesManager";
import { getAllContactsAdmin } from "@/actions/contact.actions";

export const metadata: Metadata = { title: "Manage Messages" };
export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await getAllContactsAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-ink sm:text-3xl">
          Customer Messages
        </h1>
        <p className="mt-1 text-sm text-muted">
          Inquiries submitted through the website&apos;s contact form.
        </p>
      </div>

      <MessagesManager messages={messages} />
    </div>
  );
}
