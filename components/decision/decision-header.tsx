"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"
import type { Decision } from "@/types/decision"
import type { User } from "@supabase/supabase-js"

interface DecisionHeaderProps {
  currentDecision: Decision
  setCurrentDecision: (decision: Decision) => void
  user: User | null
  saving: boolean
  onSave: () => void
}

export function DecisionHeader({ currentDecision, setCurrentDecision, user, saving, onSave }: DecisionHeaderProps) {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl">📋 Définir votre Décision</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="decision-title">Titre de la décision *</Label>
          <Input
            id="decision-title"
            placeholder="Ex: Changer d'emploi, Acheter une maison..."
            value={currentDecision.title}
            onChange={(e) => setCurrentDecision({ ...currentDecision, title: e.target.value })}
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="decision-description">Description du contexte</Label>
          <Textarea
            id="decision-description"
            placeholder="Décrivez votre situation, les enjeux, le contexte..."
            value={currentDecision.description}
            onChange={(e) => setCurrentDecision({ ...currentDecision, description: e.target.value })}
            rows={3}
          />
        </div>

        {user ? (
          <Button onClick={onSave} disabled={!currentDecision.title.trim() || saving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Sauvegarde..." : "Sauvegarder la décision"}
          </Button>
        ) : (
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Connectez-vous pour sauvegarder vos décisions</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
