import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import type React from "react"
import "./globals.css"
import { ToastProvider } from "@/hooks/use-toast"
import ErrorBoundary from "@/components/error-boundary"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "DecisionAI - Plateforme d'Aide à la Décision",
  description:
    "Prenez des décisions éclairées avec l'IA. Méthode Schulich enrichie par l'intelligence artificielle pour analyser vos arguments et optimiser vos choix.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
      <body className="transition-colors duration-300">
        <ErrorBoundary>
          <ToastProvider>{children}</ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}