import React from "react";
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

  // Split label into lines if it contains line breaks
  const lines = label.split("\n");

  // Calculate approximate text width (rough estimation)
  const maxLineLength = Math.max(...lines.map((line) => line.length));
  const textWidth = maxLineLength * fontSize * 0.6;
  const textHeight = lines.length * lineHeight;

  return (
    <g className="annotation-label">
      {/* Background rectangle for readability */}
      <rect
        x={x - textWidth / 2 - padding}
        y={y - textHeight / 2 - padding}
        width={textWidth + padding * 2}
        height={textHeight + padding * 2}
        fill="white"
        opacity={0.8}
        rx={3}
        ry={3}
      />
      {/* Text */}
      {lines.map((line, index) => (
        <text
          key={index}
          x={x}
          y={y - textHeight / 2 + (index + 0.8) * lineHeight}
          textAnchor="middle"
          fontSize={fontSize}
          fill={color}
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          {line}
        </text>
      ))}
    </g>
  );
};
