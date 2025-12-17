import Link from "next/link"
import Image from "next/image"

export default function TermsAndConditionsPageEn() {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-green-50 to-sky-100"
      dir="ltr"
    >
      {/* Navbar */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 flex items-center justify-between gap-3">
          <Link href="/en" className="text-2xl font-extrabold flex-shrink-0">
            <Image
              src="/logo/1.png"
              alt="Movokids"
              width={200}
              height={60}
              className="object-contain w-32 sm:w-40 md:w-48 h-auto"
            />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link
              href="/terms"
              className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/70 text-sky-700 border border-sky-200 hover:bg-white shadow-sm text-xs sm:text-sm font-medium whitespace-nowrap transition-all"
            >
              العربية
            </Link>
            <Link
              href="/en"
              className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/70 text-sky-700 border border-sky-200 hover:bg-white shadow-sm text-xs sm:text-sm font-medium whitespace-nowrap transition-all"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/90 rounded-3xl border border-sky-100 p-8 md:p-12 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-extrabold text-sky-900 mb-8">
            Terms and Conditions
          </h1>

          <div className="prose prose-sky max-w-none space-y-6 text-sky-900/80 leading-relaxed">
            <p className="text-lg">
              Welcome to MovoKids. By using our website and services, you agree to be bound by these Terms and Conditions. Please read them carefully.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                1. Acceptance of Terms
              </h2>
              <p>
                By using the MovoKids platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                2. Use of Service
              </h2>
              <p className="mb-3">The MovoKids platform must be used for educational and training purposes only. You agree to:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Not use the platform for any illegal or unauthorized purpose</li>
                <li>Not attempt to gain unauthorized access to the platform's systems</li>
                <li>Not share your account with other people</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                3. Accounts and Subscriptions
              </h2>
              <p className="mb-3">When creating an account:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Information provided must be accurate and complete</li>
                <li>You are responsible for maintaining the confidentiality of your account information</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>Subscriptions are automatically renewable unless cancelled</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                4. Content and Intellectual Property
              </h2>
              <p className="mb-3">
                All content on the MovoKids platform, including texts, images, games, and programs, is protected by copyright and intellectual property rights. You may not:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Copy, distribute, or modify any content from the platform</li>
                <li>Use content for commercial purposes without written permission</li>
                <li>Remove any copyright notices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                5. Medical Disclaimer
              </h2>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4 rounded">
                <p className="font-semibold text-red-900 mb-2">Important Notice:</p>
                <p className="text-red-800 mb-3">
                  MovoKids is an educational and training platform only. We do not provide:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-red-800">
                  <li>Medical diagnosis for any condition</li>
                  <li>Medical or pharmaceutical treatment</li>
                  <li>Medical consultation as a substitute for a specialist doctor</li>
                </ul>
                <p className="text-red-800 mt-3">
                  You must consult a specialist doctor for proper diagnosis and treatment. MovoKids is a support and development tool only.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                6. Payments and Refunds
              </h2>
              <p className="mb-3">
                All payments are processed through secure payment gateways. Regarding refunds:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Refund policy applies according to local laws</li>
                <li>Please contact us at info@movokids.com for any refund inquiries</li>
                <li>Administrative fees may apply to refund requests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                7. Account Cancellation
              </h2>
              <p>
                You may cancel your account at any time through account settings or by contacting us. Your data will be deleted in accordance with our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                8. Modifications to Terms
              </h2>
              <p>
                We reserve the right to modify these Terms and Conditions at any time. You will be notified of any material changes via email or through the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                9. Contact Us
              </h2>
              <p className="mb-3">
                We're happy to hear from you at any time 🌟 The MovoKids team is here to support you and answer all your questions.
              </p>
              <p className="mb-2">Contact methods:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>📧 Email: <a href="mailto:info@movokids.com" className="text-sky-700 hover:text-sky-900 underline">info@movokids.com</a></li>
                <li>🌐 Through the contact form on the website</li>
                <li>⏰ Response within 24–48 business hours</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-sky-900 mt-8 mb-4">
                10. Governing Law
              </h2>
              <p>
                These Terms and Conditions are subject to applicable local laws. Any dispute arising from these terms will be resolved in accordance with local laws.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-sky-100">
            <Link
              href="/en"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 text-white font-semibold hover:bg-sky-600 shadow transition-colors"
            >
              <span>←</span>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

