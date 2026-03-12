export default function CookiesPage() {
  return (
    <div className="prose prose-slate max-w-none">
      <h1>Cookie Policy</h1>
      <p className="text-text-tertiary italic">
        Effective Date: December 28, 2025
      </p>

      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you browse our
        website. They help us ensure the platform works correctly and securely.
      </p>

      <h2>2. How we use cookies</h2>
      <p>We use cookies for the following purposes:</p>
      <ul>
        <li>
          <strong>Essential Cookies</strong>: Required for login, session
          management, and security (e.g., <code>authjs.session-token</code>).
          You cannot opt-out of these.
        </li>
        <li>
          <strong>Functional Cookies</strong>: Remember your preferences (e.g.,
          language, dashboard layout).
        </li>
        <li>
          <strong>Analytics Cookies</strong>: Help us understand how you use the
          platform (e.g., page views, load times). We do not share this data
          with ad networks.
        </li>
      </ul>

      <h2>3. Managing Cookies</h2>
      <p>
        You can control cookie preferences in your browser settings. However,
        disabling essential cookies may break login functionality.
      </p>
    </div>
  );
}
