import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type Level = "Beginner" | "Intermediate" | "Advanced";

/** A piece of lesson content. Rendered by <Prose />. */
export type Block =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "code"; code: string; file?: string }
  | { t: "callout"; tone: "tip" | "warn" | "info" | "key"; title: string; text: string }
  | { t: "lab" };

export interface QuizQ {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

/** A walkthrough step that points at a `// @region name` in the project source. */
export interface Step {
  title: string;
  region: string;
  body: string;
}

export interface LessonContent {
  learn: string[];
  lesson: Block[];
  steps: Step[];
  mistakes: { title: string; text: string }[];
  challenges: string[];
  quiz: QuizQ[];
  theory: string[];
}

export interface Project extends LessonContent {
  slug: string;
  title: string;
  tagline: string;
  icon: LucideIcon;
  level: Level;
  minutes: number;
  concepts: string[];
  gradient: [string, string];
  file: string;
  Demo: ComponentType;
  source: string;
}

export interface Chapter {
  slug: string;
  n: number;
  title: string;
  tagline: string;
  icon: LucideIcon;
  minutes: number;
  gradient: [string, string];
  Lab: ComponentType;
  blocks: Block[];
  takeaways: string[];
  quiz: QuizQ[];
}
