"use client";

export default function NewsletterForm() {
  return (
    <form
      className="hp-newsletter-form"
      onSubmit={(e) => e.preventDefault()}
    >
      <label htmlFor="hp-newsletter-email" style={{ position: "absolute", left: "-9999px" }}>
        Email address
      </label>
      <input
        id="hp-newsletter-email"
        type="email"
        placeholder="your@email.com"
        required
      />
      <button type="submit">Sign up</button>
    </form>
  );
}
