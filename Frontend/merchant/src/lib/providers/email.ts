import { urls } from "@vayva/shared";

export class EmailProvider {
    static apiKey: string | undefined = process.env.RESEND_API_KEY;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async sendEmail(to: any, subject: any, html: unknown) {
        if (!this.apiKey) {
            throw new Error("Missing Email configuration (RESEND_API_KEY)");
        }
        const response = await fetch(`${urls.resendBase()}/emails`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: `Vayva <${urls.noReplyEmail()}>`,
                to: [to],
                subject: subject,
                html: html
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Email API request failed");
        }
        return await response.json();
    }
}
EmailProvider.apiKey = process.env.RESEND_API_KEY;
