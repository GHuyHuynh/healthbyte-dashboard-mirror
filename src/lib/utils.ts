import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PersonaData } from "./data"; 

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMessageTime(date: Date = new Date()): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Converts JSON data to TypeScript constants
 * @param jsonData JSON data containing persona data
 * @returns Array of PersonaData objects with proper typing
 */
export function convertJsonToPersonaData(jsonData: any[]): PersonaData[] {
  try {
    return jsonData.map((item: any) => ({
      id: item.id,
      session_id: item.session_id,
      persona_id: Number(item.persona_id),
      persona_name: item.persona_name,
      iteration: Number(item.iteration),
      current_rating: Number(item.current_rating),
      normalized_current_rating: Number(item.normalized_current_rating),
      recommened_rating: item.recommened_rating ? Number(item.recommened_rating) : null,
      normalized_recommened_rating: item.normalized_recommened_rating ? Number(item.normalized_recommened_rating) : null,
      reaction: item.reaction,
      reason: item.reason,
      editor_changes: item.editor_changes,
      article: item.article,
      is_fact: Boolean(item.is_fact),
      is_real: Boolean(item.is_real)
    }));
  } catch (error) {
    console.error("Error processing JSON data:", error);
    return [];
  }
}
