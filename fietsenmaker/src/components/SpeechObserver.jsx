import { useEffect } from "react";
import { speak, textOf } from "../data/speech";

// Watches the page for [data-speak] elements and reads them aloud when they
// appear or their text changes. Mounted once in App, so games only need to
// mark their prompt and feedback elements.
export default function SpeechObserver() {
  useEffect(() => {
    const spoken = new WeakMap();
    let pending = null;

    const flush = () => {
      pending = null;
      const fresh = [];
      for (const el of document.querySelectorAll("[data-speak]")) {
        const t = textOf(el).trim();
        if (t && spoken.get(el) !== t) {
          spoken.set(el, t);
          fresh.push(t);
        }
      }
      if (fresh.length) speak(fresh.join(". "));
    };

    // Batch mutations so a prompt + its options render before we speak
    const schedule = () => {
      if (!pending) pending = setTimeout(flush, 250);
    };

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["data-speak"],
    });
    schedule();

    return () => {
      observer.disconnect();
      clearTimeout(pending);
    };
  }, []);

  return null;
}
