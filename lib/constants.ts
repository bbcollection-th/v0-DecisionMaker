export const DECISION_CONSTANTS = {
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_ARGUMENT_LENGTH: 200,
  MIN_WEIGHT: -10,
  MAX_WEIGHT: 10,
  AUTO_SAVE_DELAY: 1000,
  TOAST_DURATION: 5000,
} as const

export const VALIDATION_MESSAGES = {
  TITLE_REQUIRED: "Le titre est requis",
  TITLE_TOO_LONG: `Le titre ne peut pas dépasser ${DECISION_CONSTANTS.MAX_TITLE_LENGTH} caractères`,
  DESCRIPTION_TOO_LONG: `La description ne peut pas dépasser ${DECISION_CONSTANTS.MAX_DESCRIPTION_LENGTH} caractères`,
  ARGUMENT_REQUIRED: "L'argument ne peut pas être vide",
  ARGUMENT_TOO_LONG: `L\'argument ne peut pas dépasser ${DECISION_CONSTANTS.MAX_ARGUMENT_LENGTH} caractères`,
  WEIGHT_INVALID: `Le poids doit être entre ${DECISION_CONSTANTS.MIN_WEIGHT} et ${DECISION_CONSTANTS.MAX_WEIGHT}`,
} as const

export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
} as const
