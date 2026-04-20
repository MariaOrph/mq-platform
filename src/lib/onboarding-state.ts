// Tiny helpers for onboarding state. Split from MQOnboarding.tsx so pages that
// only need to CHECK onboarding state don't pull in the whole onboarding UI
// component into their bundle.

const STORAGE_KEY = 'mq_onboarding_complete'

export function shouldShowOnboarding(): boolean {
  try { return !localStorage.getItem(STORAGE_KEY) } catch { return false }
}

export function resetOnboarding(): void {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* */ }
}

export function markOnboardingComplete(): void {
  try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* */ }
}
