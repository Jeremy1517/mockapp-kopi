"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FieldErrors } from "@/lib/tax/schema";
import { submitTaxReturn } from "@/server/submissions/service";

export interface FileReturnState {
  message?: string;
  fieldErrors: FieldErrors;
}

export async function fileTaxReturn(
  _prev: FileReturnState,
  formData: FormData,
): Promise<FileReturnState> {
  const result = await submitTaxReturn(Object.fromEntries(formData));

  if (!result.ok) {
    return { message: result.message, fieldErrors: result.fieldErrors };
  }

  revalidatePath("/submissions");
  redirect(`/submissions/${result.submission.id}`);
}
