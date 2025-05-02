'use client';

import { useMemo } from 'react';
import { PersonaData, getAvailablePersonas } from '@/lib/data';

export interface HeatMapProps {
  className?: string;
  data: PersonaData[];
}

interface RatingChangeDataItem {
  persona: string;
  iteration: number;
  rating: number;
  formattedRating: string;
  change: number | null;
  changeText: string;
}

// Color scale from red (0) to yellow (0.5) to green (1)
const getColorByRating = (rating: number): string => {
  if (rating < 0.3) return '#ef4444'; // Red
  if (rating < 0.5) return '#f97316'; // Orange
  if (rating < 0.7) return '#facc15'; // Yellow
  if (rating < 0.9) return '#84cc16'; // Light green
  return '#22c55e'; // Green
};

const formatRating = (rating: number): string => {
  return `${(rating * 100).toFixed(1)}%`;
};

export function RatingTable({ className, data }: HeatMapProps) {
  const ratingChangesData = useMemo(() => {
    // Get all available personas
    const personas = getAvailablePersonas();
    
    // Group by persona for change calculations
    const personaData: Record<string, PersonaData[]> = {};
    personas.forEach(persona => {
      const personaItems = data.filter((item: PersonaData) => item.persona_name === persona);
      if (personaItems.length > 0) {
        personaData[persona] = personaItems.sort((a: PersonaData, b: PersonaData) => a.iteration - b.iteration);
      }
    });
    
    // Calculate changes and prepare data
    const result: RatingChangeDataItem[] = [];
    
    Object.entries(personaData).forEach(([persona, items]) => {
      items.forEach((item, index) => {
        const previousRating = index > 0 ? items[index - 1].normalized_current_rating : null;
        const change = previousRating !== null ? item.normalized_current_rating - previousRating : null;
        
        const changeText = change !== null 
          ? change > 0 
            ? `+${formatRating(change)}` 
            : change < 0 
              ? `-${formatRating(Math.abs(change))}` 
              : 'No change'
          : 'Initial rating';
        
        result.push({
          persona,
          iteration: item.iteration,
          rating: item.normalized_current_rating,
          formattedRating: formatRating(item.normalized_current_rating),
          change,
          changeText
        });
      });
    });
    
    return result;
  }, [data]);

  // For the data table, group by persona for better organization
  const tableData = useMemo(() => {
    return ratingChangesData.sort((a, b) => {
      // First sort by persona
      if (a.persona !== b.persona) {
        return a.persona.localeCompare(b.persona);
      }
      // Then by iteration
      return a.iteration - b.iteration;
    });
  }, [ratingChangesData]);

  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-4">Rating Changes Across Iterations</h2>
      
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Persona</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Iteration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((item, index) => (
              <tr 
                key={index} 
                className={index > 0 && item.persona !== tableData[index-1].persona ? "border-t-4 border-gray-300" : ""}
              >
                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.persona}</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{item.iteration}</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 flex items-center">
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: getColorByRating(item.rating) }}
                  ></span>
                  {item.formattedRating}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm">
                  <span 
                    className={`inline-flex px-2 py-1 text-xs rounded ${
                      item.change === null ? 'bg-gray-100 text-gray-800' :
                      item.change > 0 ? 'bg-green-100 text-green-800' :
                      item.change < 0 ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.changeText}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
