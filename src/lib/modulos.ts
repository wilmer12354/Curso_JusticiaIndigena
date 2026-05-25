export const MODULOS = [
  { label: "MÓDULO I", min: 1, max: 7 },
  { label: "MÓDULO II", min: 8, max: 14 },
  { label: "MÓDULO III", min: 15, max: 21 },
] as const;

export const CUOTA_MAX_TOPIC = {
  1: MODULOS[0].max,
  2: MODULOS[1].max,
  3: 999,
} as const;

export const MAX_TOPIC = MODULOS[MODULOS.length - 1].max;
