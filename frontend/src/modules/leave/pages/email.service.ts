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

  async sendLeaveStatusNotification(to: string, teacherName: string, status: string, startDate: Date, endDate: Date) {
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Leave Request Update</h2>
        <p>Hello ${teacherName},</p>
        <p>Your leave request for the period <strong>${start} to ${end}</strong> has been <strong>${status.toUpperCase()}</strong>.</p>
        <p>Please log in to the portal for more details.</p>
        <br />
        <p>Regards,<br />School Administration</p>
      </div>
    `;

    return this.sendMail(to, `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`, html);
  }

  async sendLeaveApplicationNotification(to: string, approverName: string, teacherName: string, startDate: Date, endDate: Date, reason: string) {
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>New Leave Application</h2>
        <p>Hello ${approverName},</p>
        <p>Teacher <strong>${teacherName}</strong> has applied for leave.</p>
        <p><strong>Duration:</strong> ${start} to ${end}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please review the application in the administration dashboard.</p>
        <br />
        <p>Regards,<br />Javiya Schooling System</p>
      </div>
    `;

    return this.sendMail(to, `New Leave Application: ${teacherName}`, html);
  }

  async sendTimetablePublishedNotification(to: string, teacherName: string) {
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>New Timetable Published</h2>
        <p>Hello ${teacherName},</p>
        <p>The official timetable for the upcoming period has been published and is now active.</p>
        <br />
        <p>Regards,<br />Academic Coordinator</p>
      </div>
    `;

    return this.sendMail(to, `Academic Timetable Published`, html);
  }

  async sendTestEmail(to: string) {
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #2563eb;">ERP Connectivity Test</h2>
        <p>Hello, this is a test email from the Javiya Schooling System.</p>
        <p>Timestamp: ${new Date().toLocaleString()}</p>
      </div>
    `;
    return this.sendMail(to, 'Javiya Schooling System - SMTP Test', html);
  }

  private async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: '"Javiya Schooling System" <noreply@javiyaschool.com>',
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
    }
  }
}