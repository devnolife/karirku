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
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const elNode = node as HTMLElement;
            if (elNode.tagName === "BR") {
              frag.appendChild(node.cloneNode(true));
              return;
            }
            const outer = document.createElement("span");
            outer.style.display = "inline-block";
            outer.style.overflow = "hidden";
            outer.style.verticalAlign = "top";
            const clone = elNode.cloneNode(true) as HTMLElement;
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

      /* ---------- Progress bars grow on scroll ---------- */
      gsap.utils.toArray<HTMLElement>("[data-gs='bar']").forEach((el) => {
        const w = parseFloat(el.dataset.w ?? "100");
        gsap.fromTo(
          el,
          { width: "0%" },
          {
            width: `${w}%`,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      /* ---------- Preview cards: subtle scrub parallax ---------- */
      gsap.utils.toArray<HTMLElement>("[data-gs='hero-preview']").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 0 },
          {
            y: -(20 + (i % 3) * 6),
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          }
        );
      });

      ScrollTrigger.refresh();

      /* ---------- Continuous float (ambient shapes) ---------- */
      gsap.utils.toArray<HTMLElement>("[data-gs='float']").forEach((el, i) => {
        const yAmp = 10 + (i % 3) * 6;
        const rAmp = 2 + (i % 4);
        const dur = 5 + (i % 5) * 1.2;
        gsap.to(el, {
          y: `+=${yAmp}`,
          rotation: `+=${rAmp}`,
          duration: dur,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.15,
        });
      });

      /* ---------- Continuous orbit rotation ---------- */
      gsap.utils.toArray<HTMLElement>("[data-gs='orbit']").forEach((el) => {
        const dur = parseFloat(el.dataset.dur ?? "30");
        const dir = el.dataset.dir === "ccw" ? -360 : 360;
        gsap.to(el, {
          rotation: dir,
          duration: dur,
          ease: "none",
          repeat: -1,
          transformOrigin: "50% 50%",
        });
      });

      /* ---------- Counter-rotate to keep content upright inside orbits ---------- */
      gsap.utils.toArray<HTMLElement>("[data-gs='orbit-item']").forEach((el) => {
        const dur = parseFloat(el.dataset.dur ?? "30");
        const dir = el.dataset.dir === "ccw" ? 360 : -360;
        gsap.to(el, {
          rotation: dir,
          duration: dur,
          ease: "none",
          repeat: -1,
          transformOrigin: "50% 50%",
        });
      });

      /* ---------- SVG path draw on scroll ---------- */
      gsap.utils
        .toArray<SVGPathElement | SVGLineElement>("[data-gs='draw']")
        .forEach((p) => {
          let len = 0;
          try {
            len = (p as SVGPathElement).getTotalLength?.() ?? 0;
          } catch {
            len = 0;
          }
          if (!len) {
            const bbox = (p as SVGGraphicsElement).getBBox?.();
            len = bbox ? bbox.width + bbox.height : 400;
          }
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
          gsap.to(p, {
            strokeDashoffset: 0,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: p,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });
        });

      /* ---------- Typing effect ---------- */
      gsap.utils.toArray<HTMLElement>("[data-gs='type']").forEach((el) => {
        const original = el.dataset.text ?? el.textContent ?? "";
        el.dataset.text = original;
        el.textContent = "";
        const obj = { i: 0 };
        gsap.to(obj, {
          i: original.length,
          duration: Math.max(1.2, original.length * 0.035),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            el.textContent = original.slice(0, Math.round(obj.i));
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
