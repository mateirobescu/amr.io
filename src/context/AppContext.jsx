import { createContext, useContext, useState, useEffect } from "react";

function getTheme() {
  const storedTheme = localStorage.getItem("theme-data");
  if (storedTheme) {
    return storedTheme;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function getCounterState() {
  const state = localStorage.getItem("counterState");
  if (state) return Number(state);

  return 3;
}

function getCurrentCounter() {
  const counter = localStorage.getItem("currentCounter");

  if (counter) {
    const parsed = JSON.parse(counter);
    const [year, month, day] = parsed.dateObj.split("-");

    parsed.dateObj = new Date(year, month - 1, day);
    console.log(parsed.dateObj);
    return parsed;
  }

  return null;
}

const AppContext = createContext();

export function AppProvider({ children }) {
  const [menuState, setMenuState] = useState(false);
  const [theme, setTheme] = useState(() => getTheme());
  const [currentCounter, setCurrentCounter] = useState(() =>
    getCurrentCounter()
  );

  const [timeLeft, setTimeLeft] = useState(
    currentCounter
      ? currentCounter.dateObj.getTime() - new Date().getTime()
      : null
  );

  const [counterState, setCounterState] = useState(() => getCounterState());

  useEffect(() => {
    if (menuState) {
      document.body.classList.add("no-scroll");
      document.documentElement.classList.add("no-scroll");
      window.scroll({ top: 0 });
    } else {
      document.body.classList.remove("no-scroll");
      document.documentElement.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
      document.documentElement.classList.remove("no-scroll");
    };
  }, [menuState]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme-data", theme);
  }, [theme]);

  function getDates() {
    const localDates = JSON.parse(localStorage.getItem("dates"));
    if (localDates) return localDates;

    return new Array();
  }

  const [dates, setDates] = useState(getDates());

  useEffect(() => {
    localStorage.setItem("dates", JSON.stringify(dates));
  }, [dates]);

  return (
    <AppContext.Provider
      value={{
        menuState,
        setMenuState,
        theme,
        setTheme,
        timeLeft,
        setTimeLeft,
        currentCounter,
        setCurrentCounter,
        counterState,
        setCounterState,
        dates,
        setDates,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
