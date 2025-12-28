import Link from "next/link"
import Image from "next/image"

export default function ExchangePolicyPageEn() {
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
              href="/exchange-policy"
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
            Exchange Policy
          </h1>

          <div className="prose prose-sky max-w-none space-y-6 text-sky-900/80 leading-relaxed">
            <section>
              <ul className="list-disc ml-6 space-y-3">
                <li className="text-base">
                  Subscription plans cannot be changed until after the month has passed
                </li>
                <li className="text-base">
                  Plans can be upgraded or downgraded after the subscription month has passed
                </li>
              </ul>
            </section>

            <section>
              <p className="mt-6 text-base">
                This can be done by contacting the support team, taking into account the regulatory conditions of each country.
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

