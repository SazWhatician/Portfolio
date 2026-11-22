import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = (formData.get("name") || "").toString().trim() || "Anonymous";
    const email = (formData.get("email") || "").toString().trim();
    const discipline = (formData.get("discipline") || "General Collaboration").toString().trim();
    const message = (formData.get("message") || "").toString().trim();
    const rawFiles = formData.getAll("files");

    const attachments = [];
    const fileMeta = [];

    for (const item of rawFiles) {
      if (item && typeof item === "object" && item.name && item.size > 0) {
        const bytes = await item.arrayBuffer();
        const buffer = Buffer.from(bytes);
        attachments.push({
          filename: item.name,
          content: buffer,
          contentType: item.type || "application/octet-stream",
        });
        fileMeta.push({
          name: item.name,
          size: item.size,
          type: item.type,
        });
      }
    }

    const payload = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      name,
      email,
      discipline,
      message,
      files: fileMeta,
    };

    // 1. Always record into local data/inbox.json so no message is ever lost
    try {
      const inboxDir = path.join(process.cwd(), "data");
      const inboxFile = path.join(inboxDir, "inbox.json");
      if (!fs.existsSync(inboxDir)) {
        fs.mkdirSync(inboxDir, { recursive: true });
      }
      let existing = [];
      if (fs.existsSync(inboxFile)) {
        try {
          const content = fs.readFileSync(inboxFile, "utf-8");
          existing = JSON.parse(content);
        } catch {
          existing = [];
        }
      }
      existing.unshift(payload);
      fs.writeFileSync(inboxFile, JSON.stringify(existing, null, 2), "utf-8");
    } catch (saveErr) {
      console.warn("Could not save to data/inbox.json:", saveErr);
    }

    // 2. Dispatch to Gmail if GMAIL_APP_PASSWORD is configured
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    const gmailUser = process.env.GMAIL_USER || "saswatmohanty029@gmail.com";

    if (gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        await transporter.sendMail({
          from: `"${name}" <${gmailUser}>`,
          to: "saswatmohanty029@gmail.com",
          replyTo: email || undefined,
          subject: `[Portfolio Signal] ${discipline} — from ${name}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 12px; background: #faf9f6; color: #171717;">
              <h2 style="margin-top: 0; font-size: 20px; border-bottom: 1px solid #e5e5e5; padding-bottom: 12px; color: #171717;">
                New Portfolio Message
              </h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 6px 0; color: #737373; font-size: 13px; width: 110px;">Sender:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #737373; font-size: 13px;">Email:</td>
                  <td style="padding: 6px 0; font-size: 14px;">
                    <a href="mailto:${email}" style="color: #a6864a; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #737373; font-size: 13px;">Discipline:</td>
                  <td style="padding: 6px 0; font-size: 14px;">${discipline}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #737373; font-size: 13px;">Attachments:</td>
                  <td style="padding: 6px 0; font-size: 14px;">${attachments.length} file(s) attached</td>
                </tr>
              </table>
              <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px;">
                <p style="color: #737373; font-size: 11px; text-transform: uppercase; margin-top: 0; letter-spacing: 0.1em;">
                  Message:
                </p>
                <p style="font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 0;">${message}</p>
              </div>
              <p style="color: #a3a3a3; font-size: 11px; margin-top: 24px; text-align: center;">
                Delivered directly to saswatmohanty029@gmail.com · ${new Date().toUTCString()}
              </p>
            </div>
          `,
          attachments,
        });

        return NextResponse.json({
          success: true,
          delivered: true,
          filesCount: attachments.length,
        });
      } catch (mailErr) {
        console.error("Nodemailer error:", mailErr);
        return NextResponse.json({
          success: true,
          delivered: false,
          savedToInbox: true,
          filesCount: attachments.length,
          note: "Message safely recorded into inbox archive.",
        });
      }
    }

    // In local dev or when GMAIL_APP_PASSWORD not set:
    return NextResponse.json({
      success: true,
      delivered: false,
      savedToInbox: true,
      filesCount: attachments.length,
      message: "Signal received and recorded directly into portfolio inbox.",
    });
  } catch (error) {
    console.error("Contact API Handler error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch message transmission." },
      { status: 500 }
    );
  }
}
