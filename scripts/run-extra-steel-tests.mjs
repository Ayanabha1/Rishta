import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const outputDirectory = mkdtempSync(join(tmpdir(), "rishta-extra-steel-tests-"));

try {
  const compiler = resolve("node_modules/.bin/tsc");
  const compile = spawnSync(
    compiler,
    [
      "tests/extra-steel.test.ts",
      "tests/lead-stages.test.ts",
      "--outDir",
      outputDirectory,
      "--module",
      "commonjs",
      "--moduleResolution",
      "node",
      "--target",
      "es2020",
      "--esModuleInterop",
      "--skipLibCheck",
      "--types",
      "node",
    ],
    { stdio: "inherit" }
  );

  if (compile.status !== 0) process.exitCode = compile.status ?? 1;
  else {
    const testFiles = [
      join(outputDirectory, "tests/extra-steel.test.js"),
      join(outputDirectory, "tests/lead-stages.test.js"),
    ];
    const tests = spawnSync(process.execPath, ["--test", ...testFiles], {
      stdio: "inherit",
    });
    process.exitCode = tests.status ?? 1;
  }
} finally {
  rmSync(outputDirectory, { recursive: true, force: true });
}
