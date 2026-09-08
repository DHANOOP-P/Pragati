import { createContext, useContext, useEffect } from "react";

const LayoutChrome = createContext({
  setHideFooter: () => {},
});

export const LayoutChromeProvider = LayoutChrome.Provider;

export function useHideFooter() {
  const { setHideFooter } = useContext(LayoutChrome);
  useEffect(() => {
    setHideFooter(true);
    return () => setHideFooter(false);
  }, [setHideFooter]);
}
