import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";

const Privacy = () => {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    // Set page title
    document.title = "JobHub — Privacy Policy";

    // Intersection Observer for TOC active state
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" }
    );

    // Observe all section headings
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
      document.title = "JobHub"; // Reset title on unmount
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sections = [
    { id: "who-we-are", title: "1. Who we are" },
    { id: "data-we-collect", title: "2. The data we collect" },
    { id: "how-we-use", title: "3. How we use your data" },
    { id: "verification", title: "4. Verification & reviews" },
    { id: "sharing-data", title: "5. Sharing your data" },
    { id: "international-transfers", title: "6. International transfers" },
    { id: "data-retention", title: "7. Data retention" },
    { id: "your-rights", title: "8. Your rights" },
    { id: "security", title: "9. Security" },
    { id: "children", title: "10. Children" },
    { id: "cookies", title: "11. Cookies" },
    { id: "changes", title: "12. Changes to this policy" },
    { id: "contact", title: "13. Contact us" },
  ];

  const todayDate = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="lg:grid lg:grid-cols-[1fr_250px] lg:gap-12">
          {/* Main Content */}
          <main>
            <article className="prose prose-slate dark:prose-invert max-w-none">
              {/* Header */}
              <div className="not-prose">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  Privacy Policy
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Last updated: {todayDate}
                </p>
              </div>

              {/* Introduction */}
              <p className="mt-6 text-slate-700 dark:text-slate-300 leading-7">
                JobHub ("<strong>we</strong>", "<strong>us</strong>", "<strong>our</strong>") helps UK homeowners connect with tradespeople. This policy explains how we collect, use, and share your personal data when you use JobHub as a <strong>homeowner</strong>, a <strong>tradesperson</strong>, or when you <strong>browse</strong> our site.
              </p>
              <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                If you have questions, contact us at <a href="mailto:virtoala0@gmail.com" className="font-semibold text-trust-blue hover:underline">virtoala0@gmail.com</a>.
              </p>

              {/* Section 1 */}
              <section id="who-we-are" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  1. Who we are (Data Controller)
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  <strong>Controller:</strong> Martin Hristev (operating as JobHub)
                  <br />
                  <strong>Registered address:</strong> 27 Botsford Road, United Kingdom
                  <br />
                  <strong>Email:</strong> <a href="mailto:virtoala0@gmail.com" className="text-trust-blue hover:underline">virtoala0@gmail.com</a>
                </p>
              </section>

              {/* Section 2 */}
              <section id="data-we-collect" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  2. The data we collect
                </h2>

                <h3 className="mt-6 text-base font-semibold text-slate-900 dark:text-slate-50">
                  2.1 Data you provide directly
                </h3>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>Account & profile data</strong> (both roles): name, email, phone, location/town, postcode.</li>
                  <li><strong>Homeowner job posts:</strong> job title/description, photos (optional), budget range, timing, postcode, preferred contact method.</li>
                  <li><strong>Tradesperson onboarding:</strong> trade categories, years of experience, certifications/qualifications (e.g., IDs, license names or numbers), profile photos, service radius, service location.</li>
                  <li><strong>Payment actions (trader):</strong> application fee/credit purchases and billing details (processed by our payment provider; we never store full card numbers).</li>
                  <li><strong>Messages & reviews:</strong> chat messages, ratings, comments, job feedback.</li>
                  <li><strong>Support inquiries:</strong> questions, bug reports, or other contact.</li>
                </ul>

                <h3 className="mt-6 text-base font-semibold text-slate-900 dark:text-slate-50">
                  2.2 Data we collect automatically
                </h3>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>Usage & device data:</strong> pages viewed, actions taken, IP address, browser/OS, device identifiers.</li>
                  <li><strong>Cookies & similar tech:</strong> strictly necessary cookies to operate the site; optional analytics cookies if enabled (see "Cookies" below).</li>
                </ul>

                <h3 className="mt-6 text-base font-semibold text-slate-900 dark:text-slate-50">
                  2.3 Data from others
                </h3>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>Email notifications to tradespeople</strong> initiated by homeowners (AI/job assistant suggestions).</li>
                  <li><strong>Verification indicators:</strong> a manual "Verified"/"Unverified" status is currently assigned by our team. (See "Verification" below.)</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section id="how-we-use" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  3. How we use your data (Purposes & lawful bases)
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  We process data under UK GDPR Art. 6(1) as follows:
                </p>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>
                    <strong>Provide and operate JobHub</strong> (create accounts, post jobs, show jobs, allow applications and chat).
                    <br />
                    <em>Legal basis:</em> <strong>Contract</strong> (Art. 6(1)(b)).
                  </li>
                  <li>
                    <strong>Payments</strong> (e.g., trader application fee).
                    <br />
                    <em>Legal basis:</em> <strong>Contract</strong> (Art. 6(1)(b)); <strong>Legal obligation</strong> for financial records (Art. 6(1)(c)).
                  </li>
                  <li>
                    <strong>AI assistance & matching</strong> (suggesting suitable trades, refining job posts, recommending actions).
                    <br />
                    <em>Legal basis:</em> <strong>Legitimate interests</strong> (Art. 6(1)(f)) to improve matching and user experience.
                  </li>
                  <li>
                    <strong>Safety, integrity, and abuse prevention</strong> (detect spam/fraud, protect users).
                    <br />
                    <em>Legal basis:</em> <strong>Legitimate interests</strong> (Art. 6(1)(f)); <strong>Legal obligation</strong> where applicable.
                  </li>
                  <li>
                    <strong>Communications</strong> (service updates, transactional emails, reminders).
                    <br />
                    <em>Legal basis:</em> <strong>Contract</strong> (Art. 6(1)(b)) and/or <strong>Legitimate interests</strong> (Art. 6(1)(f)).
                    <br />
                    Marketing emails, if any, will rely on <strong>consent</strong> or soft opt-in as permitted.
                  </li>
                  <li>
                    <strong>Analytics & product improvement</strong> (aggregate usage).
                    <br />
                    <em>Legal basis:</em> <strong>Legitimate interests</strong> (Art. 6(1)(f)). For non-essential cookies, we obtain <strong>consent</strong>.
                  </li>
                </ul>
              </section>

              {/* Section 4 */}
              <section id="verification" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  4. Verification & reviews
                </h2>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>Verification status</strong> is currently determined <strong>manually</strong> by JobHub staff based on information provided (e.g., qualifications, insurance, experience). We may update this process in the future.</li>
                  <li><strong>Reviews</strong> can be left by homeowners tied to completed jobs; reviews and ratings are visible on tradesperson profiles.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section id="sharing-data" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  5. Sharing your data
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  We share personal data only as needed to operate JobHub:
                </p>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>Payment processing:</strong> Stripe (or equivalent). We share payment intent details; we do not store full card numbers.</li>
                  <li><strong>Email & notifications:</strong> transactional email providers (e.g., SendGrid/Postmark) to deliver messages.</li>
                  <li><strong>Analytics (if enabled):</strong> privacy-focused analytics provider to understand aggregate usage.</li>
                  <li><strong>Hosting & infrastructure:</strong> cloud and security vendors necessary to run the service.</li>
                  <li><strong>Legal & compliance:</strong> law enforcement or regulators where required by law, or to defend legal claims.</li>
                  <li><strong>Business transfers:</strong> in the event of a merger, acquisition, or asset sale, data may transfer under appropriate safeguards.</li>
                </ul>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  We do <strong>not</strong> sell personal data.
                </p>
              </section>

              {/* Section 6 */}
              <section id="international-transfers" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  6. International transfers
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  Where vendors process data outside the UK, we rely on <strong>UK adequacy regulations</strong> or <strong>appropriate safeguards</strong> (e.g., Standard Contractual Clauses).
                </p>
              </section>

              {/* Section 7 */}
              <section id="data-retention" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  7. Data retention
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  We keep personal data only as long as necessary for the purposes above:
                </p>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Accounts and profiles: retained while your account is active.</li>
                  <li>Jobs, chats, and reviews: retained for the life of the account and a reasonable period thereafter for audit, safety, and dispute handling.</li>
                  <li>Payment records: retained per legal/financial requirements.</li>
                </ul>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  When no longer needed, data is deleted or anonymised.
                </p>
              </section>

              {/* Section 8 */}
              <section id="your-rights" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  8. Your rights (UK GDPR)
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  You have the right to:
                </p>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Access, correct, or delete your personal data.</li>
                  <li>Object to or restrict certain processing.</li>
                  <li>Data portability (where applicable).</li>
                  <li>Withdraw consent at any time (for consent-based processing).</li>
                </ul>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  To exercise these rights, email <a href="mailto:virtoala0@gmail.com" className="font-semibold text-trust-blue hover:underline">virtoala0@gmail.com</a>.
                </p>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  You also have the right to complain to the UK <strong>Information Commissioner's Office (ICO)</strong>:{" "}
                  <a
                    href="https://ico.org.uk/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-trust-blue hover:underline"
                  >
                    https://ico.org.uk/
                  </a>
                  .
                </p>
              </section>

              {/* Section 9 */}
              <section id="security" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  9. Security
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  We use technical and organisational measures to protect your data (encryption in transit, access controls, monitoring). No method is 100% secure, but we work to protect the service and your information.
                </p>
              </section>

              {/* Section 10 */}
              <section id="children" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  10. Children
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  JobHub is not intended for individuals under <strong>18</strong>. We do not knowingly collect personal data from children.
                </p>
              </section>

              {/* Section 11 */}
              <section id="cookies" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  11. Cookies
                </h2>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>Strictly necessary cookies</strong> operate core features (login session, CSRF, routing).</li>
                  <li><strong>Analytics cookies</strong> (if used) help us understand usage and improve the product.</li>
                </ul>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  Where required, we will ask for <strong>consent</strong> before setting analytics cookies. You can change preferences in your browser or via our cookie controls (if present).
                </p>
              </section>

              {/* Section 12 */}
              <section id="changes" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  12. Changes to this policy
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  We may update this policy to reflect changes in our service or the law. We will post the updated version here and revise the "Last updated" date.
                </p>
              </section>

              {/* Section 13 */}
              <section id="contact" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  13. Contact us
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  For privacy questions or requests:
                </p>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>Email:</strong> <a href="mailto:virtoala0@gmail.com" className="text-trust-blue hover:underline">virtoala0@gmail.com</a></li>
                  <li><strong>Mail:</strong> Martin Hristev (JobHub), 27 Botsford Road</li>
                </ul>
              </section>

              {/* Back to Top */}
              <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 not-prose">
                <button
                  onClick={scrollToTop}
                  className="inline-flex items-center gap-2 text-sm font-medium text-trust-blue hover:text-trust-blue/80 transition-colors focus:outline-none focus:ring-2 focus:ring-trust-blue focus:ring-offset-2 rounded-sm"
                  aria-label="Scroll to top"
                >
                  <ArrowUp className="h-4 w-4" />
                  Back to top
                </button>
              </div>
            </article>
          </main>

          {/* Table of Contents - Desktop only */}
          <aside className="hidden lg:block">
            <nav
              aria-label="On this page"
              className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto"
            >
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">
                On this page
              </h2>
              <ul className="space-y-2 text-sm border-l border-slate-200 dark:border-slate-800">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className={`block pl-4 py-1 -ml-px border-l transition-colors ${
                        activeSection === section.id
                          ? "border-trust-blue text-trust-blue font-medium"
                          : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById(section.id);
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
