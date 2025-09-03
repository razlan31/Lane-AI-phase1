import { supabase } from '@/integrations/supabase/client';

/**
 * Send a test email using SendGrid via Supabase Edge Function
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject (optional)
 * @param {string} text - Plain text content (optional)
 * @param {string} html - HTML content (optional)
 */
export async function sendTestEmail(to, subject, text, html) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject: subject || 'LaneAI Test Email',
        text: text || 'This is a test email from LaneAI + SendGrid integration.',
        html: html
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to send email');
    }

    if (!data.success) {
      console.error('SendGrid error:', data.error);
      throw new Error(data.error || 'Failed to send email');
    }

    return {
      success: true,
      message: data.message,
      to: data.to,
      subject: data.subject
    };
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
}

/**
 * Send a welcome email to new users
 * @param {string} to - Recipient email address
 * @param {string} name - User's name
 */
export async function sendWelcomeEmail(to, name) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Welcome to LaneAI!</h1>
      <p>Hi ${name || 'there'},</p>
      <p>Welcome to LaneAI - your AI-powered venture companion. We're excited to help you build and grow your business!</p>
      <p>Get started by:</p>
      <ul>
        <li>Creating your first venture</li>
        <li>Setting up your KPIs</li>
        <li>Exploring our AI tools</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The LaneAI Team</p>
    </div>
  `;

  return sendTestEmail(to, 'Welcome to LaneAI!', undefined, html);
}