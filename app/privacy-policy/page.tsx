import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Arinze Lab handles visitor data.",
  alternates: { canonical: "/privacy-policy" },
  openGraph: {
    title: "Privacy Policy",
    description: "How Arinze Lab handles visitor data.",
    url: "/privacy-policy",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto max-w-[720px] px-5 py-16 md:px-8">
      <h1 className="text-3xl font-bold md:text-4xl">Privacy Policy</h1>
      <div className="prose-article mt-8">
        <p>
          This website collects minimal information necessary to respond to
          contact form submissions and to understand aggregate visitor
          behavior through privacy-respecting analytics.
        </p>
        <h2>Contact Form</h2>
        <p>
          When you submit the contact form, your name, email address, and
          message are used solely to respond to your inquiry. This
          information is not sold or shared with third parties.
        </p>
        <h2>Analytics</h2>
        <p>
          Aggregate, anonymized analytics may be collected to understand
          which pages and projects are most useful to visitors.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about this policy can be sent to arinzelabs@gmail.com.
        </p>
      </div>
    </section>
  );
}
