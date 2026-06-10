import { STORAGE_KEYS } from "./constants";
import { createId } from "./ids";
import type { AthleteProfile, RegisteredAthlete } from "./types";

function hasStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function normalizePhone(phone: string): string {
  return phone.replace(/[-\s]/g, "");
}

const DEMO_SEED: Omit<RegisteredAthlete, "id" | "createdAt">[] = [
  { name: "이민성", birthDate: "1995-01-24", phone: "010-1234-5678", sport: "육상", teamName: "가천대학교" },
  { name: "김철수", birthDate: "1998-03-15", phone: "010-9876-5432", sport: "수영", teamName: "대한수영연맹" },
  { name: "박지은", birthDate: "2001-07-22", phone: "010-5555-1234", sport: "배드민턴", teamName: "삼성블루팀" },
  { name: "최영호", birthDate: "1993-11-08", phone: "010-7777-3333", sport: "축구", teamName: "FC서울" },
  { name: "정수연", birthDate: "2000-05-19", phone: "010-2222-6666", sport: "육상", teamName: "국민체육진흥공단" },
];

export const athleteDb = {
  getAll(): RegisteredAthlete[] {
    if (!hasStorage()) return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.athleteDb);
      return raw ? (JSON.parse(raw) as RegisteredAthlete[]) : [];
    } catch {
      return [];
    }
  },

  save(athlete: RegisteredAthlete): void {
    if (!hasStorage()) return;
    const all = this.getAll();
    const idx = all.findIndex((a) => a.id === athlete.id);
    const next = idx >= 0 ? all.map((a, i) => (i === idx ? athlete : a)) : [...all, athlete];
    window.localStorage.setItem(STORAGE_KEYS.athleteDb, JSON.stringify(next));
  },

  remove(id: string): void {
    if (!hasStorage()) return;
    const next = this.getAll().filter((a) => a.id !== id);
    window.localStorage.setItem(STORAGE_KEYS.athleteDb, JSON.stringify(next));
  },

  findByCredentials(name: string, birthDate: string, phone: string): RegisteredAthlete | null {
    const normPhone = normalizePhone(phone);
    return (
      this.getAll().find(
        (a) =>
          a.name.trim() === name.trim() &&
          a.birthDate === birthDate &&
          normalizePhone(a.phone) === normPhone
      ) ?? null
    );
  },

  isSeeded(): boolean {
    return this.getAll().length > 0;
  },

  seedDemo(): void {
    if (!hasStorage()) return;
    const now = new Date().toISOString();
    for (const seed of DEMO_SEED) {
      this.save({ ...seed, id: createId("athlete"), createdAt: now });
    }
  },
};

export const sessionAuth = {
  getAthleteId(): string | null {
    if (!hasStorage()) return null;
    return window.localStorage.getItem(STORAGE_KEYS.sessionAthleteId);
  },

  setAthleteId(id: string): void {
    if (!hasStorage()) return;
    window.localStorage.setItem(STORAGE_KEYS.sessionAthleteId, id);
  },

  clearSession(): void {
    if (!hasStorage()) return;
    window.localStorage.removeItem(STORAGE_KEYS.sessionAthleteId);
  },

  isLoggedIn(): boolean {
    return this.getAthleteId() !== null;
  },
};

export function toAthleteProfile(athlete: RegisteredAthlete): AthleteProfile {
  return {
    id: athlete.id,
    name: athlete.name,
    birthDate: athlete.birthDate,
    sport: athlete.sport,
    teamName: athlete.teamName,
    createdAt: athlete.createdAt,
  };
}
