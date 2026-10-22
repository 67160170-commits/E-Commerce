export function safeRedirect(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) return "/";
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(decoded)) return "/";
    const url = new URL(value, "https://my-yadom.invalid");
    return url.origin === "https://my-yadom.invalid" ? value : "/";
  } catch { return "/"; }
}
