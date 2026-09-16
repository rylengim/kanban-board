type IconName = 'plus' | 'search' | 'refresh' | 'edit' | 'close' | 'board' | 'chevron' | 'alert' | 'plant';

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, string> = {
    plus: 'M12 5v14M5 12h14',
    search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    refresh: 'M20 7v5h-5M4 17v-5h5M6.3 6.3a8 8 0 0 1 13.2 3M4.5 14.7a8 8 0 0 0 13.2 3',
    edit: 'M14.5 5.5l4 4M4 20l4.5-1L20 7.5 16.5 4 5 15.5 4 20Z',
    close: 'M6 6l12 12M18 6 6 18',
    board: 'M4 5h16v14H4V5ZM9 5v14M15 5v14M6.5 9v4M12 9v2M17.5 9v6',
    chevron: 'm9 6 6 6-6 6',
    alert: 'M12 8v5M12 17h.01M3 21 12 3l9 18H3Z',
    plant: 'M12 22V11M12 16C4 16 3 10 3 7c7 0 9 4 9 9ZM12 11C12 4 17 2 21 2c0 6-3 9-9 9ZM7 22h10',
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
