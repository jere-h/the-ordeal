/** Minimal DOM helper so the renderers stay readable without a framework. */
export function el(tag: string, className?: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** A decorative, illustrative CSS-art hero band for a passage motif. Carries the
 *  two inner span layers the motifs draw their figures from, and is aria-hidden
 *  (purely presentational — the prose carries all the meaning). */
export function sceneArt(key: string): HTMLElement {
  const band = el('div', `scene-art scene-art--${key}`);
  band.setAttribute('aria-hidden', 'true');
  band.appendChild(el('span', 'scene-art-a'));
  band.appendChild(el('span', 'scene-art-b'));
  return band;
}
