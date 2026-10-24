"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Soft photos for the right side of the dashboard hero. They melt into the cream
// card and change by themselves every few seconds.
const SLIDES = ["/images/villa.png", "/images/commercial.png", "/images/farm.png"];

export default function HeroSlides() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5500);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div
        className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,#000_38%)] lg:[mask-image:linear-gradient(to_right,transparent_2%,#000_55%)]"
        aria-hidden
      >
        {SLIDES.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-opacity duration-1000"
            style={{
              opacity: i === index ? 1 : 0,
              objectPosition: "60% 45%",
              // a pastel, hazy look, like a soft illustration
              filter: "saturate(0.72) sepia(0.18) brightness(1.1) contrast(0.92)",
            }}
          />
        ))}
        <div className="absolute inset-0 bg-[#fff3e3]/25" />
      </div>
    </>
  );
}
