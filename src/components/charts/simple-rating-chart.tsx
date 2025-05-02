'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts';
import { PersonaData, getAvailablePersonas } from '@/lib/data';
import { NORMALIZED_THRESHOLD } from '@/lib/constants';

interface SimpleRatingChartProps {
  data: PersonaData[];
  className?: string;
}

interface ChartDataItem {
  iteration: number;
  [key: string]: number | string; // Dynamic keys for each persona
}

const PERSONA_COLORS = [
  '#f97316', // Orange-500
  '#3b82f6', // Blue-500
  '#a855f7', // Purple-500
  '#22c55e', // Green-500
  '#ef4444', // Red-500
  '#f59e0b', // Amber-500
  '#06b6d4', // Cyan-500
  '#ec4899', // Pink-500
  '#8b5cf6', // Violet-500
  '#14b8a6', // Teal-500
];

const prepareChartData = (data: PersonaData[]): ChartDataItem[] => {
  // Get all unique iterations up to max 7
  const maxIteration = 7;
  const iterations = Array.from({ length: maxIteration }, (_, i) => i + 1);
  
  // Get all unique personas
  const personas = Array.from(new Set(data.map(item => item.persona_name)));
  
  // Create a map to store the last known rating for each persona
  const lastKnownRatings: Map<string, number> = new Map();
  
  // Create a map of iteration -> persona -> rating
  const ratingMap: Map<number, Map<string, number>> = new Map();
  
  // Initialize the map with all iterations
  iterations.forEach(iteration => {
    ratingMap.set(iteration, new Map());
  });
  
  // Fill in the ratings
  data.forEach(item => {
    const personaMap = ratingMap.get(item.iteration);
    if (personaMap) {
      personaMap.set(item.persona_name, item.normalized_current_rating);
      // Update last known rating for this persona
      lastKnownRatings.set(item.persona_name, item.normalized_current_rating);
    }
  });
  
  // Convert to array of chart data items
  return iterations.map(iteration => {
    const chartItem: ChartDataItem = { iteration };
    const personaMap = ratingMap.get(iteration);
    
    if (personaMap) {
      personas.forEach(persona => {
        const rating = personaMap.get(persona);
        if (rating !== undefined) {
          chartItem[persona] = rating;
          // Update last known rating
          lastKnownRatings.set(persona, rating);
        } else {
          // Use last known rating if available
          const lastKnown = lastKnownRatings.get(persona);
          if (lastKnown !== undefined) {
            chartItem[persona] = lastKnown;
          }
        }
      });
    }
    
    return chartItem;
  });
};

export function SimpleRatingChart({ data, className }: SimpleRatingChartProps) {
  const chartData = prepareChartData(data);
  const personas = getAvailablePersonas();
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
          <p className="font-bold text-sm">Iteration {label}</p>
          <div className="mt-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {entry.value.toFixed(3)}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-4">COVID-19 Vaccination Rating Progression</h2>
      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="iteration" 
              // label={{ 
              //   value: 'Iteration', 
              //   position: 'insideBottomRight', 
              //   offset: -10 
              // }}
              tick={{ fontSize: 12 }}
              axisLine={false}
            />
            <YAxis 
              domain={[0, 1]} 
              tickFormatter={(value) => `${value.toFixed(2)}`}
              // label={{ 
              //   value: 'Normalized Rating', 
              //   angle: -90, 
              //   position: 'insideLeft',
              //   style: { textAnchor: 'middle' }
              // }}
              tick={{ fontSize: 12 }}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
            />
            <ReferenceLine 
              y={NORMALIZED_THRESHOLD} 
              label={{ 
                value: 'Threshold', 
                position: 'left',
                fill: '#ef4444',
                fontSize: 12
              }} 
              stroke="#ef4444" 
              strokeDasharray="3 3" 
              strokeWidth={1}
            />
            
            {personas.map((persona, index) => (
              <Line 
                key={persona}
                type="monotone" 
                dataKey={persona} 
                name={persona} 
                stroke={PERSONA_COLORS[index % PERSONA_COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                connectNulls={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          <span className="text-red-500">Red line</span> at 0.8 represents the threshold where personas would decide to take the vaccine.
        </p>
      </div>
    </div>
  );
}
