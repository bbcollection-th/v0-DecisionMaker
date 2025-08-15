import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UnifiedHeader } from "@/components/shared/unified-header"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="min-h-screen bg-background grid grid-rows-[auto_1fr]">
      <UnifiedHeader />
      <div className="flex w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Merci pour votre inscription !</CardTitle>
                <CardDescription>Vérifiez votre email pour confirmer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Vous vous êtes inscrit avec succès. Veuillez vérifier votre email pour confirmer votre compte avant de
                  vous connecter.
                </p>
                <div className="flex flex-col gap-2">
                  <Button asChild>
                    <Link href="/auth/login">Se connecter</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">Retour à l'accueil</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
