/// <reference types="astro/client" />

declare global {
  interface Window {
    /** Set by the Metrica loader in Base.astro AFTER consent (§14). Undefined
     *  until then, and undefined forever if the visitor declines — every call
     *  site therefore uses optional chaining and never assumes it exists. */
    __gtMetrica?: (event: string) => void;
  }
}

export {};
