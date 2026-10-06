import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy | Sitepulse",
  description: "Learn what Sitepulse processes when you check a website.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      activePage="privacy"
      description="This policy describes the information handled when you use the Sitepulse website status checker."
      title="Privacy policy"
    >
      <section>
        <h2>Information involved in a check</h2>
        <p>
          When you submit a website address, Sitepulse sends that address from
          its server to the website you asked us to check. We process the
          response status and timing to show you the result. We do not require
          an account, and the current app does not save submitted addresses or
          results in a Sitepulse user database.
        </p>
        <p>
          Our hosting provider may process standard connection information, such
          as your IP address, request time, and browser information, to deliver
          and protect the service. The website being checked may also receive
          connection information about our server and keep its own logs.
        </p>
      </section>

      <section>
        <h2>Recent check history</h2>
        <p>
          Recent checks are stored in local storage in your browser on the
          device you use. The app keeps up to 30 recent website checks there so
          you can revisit them. This history is not synced to an account or
          shared with other devices. Use the Clear control or your browser
          settings to remove it.
        </p>
      </section>

      <section>
        <h2>Cookies, analytics, and advertising</h2>
        <p>
          The current app does not integrate analytics or advertising scripts.
          The labeled advertisement area is a placeholder, not a live ad. If
          advertising such as Google AdSense is added, advertising partners may
          use cookies or similar technologies to provide and measure ads, as
          described in their own privacy policies. This policy and any required
          consent controls must be updated before those services are enabled.
        </p>
      </section>

      <section>
        <h2>How information is used</h2>
        <p>
          Information involved in a check is used to provide the requested
          result, maintain the service, and help prevent abuse. We do not sell
          the locally stored check history.
        </p>
      </section>

      <section>
        <h2>Retention and your choices</h2>
        <p>
          Browser history remains on your device until you clear it or remove
          the site&apos;s browser data. Operational records held by
          infrastructure providers are governed by their retention settings and
          agreements. You can choose not to use the checker, and you can clear
          local history at any time.
        </p>
      </section>

      <section>
        <h2>Children&apos;s privacy</h2>
        <p>
          Sitepulse is a general-purpose website tool and is not directed to
          children. If you believe a child has provided personal information
          directly to the service, contact the service operator so the matter
          can be reviewed.
        </p>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>
          We may revise this policy as the service changes. The updated date is
          shown above. Privacy rights and requirements vary by location; add a
          clear contact channel for privacy requests before making the service
          public.
        </p>
      </section>

      <p className="legal-note">
        This policy describes the current app implementation. Review it against
        your hosting logs, business location, audience, and any advertising or
        analytics tools you enable before launch.
      </p>
    </LegalLayout>
  );
}
