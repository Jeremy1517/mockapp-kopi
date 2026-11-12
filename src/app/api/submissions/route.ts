import { maskTaxId } from "@/lib/format";
import { listSubmissions, submitTaxReturn } from "@/server/submissions/service";

/** GET /api/submissions — list filed returns (summary view, Tax ID masked). */
export async function GET() {
  const submissions = await listSubmissions();
  return Response.json({
    data: submissions.map((s) => ({
      id: s.id,
      reference: s.reference,
      status: s.status,
      submittedAt: s.submittedAt,
      taxYear: s.input.taxYear,
      fullName: s.input.fullName,
      taxId: maskTaxId(s.input.taxId),
      taxPayable: s.computation.taxPayable,
      balance: s.computation.balance,
      outcome: s.computation.outcome,
    })),
  });
}

/** POST /api/submissions — file a return with a JSON body (same rules as the web form). */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const result = await submitTaxReturn(body);
  if (!result.ok) {
    return Response.json(
      { error: result.message, fieldErrors: result.fieldErrors },
      { status: result.kind === "conflict" ? 409 : 422 },
    );
  }

  return Response.json(
    { data: result.submission },
    { status: 201, headers: { Location: `/api/submissions/${result.submission.id}` } },
  );
}
