import { useEffect, useRef, useState } from "react";

// Marks a section as "revealed" once scrolled into view, and syncs the URL
// hash to its id at the same moment (shareable scroll-spy per skill-layout §11).
export function useSectionReveal(id?: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        if (id && window.location.hash !== `#${id}`) {
          window.history.replaceState(null, "", `#${id}`);
        }
      },
      { rootMargin: "0px", threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [id]);

  return { ref, revealed };
}
