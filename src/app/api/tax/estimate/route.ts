import { calculateTax } from "@/lib/tax/calculate";
import { fieldErrorsOf, taxEstimateSchema } from "@/lib/tax/schema";

/** POST /api/tax/estimate — stateless calculator; nothing is stored. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = taxEstimateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", fieldErrors: fieldErrorsOf(parsed.error) },
      { status: 422 },
    );
  }

  return Response.json({ data: calculateTax(parsed.data) });
}
