import nodemailer from "nodemailer";
import "dotenv/config";

/**
 * Create email transporter
 * @returns {Object} Nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.Email_Service,
    auth: {
      user: process.env.Email,
      pass: process.env.Email_Password,
    },
  });
};

/**
 * Send an email
 * @param {Object} options Email options
 * @param {string} options.to Recipient email
 * @param {string} options.subject Email subject
 * @param {string} options.html Email HTML content
 * @param {string} [options.text] Email plain text content
 * @param {string} [options.from] Sender email (optional, uses default if not provided)
 * @returns {Promise<Object>} Response from email provider
 */
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    const result = await transporter.sendMail({
      from: options.from || `"EduCore" <${process.env.Email}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    
    return {
      id: result.messageId,
      status: "sent",
    };
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

/**
 * Send payment receipt email
 * @param {Object} order Order details
 * @returns {Promise<Object>} Response from email provider
 */
export const sendPaymentReceipt = async (order) => {
  const receiptDate = new Date(order.orderDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">EduCore</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Payment Receipt</p>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Success Icon -->
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; background: #10b981; border-radius: 50%; padding: 15px;">
              <span style="font-size: 30px;">✓</span>
            </div>
            <h2 style="color: #10b981; margin: 15px 0 5px 0;">Payment Successful!</h2>
            <p style="color: #6b7280; margin: 0;">Thank you for your purchase, ${order.userName}!</p>
          </div>
          
          <!-- Order Details -->
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Order Details</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Order ID:</td>
                <td style="padding: 8px 0; color: #111827; text-align: right; font-weight: 500;">${order._id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Date:</td>
                <td style="padding: 8px 0; color: #111827; text-align: right;">${receiptDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Payment Method:</td>
                <td style="padding: 8px 0; color: #111827; text-align: right;">PayPal</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Payment ID:</td>
                <td style="padding: 8px 0; color: #111827; text-align: right; font-size: 12px;">${order.paymentId}</td>
              </tr>
            </table>
          </div>
          
          <!-- Course Details -->
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Course Purchased</h3>
            
            <div style="display: flex; align-items: center;">
              ${order.courseImage ? `<img src="${order.courseImage}" alt="${order.courseTitle}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 6px; margin-right: 15px;">` : ''}
              <div style="flex: 1;">
                <p style="margin: 0; color: #111827; font-weight: 600;">${order.courseTitle}</p>
                <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Instructor: ${order.instructorName}</p>
              </div>
            </div>
          </div>
          
          <!-- Total -->
          <div style="background: #4f46e5; border-radius: 8px; padding: 20px; text-align: center;">
            <p style="color: rgba(255,255,255,0.8); margin: 0 0 5px 0; font-size: 14px;">Total Amount Paid</p>
            <p style="color: white; margin: 0; font-size: 32px; font-weight: 700;">$${parseFloat(order.coursePricing).toFixed(2)}</p>
          </div>
          
          <!-- CTA -->
          <div style="text-align: center; margin-top: 25px;">
            <a href="${process.env.CLIENT_URL}/student-courses" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Start Learning Now
            </a>
          </div>
          
          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This receipt was sent to ${order.userEmail}
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} EduCore. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: order.userEmail,
    subject: `Payment Receipt - ${order.courseTitle}`,
    html,
  });
};

/**
 * Send bulk emails
 * @param {Object} options Bulk email options
 * @param {string[]} options.recipients Array of recipient emails
 * @param {string} options.subject Email subject
 * @param {string} options.html Email HTML content
 * @param {string} [options.text] Email plain text content
 * @param {Object} [options.trackingData] Data for tracking email events
 * @returns {Promise<Object>} Response from email provider
 */
export const sendBulkEmails = async (options) => {
  // This is a placeholder for actual bulk email sending logic
  console.log(`Would send email to ${options.recipients.length} recipients:`, {
    subject: options.subject,
    trackingData: options.trackingData,
  });
  
  // Return a mock success response
  return {
    id: `mock-bulk-email-${Date.now()}`,
    status: "sent",
    count: options.recipients.length,
  };
};