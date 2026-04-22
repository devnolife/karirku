"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * LandingAnimator — page-level GSAP choreography.
 *
 * Picks up elements by data-attributes so the JSX tree stays clean.
 *
 *   data-gs="hero-line"       word-stagger reveal on mount
 *   data-gs="hero-fade"       fade+rise on mount (ordered by DOM position)
 *   data-gs="section"         fade+rise when scrolling into view
 *   data-gs="stagger-parent"  children with data-gs="stagger-child" enter staggered
 *   data-gs="count" data-to="72"  count-up when scrolled into view
 *   data-gs="hero-preview"    subtle scrub parallax on scroll
 */
export function LandingAnimator() {
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      /* ---------- HERO headline: split top-level text into word spans ---------- */
      document.querySelectorAll<HTMLElement>("[data-gs='hero-line']").forEach((el) => {
        const frag = document.createDocumentFragment();
        Array.from(el.childNodes).forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent ?? "";
            text.split(/(\s+)/).forEach((chunk) => {
              if (!chunk) return;
              if (/^\s+$/.test(chunk)) {
                frag.appendChild(document.createTextNode(chunk));
              } else {
                const outer = document.createElement("span");
                outer.style.display = "inline-block";
                outer.style.overflow = "hidden";
                outer.style.verticalAlign = "top";
                const inner = document.createElement("span");
                inner.style.display = "inline-block";
                inner.className = "gs-word";
                inner.textContent = chunk;
                outer.appendChild(inner);
                frag.appendChild(outer);
              }
            });
          } else {
            const elNode = node as HTMLElement;
            if (elNode.tagName === "BR") {
              frag.appendChild(node.cloneNode(true));
              return;
            }
            const outer = document.createElement("span");
            outer.style.display = "inline-block";
            outer.style.overflow = "hidden";
            outer.style.verticalAlign = "top";
            const clone = node.cloneNode(true) as HTMLElement;
            clone.style.display = "inline-block";
            clone.classList.add("gs-word");
            outer.appendChild(clone);
            frag.appendChild(outer);
          }
        });
        el.replaceChildren(frag);

        gsap.from(el.querySelectorAll(".gs-word"), {
          yPercent: 110,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.045,
        });
      });

      /* ---------- HERO fade-in blocks ---------- */
      gsap.utils.toArray<HTMLElement>("[data-gs='hero-fade']").forEach((el, i) => {
        gsap.from(el, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.4 + i * 0.1,
        });
      });

      /* ---------- Section enter (scroll trigger) ---------- */
      gsap.utils.toArray<HTMLElement>("[data-gs='section']").forEach((el) => {
        gsap.from(el, {
          y: 28,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });

      /* ---------- Stagger child groups ---------- */
      gsap.utils.toArray<HTMLElement>("[data-gs='stagger-parent']").forEach((parent) => {
        const kids = parent.querySelectorAll<HTMLElement>("[data-gs='stagger-child']");
        if (!kids.length) return;
        gsap.from(kids, {
          y: 24,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: parent,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      });

      /* ---------- Number count-up ---------- */
      gsap.utils.toArray<HTMLElement>("[data-gs='count']").forEach((el) => {
        const raw = el.dataset.to ?? el.textContent ?? "0";
        const target = parseFloat(raw);
        if (Number.isNaN(target)) return;
        const decimals = raw.includes(".") ? 1 : 0;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            el.textContent = obj.val.toFixed(decimals);
          },
        });
      });

      /* ---------- Hero preview subtle scrub parallax ---------- */
      const preview = document.querySelector<HTMLElement>("[data-gs='hero-preview']");
      if (preview) {
        gsap.fromTo(
          preview,
          { y: 0 },
          {
            y: -24,
            ease: "none",
            scrollTrigger: {
              trigger: preview,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          }
        );
      }

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return null;
}
