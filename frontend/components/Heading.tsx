/**
 * PL: Uniwersalny komponent nagłówka wspierający różne poziomy (h1-h6).
 * Pozwala na dynamiczną zmianę tagu HTML przy zachowaniu spójności stylów i kolorystyki.
 * * EN: Universal heading component supporting various levels (h1-h6).
 * Allows dynamic HTML tag switching while maintaining consistent styles and color palette.
 */

// Definiujemy typy dla TypeScripta, aby uciszyć błędy podkreślenia
type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  color?: string;
  children: React.ReactNode;
}

export function Heading({
  as: Tag = 'h2',
  color = '',
  children,
  ...props
}: HeadingProps) {
  /**
   * PL: Definicje stylów Tailwind dla poszczególnych poziomów nagłówków.
   * EN: Tailwind style definitions for individual heading levels.
   */
  const headingStyles: Record<HeadingLevel, string> = {
    h1: 'text-5xl font-extrabold tracking-tight',
    h2: 'text-4xl font-bold tracking-tight',
    h3: 'text-2xl font-semibold tracking-tight',
    h4: 'text-xl font-semibold',
    h5: 'text-lg font-medium',
    h6: 'text-base font-medium',
  };

  /**
   * PL: Dobór odpowiedniej klasy stylu na podstawie przekazanego tagu (domyślnie h2).
   * EN: Selecting the appropriate style class based on the passed tag (defaults to h2).
   */
  const styles = headingStyles[Tag] || headingStyles.h2;
  const finalColor = color || 'text-dark-text';
  const className = `${styles} ${finalColor} ${props.className || ''}`.trim();

  return (
    <Tag className={className} {...props}>
      {children}
    </Tag>
  );
}
