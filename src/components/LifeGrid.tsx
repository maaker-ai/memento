import React, { useMemo } from "react";
import { View, Dimensions } from "react-native";
import Svg, { Rect, Circle } from "react-native-svg";
import { COLORS, WEEKS_PER_YEAR, TOTAL_YEARS } from "../utils/constants";
import { getWeeksLived, dateToWeekIndex } from "../utils/date";
import { Milestone } from "../types";

interface LifeGridProps {
  birthday: string;
  milestones: Milestone[];
}

export default function LifeGrid({ birthday, milestones }: LifeGridProps) {
  const screenWidth = Dimensions.get("window").width;
  const gridWidth = screenWidth - 56; // match content padding 28*2
  const gap = 1;
  const cellSize = (gridWidth - gap * (WEEKS_PER_YEAR - 1)) / WEEKS_PER_YEAR;
  const totalCellSize = cellSize + gap;

  const weeksLived = useMemo(() => getWeeksLived(birthday), [birthday]);

  const milestoneWeeks = useMemo(() => {
    const map = new Map<number, Milestone>();
    milestones.forEach((m) => {
      const weekIdx = dateToWeekIndex(birthday, m.date);
      if (weekIdx >= 0 && weekIdx < TOTAL_YEARS * WEEKS_PER_YEAR) {
        map.set(weekIdx, m);
      }
    });
    return map;
  }, [birthday, milestones]);

  const svgWidth = gridWidth;
  const svgHeight = TOTAL_YEARS * totalCellSize;

  const cells = useMemo(() => {
    const elements: React.ReactElement[] = [];
    for (let year = 0; year < TOTAL_YEARS; year++) {
      for (let week = 0; week < WEEKS_PER_YEAR; week++) {
        const weekIndex = year * WEEKS_PER_YEAR + week;
        const x = week * totalCellSize;
        const y = year * totalCellSize;
        const isMilestone = milestoneWeeks.has(weekIndex);

        if (isMilestone) {
          elements.push(
            <Circle
              key={weekIndex}
              cx={x + cellSize / 2}
              cy={y + cellSize / 2}
              r={cellSize / 2}
              fill={COLORS.milestone}
            />
          );
        } else {
          let fill = "#1A1A1A"; // future
          let height = cellSize;
          if (weekIndex < weeksLived) {
            fill = "#404040"; // past
          } else if (weekIndex === weeksLived) {
            fill = "#FFFFFF"; // current
            height = cellSize + 1;
          }

          elements.push(
            <Rect
              key={weekIndex}
              x={x}
              y={y}
              width={cellSize}
              height={height}
              rx={0.5}
              fill={fill}
            />
          );
        }
      }
    }
    return elements;
  }, [weeksLived, milestoneWeeks, cellSize, totalCellSize]);

  return (
    <View style={{ borderRadius: 8, overflow: "hidden", padding: 4 }}>
      <Svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      >
        {cells}
      </Svg>
    </View>
  );
}
