import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { handleChange } from "./http";
import { getPantry, logBrew } from "./service";

const post = (body: string, headers: Record<string, string>) =>
  new Request("http://localhost/api/brews", { method: "POST", body, headers });

describe("handleChange", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "kopi-http-"));
    process.env.DATA_DIR = dir;
  });

  afterEach(async () => {
    delete process.env.DATA_DIR;
    await rm(dir, { recursive: true, force: true });
  });

  const latte = JSON.stringify({ recipe: "latte", cups: 1 });

  it("accepts a JSON request", async () => {
    const res = await handleChange(
      post(latte, { "content-type": "application/json; charset=utf-8" }),
      logBrew,
    );
    expect(res.status).toBe(201);
    expect((await getPantry()).log).toHaveLength(1);
  });

  it("rejects a plain-text body, which a cross-site form could send without a preflight", async () => {
    const res = await handleChange(post(latte, { "content-type": "text/plain" }), logBrew);
    expect(res.status).toBe(415);
    expect((await getPantry()).log).toHaveLength(0);
  });

  it("rejects requests a browser marks as cross-site", async () => {
    const res = await handleChange(
      post(latte, { "content-type": "application/json", "sec-fetch-site": "cross-site" }),
      logBrew,
    );
    expect(res.status).toBe(403);
    expect((await getPantry()).log).toHaveLength(0);
  });
});
