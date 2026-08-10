import { describe, it, expect } from 'vitest';

// ── Helper functions under test (mirroring neo/index.html core logic) ──

export function todayStr(dateObj?: Date): string {
  const d = dateObj || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function daysUntil(dateStr: string | null, referenceDate?: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  const t = referenceDate ? new Date(referenceDate + 'T00:00:00') : new Date();
  if (!referenceDate) t.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

export function isOverdue(task: { sr_stage: number; sr_next_date: string | null }, referenceDate?: string): boolean {
  if (task.sr_stage < 1 || task.sr_stage >= 4 || !task.sr_next_date) return false;
  const days = daysUntil(task.sr_next_date, referenceDate);
  return days !== null && days <= 0;
}

export const SR_INTERVALS: Record<number, number> = { 1: 1, 2: 3, 3: 7 };

export const WEEKLY_PLAN: Record<number, { label: string; title: string; categories: string[]; count: number; goal: string; includeHards?: boolean }> = {
  1: { label: "Monday", title: "Tier 1 Core — Arrays, Strings, Sliding Window, Two Pointers, Linked Lists", categories: ["Arrays & Hashing", "String Manipulation", "Sliding Window", "Two Pointers", "Linked Lists"], count: 5, goal: "Pattern drilling, speed building" },
  2: { label: "Tuesday", title: "Tier 1 Core — Arrays, Strings, Sliding Window, Two Pointers, Linked Lists", categories: ["Arrays & Hashing", "String Manipulation", "Sliding Window", "Two Pointers", "Linked Lists"], count: 5, goal: "Pattern drilling, speed building" },
  3: { label: "Wednesday", title: "Tier 1 Core — Arrays, Strings, Sliding Window, Two Pointers, Linked Lists", categories: ["Arrays & Hashing", "String Manipulation", "Sliding Window", "Two Pointers", "Linked Lists"], count: 5, goal: "Pattern drilling, speed building" },
  4: { label: "Thursday", title: "Tier 1 Depth — Stacks, Binary Search, Trees, BSTs", categories: ["Stacks & Queues", "Binary Search", "Trees", "Binary Search Trees"], count: 5, goal: "Slightly harder variants, optimization practice" },
  5: { label: "Friday", title: "Tier 1 Depth — Stacks, Binary Search, Trees, BSTs", categories: ["Stacks & Queues", "Binary Search", "Trees", "Binary Search Trees"], count: 4, goal: "Slightly harder variants, optimization practice" },
  6: { label: "Saturday", title: "Graphs + DFS/BFS", categories: ["Graphs"], count: 5, goal: "Learn connectivity patterns" },
  0: { label: "Sunday", title: "DP or Mixed Review + Famous Hards", categories: ["Dynamic Programming", "Heaps / Priority Queues", "Backtracking", "Trie", "Greedy", "Intervals", "Matrix Problems"], count: 4, goal: "Consolidate learnings, tackle something harder", includeHards: true },
};

export const FAMOUS_HARDS = [
  "Median of two sorted arrays (famous hard)",
  "Binary tree maximum path sum",
  "Wildcard matching (famous hard)",
  "Regular expression matching (famous hard)",
  "Burst balloons (famous hard)",
  "Reconstruct itinerary (Eulerian path)",
  "Alien dictionary",
  "Minimum height trees",
  "Serialize and deserialize tree",
];

export interface Task {
  id: string;
  title: string;
  tier: number;
  category: string;
  completed: boolean;
  sr_stage: number;
  sr_next_date: string | null;
  sr_first_done: string | null;
}

export function getTodaySuggestions(allTasks: Task[], dayOfWeek: number, currentTodayStr: string) {
  const plan = WEEKLY_PLAN[dayOfWeek];
  if (!plan) return { plan: null, problems: [], hards: [] };

  // Eligible tasks: either uncompleted OR completed TODAY as part of today's study plan
  const categoryPool = allTasks.filter(t => 
    plan.categories.includes(t.category) &&
    ((!t.completed && t.sr_stage === 0) || (t.completed && t.sr_first_done === currentTodayStr))
  );

  const problems = categoryPool.slice(0, plan.count);
  const problemIds = new Set(problems.map(p => p.id));
  const problemTitles = new Set(problems.map(p => p.title));

  let hards: Task[] = [];
  if (plan.includeHards) {
    hards = allTasks.filter(t => 
      FAMOUS_HARDS.includes(t.title) &&
      !problemIds.has(t.id) &&
      !problemTitles.has(t.title) &&
      ((!t.completed && t.sr_stage === 0) || (t.completed && t.sr_first_done === currentTodayStr))
    ).slice(0, 2);
  }

  return { plan, problems, hards };
}

export function getNextSRState(currentStage: number, today: string) {
  const nextStage = currentStage + 1;
  if (nextStage >= 4) {
    return { sr_stage: 4, sr_next_date: null };
  }
  const daysToAdd = SR_INTERVALS[nextStage] || 1;
  return { sr_stage: nextStage, sr_next_date: addDays(today, daysToAdd) };
}


// ── Unit Tests ──

describe('NEO DSA OA Tracker Logic', () => {
  describe('Date Helpers', () => {
    it('should format date string correctly', () => {
      const d = new Date(2026, 7, 10); // Aug 10, 2026
      expect(todayStr(d)).toBe('2026-08-10');
    });

    it('should add days correctly', () => {
      expect(addDays('2026-08-10', 1)).toBe('2026-08-11');
      expect(addDays('2026-08-10', 3)).toBe('2026-08-13');
      expect(addDays('2026-08-10', 7)).toBe('2026-08-17');
      expect(addDays('2026-08-31', 1)).toBe('2026-09-01');
    });

    it('should calculate daysUntil accurately', () => {
      expect(daysUntil('2026-08-12', '2026-08-10')).toBe(2);
      expect(daysUntil('2026-08-10', '2026-08-10')).toBe(0);
      expect(daysUntil('2026-08-08', '2026-08-10')).toBe(-2);
      expect(daysUntil(null, '2026-08-10')).toBeNull();
    });
  });

  describe('Overdue Detection', () => {
    it('should identify overdue items accurately', () => {
      expect(isOverdue({ sr_stage: 1, sr_next_date: '2026-08-09' }, '2026-08-10')).toBe(true);
      expect(isOverdue({ sr_stage: 1, sr_next_date: '2026-08-10' }, '2026-08-10')).toBe(true); // Due today
      expect(isOverdue({ sr_stage: 1, sr_next_date: '2026-08-11' }, '2026-08-10')).toBe(false); // Due tomorrow
      expect(isOverdue({ sr_stage: 0, sr_next_date: '2026-08-09' }, '2026-08-10')).toBe(false); // Stage 0
      expect(isOverdue({ sr_stage: 4, sr_next_date: '2026-08-09' }, '2026-08-10')).toBe(false); // Mastered
    });
  });

  describe('Spaced Repetition Progression', () => {
    it('should schedule stage 1 to stage 2 with 3-day interval', () => {
      const state = getNextSRState(1, '2026-08-10');
      expect(state.sr_stage).toBe(2);
      expect(state.sr_next_date).toBe('2026-08-13'); // +3 days
    });

    it('should schedule stage 2 to stage 3 with 7-day interval', () => {
      const state = getNextSRState(2, '2026-08-10');
      expect(state.sr_stage).toBe(3);
      expect(state.sr_next_date).toBe('2026-08-17'); // +7 days
    });

    it('should complete stage 3 to stage 4 with null next date', () => {
      const state = getNextSRState(3, '2026-08-10');
      expect(state.sr_stage).toBe(4);
      expect(state.sr_next_date).toBeNull();
    });
  });

  describe('Today Suggestions & Duplicate Handling', () => {
    const mockTasks: Task[] = [
      { id: '1', title: 'Two sum', tier: 1, category: 'Arrays & Hashing', completed: false, sr_stage: 0, sr_next_date: null, sr_first_done: null },
      { id: '2', title: 'Valid anagram', tier: 1, category: 'Arrays & Hashing', completed: false, sr_stage: 0, sr_next_date: null, sr_first_done: null },
      { id: '3', title: 'Product of array except self', tier: 1, category: 'Arrays & Hashing', completed: false, sr_stage: 0, sr_next_date: null, sr_first_done: null },
      { id: '4', title: 'Contains duplicate I', tier: 1, category: 'Arrays & Hashing', completed: false, sr_stage: 0, sr_next_date: null, sr_first_done: null },
      { id: '5', title: 'Group anagrams', tier: 1, category: 'Arrays & Hashing', completed: false, sr_stage: 0, sr_next_date: null, sr_first_done: null },
      { id: '6', title: 'Longest consecutive sequence', tier: 1, category: 'Arrays & Hashing', completed: false, sr_stage: 0, sr_next_date: null, sr_first_done: null },
      // Famous hards
      { id: '7', title: 'Wildcard matching (famous hard)', tier: 1, category: 'Dynamic Programming', completed: false, sr_stage: 0, sr_next_date: null, sr_first_done: null },
      { id: '8', title: 'Burst balloons (famous hard)', tier: 1, category: 'Dynamic Programming', completed: false, sr_stage: 0, sr_next_date: null, sr_first_done: null },
      { id: '9', title: 'Climbing stairs', tier: 1, category: 'Dynamic Programming', completed: false, sr_stage: 0, sr_next_date: null, sr_first_done: null },
    ];

    it('should return 5 problems for Monday (Day 1)', () => {
      const { plan, problems } = getTodaySuggestions(mockTasks, 1, '2026-08-10');
      expect(plan?.label).toBe('Monday');
      expect(problems.length).toBe(5);
      expect(problems[0].title).toBe('Two sum');
    });

    it('should retain items completed TODAY in Today view instead of replacing them', () => {
      const tasksWithCompleted = mockTasks.map(t => 
        t.id === '1' ? { ...t, completed: true, sr_stage: 1, sr_first_done: '2026-08-10' } : t
      );
      const { problems } = getTodaySuggestions(tasksWithCompleted, 1, '2026-08-10');
      expect(problems.length).toBe(5);
      expect(problems[0].id).toBe('1');
      expect(problems[0].completed).toBe(true);
    });

    it('should prevent duplicate famous hard problems on Sunday (Day 0)', () => {
      const { problems, hards } = getTodaySuggestions(mockTasks, 0, '2026-08-10'); // Sunday
      const problemIds = new Set(problems.map(p => p.id));
      hards.forEach(h => {
        expect(problemIds.has(h.id)).toBe(false);
      });
    });
  });
});
