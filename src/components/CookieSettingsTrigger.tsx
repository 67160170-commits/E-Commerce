"use client";

export default function CookieSettingsTrigger({
  label = "ตั้งค่าคุกกี้",
  className = "inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand hover:text-brand transition-colors",
}: {
  label?: string;
  className?: string;
}) {
  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vitashop:open-cookie-settings"));
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      id="cookie-settings-trigger-btn"
      className={className}
    >
      <span>🍪</span>
      <span>{label}</span>
    </button>
  );
}
