import { resolve4, resolve6 } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_URL_LENGTH = 2_048;
const CHECK_TIMEOUT_MS = 8_000;

function makeDiagnosis(
  category: string,
  title: string,
  detail: string,
  nextStep: string,
) {
  return { category, title, detail, nextStep };
}

function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  if ("code" in error && typeof error.code === "string") return error.code;
  if ("cause" in error) return getErrorCode(error.cause);
  return undefined;
}

function validateTarget(value: unknown) {
  if (typeof value !== "string" || value.length > MAX_URL_LENGTH) {
    throw new Error("Enter a valid website address.");
  }

  let target: URL;
  try {
    target = new URL(value);
  } catch {
    throw new Error("Enter a valid website address.");
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS websites can be checked.");
  }

  if (target.username || target.password) {
    throw new Error("Website addresses cannot include login details.");
  }

  const hostname = target.hostname.toLowerCase().replace(/\.$/, "");
  const blockedSuffixes = [
    ".localhost",
    ".local",
    ".internal",
    ".test",
    ".invalid",
  ];
  if (
    !hostname.includes(".") ||
    hostname === "localhost" ||
    blockedSuffixes.some((suffix) => hostname.endsWith(suffix)) ||
    isIP(hostname.replace(/^\[|\]$/g, "")) !== 0
  ) {
    throw new Error(
      "Enter a public website address, not a local or IP address.",
    );
  }

  if (target.port && target.port !== "80" && target.port !== "443") {
    throw new Error("Only standard web ports (80 and 443) can be checked.");
  }

  return target;
}

function isPublicAddress(address: string, family: number) {
  if (family === 4) {
    const octets = address.split(".").map(Number);
    if (octets.length !== 4 || octets.some((part) => part < 0 || part > 255)) {
      return false;
    }

    const [first, second, third] = octets;
    if (
      first === 0 ||
      first === 10 ||
      first === 127 ||
      first >= 224 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168) ||
      (first === 192 && second === 0 && third === 0) ||
      (first === 192 && second === 0 && third === 2) ||
      (first === 198 && (second === 18 || second === 19)) ||
      (first === 198 && second === 51 && third === 100) ||
      (first === 203 && second === 0 && third === 113)
    ) {
      return false;
    }
    return true;
  }

  if (family === 6) {
    const normalized = address.toLowerCase();
    const firstBlock = Number.parseInt(normalized.split(":")[0] || "0", 16);
    return (
      firstBlock >= 0x2000 &&
      firstBlock <= 0x3fff &&
      !normalized.startsWith("2001:db8:")
    );
  }

  return false;
}

