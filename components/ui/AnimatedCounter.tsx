"use client";

import { useEffect, useState } from "react";

export default function AnimatedCounter({ value }: { value: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const numericValue = parseInt(value.replace("+", ""));
    let start = 0;

    const interval = setInterval(() => {
      start += Math.ceil(numericValue / 50);
      if (start >= numericValue) {
        start = numericValue;
        clearInterval(interval);
      }
      setCount(start);
    }, 20);

    return () => clearInterval(interval);
  }, [value]);

  return <span>{count}+</span>;
}