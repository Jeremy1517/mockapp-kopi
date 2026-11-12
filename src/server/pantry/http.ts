import "server-only";

import type { ChangeResult } from "./service";

/**
 * Shared by the POST routes: parse a JSON body, run one change, map the result to HTTP.
 *
 * There's no login in this mock, so two cheap checks stop another website from changing
 * stock through a visitor's browser: a JSON content type can't be sent cross-site without
 * a CORS preflight (which these routes don't answer), and browsers mark cross-site
 * requests with `Sec-Fetch-Site`. Put real authentication in front before sharing the app.
 */
export async function handleChange(request: Request, change: (body: unknown) => Promise<ChangeResult>) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return Response.json({ error: "Requests from other websites aren't allowed" }, { status: 403 });
  }

  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return Response.json(
      { error: "Send the body as JSON with Content-Type: application/json" },
      { status: 415 },
    );
  }

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
