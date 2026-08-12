"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  type MotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import Lenis from "lenis";
import type { ColumnsSection } from "@/lib/content/types";

const DESKTOP_OFFSETS = [
  "top-[-45%]",
  "top-[-95%]",
  "top-[-45%]",
  "top-[-75%]",
] as const;

const MOBILE_OFFSETS = ["top-[-35%]", "top-[-70%]"] as const;

const useDimension = () => {
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimension = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };
    updateDimension();
    window.addEventListener("resize", updateDimension);
    return () => window.removeEventListener("resize", updateDimension);
  }, []);

  return dimension;
};

function distributeImages(images: string[], columnCount: 2 | 4): string[][] {
  if (columnCount === 2) {
    return [images.slice(0, 5), images.slice(5, 10)];
  }
  return [
    images.slice(0, 3),
    images.slice(3, 6),
    images.slice(6, 8),
    images.slice(8, 10),
  ];
}

export default function Columns({ content }: { content: ColumnsSection }) {
  const { width, height } = useDimension();
  const isMobile = width > 0 && width < 768;
  const columnCount: 2 | 4 = isMobile ? 2 : 4;
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    const lenis = new Lenis();
    let frame = 0;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  const y1 = useTransform(scrollYProgress, [0, 1], [0, height * (isMobile ? 1.4 : 2)]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * (isMobile ? 2.2 : 3.3)]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.25]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 3]);

  const images = useMemo(
    () => content.items.map((item) => item.image).filter(Boolean),
    [content.items],
  );

  const columns = useMemo(() => {
    const groups = distributeImages(images, columnCount);
    const motions = columnCount === 2 ? [y1, y2] : [y1, y2, y3, y4];
    const offsets = columnCount === 2 ? MOBILE_OFFSETS : DESKTOP_OFFSETS;
    return groups.map((group, index) => ({
      images: group,
      y: motions[index]!,
      className: offsets[index]!,
    }));
  }, [images, columnCount, y1, y2, y3, y4]);

  if (images.length < 10) return null;

  return (
    <section id="columns" className="bg-[#F6F6F6]">
      <div
        ref={container}
        className="box-border flex h-[140vh] flex-row gap-3 overflow-hidden bg-[rgb(28,28,28)] p-3 md:h-[175vh] md:gap-[2vw] md:p-[2vw]"
      >
        {columns.map((column, index) => (
          <Column
            key={index}
            images={column.images}
            y={column.y}
            className={column.className}
            isMobile={isMobile}
          />
        ))}
      </div>
    </section>
  );
}

function Column({
  images,
  y,
  className = "",
  isMobile,
}: {
  images: readonly string[];
  y: MotionValue<number>;
  className?: string;
  isMobile: boolean;
}) {
  return (
    <motion.div
      style={{ y }}
      className={`relative flex h-full flex-col gap-3 md:gap-[2vw] ${
        isMobile ? "w-1/2 min-w-0" : "w-1/4 min-w-62.5"
      } ${className}`}
    >
      {images.map((image, index) => (
        <div
          key={`${image}-${index}`}
          className="relative h-full w-full overflow-hidden rounded-xl md:rounded-[1vw]"
        >
          <Image
            src={image}
            alt=""
            fill
            className="object-cover"
            sizes={isMobile ? "50vw" : "25vw"}
          />
        </div>
      ))}
    </motion.div>
  );
}
