export default function TermsPage() {
  return (
    <div className="prose prose-slate max-w-none">
      <h1>Terms of Service</h1>
      <p className="text-text-tertiary italic">
        Effective Date: December 28, 2025
      </p>

      <h2>1. Acceptance</h2>
      <p>
        By registering for Vayva, you agree to these Terms. If you do not agree,
        do not use the Service.
      </p>

      <h2>2. Merchant Responsibilities</h2>
      <ul>
        <li>
          You are responsible for the legality of the products/services you
          sell.
        </li>
        <li>
          You must fulfill orders promptly and handle customer disputes fairly.
        </li>
        <li>You agree to comply with all applicable tax laws.</li>
      </ul>

      <h2>3. Fees & Payments</h2>
      <ul>
        <li>
          <strong>Subscription</strong>: Fees are billed according to your
          selected plan (Starter, Growth, Scale).
        </li>
        <li>
          <strong>Transaction Fees</strong>: We verify payment status via
          Paystack. A standard transaction fee (e.g., 5%) applies to
          withdrawals/payouts.
        </li>
        <li>
          <strong>Refunds</strong>: Subscription fees are non-refundable.
        </li>
      </ul>

      <h2>4. Prohibited Content</h2>
      <p>
        You may not use Vayva to sell illegal goods, weapons, drugs, or
        fraudulent services. We reserve the right to suspend any store violating
        this policy immediately.
      </p>

      <h2>5. Reliability & SLA</h2>
      <p>
        We strive for 99.9% uptime. However, the Service is provided "AS IS"
        without warranties of any kind. We are not liable for lost profits due
        to downtime or third-party (e.g., Paystack) outages.
      </p>

      <h2>6. Account Termination</h2>
      <p>
        We may terminate your account for violations of these Terms. You may
        terminate your account at any time via the Admin Dashboard.
      </p>
    </div>
  );
}
