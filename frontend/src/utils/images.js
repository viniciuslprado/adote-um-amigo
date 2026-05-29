export const FALLBACK_ANIMAL_IMAGE = "/pata.png";

export function useFallbackImage(event) {
  if (event.currentTarget.src.endsWith(FALLBACK_ANIMAL_IMAGE)) {
    return;
  }

  event.currentTarget.src = FALLBACK_ANIMAL_IMAGE;
}
