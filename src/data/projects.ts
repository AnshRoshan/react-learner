import {
  ArrowLeftRight,
  Bell,
  Blocks,
  Calculator as CalculatorIcon,
  Grid3x3,
  KeyRound,
  List,
  ListTodo,
  MessageSquare,
  Palette,
  Plus,
  Receipt,
  Rows3,
  Telescope,
  Timer,
  Trophy,
} from "lucide-react";
import type { Project } from "./types";
import { beginner } from "./lessons-beginner";
import { intermediate } from "./lessons-intermediate";
import { advanced } from "./lessons-advanced";

import CounterDemo from "../projects/Counter";
import counterSrc from "../projects/Counter.tsx?raw";
import AccordionDemo from "../projects/Accordion";
import accordionSrc from "../projects/Accordion.tsx?raw";
import TicTacToeDemo from "../projects/TicTacToe";
import ticTacToeSrc from "../projects/TicTacToe.tsx?raw";
import ColorPaletteDemo from "../projects/ColorPalette";
import colorPaletteSrc from "../projects/ColorPalette.tsx?raw";
import PasswordDemo from "../projects/PasswordGenerator";
import passwordSrc from "../projects/PasswordGenerator.tsx?raw";
import TodoDemo from "../projects/TodoList";
import todoSrc from "../projects/TodoList.tsx?raw";
import PomodoroDemo from "../projects/Pomodoro";
import pomodoroSrc from "../projects/Pomodoro.tsx?raw";
import CurrencyDemo from "../projects/CurrencyConverter";
import currencySrc from "../projects/CurrencyConverter.tsx?raw";
import CalculatorDemo from "../projects/Calculator";
import calculatorSrc from "../projects/Calculator.tsx?raw";
import QuizDemo from "../projects/Quiz";
import quizSrc from "../projects/Quiz.tsx?raw";
import InvoiceDemo from "../projects/Invoice";
import invoiceSrc from "../projects/Invoice.tsx?raw";
import ThemeStudioDemo from "../projects/ThemeStudio";
import themeStudioSrc from "../projects/ThemeStudio.tsx?raw";
import ModalToastsDemo from "../projects/ModalToasts";
import modalToastsSrc from "../projects/ModalToasts.tsx?raw";
import VirtualListDemo from "../projects/VirtualList";
import virtualListSrc from "../projects/VirtualList.tsx?raw";
import LiveChatDemo from "../projects/LiveChat";
import liveChatSrc from "../projects/LiveChat.tsx?raw";
import CosmicGalleryDemo from "../projects/CosmicGallery";
import cosmicGallerySrc from "../projects/CosmicGallery.tsx?raw";

const lessons = { ...beginner, ...intermediate, ...advanced };

type Meta = Omit<Project, "learn" | "lesson" | "steps" | "mistakes" | "challenges" | "quiz" | "theory">;

