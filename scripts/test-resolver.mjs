// Resolves the "@/..." path alias from tsconfig for `node --test`, so pure modules can be
// tested without a bundler. Also stubs "server-only". Registered through scripts/test-setup.mjs.
import { existsSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = fileURLToPath(new URL("../src/", import.meta.url));
const EXTENSIONS = [".ts", ".tsx", ".js", ".mjs", ".json"];

/** Next.js resolves "server-only" itself; under node:test it is an empty module. */
const EMPTY_MODULE = "data:text/javascript,";

export function resolve(specifier, context, next) {
  if (specifier === "server-only") return { url: EMPTY_MODULE, shortCircuit: true };
  if (!specifier.startsWith("@/")) return next(specifier, context);
  const base = SRC + specifier.slice(2);
  const candidates = [base, ...EXTENSIONS.map((e) => base + e), ...EXTENSIONS.map((e) => base + "/index" + e)];
  for (const path of candidates) {
    if (existsSync(path) && statSync(path).isFile()) return next(pathToFileURL(path).href, context);
  }
  return next(specifier, context);
}
