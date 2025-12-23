// components/heading.jsx
import { colorPalette } from './colors';

export function Heading({ as: Tag = 'h2', color = colorPalette.tw.textDark, children, ...props }) {
  const headingStyles = {
    h1: "text-5xl font-extrabold tracking-tight",
    h2: "text-4xl font-bold tracking-tight", 
    h3: "text-2xl font-semibold tracking-tight",
    h4: "text-xl font-semibold",
    h5: "text-lg font-medium",
    h6: "text-base font-medium",
  };

  const styles = headingStyles[Tag] || headingStyles.h2;
  const className = `${styles} ${color}`;

  return <Tag className={className} {...props}>{children}</Tag>;
}
