const PRODUCES = ["text/html", "text/markdown"];

function parseAccept(header) {
  return header.split(",").flatMap((value) => {
    const [rawType, ...parameters] = value.split(";").map((part) => part.trim());
    const type = rawType.toLowerCase();
    if (!type) return [];

    let q = 1;
    for (const parameter of parameters) {
      const [rawName, rawValue] = parameter.split("=", 2).map((part) => part.trim());
      if (rawName.toLowerCase() !== "q") continue;
      const parsed = Number(rawValue);
      if (Number.isFinite(parsed)) q = Math.max(0, Math.min(1, parsed));
    }

    const specificity = type === "*/*" ? 0 : type.endsWith("/*") ? 1 : 2;
    return [{ type, q, specificity }];
  });
}

function matches(entry, candidate) {
  if (entry.type === "*/*") return true;
  if (entry.type.endsWith("/*")) return candidate.startsWith(entry.type.slice(0, -1));
  return entry.type === candidate;
}

export function preferredType(header, produces = PRODUCES) {
  if (!header) return produces[0] ?? null;
  const entries = parseAccept(header);
  if (!entries.length) return produces[0] ?? null;

  let best = null;
  let bestQ = -1;
  let bestSpecificity = -1;
  let bestPosition = Infinity;

  for (const candidate of produces) {
    let matched = null;
    let matchedPosition = Infinity;

    for (let position = 0; position < entries.length; position += 1) {
      const entry = entries[position];
      if (!matches(entry, candidate)) continue;
      if (!matched || entry.specificity > matched.specificity ||
          (entry.specificity === matched.specificity && position < matchedPosition)) {
        matched = entry;
        matchedPosition = position;
      }
    }

    if (!matched || matched.q <= 0) continue;
    if (matched.q > bestQ ||
        (matched.q === bestQ && matched.specificity > bestSpecificity) ||
        (matched.q === bestQ && matched.specificity === bestSpecificity && matchedPosition < bestPosition)) {
      best = candidate;
      bestQ = matched.q;
      bestSpecificity = matched.specificity;
      bestPosition = matchedPosition;
    }
  }

  return best;
}

function withNegotiationHeaders(response) {
  const headers = new Headers(response.headers);
  const vary = (headers.get("Vary") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const lower = vary.map((value) => value.toLowerCase());
  if (!lower.includes("accept")) vary.push("Accept");
  if (!lower.includes("accept-encoding")) vary.push("Accept-Encoding");
  headers.set("Vary", vary.join(", "));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function textResponse(body, status, contentType = "text/plain; charset=utf-8") {
  return withNegotiationHeaders(new Response(body, {
    status,
    headers: { "Content-Type": contentType },
  }));
}

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body, null, 2) + "\n", {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": status === 200 ? "public, max-age=300" : "no-store",
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function apiResponse(request, url) {
  const isIndex = url.pathname === "/api" || url.pathname === "/api/";
  if (!isIndex) {
    return jsonResponse({
      error: {
        code: "not_found",
        message: `No API route matches ${request.method} ${url.pathname}.`,
        resolution: "Use GET /api or inspect /openapi.json for the published API surface.",
      },
    }, 404);
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return jsonResponse({
      error: {
        code: "method_not_allowed",
        message: `${request.method} is not supported for /api.`,
        resolution: "Retry this endpoint with GET, or inspect /openapi.json.",
      },
    }, 405, { Allow: "GET, HEAD" });
  }

  const body = {
    name: "Igor Varyvoda",
    description: "Products, systems, and writing by Igor Varyvoda, a product builder and operator who keeps a living portfolio of software.",
    url: `${url.origin}/`,
    resources: {
      openapi: `${url.origin}/openapi.json`,
      sitemap: `${url.origin}/sitemap.xml`,
      projects: `${url.origin}/projects/`,
      writing: `${url.origin}/posts/`,
      markdown: "Send Accept: text/markdown to any canonical HTML page.",
    },
  };
  return request.method === "HEAD"
    ? new Response(null, { status: 200, headers: jsonResponse(body).headers })
    : jsonResponse(body);
}

function markdownPath(pathname) {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/") return "/index.md";
  if (clean.endsWith("/index.html")) return `${clean.slice(0, -10)}index.md`;
  if (clean.endsWith(".html")) return `${clean.slice(0, -5)}.md`;
  return `${clean}/index.md`;
}

const NOT_FOUND_MARKDOWN = `# 404 — Page not found

That path does not exist.

- [Home](/)
- [Projects](/projects/)
- [Writing](/posts/)
- [Sitemap](/sitemap.xml)
- [OpenAPI](/openapi.json)
`;

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
    return apiResponse(request, url);
  }

  if (url.pathname.endsWith(".md")) {
    return withNegotiationHeaders(await context.next());
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return withNegotiationHeaders(await context.next());
  }

  const accept = request.headers.get("Accept");
  const chosen = preferredType(accept);
  if (!chosen && accept) {
    return textResponse("Not Acceptable\n\nAvailable: text/html, text/markdown\n", 406);
  }

  if (chosen === "text/markdown") {
    const markdownUrl = new URL(url);
    markdownUrl.pathname = markdownPath(url.pathname);
    const markdownResponse = await context.env.ASSETS.fetch(new Request(markdownUrl, request));
    if (markdownResponse.status === 200) {
      const headers = new Headers(markdownResponse.headers);
      headers.set("Content-Type", "text/markdown; charset=utf-8");
      return withNegotiationHeaders(new Response(markdownResponse.body, {
        status: 200,
        headers,
      }));
    }

    const htmlResponse = await context.next();
    if (htmlResponse.status === 404) {
      return textResponse(NOT_FOUND_MARKDOWN, 404, "text/markdown; charset=utf-8");
    }
    if (!preferredType(accept, ["text/html"])) {
      return textResponse("Not Acceptable\n\nMarkdown is unavailable and HTML was rejected.\n", 406);
    }
    return withNegotiationHeaders(htmlResponse);
  }

  return withNegotiationHeaders(await context.next());
}
