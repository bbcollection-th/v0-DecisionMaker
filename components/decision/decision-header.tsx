"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Decision } from "@/types/decision"
import type { User } from "@supabase/supabase-js"

interface DecisionHeaderProps {
  currentDecision: Decision
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  user: User | null
  saving: boolean
  onCreateNew: () => void
}

export function DecisionHeader({
  currentDecision,
  onTitleChange,
  onDescriptionChange,
  user,
  saving,
  onCreateNew,
}: DecisionHeaderProps) {
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
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="decision-description">Description du contexte</Label>
          <Textarea
            id="decision-description"
            placeholder="Décrivez votre situation, les enjeux, le contexte..."
            value={currentDecision.description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between">
          {user && currentDecision.title.trim() && (
            <div className="flex items-center text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Sauvegarde automatique
            </div>
          )}
          <Button onClick={onCreateNew} variant="outline" className="ml-auto bg-transparent">
            Nouvelle décision
          </Button>
        </div>

        {!user && (
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Connectez-vous pour sauvegarder vos décisions</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
