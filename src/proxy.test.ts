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

  it("serves Manglish pages", () => {
    expect(visit("/manglish/recipes/kopi").headers.get("location")).toBeNull();
    expect(visit("/manglish").headers.get("location")).toBeNull();
  });

  it("opens bare URLs in the last language picked", () => {
    expect(visit("/", "kopi-lang=manglish").headers.get("location")).toBe("http://localhost/manglish");
    expect(visit("/log", "kopi-lang=manglish").headers.get("location")).toBe("http://localhost/manglish/log");
    expect(visit("/", "kopi-lang=klingon").headers.get("location")).toBe("http://localhost/en");
  });
});
