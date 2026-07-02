import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

interface ContactNotificationInput {
  name: string;
  email: string;
  phone: string;
  message: string;
}

/**
 * Send an email notification to the admin when a new contact message
 * is received. Fails silently (logs only) so the API never errors out
 * just because email delivery failed.
 */
export async function sendContactNotification(input: ContactNotificationInput) {
  const t = getTransporter();
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!t || !adminEmail) {
    console.warn("Email not configured — skipping contact notification email.");
    return;
  }

  try {
    await t.sendMail({
      from: `"${process.env.NEXT_PUBLIC_SITE_NAME || "Dealership Website"}" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      replyTo: input.email,
      subject: `New inquiry from ${input.name}`,
      text: `New contact form submission:

Name: ${input.name}
Email: ${input.email}
Phone: ${input.phone}

Message:
${input.message}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${input.name}</p>
        <p><strong>Email:</strong> ${input.email}</p>
        <p><strong>Phone:</strong> ${input.phone}</p>
        <p><strong>Message:</strong></p>
        <p>${input.message.replace(/\n/g, "<br/>")}</p>
      `,
    });
  } catch (err) {
    console.error("Failed to send contact notification email:", err);
  }
}
