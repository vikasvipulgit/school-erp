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

  private async sendMail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: '"Javiya Schooling System" <noreply@javiyaschool.com>',
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
    }
  }
}