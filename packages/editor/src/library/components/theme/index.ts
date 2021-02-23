export const THEME_DEFAULT = {
  'text-primary': rgba(51, 51, 51, 1),
  'text-secondary': rgba(51, 51, 51, 1),
  'text-primary-inverse': rgba(255, 255, 255, 1),
  background: rgba(247, 247, 247, 1),
  primary: rgba(41, 109, 255, 1),
  secondary: rgba(91, 110, 149, 1),
  shadow: rgba(0, 0, 0, 0.08),
  'shadow-solid': rgba(58, 69, 92, 0.16),
  border: rgba(16, 42, 100, 0.08),
} as const;

function rgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
