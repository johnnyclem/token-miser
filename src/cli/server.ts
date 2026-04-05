import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { AggregateData } from "../analyzer/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js":   "application/javascript",
  ".css":  "text/css",
  ".json": "application/json",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".ico":  "image/x-icon",
};

/**
 * Start a local HTTP server that:
 *  1. Serves the pre-built dashboard from dist/dashboard/
 *  2. Serves real aggregate data at GET /api/data
 *
 * Returns the URL and a close() handle.
 */
export function startDashboardServer(
  data: AggregateData,
  port = 0, // 0 = let OS pick a free port
): Promise<{ url: string; close: () => void }> {
  // Resolve the dashboard dist directory relative to the package root.
  // In an npm install, the CLI lives at dist/cli/server.js, so the
  // dashboard lives at ../../dist/dashboard (sibling under dist/).
  // During local dev it may also be at ../dist/dashboard from the repo root.
  const distDir = join(__dirname, "..", "dashboard");

  const dataJson = JSON.stringify(data);

  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", `http://localhost`);

    // API endpoint — serve real data
    if (url.pathname === "/api/data") {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(dataJson);
      return;
    }

    // Static file serving from dashboard dist
    let filePath = join(distDir, url.pathname === "/" ? "index.html" : url.pathname);

    // SPA fallback — serve index.html for unknown paths
    if (!existsSync(filePath)) {
      filePath = join(distDir, "index.html");
    }

    if (!existsSync(filePath)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    try {
      const content = readFileSync(filePath);
      const ext = extname(filePath);
      res.writeHead(200, {
        "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
      });
      res.end(content);
    } catch {
      res.writeHead(500);
      res.end("Internal error");
    }
  });

  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(port, "127.0.0.1", () => {
      const addr = server.address();
      const actualPort = typeof addr === "object" && addr ? addr.port : port;
      const serverUrl = `http://127.0.0.1:${actualPort}`;
      resolve({
        url: serverUrl,
        close: () => server.close(),
      });
    });
  });
}
