'use server';

interface SendTestEmailParams {
  recipientEmail: string;
}

interface SendTestEmailResult {
  success: boolean;
  error?: string;
}

export async function sendTestEmail(params: SendTestEmailParams): Promise<SendTestEmailResult> {
  try {
    const { recipientEmail } = params;

    // Validate email
    if (!recipientEmail || !isValidEmail(recipientEmail)) {
      return {
        success: false,
        error: 'Please provide a valid recipient email address',
      };
    }

    // Email service not configured yet
    return {
      success: false,
      error: 'Email service not configured. Please configure an email provider to send test emails.',
    };
  } catch (error) {
    console.error('Test email send error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: `Failed to send test email: ${errorMessage}`,
    };
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
