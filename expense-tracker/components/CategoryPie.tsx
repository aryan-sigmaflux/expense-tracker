"use client";

import { PieChart, Pie, Cell } from "recharts";

export type PieDatum = { name: string; value: number; color: string };

const SIZE = 220;
const OUTER = 88;
const CENTER = SIZE / 2;
const LIFT = 9; // how far the active slice pops outward

export default function CategoryPie({
  data,
  activeName,
  onSelect,
}: {
  data: PieDatum[];
  activeName: string | null;
  onSelect: (name: string) => void;
}) {
  const hasActive = activeName !== null && data.some((d) => d.name === activeName);

  // Mid-angle of the active slice -> direction to nudge it outward.
  let dx = 0;
  let dy = 0;
  if (hasActive) {
    const sum = data.reduce((s, d) => s + d.value, 0) || 1;
    let angle = 90; // matches startAngle, sweeping clockwise
    for (const d of data) {
      const sweep = (d.value / sum) * 360;
      if (d.name === activeName) {
        const mid = angle - sweep / 2;
        const rad = (-mid * Math.PI) / 180;
        dx = Math.cos(rad) * LIFT;
        dy = Math.sin(rad) * LIFT;
        break;
      }
      angle -= sweep;
    }
  }

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      {/* Base pie (active slice hidden to leave a gap) */}
      <PieChart width={SIZE} height={SIZE}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={0}
          outerRadius={OUTER}
          startAngle={90}
          endAngle={-270}
          isAnimationActive={false}
          onClick={(_, index) => onSelect(data[index].name)}
          style={{ cursor: "pointer", outline: "none" }}
        >
          {data.map((d) => {
            const isActive = d.name === activeName;
            return (
              <Cell
                key={d.name}
                fill={d.color}
                opacity={hasActive ? (isActive ? 0 : 0.28) : 1}
                stroke="#ffffff"
                strokeWidth={data.length > 1 ? 2 : 0}
              />
            );
          })}
        </Pie>
      </PieChart>

      {/* Lifted, shadowed copy of just the active slice */}
      {hasActive && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.28))" }}
        >
          <PieChart width={SIZE} height={SIZE}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx={CENTER + dx}
              cy={CENTER + dy}
              innerRadius={0}
              outerRadius={OUTER + 5}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {data.map((d) => {
                const isActive = d.name === activeName;
                return (
                  <Cell
                    key={d.name}
                    fill={isActive ? d.color : "transparent"}
                    stroke={isActive ? "#ffffff" : "none"}
                    strokeWidth={isActive ? 2 : 0}
                  />
                );
              })}
            </Pie>
          </PieChart>
        </div>
      )}
    </div>
  );
}
