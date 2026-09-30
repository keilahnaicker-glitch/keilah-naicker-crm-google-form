import { ScriptConfig } from '../types';

export const DEFAULT_SCRIPT_CONFIG: ScriptConfig = {
  scriptName: 'Google Workspace CRM Auto-Responder',
  recipientAdminEmail: 'keilahnaicker@gmail.com',
  senderName: 'Keilah Naicker',
  emailSubject: 'Welcome to our Client Network – Next Steps & Confirmation',
  brandName: 'Keilah Naicker Consulting & Services',
  includeAdminNotification: true,
  updateSheetStatus: true,
  customWelcomeBody: `Thank you for reaching out and submitting your project inquiry. We have received your details and our team is already reviewing your requirements. We typically respond within 24 hours to schedule an introductory consultation.`,
};

export function generateAppsScriptCode(config: ScriptConfig, sheetName: string = 'Form Responses 1'): string {
  return `/**
 * ============================================================================
 * GOOGLE WORKSPACE CRM — AUTOMATED WELCOME EMAIL TRIGGER
 * Author: ${config.senderName} (${config.recipientAdminEmail})
 * Brand: ${config.brandName}
 * Generated: ${new Date().toISOString()}
 * ============================================================================
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Spreadsheet (or Google Form).
 * 2. In the top menu, click Extensions > Apps Script.
 * 3. Delete any code in the editor (Code.gs) and paste this entire script.
 * 4. Click the Save icon (Floppy disk / Ctrl+S).
 * 5. In the left sidebar, click Triggers (alarm clock icon) > + Add Trigger:
 *    - Choose which function to run: onFormSubmit
 *    - Select event source: From spreadsheet (or From form)
 *    - Select event type: On form submit
 *    - Failure notification settings: Notify me immediately
 * 6. Click Save and authorize permissions.
 * ============================================================================
 */

// Configuration constants
const CONFIG = {
  ADMIN_EMAIL: '${config.recipientAdminEmail}',
  SENDER_NAME: '${config.senderName}',
  BRAND_NAME: '${config.brandName}',
  EMAIL_SUBJECT: '${config.emailSubject}',
  SHEET_NAME: '${sheetName}',
  NOTIFY_ADMIN: ${config.includeAdminNotification},
  UPDATE_SHEET: ${config.updateSheetStatus}
};

/**
 * Main Trigger Function called automatically when a form is submitted
 * @param {Object} e - Event object passed by Google Forms / Sheets
 */
function onFormSubmit(e) {
  try {
    console.log("🔔 [CRM Trigger] New form submission detected!");
    
    // Extract client details safely from event object or active sheet row
    const lead = extractLeadData(e);
    
    if (!lead || !lead.email) {
      console.warn("⚠️ [CRM Warning] No valid client email address found in submission. Aborting auto-responder.");
      return;
    }
    
    console.log("📨 [CRM] Preparing welcome email for: " + lead.name + " <" + lead.email + ">");
    
    // 1. Send personalized welcome email to the client
    sendClientWelcomeEmail(lead);
    
    // 2. Send instant notification to admin/business owner
    if (CONFIG.NOTIFY_ADMIN) {
      sendAdminNotification(lead);
    }
    
    // 3. Mark row as 'Email Sent' in the Google Sheet
    if (CONFIG.UPDATE_SHEET && e && e.range) {
      markEmailSentInSheet(e.range);
    }
    
    console.log("✅ [CRM Success] Automated CRM welcome sequence completed successfully for: " + lead.email);
    
  } catch (error) {
    console.error("❌ [CRM Error] Failed to process submission: " + error.toString(), error.stack);
    
    // Attempt to notify admin about the failure
    try {
      MailApp.sendEmail({
        to: CONFIG.ADMIN_EMAIL,
        subject: "[CRM Alert] Automation Error in Form Trigger",
        body: "An error occurred while processing a new form submission:\\n\\n" + error.toString()
      });
    } catch (notifyErr) {
      console.error("Failed to send error notification", notifyErr);
    }
  }
}

/**
 * Helper to parse form response columns reliably
 */
function extractLeadData(e) {
  const lead = {
    timestamp: new Date().toLocaleString(),
    name: "Valued Client",
    email: "",
    phone: "Not provided",
    company: "Individual",
    service: "General Inquiry",
    budget: "Not specified",
    notes: ""
  };
  
  if (!e) {
    console.log("ℹ️ No event object provided (Manual test run detected).");
    return lead;
  }
  
  // Case A: Event contains named values (Google Form attached directly or Sheet Form Response)
  if (e.namedValues) {
    for (const key in e.namedValues) {
      const lowerKey = key.toLowerCase();
      const val = e.namedValues[key][0] ? e.namedValues[key][0].trim() : "";
      
      if (lowerKey.includes("name") || lowerKey.includes("full name")) lead.name = val || lead.name;
      else if (lowerKey.includes("email")) lead.email = val;
      else if (lowerKey.includes("phone") || lowerKey.includes("mobile") || lowerKey.includes("tel")) lead.phone = val;
      else if (lowerKey.includes("company") || lowerKey.includes("organization") || lowerKey.includes("business")) lead.company = val;
      else if (lowerKey.includes("service") || lowerKey.includes("interest") || lowerKey.includes("requirement")) lead.service = val;
      else if (lowerKey.includes("budget") || lowerKey.includes("price") || lowerKey.includes("tier")) lead.budget = val;
      else if (lowerKey.includes("note") || lowerKey.includes("message") || lowerKey.includes("detail") || lowerKey.includes("description")) lead.notes = val;
    }
    return lead;
  }
  
  // Case B: Values passed as an array [Timestamp, Name, Email, Phone, Company, Service, Budget, Notes...]
  if (e.values && Array.isArray(e.values)) {
    const vals = e.values;
    lead.timestamp = vals[0] || lead.timestamp;
    lead.name = vals[1] || lead.name;
    lead.email = vals[2] || "";
    lead.phone = vals[3] || lead.phone;
    lead.company = vals[4] || lead.company;
    lead.service = vals[5] || lead.service;
    lead.budget = vals[6] || lead.budget;
    lead.notes = vals[7] || lead.notes;
    return lead;
  }
  
  return lead;
}

/**
 * Sends HTML + Plaintext Welcome Email to the client
 */
function sendClientWelcomeEmail(lead) {
  const firstName = lead.name.split(" ")[0] || "there";
  
  const plainTextBody = 
    "Hi " + firstName + ",\\n\\n" +
    "Thank you for contacting " + CONFIG.BRAND_NAME + "! We have received your client intake submission.\\n\\n" +
    "Summary of your inquiry:\\n" +
    "• Service: " + lead.service + "\\n" +
    "• Organization: " + lead.company + "\\n" +
    "• Budget Range: " + lead.budget + "\\n\\n" +
    "${config.customWelcomeBody?.replace(/"/g, '\\"') || 'We will review your details and be in touch promptly.'}\\n\\n" +
    "Best regards,\\n" +
    CONFIG.SENDER_NAME + "\\n" +
    CONFIG.BRAND_NAME + "\\n" +
    CONFIG.ADMIN_EMAIL;

  const htmlBody = \`
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
      <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #1e3a8a; font-size: 22px; font-weight: 700;">\${CONFIG.BRAND_NAME}</h2>
        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Client Relationship & Project Intake</p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6;">Hello <strong>\${escapeHtml(firstName)}</strong>,</p>
      
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        Thank you for connecting with us! We have successfully received your inquiry through our client portal.
      </p>
      
      <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Your Submission Summary</h4>
        <table style="width: 100%; font-size: 14px; color: #475569; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; width: 140px; font-weight: 600;">Service Focus:</td>
            <td style="padding: 4px 0; color: #0f172a;">\${escapeHtml(lead.service)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Company / Org:</td>
            <td style="padding: 4px 0; color: #0f172a;">\${escapeHtml(lead.company)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Budget Tier:</td>
            <td style="padding: 4px 0; color: #0f172a;">\${escapeHtml(lead.budget)}</td>
          </tr>
        </table>
      </div>
      
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        ${config.customWelcomeBody?.replace(/"/g, '\\"') || 'Our team is reviewing your project details. You can expect a personalized response from us within 24 business hours.'}
      </p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">
        <p style="margin: 0 0 4px 0;"><strong>\${CONFIG.SENDER_NAME}</strong></p>
        <p style="margin: 0 0 4px 0;">\${CONFIG.BRAND_NAME}</p>
        <p style="margin: 0; color: #3b82f6;"><a href="mailto:\${CONFIG.ADMIN_EMAIL}" style="color: #3b82f6; text-decoration: none;">\${CONFIG.ADMIN_EMAIL}</a></p>
      </div>
    </div>
  \`;

  MailApp.sendEmail({
    to: lead.email,
    subject: CONFIG.EMAIL_SUBJECT,
    body: plainTextBody,
    htmlBody: htmlBody,
    name: CONFIG.SENDER_NAME,
    replyTo: CONFIG.ADMIN_EMAIL
  });
}

/**
 * Sends Admin Alert to ${config.recipientAdminEmail}
 */
function sendAdminNotification(lead) {
  const subject = "⚡ [New CRM Lead] " + lead.name + " (" + lead.company + ")";
  const body = 
    "A new client has completed your Google Form intake:\\n\\n" +
    "• Name: " + lead.name + "\\n" +
    "• Email: " + lead.email + "\\n" +
    "• Phone: " + lead.phone + "\\n" +
    "• Company: " + lead.company + "\\n" +
    "• Service: " + lead.service + "\\n" +
    "• Budget: " + lead.budget + "\\n" +
    "• Notes: " + lead.notes + "\\n\\n" +
    "An automated welcome email was dispatched to " + lead.email + " immediately.";
    
  MailApp.sendEmail({
    to: CONFIG.ADMIN_EMAIL,
    subject: subject,
    body: body,
    name: "CRM Intake Bot"
  });
}

/**
 * Updates the spreadsheet row with 'Email Sent: Yes'
 */
function markEmailSentInSheet(range) {
  try {
    const sheet = range.getSheet();
    const row = range.getRow();
    // Assuming columns: J=Status, K=Welcome Email Sent, L=Sent Timestamp
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    let emailStatusCol = -1;
    let timestampCol = -1;
    
    for (let i = 0; i < headers.length; i++) {
      const h = (headers[i] || "").toString().toLowerCase();
      if (h.includes("welcome email") || h.includes("email status") || h.includes("auto-reply")) {
        emailStatusCol = i + 1;
      }
      if (h.includes("sent timestamp") || h.includes("email sent at")) {
        timestampCol = i + 1;
      }
    }
    
    // If not found in headers, append to next available columns
    if (emailStatusCol === -1) emailStatusCol = 10;
    if (timestampCol === -1) timestampCol = 11;
    
    sheet.getRange(row, emailStatusCol).setValue("Sent (Automated)");
    sheet.getRange(row, timestampCol).setValue(new Date().toLocaleString());
    
  } catch (err) {
    console.warn("Could not update status in sheet: " + err.message);
  }
}

/**
 * Test function to verify permissions and run a simulated execution
 */
function testAutomation() {
  const testPayload = {
    namedValues: {
      "Full Name": ["Test Client (Keilah Demo)"],
      "Email Address": ["${config.recipientAdminEmail}"],
      "Phone Number": ["+1 555-0199"],
      "Company / Organization": ["Acme Corp"],
      "Service Interested In": ["Premium Consulting"],
      "Project Budget": ["$5,000 - $10,000"],
      "Project Notes": ["This is a test submission from the CRM Test Runner."]
    }
  };
  
  console.log("🧪 Running manual testAutomation() trigger...");
  onFormSubmit(testPayload);
  console.log("🏁 testAutomation() finished! Check your inbox at ${config.recipientAdminEmail}");
}

function escapeHtml(text) {
  if (!text) return "";
  return text.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
`;
}
