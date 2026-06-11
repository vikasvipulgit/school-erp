import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { getBaseTemplate } from './templates/base-template';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);

  onModuleInit() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.logger.log('SendGrid API initialized successfully');
    } else {
      this.logger.warn('SENDGRID_API_KEY not found in environment. Email notifications will be disabled.');
    }
  }

  async sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    if (!process.env.SENDGRID_API_KEY) {
      this.logger.warn('Skipping email send: SendGrid API key not configured');
      return;
    }

    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@javiyaschool.com',
        name: process.env.SENDGRID_FROM_NAME || 'Javiya Schooling System',
      },
      subject,
      html,
    };

    try {
      console.log(`[DEBUG SENDGRID] Attempting to send to: ${to}`);
      const response = await sgMail.send(msg);
      console.log(`[DEBUG SENDGRID] Success! Message ID: ${response[0].headers['x-message-id']}`);
      this.logger.log(`Email sent successfully to ${to}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.response?.body || error.message);
      console.error(`[DEBUG SENDGRID] FAILURE! Error details:`, JSON.stringify(error.response?.body, null, 2));
      // Swallow the error to prevent unhandled promise rejections from crashing the server
      return false;
    }
  }

  // --- Specialized Template Builders ---

  async sendLeaveStatusEmail(to: string, teacherName: string, status: string, startDate: string, endDate: string, remarks?: string) {
    const isApproved = status.toLowerCase() === 'approved';
    const statusClass = isApproved ? 'status-approved' : 'status-rejected';
    
    const content = `
      <p>Hello <strong>${teacherName}</strong>,</p>
      <p>There has been an update regarding your leave application.</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid ${isApproved ? '#0694a2' : '#c81e1e'}; margin: 20px 0;">
        <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${status.toUpperCase()}</span></p>
        <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
        ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ''}
      </div>
      <p>You can log in to the portal to view more details or contact the administration if you have any questions.</p>
      <a href="http://localhost:5173/leave" class="button">View Leave Status</a>
    `;

    return this.sendEmail({
      to,
      subject: `Leave Application ${status} - Javiya Schooling System`,
      html: getBaseTemplate(content),
    });
  }

  async sendLeaveApplicationNotification(to: string, principalName: string, teacherName: string, startDate: string, endDate: string, reason: string) {
    const content = `
      <p>Hello <strong>${principalName}</strong>,</p>
      <p>Teacher <strong>${teacherName}</strong> has applied for leave.</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #0B1F5C; margin: 20px 0;">
        <p><strong>Duration:</strong> ${startDate} to ${endDate}</p>
        <p><strong>Reason:</strong> ${reason}</p>
      </div>
      <p>Please review the application in the administration dashboard.</p>
      <a href="http://localhost:5173/admin/leave" class="button">Review Application</a>
    `;

    return this.sendEmail({
      to,
      subject: `New Leave Application: ${teacherName}`,
      html: getBaseTemplate(content),
    });
  }

  async sendTaskAssignedEmail(to: string, teacherName: string, taskTitle: string, dueDate: string, assignedBy: string) {
    const content = `
      <p>Hello <strong>${teacherName}</strong>,</p>
      <p>You have been assigned a new academic task.</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #0B1F5C; margin: 20px 0;">
        <p><strong>Task:</strong> ${taskTitle}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <p><strong>Assigned By:</strong> ${assignedBy}</p>
      </div>
      <p>Please review the task details and update your progress periodically.</p>
      <a href="http://localhost:5173/tasks" class="button">Go to Tasks</a>
    `;

    return this.sendEmail({
      to,
      subject: `New Task Assigned: ${taskTitle}`,
      html: getBaseTemplate(content),
    });
  }

  async sendFeedbackEmail(to: string, teacherName: string, title: string, message: string, type: string) {
    const content = `
      <p>Hello <strong>${teacherName}</strong>,</p>
      <p>You have received new ${type} from the Principal.</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #D4AF37; margin: 20px 0;">
        <h3 style="color: #0B1F5C; margin-top: 0;">${title}</h3>
        <p>"${message}"</p>
      </div>
      <p>Keep up the great work! Your contributions are highly valued.</p>
      <a href="http://localhost:5173/feedback" class="button">View Appreciation</a>
    `;

    return this.sendEmail({
      to,
      subject: `New Appreciation Received: ${title}`,
      html: getBaseTemplate(content),
    });
  }

  async sendProxyAssignedEmail(to: string, teacherName: string, className: string, date: string, period: string) {
    const content = `
      <p>Hello <strong>${teacherName}</strong>,</p>
      <p>You have been assigned a proxy period to cover for a colleague.</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #0B1F5C; margin: 20px 0;">
        <p><strong>Class:</strong> ${className}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Period:</strong> ${period}</p>
      </div>
      <p>Thank you for your cooperation in maintaining the school's academic schedule.</p>
      <a href="http://localhost:5173/leave" class="button">View Details</a>
    `;

    return this.sendEmail({
      to,
      subject: `Proxy Assignment Notification - ${date}`,
      html: getBaseTemplate(content),
    });
  }

  async sendTimetablePublishedEmail(to: string, teacherName: string) {
    const content = `
      <p>Hello <strong>${teacherName}</strong>,</p>
      <p>The academic timetable has been officially published and updated.</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #0B1F5C; margin: 20px 0;">
        <p>You can now view your updated schedule in the Timetable section of the portal.</p>
      </div>
      <p>Please check your periods and rooms to ensure a smooth academic flow.</p>
      <a href="http://localhost:5173/timetable" class="button">View Timetable</a>
    `;

    return this.sendEmail({
      to,
      subject: `Academic Timetable Published - Javiya Schooling System`,
      html: getBaseTemplate(content),
    });
  }
}
