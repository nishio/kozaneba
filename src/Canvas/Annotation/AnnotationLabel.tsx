import React, { useRef, useEffect, useState } from "react";
import { V2 } from "../../dimension/V2";

interface AnnotationLabelProps {
  position: V2;
  label: string;
  fontSize?: number;
  color?: string;
}

export const AnnotationLabel: React.FC<AnnotationLabelProps> = ({
  position,
  label,
  fontSize = 14,
  color = "#000000",
}) => {
  const [x, y] = position;
  const padding = 4;
  const lineHeight = fontSize * 1.2;
  const textRef = useRef<SVGTextElement>(null);
  const [bbox, setBbox] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Split label into lines if it contains line breaks
  const lines = label.split("\n");

  useEffect(() => {
    if (textRef.current) {
      try {
        const box = textRef.current.getBBox();
        setBbox({ width: box.width, height: box.height });
      } catch (e) {
        // getBBox may fail in some cases, use fallback
        const textWidth = label.length * fontSize * 0.6;
        const textHeight = lines.length * lineHeight;
        setBbox({ width: textWidth, height: textHeight });
      }
    }
  }, [label, fontSize, lines.length, lineHeight]);

  return (
    <g className="annotation-label">
      {/* Background rectangle for readability */}
      <rect
        x={x - bbox.width / 2 - padding}
        y={y - bbox.height / 2 - padding}
        width={bbox.width + padding * 2}
        height={bbox.height + padding * 2}
        fill="white"
        opacity={0.8}
        rx={3}
        ry={3}
      />
      {/* Text */}
      <text ref={textRef} x={x} y={y} textAnchor="middle" fontSize={fontSize}>
        {lines.map((line, index) => (
          <tspan
            key={index}
            x={x}
            dy={index === 0 ? 0 : lineHeight}
            fill={color}
            style={{ userSelect: "none", pointerEvents: "none" }}
          >
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};
