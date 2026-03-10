import { EmailServiceError, MissingEnvVarError } from "@/utils/errors";

if (!process.env.MAIL_API_KEY) {
  throw new MissingEnvVarError("MAIL_API_KEY");
}

const mailApiKey = process.env.MAIL_API_KEY;

export const mailService = {
  sendVerificationEmail: async (email: string, verificationCode: string): Promise<void> => {
    const emailBody = {
      sender: {
        name: "Memoize Team",
        email: "support@memoize.in",
      },
      to: [{ email }],
      subject: "Memoize Verification Code",
      htmlContent: `
        <div style='font-size:16px;'>Your email verification code is: <strong>${verificationCode}</strong></div>
        <div>This code will only be active for 10 minutes (you will only be able to generate a new code once this expires)</div>
      `,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": mailApiKey,
      },
      body: JSON.stringify(emailBody),
    });

    if (!response.ok) {
      throw new EmailServiceError(`Failed to send verification email: ${response.statusText}`);
    }
  },
};
