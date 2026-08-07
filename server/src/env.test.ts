import { describe, expect, it, vi } from "vitest";
import { assertEnv, getEnvErrors, readEnv } from "./env.js";

describe("getEnvErrors", () => {
  it("returns empty when both secrets are set", () => {
    expect(
      getEnvErrors({
        ADMIN_PASSWORD: "secret",
        SESSION_SECRET: "sess",
      }),
    ).toEqual([]);
  });

  it("flags missing or empty secrets", () => {
    expect(getEnvErrors({})).toEqual(["ADMIN_PASSWORD", "SESSION_SECRET"]);
    expect(
      getEnvErrors({ ADMIN_PASSWORD: "  ", SESSION_SECRET: "" }),
    ).toEqual(["ADMIN_PASSWORD", "SESSION_SECRET"]);
  });
});

describe("assertEnv", () => {
  it("exits when secrets are missing", () => {
    const exit = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit");
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => assertEnv({})).toThrow("exit");
    expect(error).toHaveBeenCalled();
    exit.mockRestore();
    error.mockRestore();
  });
});

describe("readEnv", () => {
  it("returns trimmed config when env is valid", () => {
    expect(
      readEnv({
        ADMIN_PASSWORD: " admin ",
        SESSION_SECRET: " sess ",
        PORT: "4000",
      }),
    ).toEqual({
      adminPassword: "admin",
      sessionSecret: "sess",
      port: 4000,
    });
  });
});
