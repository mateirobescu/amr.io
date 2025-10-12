import {
  Fragment,
  use,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { AppProvider, useAppContext } from "./context/AppContext";
import { IoIosMenu } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { IoInvertMode } from "react-icons/io5";
import { IoTrashOutline } from "react-icons/io5";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import "./index.css";
import "./App.css";

function MenuBtn() {
  const { menuState, setMenuState } = useAppContext();

  return (
    <button
      aria-label="Menu button"
      aria-expanded={menuState}
      className={`header__btn left ${menuState ? "open" : ""}`}
      onClick={() => setMenuState(!menuState)}
    >
      {!menuState ? <IoIosMenu /> : <IoMdClose />}
    </button>
  );
}

function ThemeToggleBtn() {
  const { theme, setTheme } = useAppContext();

  const toggleTheme = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme]
  );

  return (
    <button
      aria-label="Theme switcher button"
      aria-pressed={theme === "dark"}
      className="header__btn right"
      onClick={toggleTheme}
    >
      <IoInvertMode />
    </button>
  );
}

function Header() {
  return (
    <header className="header">
      <MenuBtn />
      <h1 className="header-title">amr.io</h1>
      <ThemeToggleBtn />
    </header>
  );
}

function Main() {
  return (
    <main className="main">
      <Menu />
      <Overlay />
      <CounterBtn />
      <Counter />
    </main>
  );
}

function Overlay() {
  const { menuState, setMenuState } = useAppContext();

  const closeMenu = useCallback(() => setMenuState(false), [setMenuState]);

  return (
    <div
      role="button"
      className={`overlay ${menuState ? "open" : ""}`}
      onClick={closeMenu}
    ></div>
  );
}

function saveCounterState(newState) {
  localStorage.setItem("counterState", newState);
  return newState;
}

function CounterBtn() {
  const { counterState, setCounterState, currentCounter } = useAppContext();

  const handleClick = useCallback(() => {
    if (!currentCounter) return;
    const newState = (counterState + 1) % 5;
    setCounterState(saveCounterState(newState));
  }, [counterState, currentCounter, setCounterState]);

  return (
    <button
      aria-label="Counter mode switcher button"
      className="counter__btn"
      onClick={handleClick}
    ></button>
  );
}

function InstructionsMsg() {
  return (
    <section className="instructions" aria-labelledby="instructions-title">
      <h2>Welcome to amr.io!</h2>
      <p>
        Click on the menu button in the top left part of the screen to add,
        delete or change to current counter.
      </p>
      <p>
        Once you select the counter, click on the screen to change between modes
        (days, hours, minutes, etc...).
      </p>
    </section>
  );
}

function Counter() {
  const { currentCounter, timeLeft, setTimeLeft, counterState } =
    useAppContext();

  const stateTimes = {
    0: 1000,
    1: 1000,
    2: 1000,
    3: 250,
    4: 125,
  };

  const intervalRef = useRef();

  useEffect(() => {
    if (!currentCounter) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(currentCounter.dateObj.getTime() - new Date().getTime());
    }, stateTimes[counterState]);

    return () => clearInterval(intervalRef.current);
  }, [currentCounter, counterState]);

  if (currentCounter === null) return <InstructionsMsg />;

  const timeData = [
    ["days", Math.trunc(timeLeft / (1000 * 60 * 60 * 24))],
    ["hours", Math.trunc((timeLeft / (1000 * 60 * 60)) % 24)],
    ["minutes", Math.trunc((timeLeft / (1000 * 60)) % 60)],
    ["seconds", Math.trunc((timeLeft / 1000) % 60)],
    ["milliseconds", Math.trunc(timeLeft % 1000)],
  ];

  const cleanTime = timeData
    .filter((_, index) => index <= counterState)
    .map((data) => {
      return (
        <Fragment key={`${data[0]}`}>
          <span>{Math.abs(data[1])}</span>
          <span>{data[0]}</span>
        </Fragment>
      );
    });

  const counterMsg = (
    <>
      <span className="counter-msg">{`${
        timeLeft > 0 ? "Until" : "Since"
      }`}</span>
      <span className="counter-msg"> {currentCounter.name}</span>
    </>
  );

  return (
    <div className="counter" aria-live="polite">
      {cleanTime}
      {counterMsg}
    </div>
  );
}

