import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/server"
import { redirect } from "next/navigation"
import Image from "next/image"

export default async function HomeEn() {
  // Redirect logged-in users to dashboard
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-green-50 to-sky-100"
      dir="ltr"
    >

      {/* Navbar */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link
            href="/en"
            className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-green-600"
          >
            <Image src="/logo/1.png" alt="Movokids" width={200} height={200} />

          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/"
              className="px-3 py-2 rounded-xl bg-white/70 text-sky-700 border border-sky-200 hover:bg-white shadow-sm"
            >
              عربي
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-xl bg-white/70 text-sky-700 border border-sky-200 hover:bg-white shadow-sm"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 shadow"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 md:pt-10 md:pb-16 lg:pt-14 lg:pb-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-left">
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-sky-900">
                Movokids is a complete platform to help kids ages 5–12 discover
                their true strengths
              </h1>
              <p className="mt-4 text-sky-900/80 text-lg md:text-xl">
                We support children ages 5–12 in building focus, emotional
                self‑control, and learning abilities with daily fun exercises,
                interactive activities, and online sessions with specialists.
              </p>
              <p className="mt-3 text-sky-900/70 text-sm md:text-base">
                Our assessments are based on internationally recognized
                screening tools, but they are not a final diagnosis. A confirmed
                diagnosis must be made by a qualified physician. Our goal is to
                provide early indicators for families and then offer
                step‑by‑step training with specialists to turn challenges into
                achievements.
              </p>
              <div className="mt-6 flex items-center justify-start gap-3">
                <Link
                  href="/auth/signup"
                  className="px-5 py-3 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 shadow"
                >
                  Start free
                </Link>
                <a
                  href="#why"
                  className="px-5 py-3 rounded-2xl bg-white text-sky-700 border border-sky-200 hover:bg-sky-50"
                >
                  Why Movokids?
                </a>
              </div>
              <div className="mt-4 flex items-center justify-start gap-2 text-sky-800/70 text-sm">
                <span>👨‍👩‍👧 Parent‑friendly</span>
                <span>•</span>
                <span>🧒 Kid‑friendly</span>
                <span>•</span>
                <span>🔒 Safe & trusted</span>
              </div>
            </div>
            <div>
              <div className="relative mx-auto w-full max-w-md aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-sky-100 to-green-100 border border-white/60 shadow-xl flex items-center justify-center">
                <img
                  src="/hero.png"
                  alt="Illustration of the Movokids platform"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs md:text-sm px-3 py-2 rounded-2xl shadow">
                  Motivational rewards
                </div>
                <div className="absolute bottom-2 right-2 bg-sky-500 text-white text-xs md:text-sm px-3 py-2 rounded-2xl shadow">
                  Fun activities
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Mission */}
            <div className="bg-white/90 rounded-3xl border border-sky-100 p-6 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-5 items-center">
                <div className="text-left order-2 sm:order-1">
                  <h2 className="text-2xl font-bold text-sky-900 mb-2">
                    Our Mission
                  </h2>
                  <p className="text-sky-900/80">
                    Turning the daily challenges of children with attention
                    difficulties and hyperactivity into success stories through
                    practical training, assessments, and interactive sessions
                    with specialists.
                  </p>
                </div>
                <div className="order-1 sm:order-2">
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-sky-100 bg-white">
                    <img
                      src="/hero/kids_3.png"
                      alt="Engaging learning"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Vision */}
            <div className="bg-white/90 rounded-3xl border border-green-100 p-6 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-5 items-center">
                <div className="order-2 text-left">
                  <h2 className="text-2xl font-bold text-sky-900 mb-2">
                    Our Vision
                  </h2>
                  <p className="text-sky-900/80">
                    A world where every child can grow, learn, and shine. We
                    believe every child deserves access to specialized support,
                    enjoyable educational activities, and a safe space to
                    thrive—no matter the challenge.
                  </p>
                </div>
                <div className="order-1">
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-sky-100 bg-white">
                    <img
                      src="/hero/kids_1.png"
                      alt="Hands-on activity"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Programs Features */}
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/90 rounded-3xl border border-sky-100 p-6 md:p-8 shadow-sm">
            <div className="text-center mb-8">
              <p className="text-sky-900/90 text-lg md:text-xl font-semibold">
                Our programs are developed in collaboration with specialists in
                psychology and special education.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-gradient-to-br from-sky-50 to-white rounded-2xl border border-sky-100 p-5 text-center shadow-sm">
                <div className="text-4xl mb-3">🌍</div>
                <h3 className="font-bold text-sky-900 text-lg mb-2">
                  Global Assessment Tools
                </h3>
                <p className="text-sky-900/70 text-sm">
                  Using internationally recognized assessment tools
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 p-5 text-center shadow-sm">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="font-bold text-sky-900 text-lg mb-2">
                  Daily Training
                </h3>
                <p className="text-sky-900/70 text-sm">
                  To help with attention and focus
                </p>
              </div>
              <div className="bg-gradient-to-br from-sky-50 to-white rounded-2xl border border-sky-100 p-5 text-center shadow-sm">
                <div className="text-4xl mb-3">👨‍⚕️</div>
                <h3 className="font-bold text-sky-900 text-lg mb-2">
                  Sessions with Specialists
                </h3>
                <p className="text-sky-900/70 text-sm">
                  Direct support from qualified experts
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 p-5 text-center shadow-sm">
                <div className="text-4xl mb-3">✨</div>
                <h3 className="font-bold text-sky-900 text-lg mb-2">
                  Proven Results
                </h3>
                <p className="text-sky-900/70 text-sm">
                  With hundreds of children and families
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Benefits */}
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-sky-50 to-green-50 rounded-3xl border border-sky-100 p-6">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-sky-900 mb-6 text-left">
                  What will your child gain with Movokids?
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm text-left">
                    <div className="text-3xl">🎯</div>
                    <h3 className="mt-3 font-bold text-sky-900">
                      Stronger focus
                    </h3>
                    <p className="text-sky-900/70 text-sm mt-1">
                      Daily activities that encourage longer attention spans.
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm text-left">
                    <div className="text-3xl">🧘</div>
                    <h3 className="mt-3 font-bold text-sky-900">
                      Better behavior
                    </h3>
                    <p className="text-sky-900/70 text-sm mt-1">
                      Games and exercises that build patience and self‑control.
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm text-left">
                    <div className="text-3xl">✍️</div>
                    <h3 className="mt-3 font-bold text-sky-900">
                      Academic skills
                    </h3>
                    <p className="text-sky-900/70 text-sm mt-1">
                      Practice with numbers, letters, and memory.
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm text-left">
                    <div className="text-3xl">🌟</div>
                    <h3 className="mt-3 font-bold text-sky-900">Confidence</h3>
                    <p className="text-sky-900/70 text-sm mt-1">
                      Reward systems that celebrate every achievement.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="relative mx-auto w-full max-w-md aspect-square rounded-3xl overflow-hidden border border-sky-100 bg-white shadow">
                  <img
                    src="/hero/kids_4.png"
                    alt="Fun activities"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section id="why" className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-6">
              <div className="bg-white/90 rounded-3xl border border-sky-100 p-6 shadow-sm">
                <h2 className="text-2xl font-extrabold text-sky-900 mb-4">
                  Why Movokids?
                </h2>
                <ul className="space-y-3 text-sky-900/85 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">✔️</span>
                    <span>Bilingual content (Arabic + English)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">✔️</span>
                    <span>Activities designed by child psychologists</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">✔️</span>
                    <span>Fun and easy to use</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">✔️</span>
                    <span>Affordable subscription plans</span>
                  </li>
                </ul>
                <div className="mt-6 flex justify-start">
                  <Link
                    href="/auth/signup"
                    className="px-5 py-3 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 shadow"
                  >
                    Try it free
                  </Link>
                </div>
              </div>
              <div className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-sky-50 p-6 text-left">
                <h3 className="text-xl font-bold text-sky-900">How it works</h3>
                <ol className="mt-3 space-y-2 text-sky-900/80">
                  <li>
                    1) A short starter assessment to identify strengths and
                    challenges.
                  </li>
                  <li>
                    2) A daily, bite‑sized training plan that’s fun and easy.
                  </li>
                  <li>3) Progress tracking and clear reports for parents.</li>
                  <li>
                    4) Optional online sessions with specialists when needed.
                  </li>
                </ol>
                <div className="mt-4 flex items-center justify-start gap-2 text-sky-800/70 text-sm">
                  <span>⏱️ 10–15 minutes a day</span>
                  <span>•</span>
                  <span>🎮 Play + Learn</span>
                </div>
              </div>
            </div>
            <div>
              <div className="relative mx-auto w-full max-w-md aspect-square rounded-3xl overflow-hidden border border-sky-100 bg-white shadow">
                <img
                  src="/hero/kids_2.png"
                  alt="Learn and engage"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-sky-600 to-green-600 p-6 text-white text-left shadow">
            <h2 className="text-2xl md:text-3xl font-extrabold">
              Start your child’s journey today
            </h2>
            <p className="mt-2 text-white/90">
              Join Movokids and make a real difference with simple, enjoyable
              steps.
            </p>
            <div className="mt-4 flex justify-start gap-3">
              <Link
                href="/auth/signup"
                className="px-5 py-3 rounded-2xl bg-white text-sky-700 font-semibold hover:bg-sky-50"
              >
                Create account
              </Link>
              <Link
                href="/auth/login"
                className="px-5 py-3 rounded-2xl bg-white/10 border border-white/30 text-white hover:bg-white/20"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Parents' Reviews */}
      <section className="relative z-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-sky-900 text-center mb-8">
            Parents' Reviews
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <div className="bg-white/90 rounded-3xl border border-sky-100 p-6 shadow-sm text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sky-900/80 mb-4">
                "Wonderful platform that helped my son so much with focus and
                attention. The activities are fun and easy to use, and my child
                now looks forward to daily exercises."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-green-400 flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
                <div className="text-left">
                  <p className="font-bold text-sky-900">Ahmed's Mother</p>
                  <p className="text-sm text-sky-700">Riyadh, Saudi Arabia</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white/90 rounded-3xl border border-sky-100 p-6 shadow-sm text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sky-900/80 mb-4">
                "The app is easy to use and the sessions with specialists were
                very helpful. I noticed a significant improvement in my
                daughter's behavior after just two weeks."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-sky-400 flex items-center justify-center text-white font-bold text-lg">
                  K
                </div>
                <div className="text-left">
                  <p className="font-bold text-sky-900">Khalid's Father</p>
                  <p className="text-sm text-sky-700">Jeddah, Saudi Arabia</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white/90 rounded-3xl border border-sky-100 p-6 shadow-sm text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sky-900/80 mb-4">
                "Thanks to Movokids for this unique platform. My child became
                calmer and his ability to control emotions has improved
                significantly."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-green-400 flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div className="text-left">
                  <p className="font-bold text-sky-900">Sarah's Mother</p>
                  <p className="text-sm text-sky-700">Dubai, UAE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="relative z-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-sky-900 mb-2">
              Our Blog
            </h2>
            <p className="text-sky-900/70">
              Discover the latest tips and resources to support your child
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Blog Post 1 */}
            <article className="bg-white/90 rounded-3xl border border-sky-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-sky-100 to-green-100">
                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                  🧠
                </div>
              </div>
              <div className="p-6 text-left">
                <div className="text-xs text-sky-700 mb-2">
                  October 15, 2024
                </div>
                <h3 className="text-xl font-bold text-sky-900 mb-3">
                  How to Help Your Child Improve Focus
                </h3>
                <p className="text-sky-900/70 text-sm mb-4">
                  Practical daily tips to enhance your child's ability to pay
                  attention and focus during daily activities and studying.
                </p>
                <a
                  href="#"
                  className="text-sky-700 hover:text-sky-900 font-semibold text-sm inline-flex items-center gap-1"
                >
                  <span>Read more</span>
                  <span>→</span>
                </a>
              </div>
            </article>

            {/* Blog Post 2 */}
            <article className="bg-white/90 rounded-3xl border border-sky-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-green-100 to-sky-100">
                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                  👨‍👩‍👧‍👦
                </div>
              </div>
              <div className="p-6 text-left">
                <div className="text-xs text-sky-700 mb-2">
                  October 12, 2024
                </div>
                <h3 className="text-xl font-bold text-sky-900 mb-3">
                  The Role of Parents in Supporting Children with ADHD
                </h3>
                <p className="text-sky-900/70 text-sm mb-4">
                  Effective strategies for dealing with daily challenges and
                  providing appropriate support for your child.
                </p>
                <a
                  href="#"
                  className="text-sky-700 hover:text-sky-900 font-semibold text-sm inline-flex items-center gap-1"
                >
                  <span>Read more</span>
                  <span>→</span>
                </a>
              </div>
            </article>

            {/* Blog Post 3 */}
            <article className="bg-white/90 rounded-3xl border border-sky-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-sky-100 to-green-100">
                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                  🎯
                </div>
              </div>
              <div className="p-6 text-left">
                <div className="text-xs text-sky-700 mb-2">
                  October 8, 2024
                </div>
                <h3 className="text-xl font-bold text-sky-900 mb-3">
                  Daily Training: The Key to Skill Development
                </h3>
                <p className="text-sky-900/70 text-sm mb-4">
                  How short daily exercises help build positive habits and
                  improve academic performance.
                </p>
                <a
                  href="#"
                  className="text-sky-700 hover:text-sky-900 font-semibold text-sm inline-flex items-center gap-1"
                >
                  <span>Read more</span>
                  <span>→</span>
                </a>
              </div>
            </article>
          </div>
          <div className="text-center mt-8">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 text-white font-semibold hover:bg-sky-600 shadow"
            >
              <span>View all articles</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white/90 border-t border-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Links Section */}
            <div className="text-left">
              <h3 className="text-lg font-bold text-sky-900 mb-4">
                Important Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sky-700 hover:text-sky-900 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sky-700 hover:text-sky-900 transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-sky-700 hover:text-sky-900 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Section */}
            <div className="text-left">
              <h3 className="text-lg font-bold text-sky-900 mb-4">
                Contact Us
              </h3>
              <div className="space-y-3">
                <a
                  href="https://wa.me/966500000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sky-700 hover:text-green-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>+966 50 000 0000</span>
                </a>
                <a
                  href="mailto:info@movokids.com"
                  className="flex items-center gap-2 text-sky-700 hover:text-sky-900 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>info@movokids.com</span>
                </a>
              </div>
            </div>

            {/* Social Media Section */}
            <div className="text-left">
              <h3 className="text-lg font-bold text-sky-900 mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a
                  href="https://facebook.com/movokids"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 hover:text-blue-600 transition-colors"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com/movokids"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 hover:text-sky-500 transition-colors"
                  aria-label="Twitter"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com/movokids"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 hover:text-pink-600 transition-colors"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/movokids"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 hover:text-blue-700 transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-sky-100">
            <p className="text-center text-sky-900/60 text-xs">
              © {new Date().getFullYear()} Movokids. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
