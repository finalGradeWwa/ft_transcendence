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
  | 'mail'
  | 'chat'
  | 'edit'
  | 'user-plus'
  | 'chevron-left'
  | 'chevron-right'
  | 'trash'
  | 'bell'
  | 'check';

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
      <path d="M2.25 6.75c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v10.5c0 .621-.504 1.125-1.125 1.125H3.375A1.125 1.125 0 0 1 2.25 17.25V6.75Zm1.125-.75 8.625 5.625 8.625-5.625" />
    ),
    chat: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
    edit: (
      <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
    ),
    'user-plus': (
      <path d="M19 7.5h3m-1.5-1.5v3m-9.5.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 9c0 1.353-1.1 2.25-2.25 2.25h-9c-1.15 0-2.25-.897-2.25-2.25 0-2.676 2.184-4.85 4.875-4.85h3.75c2.691 0 4.875 2.174 4.875 4.85Z" />
    ),
    'chevron-left': <path d="M15.75 19.5 8.25 12l7.5-7.5" />,
    'chevron-right': <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />,
    trash: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    ),
    bell: (
      <path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    ),
    check: <path d="M4.5 12.75l6 6 9-13.5" />,
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