function DateEl({ dateInfo }) {
  const { name, date } = dateInfo;

  const { setDates, currentCounter, setCurrentCounter, setMenuState } =
    useAppContext();

  const deleteDate = useCallback(
    (e) => {
      e.stopPropagation();

      setCurrentCounter(null);
      setDates((prev) => prev.filter((date) => date.name !== name));
    },
    [name, setCurrentCounter, setDates]
  );

  const [year, month, day] = date.split("-");

  const changeDate = useCallback(() => {
    let new_date;

    if (currentCounter?.name === name) {
      new_date = null;
      localStorage.removeItem("currentCounter");
    } else {
      new_date = { name, dateObj: new Date(year, month - 1, day) };
      localStorage.setItem(
        "currentCounter",
        JSON.stringify({ name, dateObj: date })
      );
    }

    setCurrentCounter(new_date);
    setMenuState(false);
  }, [currentCounter, name, date, setCurrentCounter, setMenuState]);

  return (
    <>
      <div
        role="button"
        className={`date__container ${
          currentCounter?.name === name ? "active" : ""
        }`}
        onClick={changeDate}
      >
        <span>{name}</span>

        <div className="date">
          <span>{day.padStart(2, "0")}</span>
          <span>/</span>
          <span>{month.padStart(2, "0")}</span>
          <span>/</span>
          <span>{year}</span>
        </div>
        <button
          aria-label="Delete date button"
          className="date-trash__btn"
          onClick={deleteDate}
        >
          <IoTrashOutline />
        </button>
      </div>
      <div className="spacer"></div>
    </>
  );
}

function DateInput({ formData, handleChange }) {
  const handleDateChange = (date) => {
    const formatted = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`
      : "";
    handleChange({ target: { name: "date", value: formatted } });
  };
  const datePicker = useRef(null);

  return (
    <div>
      <button
        aria-label="Open date picker button"
        aria-haspopup="dialog"
        type="button"
        className="date"
        onClick={() => datePicker.current?.setOpen(true)}
      >
        <span>{formData.date.split("-")[2] || "dd"}</span>
        <span>/</span>
        <span>{formData.date.split("-")[1] || "mm"}</span>
        <span>/</span>
        <span>{formData.date.split("-")[0] || "yyyy"}</span>
      </button>
      <DatePicker
        ref={datePicker}
        selected={formData.date ? new Date(`${formData.date}T00:00`) : null}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        className="hidden-input"
        calendarStartDay={1}
        showPopperArrow={false}
        minDate={new Date(2000, 0, 1)}
        maxDate={new Date(2100, 11, 31)}
      />
    </div>
  );
}

function NewDateForm() {
  const { dates, setDates } = useAppContext();

  const [formData, setFormData] = useState({
    name: "",
    date: "",
  });

  const handleForm = useCallback(
    (e) => {
      e.preventDefault();
      if (!formData.name || !formData.date) return;
      if (dates.some((d) => d.name === formData.name)) return;

      setDates((prev) => [...prev, formData]);
      setFormData({ name: "", date: "" });
    },
    [formData, dates, setDates]
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  return (
    <form className="form" onSubmit={handleForm}>
      <input
        type="text"
        placeholder="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        aria-required="true"
      />

      <DateInput formData={formData} handleChange={handleChange} />

      <button aria-label="Add date button" className="add-date__btn">
        Add Date
      </button>
    </form>
  );
}

function Menu() {
  const { menuState, dates } = useAppContext();

  const datesElements = useMemo(
    () => dates.map((date) => <DateEl key={date.name} dateInfo={date} />),
    [dates]
  );

  return (
    <div
      className={`menu ${menuState ? "open" : ""}`}
      onClick={(e) => e.stopPropagation()}
      role="menu"
    >
      <div className="dates__container">
        {datesElements}
        <NewDateForm />
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Header />
      <Main />
    </AppProvider>
  );
}

export default App;
