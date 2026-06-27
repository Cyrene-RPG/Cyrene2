import type { ReactNode } from "react";
import { BrowserRouter, HashRouter } from "react-router-dom";

type Props = {
  children: ReactNode;
};

/** Electron loads the UI from file://; BrowserRouter cannot match routes there. */
export default function AppRouter({ children }: Props) {
  const Router = window.cyreneDesktop?.isDesktop ? HashRouter : BrowserRouter;
  return <Router>{children}</Router>;
}
