"use server";

import { refresh } from "next/cache";
import { toLocale, type Locale } from "@/i18n/config";
import type { FieldErrors } from "@/lib/coffee/schema";
import { logBrew, logCount, logDelivery, type ChangeResult } from "@/server/pantry/service";

export interface ActionState {
  status: "idle" | "done" | "error";
  message?: string;
  fieldErrors?: FieldErrors;
  /** Bumps on every response so the form can tell two identical results apart. */
  seq: number;
}

/** Forms send the page's locale in a hidden `locale` field so messages come back in it. */
const localeOf = (formData: FormData): Locale => toLocale(formData.get("locale"));

async function respond(prev: ActionState, change: Promise<ChangeResult>): Promise<ActionState> {
  const result = await change;
  if (!result.ok) {
    return { status: "error", message: result.message, fieldErrors: result.fieldErrors, seq: prev.seq + 1 };
  }
  refresh();
  return { status: "done", message: result.message, seq: prev.seq + 1 };
}

export async function brewAction(prev: ActionState, formData: FormData) {
  return respond(prev, logBrew(Object.fromEntries(formData), localeOf(formData)));
}

export async function deliveryAction(prev: ActionState, formData: FormData) {
  return respond(prev, logDelivery(Object.fromEntries(formData), localeOf(formData)));
}

export async function countAction(prev: ActionState, formData: FormData) {
  return respond(prev, logCount(Object.fromEntries(formData), localeOf(formData)));
}
