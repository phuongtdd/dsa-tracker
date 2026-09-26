import type { Topic } from "../types";

export const TOPICS: Topic[] = [
  { id: "arrays-hashing", order: 1, name: "Arrays & Hashing", expectedCount: 9 },
  { id: "two-pointers", order: 2, name: "Two Pointers", expectedCount: 5 },
  { id: "sliding-window", order: 3, name: "Sliding Window", expectedCount: 6 },
  { id: "stack", order: 4, name: "Stack", expectedCount: 7 },
  { id: "binary-search", order: 5, name: "Binary Search", expectedCount: 7 },
  { id: "linked-list", order: 6, name: "Linked List", expectedCount: 11 },
  { id: "trees", order: 7, name: "Trees", expectedCount: 15 },
  { id: "tries", order: 8, name: "Tries", expectedCount: 3 },
  { id: "heap", order: 9, name: "Heap / Priority Queue", expectedCount: 7 },
  { id: "backtracking", order: 10, name: "Backtracking", expectedCount: 9 },
  { id: "graphs", order: 11, name: "Graphs", expectedCount: 13 },
  { id: "advanced-graphs", order: 12, name: "Advanced Graphs", expectedCount: 6 },
  { id: "dp-1d", order: 13, name: "1-D Dynamic Programming", expectedCount: 12 },
  { id: "dp-2d", order: 14, name: "2-D Dynamic Programming", expectedCount: 11 },
  { id: "greedy", order: 15, name: "Greedy", expectedCount: 8 },
  { id: "intervals", order: 16, name: "Intervals", expectedCount: 6 },
  { id: "math-geometry", order: 17, name: "Math & Geometry", expectedCount: 8 },
  { id: "bit-manipulation", order: 18, name: "Bit Manipulation", expectedCount: 7 },
];

export const topicById = (id: string) => TOPICS.find((t) => t.id === id);
