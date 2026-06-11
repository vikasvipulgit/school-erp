import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendTaskAssignmentNotification(to: string, teacherName: string, taskTitle: string, dueDate: Date) {
    const dateStr = dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date';
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>New Task Assigned</h2>
        <p>Hello ${teacherName},</p>
        <p>You have been assigned a new task: <strong>${taskTitle}</strong></p>
        <p><strong>Due Date:</strong> ${dateStr}</p>
        <p>Please log in to the Javiya Schooling System to view details and update your progress.</p>
        <br />
        <p>Regards,<br />School Administration</p>
      </div>
    `;

    return this.sendMail(to, `New Task Assigned: ${taskTitle}`, html);
  }

  async sendTestEmail(to: string) {
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #2563eb;">ERP Connectivity Test</h2>
        <p>Hello,</p>
        <p>This is a test email sent from the <strong>Javiya Schooling System</strong> to verify that your SMTP settings are configured correctly.</p>
        <p>If you are seeing this, the email integration is working!</p>
        <br />
        <p style="font-size: 12px; color: #777;">Timestamp: ${new Date().toLocaleString()}</p>
      </div>
    `;
    return this.sendMail(to, 'Javiya Schooling System - SMTP Configuration Test', html);
  }

  private async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: '"Javiya Schooling System" <noreply@javiyaschool.com>',
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent successfully to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
    }
  }
}