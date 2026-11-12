import "server-only";

import type { ChangeResult } from "./service";

/** Shared by the POST routes: parse a JSON body, run one change, map the result to HTTP. */
export async function handleChange(request: Request, change: (body: unknown) => Promise<ChangeResult>) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const result = await change(body);
  if (!result.ok) {
    return Response.json(
      { error: result.message, fieldErrors: result.fieldErrors },
      { status: result.kind === "short" ? 409 : 422 },
    );
  }
  return Response.json(
    { message: result.message, entry: result.entry, stock: result.pantry.stock },
    { status: 201 },
  );
}