const metas: Meta[] = [
  {
    slug: "counter", title: "Counter", icon: Plus, level: "Beginner", minutes: 10,
    tagline: "The 'hello world' of state — and a microscope for how React really updates.",
    concepts: ["useState", "events", "updater fn"], gradient: ["#22d3ee", "#6366f1"],
    file: "Counter.tsx", Demo: CounterDemo, source: counterSrc,
  },
  {
    slug: "accordion", title: "Accordion", icon: Rows3, level: "Beginner", minutes: 12,
    tagline: "Lift state up and build an accessible, animated FAQ.",
    concepts: ["lifting state", "conditional UI", "a11y"], gradient: ["#a78bfa", "#ec4899"],
    file: "Accordion.tsx", Demo: AccordionDemo, source: accordionSrc,
  },
  {
    slug: "tic-tac-toe", title: "Tic-Tac-Toe", icon: Grid3x3, level: "Beginner", minutes: 20,
    tagline: "Think in React: minimal state, derived values and time travel.",
    concepts: ["immutability", "derived state", "history"], gradient: ["#34d399", "#0ea5e9"],
    file: "TicTacToe.tsx", Demo: TicTacToeDemo, source: ticTacToeSrc,
  },
  {
    slug: "color-palette", title: "Color Palette", icon: Palette, level: "Beginner", minutes: 18,
    tagline: "Generate, lock and copy palettes with a keyboard shortcut.",
    concepts: ["lists & keys", "useEffect", "useCallback"], gradient: ["#f472b6", "#f59e0b"],
    file: "ColorPalette.tsx", Demo: ColorPaletteDemo, source: colorPaletteSrc,
  },
  {
    slug: "password-generator", title: "Password Generator", icon: KeyRound, level: "Beginner", minutes: 15,
    tagline: "Controlled inputs, derived strength and secure randomness.",
    concepts: ["controlled inputs", "derived state", "lazy init"], gradient: ["#60a5fa", "#8b5cf6"],
    file: "PasswordGenerator.tsx", Demo: PasswordDemo, source: passwordSrc,
  },
  {
    slug: "todo-list", title: "Todo List", icon: ListTodo, level: "Intermediate", minutes: 25,
    tagline: "useReducer, a custom persistence hook and drag & drop.",
    concepts: ["useReducer", "custom hook", "drag & drop"], gradient: ["#fbbf24", "#f97316"],
    file: "TodoList.tsx", Demo: TodoDemo, source: todoSrc,
  },
  {
    slug: "calculator", title: "Calculator", icon: CalculatorIcon, level: "Intermediate", minutes: 22,
    tagline: "A state machine in a reducer, with full keyboard support.",
    concepts: ["useReducer", "state machine", "keyboard"], gradient: ["#818cf8", "#c084fc"],
    file: "Calculator.tsx", Demo: CalculatorDemo, source: calculatorSrc,
  },
  {
    slug: "quiz", title: "Quiz", icon: Trophy, level: "Intermediate", minutes: 15,
    tagline: "Model a whole flow with one status and a derived score.",
    concepts: ["useReducer", "status modelling", "derived score"], gradient: ["#fb923c", "#e11d48"],
    file: "Quiz.tsx", Demo: QuizDemo, source: quizSrc,
  },
  {
    slug: "invoice", title: "Invoice Generator", icon: Receipt, level: "Intermediate", minutes: 25,
    tagline: "Controlled forms, dynamic rows and totals that can't drift.",
    concepts: ["controlled forms", "dynamic lists", "derived totals"], gradient: ["#94a3b8", "#38bdf8"],
    file: "Invoice.tsx", Demo: InvoiceDemo, source: invoiceSrc,
  },
  {
    slug: "pomodoro", title: "Pomodoro Timer", icon: Timer, level: "Intermediate", minutes: 20,
    tagline: "Timers done right: cleanup, the latest-ref pattern and timestamp maths.",
    concepts: ["useEffect cleanup", "useRef", "custom hook"], gradient: ["#fb7185", "#f59e0b"],
    file: "Pomodoro.tsx", Demo: PomodoroDemo, source: pomodoroSrc,
  },
  {
    slug: "currency-converter", title: "Currency Converter", icon: ArrowLeftRight, level: "Intermediate", minutes: 25,
    tagline: "Fetch live rates safely with AbortController and an offline fallback.",
    concepts: ["fetch", "AbortController", "custom hook"], gradient: ["#2dd4bf", "#3b82f6"],
    file: "CurrencyConverter.tsx", Demo: CurrencyDemo, source: currencySrc,
  },
  {
    slug: "theme-studio", title: "Theme Studio", icon: Blocks, level: "Advanced", minutes: 22,
    tagline: "Context, providers and a custom hook — no prop drilling.",
    concepts: ["Context", "useMemo", "custom hook"], gradient: ["#c084fc", "#fb7185"],
    file: "ThemeStudio.tsx", Demo: ThemeStudioDemo, source: themeStudioSrc,
  },
  {
    slug: "modal-toasts", title: "Modal & Toasts", icon: Bell, level: "Advanced", minutes: 25,
    tagline: "Portals, focus management and a toast queue with cleanup.",
    concepts: ["Portals", "focus mgmt", "useReducer"], gradient: ["#38bdf8", "#a78bfa"],
    file: "ModalToasts.tsx", Demo: ModalToastsDemo, source: modalToastsSrc,
  },
  {
    slug: "virtual-list", title: "Virtual List", icon: List, level: "Advanced", minutes: 22,
    tagline: "Render 10,000 rows by drawing only the ones you can see.",
    concepts: ["windowing", "useRef", "performance"], gradient: ["#4ade80", "#22d3ee"],
    file: "VirtualList.tsx", Demo: VirtualListDemo, source: virtualListSrc,
  },
  {
    slug: "live-chat", title: "Live Chat", icon: MessageSquare, level: "Advanced", minutes: 30,
    tagline: "React 19 Actions, useOptimistic and instant-feeling UI.",
    concepts: ["useOptimistic", "Actions", "useFormStatus"], gradient: ["#6366f1", "#22d3ee"],
    file: "LiveChat.tsx", Demo: LiveChatDemo, source: liveChatSrc,
  },
  {
    slug: "cosmic-gallery", title: "Cosmic Gallery", icon: Telescope, level: "Advanced", minutes: 28,
    tagline: "Suspense, use() and error boundaries for calm loading states.",
    concepts: ["Suspense", "use()", "Error boundary"], gradient: ["#7c3aed", "#0ea5e9"],
    file: "CosmicGallery.tsx", Demo: CosmicGalleryDemo, source: cosmicGallerySrc,
  },
];

export const projects: Project[] = metas.map((m) => ({ ...m, ...lessons[m.slug] }));

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
