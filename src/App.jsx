import { Fragment, use, useEffect, useRef, useState } from "react";
import { AppProvider, useAppContext } from "./context/AppContext";
import { IoIosMenu } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { IoInvertMode } from "react-icons/io5";
import { IoTrashOutline } from "react-icons/io5";

import "./index.css";
import "./App.css";

function MenuBtn() {
  const { menuState, setMenuState } = useAppContext();
  function activateMenu() {
    setMenuState(!menuState);
  }

  return (
    <button
      aria-label="Menu button"
      className={`header__btn left ${menuState ? "open" : ""}`}
      onClick={activateMenu}
    >
      {!menuState ? <IoIosMenu /> : <IoMdClose />}
    </button>
  );
}

function ThemeToggleBtn() {
  const { theme, setTheme } = useAppContext();

  return (
    <button
      aria-label="Theme switcher button"
      className="header__btn right"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <IoInvertMode />
    </button>
  );
}

function Header() {
  return (
    <div className="header">
      <MenuBtn />
      <h1 className="header-title">amr.io</h1>
      <ThemeToggleBtn />
    </div>
  );
}

function Main() {
  const { menuState, counterState, setCounterState } = useAppContext();

  return (
    <div className="main">
      <Menu />
      <Overlay />
      <CounterBtn />
      <Counter />
    </div>
  );
}

function Overlay() {
  const { menuState, setMenuState } = useAppContext();

  return (
    <div
      className={`overlay ${menuState ? "open" : ""}`}
      onClick={() => setMenuState(false)}
    ></div>
  );
}

function saveCounterState(newState, setCounterState) {
  localStorage.setItem("counterState", newState);
  setCounterState(newState);
}

function CounterBtn() {
  const { counterState, setCounterState, currentCounter, setCurrentCounter } =
    useAppContext();

  return (
    <button
      aria-label="Counter mode switcher button"
      className="counter__btn"
      onClick={() =>
        currentCounter &&
        saveCounterState((counterState + 1) % 5, setCounterState)
      }
    ></button>
  );
}

function InstructionsMsg() {
  return (
    <div className="instructions">
      <h2>Welcome to amr.io!</h2>
      <p>
        Click on the menu button in the top left part of the screen to add,
        delete or change to current counter.
      </p>
      <p>
        Once you select the counter, click on the screen to chagne between modes
        (days, hours, minutes, etc...).
      </p>
    </div>
  );
}

function Counter() {
  const {
    currentCounter,
    timeLeft,
    setTimeLeft,
    counterState,
    setCounterState,
  } = useAppContext();

  const stateTimes = {
    0: 1000,
    1: 1000,
    2: 1000,
    3: 250,
    4: 100,
  };

  useEffect(() => {
    if (currentCounter === null) return;

    const interval = setInterval(
      () =>
        setTimeLeft(currentCounter.dateObj.getTime() - new Date().getTime()),
      stateTimes[counterState]
    );
    return () => clearInterval(interval);
  }, [timeLeft, currentCounter]);

  if (currentCounter === null) return <InstructionsMsg />;

  const timeData = [
    ["days", Math.trunc(timeLeft / (1000 * 60 * 60 * 24))],
    ["hours", Math.trunc((timeLeft / (1000 * 60 * 60)) % 24)],
    ["minutes", Math.trunc((timeLeft / (1000 * 60)) % 60)],
    ["seconds", Math.trunc((timeLeft / 1000) % 60)],
    ["miliseconds", Math.trunc(timeLeft % 1000)],
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
        timeData[4][1] > 0 ? "Until" : "Since"
      }`}</span>
      <span className="counter-msg"> {currentCounter.name}</span>
    </>
  );

  return (
    <div className="counter">
      {cleanTime}
      {counterMsg}
    </div>
  );
}

function DateEl({ dateInfo }) {
  const { name, date } = dateInfo;
  const {
    dates,
    setDates,
    currentCounter,
    setCurrentCounter,
    menuState,
    setMenuState,
  } = useAppContext();

  function deleteDate(e) {
    e.stopPropagation();

    setCurrentCounter(null);
    setDates((prev) => prev.filter((date) => date.name !== name));
  }

  function changeDate() {
    const [year, month, day] = date.split("-");
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
  }

  return (
    <>
      <div
        className={`date__container ${
          currentCounter?.name === name ? "active" : ""
        }`}
        onClick={changeDate}
      >
        <span>{name}</span>

        <div className="date">
          <span>{date.split("-")[2].padStart(2, "0")}</span>
          <span>/</span>
          <span>{date.split("-")[1].padStart(2, "0")}</span>
          <span>/</span>
          <span>{date.split("-")[0]}</span>
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

function NewDateForm() {
  const { dates, setDates } = useAppContext();

  const [formData, setFormData] = useState({
    name: "",
    date: "",
  });
  const datePicker = useRef(null);

  function handleForm(e) {
    e.preventDefault();

    if (formData.name === "" || formData.value === "") return;

    if (dates.some((date) => date.name === formData.name)) return;

    setFormData({
      name: "",
      date: "",
    });
    setDates((prev) => [...prev, formData]);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function openDatePicker() {
    datePicker.current.showPicker();
  }

  return (
    <form className="form" onSubmit={handleForm}>
      <input
        type="text"
        placeholder="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
      />

      <button
        aria-label="Open date picker button"
        type="button"
        className="date"
        onClick={openDatePicker}
      >
        <span>{formData.date.split("-")[2] || "dd"}</span>
        <span>/</span>
        <span>{formData.date.split("-")[1] || "mm"}</span>
        <span>/</span>
        <span>{formData.date.split("-")[0] || "yyyy"}</span>
      </button>
      <input
        ref={datePicker}
        type="date"
        placeholder="dd"
        style={{ display: "none" }}
        name="date"
        value={formData.date}
        onChange={handleChange}
      />
      <button aria-label="Add date button" className="add-date__btn">
        Add Date
      </button>
    </form>
  );
}

function Menu() {
  const { menuState, dates } = useAppContext();

  const datesElements = dates.map((date) => (
    <DateEl key={date.name} dateInfo={date} />
  ));

  return (
    <div
      className={`menu ${menuState ? "open" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="dates__container">
        {datesElements} <NewDateForm />
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
