// PLAN §14 — Yandex Metrica, deferred, AFTER consent. Six events, all wired at
// Gate 1. GA4 is a priced add-on and is deliberately absent.
//
// This module is imported by BOTH the server-rendered island scripts and the
// inline consent script, so it must stay dependency-free.

export const METRICA_EVENTS = [
  'form_submit',
  'phone_click',
  'telegram_click',
  'whatsapp_click',
  'tour_view',
  'lang_switch',
] as const;

export type MetricaEvent = (typeof METRICA_EVENTS)[number];

/** The data attribute a link carries to fire an event on click. One delegated
 *  listener in Base.astro reads it, so no per-component JS ships. */
export const EVENT_ATTR = 'data-metrica';
