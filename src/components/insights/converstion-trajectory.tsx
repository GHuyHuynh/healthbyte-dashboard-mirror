'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
  ReferenceLine,
} from 'recharts';
import { PersonaData, getAvailablePersonas } from '@/lib/data';

export interface ConversionTrajectoryProps {
  className?: string;
  data: PersonaData[];
}

// Define color scales
const BLUE_COLORS = [
  '#dbeafe', // blue-100
  '#bfdbfe', // blue-200
  '#93c5fd', // blue-300
  '#60a5fa', // blue-400
  '#3b82f6', // blue-500
  '#2563eb', // blue-600
  '#1d4ed8', // blue-700
  '#1e40af', // blue-800
  '#1e3a8a', // blue-900
];

const GREEN_COLORS = [
  '#dcfce7', // green-100
  '#bbf7d0', // green-200
  '#86efac', // green-300
  '#4ade80', // green-400
  '#22c55e', // green-500
  '#16a34a', // green-600
  '#15803d', // green-700
  '#166534', // green-800
  '#14532d', // green-900
];

const RED_COLORS = [
  '#fee2e2', // red-100
  '#fecaca', // red-200
  '#fca5a5', // red-300
  '#f87171', // red-400
  '#ef4444', // red-500
  '#dc2626', // red-600
  '#b91c1c', // red-700
  '#991b1b', // red-800
  '#7f1d1d', // red-900
];

export function ConversionTrajectory({ className, data }: ConversionTrajectoryProps) {
  const availablePersonas = getAvailablePersonas();

  const trajectoryData = useMemo(() => {
    interface TrajectoryItem {
      name: string;
      startRating: number;
      endRating: number;
      ratingChange: number;
      absoluteRatingChange: number;
      finalIteration: number;
      changePerIteration: number;
      direction: 'positive' | 'negative';
    }

    const personaChanges = availablePersonas.map((personaName) => {
      // Filter data for this persona
      const personaData = data.filter(
        (item) => item.persona_name === personaName
      );

      // Sort by iteration to ensure correct order
      personaData.sort((a, b) => a.iteration - b.iteration);

      // Skip if there's no data for this persona in the current dataset
      if (personaData.length === 0) {
        return null;
      }

      // Find first and last iterations
      const firstIteration = personaData[0];
      const lastIteration = personaData[personaData.length - 1];

      // Calculate the change in ratings
      const ratingChange = lastIteration.normalized_current_rating - firstIteration.normalized_current_rating;
      const absoluteRatingChange = Math.abs(ratingChange);
      
      // Get the final iteration number
      const finalIteration = lastIteration.iteration;

      // Calculate change per iteration
      const changePerIteration = ratingChange / finalIteration;

      return {
        name: personaName,
        startRating: firstIteration.normalized_current_rating,
        endRating: lastIteration.normalized_current_rating,
        ratingChange,
        absoluteRatingChange,
        finalIteration,
        changePerIteration,
        direction: ratingChange >= 0 ? 'positive' : 'negative',
      } as TrajectoryItem;
    }).filter((item): item is TrajectoryItem => item !== null); // Remove null entries and type guard

    // Sort by absolute rating change in descending order to show most changed first
    return personaChanges.sort((a, b) => b.absoluteRatingChange - a.absoluteRatingChange);
  }, [availablePersonas, data]);

  // Function to determine color based on direction and intensity
  const getBarColor = (entry: any) => {
    // Find the max rating change to normalize the scale
    const maxChange = trajectoryData[0]?.absoluteRatingChange || 1;
    // Calculate the relative position in the color scale (0-1)
    const relativePosition = entry.absoluteRatingChange / maxChange;
    // Map to the color array index (0-8)
    const colorIndex = Math.min(Math.floor(relativePosition * GREEN_COLORS.length), GREEN_COLORS.length - 1);
    
    // Return color based on direction
    return entry.direction === 'positive' ? GREEN_COLORS[colorIndex] : RED_COLORS[colorIndex];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
          <p className="font-bold">{data.name}</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>Initial Rating: {(data.startRating * 100).toFixed(1)}%</p>
            <p>Final Rating: {(data.endRating * 100).toFixed(1)}%</p>
            <p>Change: {(data.ratingChange * 100).toFixed(1)}%</p>
            <p>
              Direction: 
              <span className={data.direction === 'positive' ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                {data.direction === 'positive' ? '↑ Increased' : '↓ Decreased'}
              </span>
            </p>
            <p>Iterations: {data.finalIteration}</p>
            <p>Change per Iteration: {(data.changePerIteration * 100).toFixed(1)}% per iteration</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Find max absolute value for domain symmetry
  const maxAbsoluteValue = Math.max(
    ...trajectoryData.map(d => Math.abs(d.ratingChange)),
    0.1 // Minimum value to prevent empty chart
  );

  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-2">Trajectory</h2>
      <p className="text-sm text-gray-500 mb-4">
        <span className="inline-flex items-center"><span className="text-green-500 mr-1">↑</span> Positive change</span>
        <span className="mx-2">|</span>
        <span className="inline-flex items-center"><span className="text-red-500 mr-1">↓</span> Negative change</span>
      </p>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={trajectoryData}
            margin={{ top: 30, right: 5, left: 5, bottom: 0 }}
            layout="horizontal"
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
            <XAxis 
              type="category" 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              height={100}
              angle={-45}
              textAnchor="end"
              interval={0}
              dy={35}
            />
            <YAxis 
              type="number" 
              domain={[-maxAbsoluteValue, maxAbsoluteValue]}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#718096" strokeWidth={1} />
            <Bar 
              dataKey="ratingChange" 
              radius={[4, 4, 4, 4]}
            >
              {trajectoryData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry)} 
                />
              ))}
              <LabelList 
                dataKey="ratingChange" 
                content={({ x, y, width, height, value, index }) => {
                  if (typeof index !== 'number' || index < 0 || index >= trajectoryData.length) return null;
                  const entry = trajectoryData[index];
                  if (!entry) return null;
                  
                  const direction = entry.direction === 'positive' ? '↑' : '↓';
                  const directionColor = entry.direction === 'positive' ? '#16a34a' : '#dc2626';
                  const formattedValue = `${((value as number) * 100).toFixed(1)}%`;
                  
                  // Position labels outside the bar for both positive and negative values
                  const labelPosition = entry.direction === 'positive' 
                    ? (y as number) - 10 // Above bar for positive
                    : (y as number) + 20; // Above bar for negative too
                  
                  return (
                    <g>
                      <text 
                        x={(x as number) + (width as number) / 2} 
                        y={labelPosition}
                        textAnchor="middle" 
                        dominantBaseline="middle"
                        fontSize="12"
                      >
                        <tspan fill={directionColor} fontWeight="bold">{direction} </tspan>
                        <tspan fill="#000">{formattedValue}</tspan>
                      </text>
                    </g>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center space-y-2">
        <div className="flex items-center">
          <div className="flex h-4">
            {GREEN_COLORS.map((color, i) => (
              <div 
                key={i} 
                style={{ backgroundColor: color }} 
                className="w-6" 
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">↑ Positive change (lower → higher impact)</span>
        </div>
        
        <div className="flex items-center">
          <div className="flex h-4">
            {RED_COLORS.map((color, i) => (
              <div 
                key={i} 
                style={{ backgroundColor: color }} 
                className="w-6" 
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">↓ Negative change (lower → higher impact)</span>
        </div>
      </div>
    </div>
  );
}
