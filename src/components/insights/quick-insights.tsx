'use client';

import React from 'react';
import { PersonaData } from '@/lib/data';
import { TrendingUp, TrendingDown, BarChart4 } from 'lucide-react';
import { NORMALIZED_THRESHOLD } from '@/lib/constants';

interface QuickInsightsProps {
  className?: string;
  data: PersonaData[];
}

// Insight calculations
const calculateMostPersuadablePersona = (data: PersonaData[]): { name: string, improvement: number } => {
  const personaImprovements: Record<string, number> = {};
  
  // Get all unique persona names
  const personaNames = [...new Set(data.map(item => item.persona_name))];
  
  // Calculate improvements for each persona
  personaNames.forEach(name => {
    const personaData = data.filter(item => item.persona_name === name);
    
    // Skip if there's no data for this persona
    if (personaData.length === 0) return;
    
    // Sort by iteration to get first and last entries
    const sortedData = [...personaData].sort((a, b) => a.iteration - b.iteration);
    const firstEntry = sortedData[0];
    const lastEntry = sortedData[sortedData.length - 1];
    
    if (firstEntry && lastEntry) {
      personaImprovements[name] = 
        lastEntry.normalized_current_rating - firstEntry.normalized_current_rating;
    }
  });
  
  // Find persona with highest improvement
  let highestImprovement = 0;
  let mostPersuadableName = '';
  
  Object.entries(personaImprovements).forEach(([name, improvement]) => {
    if (improvement > highestImprovement) {
      highestImprovement = improvement;
      mostPersuadableName = name;
    }
  });
  
  // Use a default value if no improvements were found
  if (mostPersuadableName === '') {
    return { name: 'No data', improvement: 0 };
  }
  
  return { 
    name: mostPersuadableName, 
    improvement: parseFloat((highestImprovement * 100).toFixed(1)) 
  };
};

const calculateLeastPersuadablePersona = (data: PersonaData[]): { name: string, improvement: number } => {
  const personaImprovements: Record<string, number> = {};
  
  // Get all unique persona names
  const personaNames = [...new Set(data.map(item => item.persona_name))];
  
  // Calculate improvements for each persona
  personaNames.forEach(name => {
    const personaData = data.filter(item => item.persona_name === name);
    
    // Skip if there's no data for this persona
    if (personaData.length === 0) return;
    
    // Sort by iteration to get first and last entries
    const sortedData = [...personaData].sort((a, b) => a.iteration - b.iteration);
    const firstEntry = sortedData[0];
    const lastEntry = sortedData[sortedData.length - 1];
    
    if (firstEntry && lastEntry) {
      personaImprovements[name] = 
        lastEntry.normalized_current_rating - firstEntry.normalized_current_rating;
    }
  });
  
  // Find persona with lowest improvement
  let lowestImprovement = Infinity;
  let leastPersuadableName = '';
  
  Object.entries(personaImprovements).forEach(([name, improvement]) => {
    if (improvement < lowestImprovement) {
      lowestImprovement = improvement;
      leastPersuadableName = name;
    }
  });
  
  // Use a default value if no improvements were found
  if (leastPersuadableName === '') {
    return { name: 'No data', improvement: 0 };
  }
  
  return { 
    name: leastPersuadableName, 
    improvement: parseFloat((lowestImprovement * 100).toFixed(1)) 
  };
};

const calculateConversionRate = (data: PersonaData[]): number => {
  const personaNames = [...new Set(data.map(item => item.persona_name))];
  
  // Return 0 if there are no personas
  if (personaNames.length === 0) return 0;
  
  const threshold = NORMALIZED_THRESHOLD; // 80% normalized rating threshold
  let convertedCount = 0;
  
  personaNames.forEach(name => {
    const personaData = data.filter(item => item.persona_name === name);
    
    // Skip if there's no data for this persona
    if (personaData.length === 0) return;
    
    // Sort by iteration to get the last entry
    const sortedData = [...personaData].sort((a, b) => a.iteration - b.iteration);
    const lastEntry = sortedData[sortedData.length - 1];
    
    if (lastEntry && lastEntry.normalized_current_rating >= threshold) {
      convertedCount++;
    }
  });
  
  return parseFloat(((convertedCount / personaNames.length) * 100).toFixed(0));
};

export const QuickInsights: React.FC<QuickInsightsProps> = ({ className, data }) => {
  const mostPersuadable = calculateMostPersuadablePersona(data);
  const leastPersuadable = calculateLeastPersuadablePersona(data);
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ${className}`}>
      <div className="bg-white rounded-lg p-4 border border-white/20 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Most Improved Persona</p>
            <div className="flex items-baseline">
              <h3 className="text-3xl font-bold text-emerald-400">+{mostPersuadable.improvement}%</h3>
              <span className="ml-2 text-sm text-gray-600">{mostPersuadable.name}</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Largest increase in willingness to get vaccinated
        </p>
      </div>
      
      <div className="bg-white rounded-lg p-4 border border-white/20 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Most Resistant Persona</p>
            <div className="flex items-baseline">
              <h3 className="text-3xl font-bold text-amber-400">{leastPersuadable.improvement >= 0 ? '+' : ''}{leastPersuadable.improvement}%</h3>
              <span className="ml-2 text-sm text-gray-600">{leastPersuadable.name}</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-amber-500" />
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Smallest change in vaccination acceptance
        </p>
      </div>
    </div>
  );
};
