import { useEffect, useRef, useState } from 'react';

export const useRefWidth = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>();

  useEffect(() => {
    const handleResize = () => setWidth(ref.current?.clientWidth);
    window.addEventListener('resize', handleResize);
    window.addEventListener('sidebar_toggle', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('sidebar_toggle', handleResize);
    };
  }, []);

  const clientWidth = ref.current?.clientWidth;

  useEffect(() => {
    width !== clientWidth && setWidth(clientWidth);
  }, [clientWidth, width]);

  return [ref, width] as [React.Ref<HTMLDivElement>, number];
};
