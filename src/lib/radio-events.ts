export const RADIO_TOGGLE_EVENT = 'malakinfo:radio-toggle';
export const RADIO_STATE_EVENT = 'malakinfo:radio-state';

let radioPlaying = false;

export function getRadioPlaying() {
  return radioPlaying;
}

export function broadcastRadioPlaying(isPlaying: boolean) {
  radioPlaying = isPlaying;
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(RADIO_STATE_EVENT, { detail: { isPlaying } }));
}
