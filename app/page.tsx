"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { MethodSection } from "@/components/landing/method-section"
import { CTASection } from "@/components/landing/cta-section"

export default function LandingPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} loading={loading} />
      <HeroSection user={user} loading={loading} />
      <FeaturesSection />
      <MethodSection />

      {/* Testimonials Section */}
      <section id="temoignages" className="py-20">
        {/* Testimonials content here */}
      </section>

      <CTASection user={user} loading={loading} />
    </div>
  )
}
