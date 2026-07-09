"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Chapter } from "@/content/types";
import { PlayerContext, type AttemptPayload } from "./PlayerContext";
import { SceneView } from "./scenes/SceneView";

// Port of createSceneNavigator from assets/js/utils.js: scenes stack on top of
// each other and slide up into view — keyboard, swipe and wheel all navigate.
export function ChapterPlayer({ chapter }: { chapter: Chapter }) {
  const [index, setIndex] = useState(0);
  const animating = useRef(false);
  const wheelLocked = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const total = chapter.scenes.length;

  const go = useCallback(
    (i: number) => {
      if (i < 0 || i >= total || i === indexRef.current || animating.current) return;
      animating.current = true;
      indexRef.current = i;
      setIndex(i);
      setTimeout(() => {
        animating.current = false;
      }, 500);
    },
    [total]
  );

  const next = useCallback(() => go(indexRef.current + 1), [go]);
  const prev = useCallback(() => go(indexRef.current - 1), [go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // If the current scene's content is taller than the screen, let it scroll
  // internally first; only flip scenes when it is at an edge.
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const scene = (e.target as HTMLElement).closest("[data-scene]");
    if (scene && scene.scrollHeight > scene.clientHeight + 1) {
      const atTop = scene.scrollTop <= 0;
      const atBottom = scene.scrollTop + scene.clientHeight >= scene.scrollHeight - 1;
      if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) return;
    }
    if (wheelLocked.current) return;
    wheelLocked.current = true;
    if (e.deltaY > 0) next();
    else prev();
    setTimeout(() => {
      wheelLocked.current = false;
    }, 800);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 50) {
      if (dy > 0) next();
      else prev();
    }
    touchStartY.current = null;
  };

  const report = useCallback(
    (attempt: AttemptPayload) => {
      fetch("/api/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterSlug: chapter.slug,
          lastScene: indexRef.current,
          ...attempt,
        }),
      })
        .then(async (res) => {
          const data = await res.json().catch(() => null);
          if (data && data.saved === false) {
            console.info("learn.: attempt not saved —", data.reason ?? res.status);
          }
        })
        .catch(() => console.info("learn.: attempt not saved — offline?"));
    },
    [chapter.slug]
  );

  return (
    <PlayerContext.Provider value={{ chapterSlug: chapter.slug, accent: chapter.color, next, report }}>
      <div className="flex h-dvh flex-col" style={{ "--accent": chapter.color } as React.CSSProperties}>
        <header className="z-20 flex items-center gap-3 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur">
          <Link
            href="/app"
            aria-label="Back to my chapters"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface transition-colors hover:border-line-strong"
          >
            ←
          </Link>
          <h1 className="font-head text-base">
            {chapter.emoji} {chapter.title}
          </h1>
          <span className="ml-auto text-xs text-ink-secondary">
            {index + 1} / {total}
          </span>
        </header>

        <div className="h-1 w-full bg-surface">
          <div
            className="h-1 rounded-r-full transition-all duration-500"
            style={{ width: `${((index + 1) / total) * 100}%`, background: chapter.color }}
          />
        </div>

        <div
          ref={containerRef}
          className="relative flex-1 overflow-hidden outline-none"
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {chapter.scenes.map((scene, i) => (
            <div
              key={scene.id}
              data-scene
              className="absolute inset-0 overflow-y-auto bg-bg px-5 py-8 transition-transform duration-500 ease-out"
              style={{ transform: i <= index ? "translateY(0)" : "translateY(100%)", zIndex: i }}
              aria-hidden={i !== index}
            >
              <div className="mx-auto flex min-h-full w-full max-w-xl flex-col items-center justify-center text-center">
                <SceneView scene={scene} active={i === index} />
                {i < total - 1 && scene.type === "concept" && (
                  <button
                    onClick={next}
                    className="mt-8 rounded-btn px-6 py-3 font-head font-semibold text-white transition-transform hover:-translate-y-0.5"
                    style={{ background: chapter.color }}
                  >
                    Continue ↓
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PlayerContext.Provider>
  );
}
