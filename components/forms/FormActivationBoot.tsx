"use client";

import { HomeFormBridge } from "@/components/forms/HomeFormBridge";

/** Client island mounted from the root layout so UI-locked homepage sources stay unchanged. */
export function FormActivationBoot() {
  return <HomeFormBridge />;
}
