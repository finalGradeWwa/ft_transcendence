'use client';

/**
 * PL: Uniwersalny komponent ikon SVG.
 * EN: Universal SVG icon component.
 */

type IconName =
  | 'plus'
  | 'search'
  | 'user'
  | 'leaf'
  | 'people'
  | 'close'
  | 'menu'
  | 'mail';

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

/**
 * PL: Renderuje ścieżki ikon na podstawie przekazanej nazwy.
 * EN: Renders icon paths based on the provided name.
 */
export const Icon = ({ name, className, size = 24 }: IconProps) => {
  const icons: Record<IconName, React.ReactNode> = {
    plus: <path d="M12 4.5v15m7.5-7.5h-15" />,
    search: (
      <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    ),
    user: (
      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    ),
    leaf: (
      <path d="M12 2.25c4.142 0 7.5 3.358 7.5 7.5a7.5 7.5 0 0 1-7.5 7.5c-4.142 0-7.5-3.358-7.5-7.5 0-2.316 1.053-4.386 2.704-5.764m4.796 5.764a2.25 2.25 0 1 0-4.5 0 2.25 2.25 0 0 0 4.5 0Z" />
    ),
    people: (
      <path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    ),
    close: <path d="M6 18L18 6M6 6l12 12" />,
    menu: <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />,
    mail: (
      <>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.5}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]}
    </svg>
  );
};
