import { ClientLead } from '../types';

export class GoogleMailService {
  /**
   * Encodes a MIME email message in URL-safe base64
   */
  private static makeBody(to: string, fromName: string, fromEmail: string, subject: string, messageHtml: string): string {
    const str = [
      `To: ${to}`,
      `From: "${fromName}" <${fromEmail}>`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      messageHtml,
    ].join('\r\n');

    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  public static async sendWelcomeEmailViaGmailApi(
    token: string | null,
    lead: ClientLead,
    senderName: string,
    senderEmail: string,
    brandName: string,
    customNote?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `Welcome to ${brandName} – Next Steps for Your Project`;
    const firstName = lead.name.split(' ')[0] || 'there';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #1e3a8a; font-size: 22px;">${brandName}</h2>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Automated Client Onboarding</p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${firstName}</strong>,</p>
        
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          Thank you for reaching out! We have received your submission through our client intake portal.
        </p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px; text-transform: uppercase;">Submission Summary</h4>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Service:</strong> ${lead.service}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Organization:</strong> ${lead.company || 'Individual'}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Budget:</strong> ${lead.budget || 'Not specified'}</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          ${customNote || 'Our team is reviewing your requirements and will reach out to you within 24 hours.'}
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">
          <p style="margin: 0 0 4px 0;"><strong>${senderName}</strong></p>
          <p style="margin: 0 0 4px 0;">${brandName}</p>
          <p style="margin: 0; color: #3b82f6;">${senderEmail}</p>
        </div>
      </div>
    `;

    if (token && !token.startsWith('mock_')) {
      try {
        const raw = this.makeBody(lead.email, senderName, senderEmail, subject, htmlContent);
        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw }),
        });

        if (response.ok) {
          const data = await response.json();
          return { success: true, messageId: data.id };
        } else {
          const errData = await response.json();
          return { success: false, error: errData.error?.message || 'Gmail API request failed' };
        }
      } catch (e: any) {
        return { success: false, error: e.message || 'Network error sending email' };
      }
    }

    // Return simulated success in preview
    return { success: true, messageId: 'msg_' + Math.random().toString(36).substring(2, 10) };
  }
}
