import Link from "next/link"
import BackgroundSlideshow from "@/components/BackgroundSlideshow"
import { createSupabaseServerClient } from "@/lib/server"
import { redirect } from "next/navigation"

export default async function HomeEn() {
  // Redirect logged-in users to dashboard
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect("/dashboard")
  }

  const backgrounds = ["/bg2.jpg", "/bg3.webp", "/bg5.webp", "/bg4.jpg"]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-green-50" dir="ltr">
      {/* Background slideshow for a friendly, soft look */}
      <BackgroundSlideshow images={backgrounds} intervalMs={7000} fadeMs={1200} />
      {/* Soft overlay for readability */}
      <div className="absolute inset-0 bg-white/70" />

      {/* Navbar */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link href="/en" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-green-600">
            Movokids
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/" className="px-3 py-2 rounded-xl bg-white/70 text-sky-700 border border-sky-200 hover:bg-white shadow-sm">
              عربي
            </Link>
            <Link href="/auth/login" className="px-4 py-2 rounded-xl bg-white/70 text-sky-700 border border-sky-200 hover:bg-white shadow-sm">
              Sign in
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 shadow">
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
                Movokids is a complete platform to help kids ages 5–12 discover their true strengths
              </h1>
              <p className="mt-4 text-sky-900/80 text-lg md:text-xl">
                We support children ages 5–12 in building focus, emotional self‑control, and learning abilities with daily fun exercises, interactive activities, and online sessions with specialists.
              </p>
              <p className="mt-3 text-sky-900/70 text-sm md:text-base">
                Our assessments are based on internationally recognized screening tools, but they are not a final diagnosis. A confirmed diagnosis must be made by a qualified physician. Our goal is to provide early indicators for families and then offer step‑by‑step training with specialists to turn challenges into achievements.
              </p>
              <div className="mt-6 flex items-center justify-start gap-3">
                <Link href="/auth/signup" className="px-5 py-3 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 shadow">
                  Start free
                </Link>
                <a href="#why" className="px-5 py-3 rounded-2xl bg-white text-sky-700 border border-sky-200 hover:bg-sky-50">
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
                <img src="/hero.png" alt="Illustration of the Movokids platform" className="w-full h-full object-cover" />
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
                  <h2 className="text-2xl font-bold text-sky-900 mb-2">Our Mission</h2>
                  <p className="text-sky-900/80">
                    Turning the daily challenges of children with attention difficulties and hyperactivity into success stories through practical training, assessments, and interactive sessions with specialists.
                  </p>
                </div>
                <div className="order-1 sm:order-2">
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-sky-100 bg-white">
                    <img src="/hero/kids_3.png" alt="Engaging learning" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
            {/* Vision */}
            <div className="bg-white/90 rounded-3xl border border-green-100 p-6 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-5 items-center">
                <div className="order-2 text-left">
                  <h2 className="text-2xl font-bold text-sky-900 mb-2">Our Vision</h2>
                  <p className="text-sky-900/80">
                    A world where every child can grow, learn, and shine. We believe every child deserves access to specialized support, enjoyable educational activities, and a safe space to thrive—no matter the challenge.
                  </p>
                </div>
                <div className="order-1">
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-sky-100 bg-white">
                    <img src="/hero/kids_1.png" alt="Hands-on activity" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                </div>
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
                    <h3 className="mt-3 font-bold text-sky-900">Stronger focus</h3>
                    <p className="text-sky-900/70 text-sm mt-1">Daily activities that encourage longer attention spans.</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm text-left">
                    <div className="text-3xl">🧘</div>
                    <h3 className="mt-3 font-bold text-sky-900">Better behavior</h3>
                    <p className="text-sky-900/70 text-sm mt-1">Games and exercises that build patience and self‑control.</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm text-left">
                    <div className="text-3xl">✍️</div>
                    <h3 className="mt-3 font-bold text-sky-900">Academic skills</h3>
                    <p className="text-sky-900/70 text-sm mt-1">Practice with numbers, letters, and memory.</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm text-left">
                    <div className="text-3xl">🌟</div>
                    <h3 className="mt-3 font-bold text-sky-900">Confidence</h3>
                    <p className="text-sky-900/70 text-sm mt-1">Reward systems that celebrate every achievement.</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="relative mx-auto w-full max-w-md aspect-square rounded-3xl overflow-hidden border border-sky-100 bg-white shadow">
                  <img src="/hero/kids_4.png" alt="Fun activities" className="absolute inset-0 w-full h-full object-cover" />
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
                <h2 className="text-2xl font-extrabold text-sky-900 mb-4">Why Movokids?</h2>
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
                  <Link href="/auth/signup" className="px-5 py-3 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 shadow">
                    Try it free
                  </Link>
                </div>
              </div>
              <div className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-sky-50 p-6 text-left">
                <h3 className="text-xl font-bold text-sky-900">How it works</h3>
                <ol className="mt-3 space-y-2 text-sky-900/80">
                  <li>1) A short starter assessment to identify strengths and challenges.</li>
                  <li>2) A daily, bite‑sized training plan that’s fun and easy.</li>
                  <li>3) Progress tracking and clear reports for parents.</li>
                  <li>4) Optional online sessions with specialists when needed.</li>
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
                <img src="/hero/kids_2.png" alt="Learn and engage" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-sky-600 to-green-600 p-6 text-white text-left shadow">
            <h2 className="text-2xl md:text-3xl font-extrabold">Start your child’s journey today</h2>
            <p className="mt-2 text-white/90">Join Movokids and make a real difference with simple, enjoyable steps.</p>
            <div className="mt-4 flex justify-start gap-3">
              <Link href="/auth/signup" className="px-5 py-3 rounded-2xl bg-white text-sky-700 font-semibold hover:bg-sky-50">
                Create account
              </Link>
              <Link href="/auth/login" className="px-5 py-3 rounded-2xl bg-white/10 border border-white/30 text-white hover:bg-white/20">
                I already have an account
              </Link>
            </div>
          </div>
          <p className="mt-4 text-center text-sky-900/60 text-xs">© {new Date().getFullYear()} Movokids. All rights reserved.</p>
        </div>
      </section>
    </div>
  )
}