export async function POST(request: Request) {
  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Send a valid website address." },
      { status: 400 },
    );
  }

  let target: URL;
  try {
    target = validateTarget(body.url);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Enter a valid website address.",
      },
      { status: 400 },
    );
  }

  const startedAt = performance.now();
  const dnsResults = await Promise.allSettled([
    resolve4(target.hostname),
    resolve6(target.hostname),
  ]);
  const addresses = dnsResults.flatMap((result, index) =>
    result.status === "fulfilled"
      ? result.value.map((address) => ({
          address,
          family: index === 0 ? 4 : 6,
        }))
      : [],
  );

  if (!addresses.length) {
    const errorCodes = dnsResults.flatMap((result) =>
      result.status === "rejected" ? [getErrorCode(result.reason)] : [],
    );
    const code = errorCodes.includes("EAI_AGAIN")
      ? "EAI_AGAIN"
      : errorCodes.includes("ENOTFOUND")
        ? "ENOTFOUND"
        : errorCodes.includes("ENODATA")
          ? "ENODATA"
          : undefined;
    const unknownDomain = code === "ENOTFOUND" || code === "ENODATA";
    const temporaryDnsFailure = code === "EAI_AGAIN";
    return Response.json({
      url: target.toString(),
      status: "down",
      statusCode: null,
      responseTime: Math.round(performance.now() - startedAt),
      diagnosis: unknownDomain
        ? makeDiagnosis(
            "unknown-domain",
            "Domain not found",
            "The domain did not resolve to a website address. It may be misspelled, expired, or missing DNS records.",
            "Check the spelling and domain registration, then review the domain's DNS records.",
          )
        : temporaryDnsFailure
          ? makeDiagnosis(
              "dns-temporary",
              "DNS lookup failed temporarily",
              "The domain name service did not return an answer in time.",
              "Wait a moment and check again. If it continues, check the domain's DNS provider.",
            )
          : makeDiagnosis(
              "dns-error",
              "Could not look up the domain",
              "The domain name service could not provide an address for this website.",
              "Check the domain's DNS configuration and try again shortly.",
            ),
    });
  }

  if (
    !addresses.length ||
    addresses.some(({ address, family }) => !isPublicAddress(address, family))
  ) {
    return Response.json(
      { error: "This address does not resolve to a public website." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(target, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
      cache: "no-store",
      headers: {
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
        Range: "bytes=0-0",
        "User-Agent": "SitepulseStatusCheck/1.0",
      },
    });
    const responseTime = Math.round(performance.now() - startedAt);
    await response.body?.cancel().catch(() => undefined);
    const diagnosis =
      response.status >= 500
        ? makeDiagnosis(
            "server-error",
            "The website's server returned an error",
            `The server responded with HTTP ${response.status}. The website is reachable, but its server could not complete this request.`,
            "Try again later. If you manage the site, check the application, web server, and hosting logs.",
          )
        : response.status >= 400
          ? makeDiagnosis(
              "http-error",
              "The website responded, but this page has an error",
              `The server returned HTTP ${response.status}. The site is online, but this address may be missing or access may be restricted.`,
              "Check the address and whether the page requires a sign-in or specific permissions.",
            )
          : response.status >= 300
            ? makeDiagnosis(
                "redirect",
                "The website redirected this request",
                `The server returned HTTP ${response.status}, which means it is reachable and points to another address.`,
                "Open the website in your browser to follow its redirect.",
              )
            : makeDiagnosis(
                "reachable",
                "The website responded normally",
                `The server returned HTTP ${response.status} to our check.`,
                "No action is needed based on this check.",
              );

    return Response.json({
      url: target.toString(),
      status: response.status >= 500 ? "issue" : "up",
      statusCode: response.status,
      responseTime,
      diagnosis,
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    const code = getErrorCode(error);
    const tlsFailure =
      Boolean(code) &&
      (code!.includes("CERT") ||
        code!.includes("TLS") ||
        code!.startsWith("ERR_SSL"));
    const refused = code === "ECONNREFUSED";
    const connectionDropped = code === "ECONNRESET";
    return Response.json({
      url: target.toString(),
      status: "down",
      statusCode: null,
      responseTime: Math.round(performance.now() - startedAt),
      diagnosis: timedOut
        ? makeDiagnosis(
            "timeout",
            "The website took too long to respond",
            "No response arrived within 8 seconds, so the check was stopped.",
            "Try again later. The site may be overloaded or blocking requests from our checker.",
          )
        : tlsFailure
          ? makeDiagnosis(
              "tls-error",
              "The secure connection could not be verified",
              "The website's HTTPS certificate or TLS configuration prevented a secure connection.",
              "Check that the site's certificate is valid, current, and configured for this domain.",
            )
          : refused
            ? makeDiagnosis(
                "connection-refused",
                "The website refused the connection",
                "The domain resolved, but the server refused the web connection.",
                "The site owner should check that the web server is running and accepting traffic on ports 80 or 443.",
              )
            : connectionDropped
              ? makeDiagnosis(
                  "connection-reset",
                  "The connection was closed unexpectedly",
                  "The website or a network device closed the connection before a response arrived.",
                  "Try again. If the problem continues, the site owner should check server and firewall logs.",
                )
              : makeDiagnosis(
                  "network-error",
                  "Could not connect to the website",
                  "The domain resolved, but the check did not receive an HTTP response.",
                  "The site may be offline, filtering automated requests, or having a network problem. Try again shortly.",
                ),
    });
  }
}
