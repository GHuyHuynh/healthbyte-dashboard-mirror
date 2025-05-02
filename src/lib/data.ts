import { convertJsonToPersonaData } from '@/lib/utils';
import mixedNewsData from '../../data/mixed-news.json';
import fakeNewsData from '../../data/fake_news.json';
import realNewsData from '../../data/real_news.json';

export interface PersonaData {
  id: string;
  session_id: string;
  persona_id: number;
  persona_name: string;
  iteration: number;
  current_rating: number;
  normalized_current_rating: number;
  recommened_rating: number | null;
  normalized_recommened_rating: number | null;
  reaction: string;
  reason: string | null;
  editor_changes: string | null;
  article: string | null;
  is_fact: boolean;
  is_real: boolean;
}

const mixedNewsPersonaData: PersonaData[] = convertJsonToPersonaData(mixedNewsData);
const fakeNewsPersonaData: PersonaData[] = convertJsonToPersonaData(fakeNewsData);
const realNewsPersonaData: PersonaData[] = convertJsonToPersonaData(realNewsData);

export const getPersonaData = (personaName: string): PersonaData[] => {
  return mixedNewsPersonaData.filter((item: PersonaData) => item.persona_name === personaName);
};

export const getAvailablePersonas = (): string[] => {
  const personas = new Set<string>();
  mixedNewsPersonaData.forEach((item: PersonaData) => {
    personas.add(item.persona_name);
  });
  fakeNewsPersonaData.forEach((item: PersonaData) => {
    personas.add(item.persona_name);
  });
  realNewsPersonaData.forEach((item: PersonaData) => {
    personas.add(item.persona_name);
  });
  return Array.from(personas);
};

export { mixedNewsPersonaData, fakeNewsPersonaData, realNewsPersonaData };