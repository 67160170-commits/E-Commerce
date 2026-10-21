// ตรวจว่าเว็บยังไม่ตั้งคุกกี้และไม่โหลดสคริปต์/ทรัพยากรจากภายนอกโดยไม่ได้รับความยินยอม
// ใช้: npm run build && npm start   แล้วเปิดอีก terminal รัน   npm run check:cookies
// เปลี่ยนที่อยู่เว็บด้วย BASE_URL=http://localhost:3000

const base = process.env.BASE_URL ?? "http://localhost:3000";
const home = await fetch(base);
const markup = await home.text();
const productPath = markup.match(/href="(\/products\/\d+)"/)?.[1];
if (!productPath) throw new Error("ไม่พบลิงก์สินค้า: ตรวจสอบฐานข้อมูล My YaDom");
const paths = ["/", "/?q=" + encodeURIComponent("ยาดม"), "/?sort=rating", "/rankings", productPath];
const trackerHosts = [
  "google-analytics", "googletagmanager", "doubleclick", "googlesyndication",
  "facebook.net", "connect.facebook", "hotjar", "clarity.ms", "segment.com",
  "mixpanel", "fonts.googleapis.com", "fonts.gstatic.com",
];

let failed = false;
const fail = (message) => { failed = true; console.error(`  ✗ ${message}`); };

for (const path of paths) {
  console.log(`ตรวจ ${path}`);
  const res = await fetch(base + path, { redirect: "manual" });
  if (res.status !== 200) { fail(`สถานะ ${res.status} (ควรเป็น 200)`); continue; }

  const cookies = res.headers.getSetCookie();
  if (cookies.length > 0) fail(`ตั้งคุกกี้ ${cookies.length} ตัว: ${cookies.map((c) => c.split("=")[0]).join(", ")}`);

  const html = await res.text();
  const external = [...html.matchAll(/<(?:script|link|img|iframe)[^>]+(?:src|href)=["'](https?:\/\/[^"']+)["']/gi)]
    .map((m) => m[1]);
  for (const url of external) fail(`โหลดทรัพยากรภายนอก: ${url}`);
  for (const host of trackerHosts) {
    if (html.includes(host)) fail(`พบการอ้างถึง ${host}`);
  }
}

if (failed) { console.error("\nไม่ผ่าน: มีคุกกี้หรือสคริปต์ภายนอกหลุดมา"); process.exit(1); }
console.log("\nผ่าน: ไม่มีคุกกี้และไม่มีสคริปต์ภายนอก");
