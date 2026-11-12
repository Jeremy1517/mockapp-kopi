import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

const visit = (path: string, cookie?: string) =>
  proxy(new NextRequest(`http://localhost${path}`, { headers: cookie ? { cookie } : {} }));

describe("proxy", () => {
  it("lets English pages through", () => {
    expect(visit("/en/recipes").headers.get("location")).toBeNull();
  });

  it("adds the language to bare URLs, keeping the query", () => {
    expect(visit("/recipes/latte?item=x").headers.get("location")).toBe(
      "http://localhost/en/recipes/latte?item=x",
    );
    expect(visit("/").headers.get("location")).toBe("http://localhost/en");
  });

  it("sends switched-off Manglish to the same page in English", () => {
    expect(visit("/manglish/recipes/kopi").headers.get("location")).toBe("http://localhost/en/recipes/kopi");
    expect(visit("/manglish").headers.get("location")).toBe("http://localhost/en");
    expect(visit("/", "kopi-lang=manglish").headers.get("location")).toBe("http://localhost/en");
  });
});
