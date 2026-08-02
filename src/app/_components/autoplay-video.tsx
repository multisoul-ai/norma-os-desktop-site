"use client";

import { useEffect, useRef, useState } from "react";

type AutoplayVideoProps = {
  active?: boolean;
  className?: string;
  label: string;
  pauseLabel: string;
  playLabel: string;
  poster: string;
  preload?: "none" | "metadata";
  sound?: {
    muteLabel: string;
    unmuteLabel: string;
  };
  src: string;
};

export function AutoplayVideo({
  active = true,
  className,
  label,
  pauseLabel,
  playLabel,
  poster,
  preload = "none",
  sound,
  src,
}: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVisibleRef = useRef(false);
  const manuallyPausedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [motionDisabled, setMotionDisabled] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    reducedMotionRef.current = reducedMotion.matches;
    setMotionDisabled(reducedMotion.matches);
    isVisibleRef.current = false;
    setIsVisible(false);

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const syncPlayback = () => {
      if (
        active &&
        isVisibleRef.current &&
        !reducedMotionRef.current &&
        !manuallyPausedRef.current
      ) {
        void video
          .play()
          .catch(() => setIsPlaying(false));
        return;
      }

      video.pause();
      setIsPlaying(false);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current =
          entry.isIntersecting && entry.intersectionRatio >= 0.4;
        setIsVisible(isVisibleRef.current);
        syncPlayback();
      },
      { threshold: [0, 0.4, 0.8] },
    );

    const handleMotionPreference = () => {
      reducedMotionRef.current = reducedMotion.matches;
      setMotionDisabled(reducedMotion.matches);
      syncPlayback();
    };

    observer.observe(video);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    reducedMotion.addEventListener("change", handleMotionPreference);

    if (!active) {
      video.muted = true;
      video.pause();
    }

    return () => {
      observer.disconnect();
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      reducedMotion.removeEventListener("change", handleMotionPreference);
      video.pause();
    };
  }, [active]);

  const playbackUnavailable = !active || !isVisible || motionDisabled;

  return (
    <>
      <video
        aria-label={label}
        className={className}
        loop
        muted={isMuted}
        playsInline
        poster={poster}
        preload={preload}
        ref={videoRef}
        src={src}
      />
      <button
        aria-label={isPlaying ? pauseLabel : playLabel}
        className="video-control"
        disabled={!isPlaying && playbackUnavailable}
        onClick={() => {
          const video = videoRef.current;

          if (!video) {
            return;
          }

          if (isPlaying) {
            manuallyPausedRef.current = true;
            video.pause();
            return;
          }

          if (
            !active ||
            !isVisibleRef.current ||
            reducedMotionRef.current
          ) {
            return;
          }

          manuallyPausedRef.current = false;
          void video
            .play()
            .catch(() => setIsPlaying(false));
        }}
        type="button"
      >
        <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
      </button>
      {sound ? (
        <button
          aria-label={isMuted ? sound.unmuteLabel : sound.muteLabel}
          aria-pressed={!isMuted}
          className="video-control video-control--sound"
          disabled={playbackUnavailable || !isPlaying}
          onClick={() => {
            const video = videoRef.current;

            if (!video) {
              return;
            }

            const nextMuted = !isMuted;
            video.muted = nextMuted;
            setIsMuted(nextMuted);
          }}
          type="button"
        >
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
            <path d="M4 9h4l4-3v12l-4-3H4z" />
            {isMuted ? (
              <path d="m16 9 5 6m0-6-5 6" />
            ) : (
              <path d="M16 8.5c1.4 1 2 2.1 2 3.5s-.6 2.5-2 3.5M18.5 6c2.2 1.6 3.2 3.6 3.2 6s-1 4.4-3.2 6" />
            )}
          </svg>
        </button>
      ) : null}
    </>
  );
}
