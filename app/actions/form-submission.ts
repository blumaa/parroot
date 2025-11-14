'use server';

import { getAdminDb } from '@/app/lib/firebase-admin';
import type { FormField } from '@/app/types';

interface SubmitFormParams {
  formData: Record<string, string>;
  fields: FormField[];
  recipientEmail: string;
}

interface SubmitFormResult {
  success: boolean;
  error?: string;
}

export async function submitForm(params: SubmitFormParams): Promise<SubmitFormResult> {
  try {
    const { formData, fields, recipientEmail } = params;

    // Validate required fields
    for (const field of fields) {
      if (field.required && !formData[field.id]) {
        return {
          success: false,
          error: `${field.label} is required`,
        };
      }
    }

    // Validate email format if email field exists
    const emailFields = fields.filter(f => f.type === 'email');
    for (const field of emailFields) {
      const email = formData[field.id];
      if (email && !isValidEmail(email)) {
        return {
          success: false,
          error: `${field.label} must be a valid email address`,
        };
      }
    }

    // Transform formData to use field labels as keys
    const labeledData: Record<string, string> = {};
    for (const field of fields) {
      labeledData[field.label] = formData[field.id] || '';
    }

    // Save to Firestore
    const db = getAdminDb();
    await db.collection('formSubmissions').add({
      data: labeledData,
      recipientEmail,
      submittedAt: new Date().toISOString(),
      read: false,
    });

    return { success: true };
  } catch (error) {
    console.error('Form submission error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to submit form: ${errorMessage}`,
    };
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
