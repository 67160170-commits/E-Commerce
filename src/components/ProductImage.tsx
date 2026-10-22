/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

// แต่ละหมวดมีสีของตัวเอง ใช้กับภาพขวด placeholder ตอนที่สินค้ายังไม่มี image_url
const PALETTE = [
  { bg: "#FCEFD2", body: "#F2A33A" },
  { bg: "#DCEBF5", body: "#2F7FB5" },
  { bg: "#E8DFF3", body: "#7A4FA3" },
  { bg: "#FBE2E6", body: "#D2647A" },
  { bg: "#DCEEDD", body: "#3E8E54" },
];

type Props = {
  categoryId: number;
  imageUrl: string | null;
  alt: string; // ส่ง "" ถ้าชื่อสินค้าแสดงอยู่ข้างภาพแล้ว
  className?: string;
};

export default function ProductImage({ categoryId, imageUrl, alt, className = "" }: Props) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (imageUrl && failedUrl !== imageUrl) {
    return <img src={imageUrl} alt={alt} loading="lazy" onError={() => setFailedUrl(imageUrl)} className={`object-contain ${className}`} />;
  }

  const color = PALETTE[(categoryId - 1) % PALETTE.length];
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      <rect width="200" height="200" fill={color.bg} />
      <ellipse cx="100" cy="172" rx="48" ry="7" fill="#17302B" opacity="0.08" />
      <rect x="82" y="30" width="36" height="20" rx="4" fill="#17302B" />
      <rect x="88" y="48" width="24" height="10" fill={color.body} />
      <rect x="62" y="56" width="76" height="112" rx="16" fill={color.body} />
      <rect x="70" y="84" width="60" height="58" rx="6" fill="#FFFFFF" opacity="0.92" />
      <rect x="78" y="96" width="44" height="6" rx="3" fill={color.body} />
      <rect x="78" y="108" width="34" height="4" rx="2" fill="#17302B" opacity="0.25" />
      <rect x="78" y="118" width="38" height="4" rx="2" fill="#17302B" opacity="0.25" />
    </svg>
  );
}
