import React from "react";

const CustomLegend = ({ payload }) => {
  if (!payload || payload.length === 0) return null;

  return (
    <ul className="flex justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center gap-2 text-sm">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-700 font-medium">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export default CustomLegend;
