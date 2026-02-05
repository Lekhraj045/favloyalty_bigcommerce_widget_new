"use client";

import { Range } from "react-range";

const TRACK_COLOR_ACTIVE = "#0d9488";
const TRACK_COLOR_INACTIVE = "#0d9488";

type PointsRedeemProps = {
  min?: number;
  max?: number;
  value?: number;
  onChange?: (points: number) => void;
};

export default function PointsRedeem({
  min = 1,
  max = 1,
  value,
  onChange,
}: PointsRedeemProps) {
  const baseMin = Math.max(1, Math.floor(min));
  const baseMax = Math.max(baseMin, Math.floor(max));
  const isDegenerate = baseMax === baseMin;

  // react-range requires max > min, so when min === max,
  // we create a 1-point-wide internal range but clamp the
  // value to the visible (base) min and show baseMin/baseMax
  // in the labels.
  const safeMin = baseMin;
  const safeMax = isDegenerate ? baseMin + 1 : baseMax;

  const points =
    value != null
      ? Math.min(safeMax, Math.max(safeMin, Math.floor(value)))
      : safeMin;

  const handleChange = (values: number[]) => {
    const v = values[0];
    if (onChange) onChange(Math.min(safeMax, Math.max(safeMin, v)));
  };

  return (
    <div className="w-full px-2 mt-11">
      <Range
        step={1}
        min={safeMin}
        max={safeMax}
        values={[points]}
        onChange={(v) => handleChange(v)}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            className="relative flex items-center w-full"
            style={{
              ...props.style,
              height: "24px",
            }}
          >
            <div
              className="absolute left-0 right-0 h-2 rounded-full opacity-50"
              style={{ background: TRACK_COLOR_INACTIVE }}
            />
            <div
              className="absolute left-0 h-2 rounded-full"
              style={{
                width: `${
                  safeMax > safeMin
                    ? ((points - safeMin) / (safeMax - safeMin)) * 100
                    : 0
                }%`,
                background: TRACK_COLOR_ACTIVE,
              }}
            />
            {children}
          </div>
        )}
        renderThumb={({ props }) => {
          const { key: thumbKey, style, ...restProps } = props;
          return (
            <div
              key={thumbKey}
              {...restProps}
              className="flex justify-center items-center rounded-full shadow-sm outline-none"
              style={{
                ...style,
                width: "24px",
                height: "24px",
                backgroundColor: TRACK_COLOR_ACTIVE,
              }}
            >
              <div
                className="absolute whitespace-nowrap font-medium text-white rounded-full px-2.5 py-1 text-[13px] pointer-events-none"
                style={{
                  top: "-36px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: TRACK_COLOR_ACTIVE,
                }}
              >
                {points}
              </div>
            </div>
          );
        }}
      />
      <div className="flex justify-between mt-2 px-0.5">
        <div className="flex flex-col">
          <span className="text-xs text-[#616161]">Min</span>
          <span className="text-sm font-medium text-[#303030]">{baseMin}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs text-[#616161]">Max</span>
          <span className="text-sm font-medium text-[#303030]">{baseMax}</span>
        </div>
      </div>
    </div>
  );
}
