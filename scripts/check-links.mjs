import { readFileSync, writeFileSync } from "node:fs";
import { execFile } from "node:child_process";

const sites = JSON.parse(readFileSync(new URL("../data/sites.json", import.meta.url), "utf8"));
const uniqueUrls = [...new Map(sites.filter((site) => site.url).map((site) => [site.url, site])).entries()];
const timeoutSeconds = 6;
const concurrency = 32;

function curlStatus(url, method) {
  const args = [
    "-L",
    "-sS",
    "-o",
    "/dev/null",
    "-w",
    "%{http_code}\t%{url_effective}",
    "--max-time",
    String(timeoutSeconds),
  ];
  if (method === "HEAD") args.push("-I");
  args.push(url);

  return new Promise((resolve) => {
    execFile("curl", args, { timeout: (timeoutSeconds + 2) * 1000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ status: 0, finalUrl: url, error: stderr.trim() || error.message });
        return;
      }
      const [statusText, finalUrl] = stdout.trim().split("\t");
      resolve({ status: Number(statusText) || 0, finalUrl: finalUrl || url, error: null });
    });
  });
}

async function checkOne([url, site]) {
  const result = {
    name: site.name,
    url,
    ok: false,
    status: null,
    method: null,
    finalUrl: url,
    error: null,
  };

  for (const method of ["HEAD", "GET"]) {
    const response = await curlStatus(url, method);
    result.status = response.status;
    result.method = method;
    result.finalUrl = response.finalUrl;
    result.error = response.error;
    result.ok = response.status >= 200 && response.status < 400;
    if (result.ok || method === "GET") return result;
  }

  return result;
}

const results = [];
let cursor = 0;

async function worker() {
  while (cursor < uniqueUrls.length) {
    const item = uniqueUrls[cursor++];
    results.push(await checkOne(item));
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));

results.sort((a, b) => a.name.localeCompare(b.name));
const summary = {
  checked: results.length,
  ok: results.filter((item) => item.ok).length,
  failed: results.filter((item) => !item.ok).length,
};

writeFileSync(
  new URL("../link-check-report.json", import.meta.url),
  `${JSON.stringify({ summary, results }, null, 2)}\n`,
);

console.log(JSON.stringify(summary));
