"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { cloudActivities, type CloudActivity } from "./cloud-state";
import "./norma-cloud.css";

const CloudViewport = dynamic(() => import("./cloud-viewport"), { ssr: false });

const activityCopy: Record<
  CloudActivity,
  { word: string; zh: string; en: string }
> = {
  calm: { word: "on cloud nine.", zh: "随时待命", en: "Ready when you are" },
  voice: {
    word: "all ears.",
    zh: "语音群控 · 一句话，一起行动",
    en: "Voice command · Say it once",
  },
  collaboration: {
    word: "better together.",
    zh: "Agent 协作 · 分工，接力",
    en: "Agent collaboration · Work together",
  },
  focus: {
    word: "in the flow.",
    zh: "工作区聚焦 · 让重要的来到眼前",
    en: "Workspace focus · Find your flow",
  },
  done: {
    word: "all done.",
    zh: "任务完成 · 好消息，及时知道",
    en: "Task complete · Stay in the loop",
  },
  rain: {
    word: "let it rain.",
    zh: "下点小雨，也陪着你",
    en: "A little rain. Still here for you.",
  },
  storm: {
    word: "a little spark.",
    zh: "灵感，正在闪现",
    en: "A little spark of inspiration",
  },
};

export default function NormaCloud({ chinese }: { chinese: boolean }) {
  const [activity, setActivity] = useState<CloudActivity>("calm");
  return (
    <section
      className="nc nc-inline"
      data-tone="black"
      data-activity={activity}
      data-weather={
        activity === "rain" || activity === "storm" ? activity : "calm"
      }
    >
      <div className="nc-topline">
        <span>NORMA / LITTLE CLOUD</span>
        <span className="nc-live-dot" />
        {chinese ? "陪你，把事情做好" : "A little company. Good work."}
      </div>
      <div className="nc-stage">
        <Image
          className="nc-poster"
          src="/brand/norma-cloud-poster.png"
          alt={chinese ? "Norma 墨黑小云朵" : "Norma’s little ink cloud"}
          fill
          sizes="(max-width: 900px) 90vw, 600px"
          priority
        />
        {cloudActivities.map((mode) => (
          <div
            className="nc-caption-layer"
            key={mode}
            data-active={mode === activity}
            aria-hidden={mode !== activity}
          >
            <p className="nc-stage-word" aria-hidden="true">
              {activityCopy[mode].word}
            </p>
            <p className="nc-activity-caption">
              {chinese ? activityCopy[mode].zh : activityCopy[mode].en}
            </p>
          </div>
        ))}
        <CloudViewport
          activity={activity}
          chinese={chinese}
          onChange={setActivity}
        />
      </div>
      <div className="nc-bottomline">
        <span>
          {chinese
            ? "它会自己切换，点一下也会回应。"
            : "It changes on its own. Tap to join in."}
        </span>
        <span>{chinese ? "也可以拖动转一转 ↗" : "Or give it a spin ↗"}</span>
      </div>
    </section>
  );
}
