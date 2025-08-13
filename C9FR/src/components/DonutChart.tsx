import React from 'react';
import { View } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { pie, arc } from 'd3-shape';

export interface DonutSlice {
  value: number;
  color: string;
  label?: string; // if omitted we render value%
}

interface Props {
  data: DonutSlice[];
  radius?: number; // overall radius
  innerRadiusRatio?: number; // 0..1
  separatorWidth?: number; // white stroke width between slices
}

// Renders a donut-style pie chart with percentage (or custom) labels and white separators
const DonutChart: React.FC<Props> = ({
  data,
  radius = 110,
  innerRadiusRatio = 0.6,
  _separatorWidth = 2,
}) => {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  if (total === 0) {
    return null;
  }

  const outerR = radius;
  const innerR = radius * innerRadiusRatio;

  const pieGenerator = pie().sort(null).value((d: any) => d.value);

  const arcs = pieGenerator(data);

  const arcGenerator = arc()
    .outerRadius(outerR)
    .innerRadius(innerR)
    .padAngle(0.02); // small gap so stroke is visible

  const viewBox = `${-outerR} ${-outerR} ${outerR * 2} ${outerR * 2}`;

  return (
    <View style={{ width: outerR * 2, height: outerR * 2, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={outerR * 2} height={outerR * 2} viewBox={viewBox}>
        <G>
          {arcs.map((arcItem: any, idx: number) => {
            const path = arcGenerator(arcItem as any);
            if (!path) return null;
            // Label position – centroid of the arc
            const [labelX, labelY] = arcGenerator.centroid(arcItem as any);
            const percentage = ((arcItem.data.value / total) * 100).toFixed(0) + '%';
            return (
              <G key={idx}>
                <Path d={path} fill={arcItem.data.color} />
                {parseFloat(percentage) >= 3 && (
                  <SvgText
                    x={labelX}
                    y={labelY}
                    fill="#fff"
                    fontSize={13}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {arcItem.data.label ?? percentage}
                  </SvgText>
                )}
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

export default DonutChart; 