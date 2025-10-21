import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";

const Terms = () => {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    // Set page title
    document.title = "JobHub — Terms of Service";

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
    { id: "our-service", title: "2. Our Service" },
    { id: "accounts-eligibility", title: "3. Accounts & Eligibility" },
    { id: "roles-rules", title: "4. Roles and Platform Rules" },
    { id: "verification", title: "5. Verification & Badges" },
    { id: "ai-features", title: "6. AI Features" },
    { id: "payments", title: "7. Payments, Fees, and Refunds" },
    { id: "quotes-contracts", title: "8. Quotes, Contracts, and Workmanship" },
    { id: "reviews-ratings", title: "9. Reviews & Ratings" },
    { id: "acceptable-use", title: "10. Acceptable Use" },
    { id: "intellectual-property", title: "11. Intellectual Property" },
    { id: "third-party", title: "12. Third-Party Services" },
    { id: "availability", title: "13. Availability & Changes" },
    { id: "disclaimers", title: "14. Disclaimers" },
    { id: "limitation-liability", title: "15. Limitation of Liability" },
    { id: "indemnity", title: "16. Indemnity" },
    { id: "termination", title: "17. Termination" },
    { id: "governing-law", title: "18. Governing Law & Jurisdiction" },
    { id: "contact", title: "19. Contact" },
    { id: "related-policies", title: "20. Related Policies" },
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
                  Terms of Service
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Last updated: {todayDate}
                </p>
              </div>

              {/* Introduction */}
              <p className="mt-6 text-slate-700 dark:text-slate-300 leading-7">
                These Terms of Service ("<strong>Terms</strong>") govern your use of JobHub ("<strong>JobHub</strong>", "<strong>we</strong>", "<strong>us</strong>", "<strong>our</strong>"). JobHub is a UK platform that helps <strong>homeowners</strong> post jobs and <strong>tradespeople</strong> discover, apply to, and discuss those jobs. By accessing or using JobHub, you agree to these Terms.
              </p>
              <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                If you do not agree, do not use JobHub.
              </p>

              {/* Note Box */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-trust-blue rounded-r not-prose">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Note:</strong> This service is currently in active development. Some features (e.g., verification workflow) are managed manually.
                </p>
              </div>

              {/* Section 1 */}
              <section id="who-we-are" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  1. Who we are
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  <strong>Operator / Controller:</strong> JobHub Ltd (placeholder)
                  <br />
                  <strong>Registered address:</strong> [Insert company address]
                  <br />
                  <strong>Contact:</strong> virtoala0@gmail.com
                </p>
              </section>

              {/* Section 2 */}
              <section id="our-service" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  2. Our Service
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  JobHub provides:
                </p>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>A listing service for homeowners to post local trade jobs.</li>
                  <li>Discovery, filtering, and <strong>AI-assisted matching</strong> for tradespeople.</li>
                  <li>In-product chat between homeowners and tradespeople after an application/fee where applicable.</li>
                  <li>Profile pages, ratings, and reviews for completed jobs.</li>
                  <li>Optional payment facilitation for application fees via third-party providers (e.g., Stripe).</li>
                </ul>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  JobHub is an <strong>intermediary platform</strong>. We are <strong>not</strong> a party to agreements between homeowners and tradespeople and do not guarantee pricing, quality, or completion of any work.
                </p>
              </section>

              {/* Section 3 */}
              <section id="accounts-eligibility" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  3. Accounts & Eligibility
                </h2>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>You must be <strong>18+</strong> to use JobHub.</li>
                  <li>You are responsible for the accuracy of your account information and for maintaining the confidentiality of your login.</li>
                  <li>You will comply with all applicable laws and trade regulations in the UK.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section id="roles-rules" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  4. Roles and Platform Rules
                </h2>
                
                <h3 className="mt-6 text-base font-semibold text-slate-900 dark:text-slate-50">
                  4.1 Homeowners
                </h3>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>May post jobs with accurate descriptions, photos, budgets, and location/postcode.</li>
                  <li>Agree to communicate respectfully and to provide fair, truthful reviews after completed jobs.</li>
                  <li>Understand that quotes or AI-suggested ranges are <strong>indicative</strong> only.</li>
                </ul>

                <h3 className="mt-6 text-base font-semibold text-slate-900 dark:text-slate-50">
                  4.2 Tradespeople
                </h3>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>May create profiles, list trade categories, experience, <strong>qualifications</strong>, service radius, and upload evidence of credentials.</li>
                  <li>Understand that <strong>application fees</strong> or credits (if applicable) are charged to unlock homeowner contact details/chat for a job.</li>
                  <li>Must carry appropriate insurance and comply with applicable trade standards.</li>
                  <li>Must not misrepresent qualifications or experience.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section id="verification" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  5. Verification & Badges
                </h2>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>"Verified" status is <strong>manually assigned</strong> by JobHub staff at present, based on information provided (e.g., qualifications, insurance, history).</li>
                  <li>Verification does <strong>not</strong> guarantee workmanship or legal compliance; homeowners must perform their own due diligence.</li>
                </ul>
              </section>

              {/* Section 6 */}
              <section id="ai-features" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  6. AI Features
                </h2>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>AI may assist with job post drafting, matching, and suggestions.</li>
                  <li>AI outputs may contain inaccuracies; users must review all AI text and decisions before relying on them.</li>
                  <li>AI outputs are <strong>informational</strong> and <strong>not professional advice</strong>.</li>
                </ul>
              </section>

              {/* Section 7 */}
              <section id="payments" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  7. Payments, Fees, and Refunds (Tradespeople)
                </h2>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Some actions (e.g., applying to jobs/unlocking homeowner contact) may require payment via our third-party processor (e.g., Stripe).</li>
                  <li>You authorise JobHub to facilitate these payments.</li>
                  <li><strong>Fees are generally non-refundable</strong> once access to homeowner contact/chat is granted, except where required by law or where JobHub determines a fault on our side (e.g., clear technical error).</li>
                  <li>You remain responsible for any taxes applicable to your use of the service.</li>
                </ul>
              </section>

              {/* Section 8 */}
              <section id="quotes-contracts" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  8. Quotes, Contracts, and Workmanship
                </h2>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Any agreement for services is <strong>between the homeowner and the tradesperson</strong>.</li>
                  <li>JobHub does <strong>not</strong> guarantee prices, timing, availability, or job outcomes.</li>
                  <li>JobHub is not responsible for the acts or omissions of users and does not provide, supervise, or guarantee trade work.</li>
                </ul>
              </section>

              {/* Section 9 */}
              <section id="reviews-ratings" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  9. Reviews & Ratings
                </h2>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Reviews must be <strong>based on genuine completed jobs</strong> and be fair, accurate, and respectful.</li>
                  <li>JobHub may moderate or remove reviews that are fraudulent, abusive, irrelevant, or violate these Terms.</li>
                  <li>Tradespeople agree that reviews may be publicly displayed on their profile.</li>
                </ul>
              </section>

              {/* Section 10 */}
              <section id="acceptable-use" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  10. Acceptable Use
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  You agree <strong>not</strong> to:
                </p>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Post illegal, deceptive, defamatory, discriminatory, or infringing content.</li>
                  <li>Upload viruses, malware, or attempt to gain unauthorised access.</li>
                  <li>Scrape, harvest, or misuse data from the platform.</li>
                  <li>Impersonate others or misrepresent your identity, credentials, or affiliation.</li>
                </ul>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  We may suspend or terminate access for violations.
                </p>
              </section>

              {/* Section 11 */}
              <section id="intellectual-property" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  11. Intellectual Property
                </h2>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>The JobHub platform, design, and content (excluding user content) are owned by JobHub or its licensors.</li>
                  <li>You retain rights in your own content but grant JobHub a worldwide, non-exclusive, royalty-free licence to host, display, and distribute it solely to operate the service.</li>
                </ul>
              </section>

              {/* Section 12 */}
              <section id="third-party" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  12. Third-Party Services
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  Payments, email delivery, analytics, hosting, and other features may be provided by third parties (e.g., Stripe). Your use of those services may be subject to their terms.
                </p>
              </section>

              {/* Section 13 */}
              <section id="availability" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  13. Availability & Changes
                </h2>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>We aim for reliable service but do not guarantee uninterrupted availability.</li>
                  <li>Features may change, be added, or removed at any time. We may update these Terms; changes take effect when posted with the new "Last updated" date.</li>
                </ul>
              </section>

              {/* Section 14 */}
              <section id="disclaimers" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  14. Disclaimers
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  Except as required by law, JobHub provides the service <strong>"as is"</strong> and <strong>"as available"</strong> without warranties of any kind, including for accuracy of AI suggestions or fitness for a particular purpose.
                </p>
              </section>

              {/* Section 15 */}
              <section id="limitation-liability" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  15. Limitation of Liability
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  To the fullest extent permitted by law, JobHub is <strong>not liable</strong> for any indirect, incidental, special, consequential, or exemplary damages, or for loss of profits, data, goodwill, or business interruption.
                </p>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  Our total aggregate liability for any claim relating to the service shall not exceed <strong>£100</strong> or the amount you paid to JobHub in the <strong>3 months</strong> prior to the event giving rise to the claim, whichever is greater.
                </p>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  Nothing limits liability for death or personal injury resulting from negligence, fraud, or other liabilities that cannot be excluded under UK law.
                </p>
              </section>

              {/* Section 16 */}
              <section id="indemnity" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  16. Indemnity
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  You agree to indemnify and hold JobHub harmless from claims arising out of your misuse of the service, your content, or your breach of these Terms.
                </p>
              </section>

              {/* Section 17 */}
              <section id="termination" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  17. Termination
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  We may suspend or terminate your access at any time if you violate these Terms or applicable law. You may delete your account at any time. Some obligations survive termination (e.g., outstanding fees, licences granted, reviews already posted).
                </p>
              </section>

              {/* Section 18 */}
              <section id="governing-law" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  18. Governing Law & Jurisdiction
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  These Terms are governed by the laws of <strong>England and Wales</strong>. Courts of England and Wales shall have exclusive jurisdiction, except where consumer law requires otherwise.
                </p>
              </section>

              {/* Section 19 */}
              <section id="contact" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  19. Contact
                </h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-7">
                  Questions about these Terms: <strong>virtoala0@gmail.com</strong>
                  <br />
                  Mail: JobHub Ltd (placeholder), [Insert address]
                </p>
              </section>

              {/* Section 20 */}
              <section id="related-policies" className="scroll-mt-20">
                <h2 className="mt-10 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  20. Related Policies
                </h2>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>
                    <strong>Privacy Policy:</strong>{" "}
                    <Link
                      to="/privacy"
                      className="text-trust-blue hover:underline"
                    >
                      /privacy
                    </Link>
                  </li>
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

export default Terms;
