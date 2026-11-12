import { getSubmission } from "@/server/submissions/service";

/** GET /api/submissions/:id — full submission including the tax computation. */
export async function GET(_request: Request, ctx: RouteContext<"/api/submissions/[id]">) {
  const { id } = await ctx.params;
  const submission = await getSubmission(id);
  if (!submission) {
    return Response.json({ error: "Submission not found" }, { status: 404 });
  }
  return Response.json({ data: submission });
}
