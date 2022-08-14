import React, { useEffect, useRef, useState } from "react";
import { useStopwatch, useTimer } from "react-timer-hook";
import {
  Button,
  ButtonGroup,
  Container,
  IconButton,
  Input,
  InputGroup,
  Modal,
  Nav,
  Navbar,
} from "rsuite";
import ReloadIcon from "@rsuite/icons/Reload";

function App() {
  const inputReference = useRef(null);

  const [excess, setExcess] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [countDownStarted, setCountDownStarted] = useState(false);
  const [started, setStarted] = useState(false);
  const [text, setText] = useState("");
  const [words, setWords] = useState([]);
  const [completedWords, setCompletedWords] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [showCountDownModal, setShowCountDownModal] = useState(false);
  const [wpm, setWPM] = useState(0);

  // const categories = {
  //   computers: 9,
  //   people: 7,
  //   places: 9,
  //   science: 10,
  //   sports: 10,
  //   movies: 7,
  //   quotes: 24,
  // };

  const fileCount = 87;

  const [stats, setStats] = useState({
    lastSpeed: 0,
    bestSpeed: 0,
    avgSpeed: 0,
    nooftests: 0,
  });

  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + 5);

  const {
    seconds: timerseconds,
    minutes: timerminutes,
    start: timerStart,
    restart: timerrestart,
    pause: timerPause,
  } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      setShowCountDownModal(false);
      setTimeout(() => {
        inputReference.current.focus();
        startTyping();
      }, 500);
    },
    autoStart: false,
  });

  const {
    seconds: stopwatchSeconds,
    minutes: stopwatchMinutes,
    start: stopwatchStart,
    pause: stopwatchpause,
    reset: stopwatchreset,
  } = useStopwatch({ autoStart: false });

  const startCountDown = async () => {
    // let keys = Object.keys(categories);
    // const randomCategory = keys[(keys.length * Math.random()) << 0];
    const randomFile = Math.floor(Math.random() * fileCount);
    const data = await fetch(`/Texts/${randomFile}.txt`);
    const txt_val = await data.text();
    const texts = txt_val;
    const words = texts.split(" ");
    setText(texts);
    setWords(words);
    setCountDownStarted(true);
    setShowCountDownModal(true);
    timerStart();
  };

  const startTyping = () => {
    setStarted(true);
    stopwatchStart();
  };

  const resetTest = () => {
    setText("");
    setWords("");
    setCountDownStarted(false);
    setStarted(false);
    stopwatchreset();
    setInputValue("");
    const expiryTimestamp = new Date();
    expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + 5);
    timerrestart(expiryTimestamp);
    timerPause();
    setWords([]);
    setCompletedWords([]);
    setCompleted(false);
  };

  const calculateWPM = () => {
    const noWords = text.split(" ");
    const totalTime = stopwatchMinutes + stopwatchSeconds / 60;
    const newWPM = Math.round((noWords.length / totalTime) * 100) / 100;
    setWPM(newWPM);
    updateScore(newWPM);
  };

  const updateScore = (wpm) => {
    const newbestSpeed = stats.bestSpeed < wpm ? wpm : stats.bestSpeed;
    const newNumber = stats.nooftests + 1;
    const newAvg =
      Math.round(((stats.avgSpeed * (newNumber - 1) + wpm) / newNumber) * 100) /
      100;
    const newStat = {
      lastSpeed: wpm,
      bestSpeed: newbestSpeed,
      avgSpeed: newAvg,
      nooftests: newNumber,
    };
    setStats(newStat);
    localStorage.setItem("stats", JSON.stringify(newStat));
  };

  const handleInput = (val) => {
    if (started) {
      setExcess(false);
      const lastLetter = val[val.length - 1];
      const currentWord = words[0];
      if (lastLetter === " " || lastLetter === ".") {
        if (val.trim() === currentWord) {
          const newWords = [...words.slice(1)];
          const newCompletedWords = [...completedWords, currentWord];
          setWords(newWords);
          setCompletedWords(newCompletedWords);
          setInputValue("");
          if (newWords.length === 0) {
            stopwatchpause();
            setCompleted(true);
            calculateWPM();
          }
        } else {
          setInputValue(val);
        }
      } else {
        if (val.trim().length > currentWord.length) {
          console.log("Error excess word");
          setExcess(true);
        }
        setInputValue(val);
      }
    }
  };

  useEffect(() => {
    let currstats = localStorage.getItem("stats");
    if (currstats === null) {
      localStorage.setItem("stats", JSON.stringify(stats));
    } else {
      const currstats = JSON.parse(localStorage.getItem("stats"));
      setStats(currstats);
    }
  }, []);

  return (
    <div className="App">
      <Container className="main_container">
        <Navbar className="nav-bar">
          <Navbar.Brand href="#" className="brand-name">
            TT
          </Navbar.Brand>
          <Nav>
            <Nav.Item className="nav-item">
              Last Speed : <span className="nav-score">{stats.lastSpeed}</span>
              WPM
            </Nav.Item>
            <Nav.Item className="nav-item">
              Best Speed : <span className="nav-score">{stats.bestSpeed}</span>{" "}
              WPM
            </Nav.Item>
            <Nav.Item className="nav-item">
              Avg Speed : <span className="nav-score">{stats.avgSpeed}</span>{" "}
              WPM
            </Nav.Item>
            <Nav.Item className="nav-item">
              No. of Tests :{" "}
              <span className="nav-score">{stats.nooftests}</span>
            </Nav.Item>
            {/* <Nav.Menu className="nav-item" title="Categories">
              <Nav.Item>Company</Nav.Item>
              <Nav.Item>Team</Nav.Item>
            </Nav.Menu> */}
          </Nav>
          <Nav pullRight className="nav-controls">
            <ButtonGroup>
              <IconButton
                className="restart-icon"
                icon={<ReloadIcon />}
                disabled={!countDownStarted}
                onClick={resetTest}
              />
              <Button
                className="start-button restart-icon"
                onClick={startCountDown}
                disabled={started}
              >
                START
              </Button>
              <Button
                className={`timer restart-icon ${
                  countDownStarted && "timer-blue"
                } ${started && "timer-green"}`}
                disabled
              >
                {started
                  ? `${stopwatchMinutes} : ${stopwatchSeconds}`
                  : `${timerminutes} : ${timerseconds}`}
              </Button>
            </ButtonGroup>
          </Nav>
        </Navbar>
        {/* Countdown modal */}

        <Modal
          role="alertdialog"
          open={showCountDownModal}
          size="xs"
          className="timer-modal"
        >
          <Modal.Body>Test will start in {timerseconds} sec</Modal.Body>
        </Modal>

        {/* Complete Model */}
        <Modal open={completed} className="complete-modal" onClose={resetTest}>
          <Modal.Header>
            <Modal.Title>Typing Test Complete!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Your speed was <span className="modal-wpm">{wpm}</span> WPM
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => {
                resetTest();
                startCountDown();
              }}
              className="modal-close"
            >
              Play Again !
            </Button>
            <Button onClick={resetTest} className="modal-close">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <Container className="typing-container">
          <p className="typing-text">
            {countDownStarted &&
              text.split(" ").map((word, w_id) => {
                let highlighted = false;
                let currentWord = false;
                if (completedWords.length > w_id) {
                  highlighted = true;
                }
                if (completedWords.length === w_id) {
                  currentWord = true;
                }
                return (
                  <span
                    className={`word ${highlighted && "green"} ${
                      currentWord && "underline"
                    } ${excess && currentWord && "red_background"}`}
                    key={w_id}
                  >
                    {word.split("").map((letter, l_id) => {
                      const isCurrentWord = w_id === completedWords.length;
                      const isWronglyTyped = letter !== inputValue[l_id];
                      const shouldBeHighlighted = l_id < inputValue.length;

                      return (
                        <span
                          className={`letter ${
                            isCurrentWord && shouldBeHighlighted
                              ? isWronglyTyped
                                ? "red"
                                : "green"
                              : ""
                          }`}
                          key={l_id}
                        >
                          {letter}
                        </span>
                      );
                    })}{" "}
                  </span>
                );
              })}
          </p>
          <InputGroup className="input-type">
            <Input
              type="text"
              placeholder="Type here..."
              className="input-field"
              ref={inputReference}
              value={inputValue}
              onChange={handleInput}
            />
          </InputGroup>
        </Container>
      </Container>
    </div>
  );
}

export default App;
