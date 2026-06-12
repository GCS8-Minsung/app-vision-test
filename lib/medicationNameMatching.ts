import type { MedicationProductLookup } from "./medicationProviders/types";

const MIN_SEARCH_SCORE = 45;
const STRONG_NAME_SCORE = 85;

export function stripMedicationQualifiers(value: string): string {
  return value.replace(/[（(][^()（）]*[）)]/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeMedicationName(value: string): string {
  return value.toLowerCase().replace(/[-\s()[\]{}·ㆍ.,:：;'"`~…_]/g, "");
}

function getNormalizedNameOnly(value: string): string {
  return normalizeMedicationName(stripMedicationQualifiers(value));
}

function getOverlapScore(query: string, candidate: string): number {
  let score = 0;
  for (const char of query) {
    if (candidate.includes(char)) score += 1;
  }
  return Math.round((score / query.length) * 50);
}

export function scoreMedicationName(query: string, candidate: string): number {
  const normalizedQuery = normalizeMedicationName(query);
  const normalizedCandidate = normalizeMedicationName(candidate);
  const nameOnlyQuery = getNormalizedNameOnly(query);
  const nameOnlyCandidate = getNormalizedNameOnly(candidate);

  if (!normalizedQuery || !normalizedCandidate || !nameOnlyQuery || !nameOnlyCandidate) return 0;
  if (normalizedQuery === normalizedCandidate || nameOnlyQuery === nameOnlyCandidate) return 100;
  if (nameOnlyCandidate.includes(nameOnlyQuery)) return 90;
  if (nameOnlyQuery.includes(nameOnlyCandidate)) return 75;

  return getOverlapScore(nameOnlyQuery, nameOnlyCandidate);
}

export function getBestMedicationNameMatch(query: string, names: string[]): { name: string; score: number } {
  return names
    .map((name) => ({ name, score: scoreMedicationName(query, name) }))
    .sort((first, second) => second.score - first.score)[0] ?? { name: "", score: 0 };
}

export function isSearchableMedicationMatch(score: number): boolean {
  return score >= MIN_SEARCH_SCORE;
}

export function isReliableProductNameMatch(query: string, result: MedicationProductLookup): boolean {
  const names = [result.matchedName, result.productName, ...result.aliases].filter(Boolean);
  const best = getBestMedicationNameMatch(query, names);
  return best.score >= STRONG_NAME_SCORE;
}

export function findReliableProductNameMatch(
  queries: string[],
  results: MedicationProductLookup[]
): MedicationProductLookup | undefined {
  return results.find((result) => queries.some((query) => isReliableProductNameMatch(query, result)));
}

export function getIngredientCompleteness(result: MedicationProductLookup): number {
  return result.ingredients.reduce((score, ingredient) => {
    if (!ingredient.name.trim()) return score;
    return score + 2 + (ingredient.dosage?.trim() ? 3 : 0);
  }, 0);
}

export function compareMedicationLookupQuality(first: MedicationProductLookup, second: MedicationProductLookup): number {
  const scoreDelta = first.score - second.score;
  if (Math.abs(scoreDelta) >= 10) return scoreDelta;

  const firstCompleteness = getIngredientCompleteness(first);
  const secondCompleteness = getIngredientCompleteness(second);
  if (firstCompleteness !== secondCompleteness) return firstCompleteness - secondCompleteness;
  if (scoreDelta !== 0) return scoreDelta;

  return second.productName.localeCompare(first.productName);
}

export function dedupeMedicationLookups(results: MedicationProductLookup[]): MedicationProductLookup[] {
  const map = new Map<string, MedicationProductLookup>();

  results.forEach((result) => {
    const key = normalizeMedicationName(result.productName);
    const previous = map.get(key);
    if (!previous || compareMedicationLookupQuality(result, previous) > 0) {
      map.set(key, result);
    }
  });

  return [...map.values()].sort((first, second) => compareMedicationLookupQuality(second, first));
}
