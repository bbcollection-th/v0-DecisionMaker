"use client"

import { useState } from "react"
import type { Argument } from "@/types/decision"

interface NewArgument {
  text: string
  weight: number
}

export function useArguments() {
  const [args, setArgs] = useState<Argument[]>([])
  const [newArgument, setNewArgument] = useState<NewArgument>({ text: "", weight: 0 })

  const addArgument = () => {
    if (newArgument.text.trim()) {
      const argument: Argument = {
        id: Date.now().toString(),
        text: newArgument.text.trim(),
        weight: newArgument.weight,
      }
      setArgs((prev) => [...prev, argument].sort((a, b) => a.weight - b.weight))
      setNewArgument({ text: "", weight: 0 })
    }
  }

  const addArgumentDirectly = (argument: Argument) => {
    setArgs((prev) => [...prev, argument].sort((a, b) => a.weight - b.weight))
  }

  const removeArgument = (id: string) => {
    setArgs((prev) => prev.filter((arg) => arg.id !== id))
  }

  const updateArgumentWeight = (id: string, weight: number) => {
    setArgs((prev) => prev.map((arg) => (arg.id === id ? { ...arg, weight } : arg)).sort((a, b) => a.weight - b.weight))
  }

  const setArgsDirectly = (newArgs: Argument[]) => {
    setArgs(newArgs.sort((a, b) => a.weight - b.weight))
  }

  const clearArgs = () => {
    setArgs([])
    setNewArgument({ text: "", weight: 0 })
  }

  // Calculs des scores
  const positiveScore = args.filter((arg) => arg.weight > 0).reduce((sum, arg) => sum + arg.weight, 0)

  const negativeScore = Math.abs(args.filter((arg) => arg.weight < 0).reduce((sum, arg) => sum + arg.weight, 0))

  const sortedArguments = [...args].sort((a, b) => a.weight - b.weight)

  return {
    args,
    newArgument,
    setNewArgument,
    addArgument,
    addArgumentDirectly,
    removeArgument,
    updateArgumentWeight,
    setArgs: setArgsDirectly,
    clearArgs,
    positiveScore,
    negativeScore,
    sortedArguments,
  }
}
