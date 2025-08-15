import { DECISION_CONSTANTS, VALIDATION_MESSAGES } from "./constants"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateTitle(title: string): ValidationResult {
  const errors: string[] = []

  if (!title.trim()) {
    errors.push(VALIDATION_MESSAGES.TITLE_REQUIRED)
  } else if (title.length > DECISION_CONSTANTS.MAX_TITLE_LENGTH) {
    errors.push(VALIDATION_MESSAGES.TITLE_TOO_LONG)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateDescription(description: string): ValidationResult {
  const errors: string[] = []

  if (description.length > DECISION_CONSTANTS.MAX_DESCRIPTION_LENGTH) {
    errors.push(VALIDATION_MESSAGES.DESCRIPTION_TOO_LONG)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateArgument(text: string, weight: number): ValidationResult {
  const errors: string[] = []

  if (!text.trim()) {
    errors.push(VALIDATION_MESSAGES.ARGUMENT_REQUIRED)
  } else if (text.length > DECISION_CONSTANTS.MAX_ARGUMENT_LENGTH) {
    errors.push(VALIDATION_MESSAGES.ARGUMENT_TOO_LONG)
  }

  if (weight < DECISION_CONSTANTS.MIN_WEIGHT || weight > DECISION_CONSTANTS.MAX_WEIGHT) {
    errors.push(VALIDATION_MESSAGES.WEIGHT_INVALID)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
