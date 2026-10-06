import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";

export const metadata: Metadata = {
  title: "Terms and Conditions | Sitepulse",
  description: "Terms for using the Sitepulse website status checker.",
};

export default function TermsPage() {
  return (
    <LegalLayout
      activePage="terms"
      description="These terms explain the basic rules for using Sitepulse and what to expect from a website status check."
      title="Terms and conditions"
    >
      <section>
        <h2>Using Sitepulse</h2>
        <p>
          Sitepulse provides a free tool that makes a single request to a public
          website and displays the response it receives. By using the checker,
          you agree to these terms and to use the service lawfully.
        </p>
      </section>

      <section>
        <h2>Checks are informational</h2>
        <p>
          A result is a point-in-time check from our server, not continuous
          monitoring or a guarantee that a website is available to every
          visitor. Network conditions, firewalls, redirects, and a
          website&apos;s own policies can affect the result. An HTTP error can
          still mean the website responded, while a failed connection does not
          prove that it is unavailable everywhere.
        </p>
        <p>
          Do not rely on Sitepulse for emergency decisions, service-level
          commitments, or other situations that require guaranteed monitoring.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>
          Only check websites you are permitted to access. Do not use Sitepulse
          to interfere with a service, evade access controls, or send automated
          or excessive requests. We may limit or suspend access to protect the
          service and other users.
        </p>
      </section>

      <section>
        <h2>Third-party websites and advertising</h2>
        <p>
          Sitepulse checks websites operated by others. Those websites have
          their own terms, privacy practices, and availability, which Sitepulse
          does not control. A link to an external website is provided for
          convenience and is not an endorsement.
        </p>
        <p>
          Advertising may be added to the service in the future. Any advertising
          providers will be subject to their own terms and privacy practices.
        </p>
      </section>

      <section>
        <h2>Availability and changes</h2>
        <p>
          Sitepulse is provided on an as-available basis. Features may change,
          be interrupted, or be discontinued. To the extent permitted by law, we
          make no warranties that the service will be uninterrupted, error-free,
          or suitable for a particular purpose.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the extent permitted by law, Sitepulse and its operator are not
          liable for indirect or consequential loss, or for decisions made based
          on a status result. Nothing in these terms excludes liability that
          cannot legally be excluded.
        </p>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>
          We may update these terms as the service changes. The date at the top
          of this page shows when they were last revised. Continued use after an
          update means you accept the revised terms.
        </p>
      </section>

      <p className="legal-note">
        Before launch, add the service operator&apos;s legal name and contact
        details, and have these terms reviewed for the jurisdictions where you
        operate.
      </p>
    </LegalLayout>
  );
}
