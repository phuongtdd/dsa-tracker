const files = import.meta.glob("./guides/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const GUIDES: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, text]) => [path.replace("./guides/", "").replace(".md", ""), text]),
);
