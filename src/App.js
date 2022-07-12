import { useRef, useState } from "react";
import { useTimer } from "react-timer-hook";
import { Button, Container, Input, InputGroup, Nav, Navbar } from "rsuite";
import ShowText from "./ShowText";

function App() {
  const inputReference = useRef(null);

  const [inputValue, setInputValue] = useState("");
  const [started, setStarted] = useState(false);
  const [text, setText] = useState("");
  const [words, setWords] = useState([]);
  const [completedWords, setCompletedWords] = useState([]);
  const [completed, setCompleted] = useState(false);
  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + 5);
  const {
    seconds: timerseconds,
    minutes,
    isRunning,
    start,
    restart,
  } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      inputReference.current.focus();
    },
    autoStart: false,
  });

  const startTest = () => {
    const texts =
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s";
    const words = texts.split(" ");
    setText(texts);
    setWords(words);
    setStarted(true);
    start();
  };

  const handleInput = (val) => {
    console.log(val);
    const lastLetter = val[val.length - 1];
    const currentWord = words[0];
    if (lastLetter === " " || lastLetter === ".") {
      const newWords = [...words.slice(1)];
      console.log(newWords, "newWords");
      console.log(newWords.length, "newWords.length");
      const newCompletedWords = [...completedWords, currentWord];
      console.log(newCompletedWords, "newCompletedWords");
      console.log("----------------");
      setWords(newWords);
      setCompletedWords(newCompletedWords);
      setInputValue("");
      setCompleted(newWords.length === 0);
    } else {
      setInputValue(val);
    }
  };

  return (
    <div className="App">
      <Container className="main_container">
        <Navbar className="nav-bar">
          <Navbar.Brand href="#" className="brand-name">
            Typing Test
          </Navbar.Brand>
          <Nav>
            <Nav.Item className="nav-item">Last Speed : 85 WPM</Nav.Item>
            <Nav.Item className="nav-item">Best Speed : 109 WPM</Nav.Item>
            <Nav.Item className="nav-item">Avg Speed : 72.2 WPM</Nav.Item>
            <Nav.Item className="nav-item">Number of Tests : 2000</Nav.Item>
          </Nav>
          <Nav pullRight>
            <Nav.Item className="nav-item">
              <Button onClick={startTest}>
                START {minutes}:{timerseconds}
              </Button>
            </Nav.Item>
          </Nav>
        </Navbar>
        <Container className="typing-container">
          <p className="typing-text">
            {started &&
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
                    }`}
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
