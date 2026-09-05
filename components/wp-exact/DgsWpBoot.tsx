"use client";

import { useEffect } from "react";
import { useChrome } from "@/components/layout/ChromeProvider";

type Props = {
  bootNav: string;
  bootV1215?: string;
  bootPortfolio?: string;
  runV1215?: boolean;
  runPortfolio?: boolean;
};

function runInlineScript(source: string, label: string) {
  try {
    const el = document.createElement("script");
    el.setAttribute("data-dgs-wp-boot", label);
    el.text = source;
    document.body.appendChild(el);
  } catch (error) {
    console.warn(`[DGS mirror] Failed to run ${label} boot script`, error);
  }
}

export function DgsWpBoot({
  bootNav,
  bootV1215 = "",
  bootPortfolio = "",
  runV1215 = true,
  runPortfolio = true,
}: Props) {
  const { openLetsTalk } = useChrome();

  useEffect(() => {
    runInlineScript(bootNav, "nav");
    if (runV1215 && bootV1215) {
      runInlineScript(bootV1215, "v1215");
    }

    if (runPortfolio && bootPortfolio) {
      runInlineScript(bootPortfolio, "portfolio");
    }

    const onTalkClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest(".dgs-talk-trigger");
      if (!target) return;
      event.preventDefault();
      openLetsTalk();
    };

    document.addEventListener("click", onTalkClick);
    return () => document.removeEventListener("click", onTalkClick);
  }, [bootNav, bootV1215, bootPortfolio, runV1215, runPortfolio, openLetsTalk]);

  return null;
}
