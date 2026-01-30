"use client";

import React, { useState } from "react";
import { Range } from "react-range";

const TRACK_COLOR_ACTIVE = "#0d9488";
const TRACK_COLOR_INACTIVE = "#0d9488";
const MIN = 1;
const MAX = 23;

export default function PointsRedeem() {
  const [values, setValues] = useState([12]);

  return (
    <div className="w-full px-2 mt-11">
      <Range
        step={1}
        min={MIN}
        max={MAX}
        values={values}
        onChange={(v) => setValues(v)}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            className="relative flex items-center w-full"
            style={{
              ...props.style,
              height: "24px",
            }}
          >
            {/* Inactive track (full width, behind) */}
            <div
              className="absolute left-0 right-0 h-2 rounded-full opacity-50"
              style={{ background: TRACK_COLOR_INACTIVE }}
            />
            {/* Active track (left portion) */}
            <div
              className="absolute left-0 h-2 rounded-full"
              style={{
                width: `${((values[0] - MIN) / (MAX - MIN)) * 100}%`,
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
            {/* Value bubble above thumb */}
            <div
              className="absolute whitespace-nowrap font-medium text-white rounded-full px-2.5 py-1 text-[13px] pointer-events-none"
              style={{
                top: "-36px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: TRACK_COLOR_ACTIVE,
              }}
            >
              {values[0]}
            </div>
          </div>
          );
        }}
      />
      {/* Min / Max labels below track */}
      <div className="flex justify-between mt-2 px-0.5">
        <div className="flex flex-col">
          <span className="text-xs text-[#616161]">Min</span>
          <span className="text-sm font-medium text-[#303030]">{MIN}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs text-[#616161]">Max</span>
          <span className="text-sm font-medium text-[#303030]">{MAX}</span>
        </div>
      </div>
    </div>
  );
}
