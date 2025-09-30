import Header from "./Header";
import Loader from "./Loader";
import ErrorComp from "./Error";
import {ReactNode, useEffect} from "react";
import {useQuiz} from "./context/QuizContext";

function Main({children}: { children: ReactNode }) {
    return <div className="main">
        {children}
    </div>
}

function QuizIntro() {
    const {questions, startQuiz} = useQuiz();
    const nQuestions = questions.length

    return <div className="start">
        <h2>Welcome to The React Quiz!</h2>
        <h3>{nQuestions} questions to test your React mastery</h3>
        <button onClick={startQuiz} className="btn btn-ui">Let's start</button>
    </div>
}

function Quiz({children}: { children: ReactNode }) {
    return <div className="start">
        {children}
    </div>
}

function Progress() {
    const {answers, questions, points, index} = useQuiz();
    const answered = answers.length === index + 1
    const maxPoints = questions.reduce((prev, curr) => prev + curr.points, 0)

    return <header className="progress">
        <progress max={questions.length} value={index + Number(answered)}/>
        <p>Question <strong>{index + 1}</strong> / {questions.length} </p>
        <p><strong>{points}</strong> / {maxPoints} points</p>
    </header>
}

function Question() {
    const {questions, index} = useQuiz();
    const question = questions[index]

    return <div>
        <h4>{question.question}</h4>
        <div className="options">
            {question.options.map((option, i) => <Option key={option} optionIndex={i} option={option}/>)}
        </div>
    </div>
}

function Option({option, optionIndex}: { option: string, optionIndex: number }) {
    const {answers, questions, saveAnswer, index} = useQuiz();
    const question = questions[index]
    const correct = question.correctOption === optionIndex
    const revealed = answers.length === index + 1
    const answer = revealed ? answers[index] : null

    return <button disabled={revealed} onClick={() => saveAnswer(optionIndex)}
                   className={`btn btn-option ${revealed && correct ? "correct" : revealed ? "wrong" : ""} ${answer === optionIndex ? "answer" : ""}`}
    >
        {option}
    </button>
}

function Finished() {
    const {highScore, questions, points} = useQuiz();
    const maxPoints = questions.reduce((prev, curr) => prev + curr.points, 0)
    const percentage = Math.ceil((points / maxPoints) * 100)

    return <>
        <p className="result">
        <span>
            {percentage === 100 && "🎖️"}
            {percentage >= 80 && percentage < 100 && "🎉️"}
            {percentage >= 50 && percentage < 80 && "👌"}
            {percentage >= 0 && percentage < 50 && "🫤"}
            {percentage === 0 && "😭"}
        </span>
            You scored <strong>{points}</strong> out of {maxPoints} ({percentage}%)
        </p>
        <p className="highscore">(HighScore: {highScore} points)</p>
    </>
}

function Timer() {
    const {tick, secondsRemaining} = useQuiz();
    const mins = Math.floor(secondsRemaining / 60)
    const secs = Math.floor(secondsRemaining % 60)

    useEffect(() => {
        const timer = setInterval(tick, 1000)
        return () => clearInterval(timer)
    }, [tick]);

    return <div className="timer">{mins < 10 && "0"}{mins}:{secs < 10 && "0"}{secs}</div>
}


export default function App() {
    const {index, answers, status, nextQuestion, reset,loadQuiz} = useQuiz();
    const answered = answers.length === index + 1

    useEffect(() => {
        loadQuiz()
    }, []);

    return <div className="app">
        <Header/>
        <Main>
            {status === 'ready' && <QuizIntro/>}
            {status === 'loading' && <Loader/>}
            {status === 'error' && <ErrorComp/>}
            {status === 'start' && <>
                <Progress/>
                <Quiz>
                    <Question/>
                </Quiz>
                <footer>
                    {answered ?
                        <button onClick={nextQuestion} className="btn btn-ui">
                            Next
                        </button>
                        : null
                    }
                    <Timer/>
                </footer>
            </>
            }
            {status === 'finished' && <>
                <Finished/>
                <button onClick={reset} className="btn btn-ui">Restart</button>
            </>
            }
        </Main>
    </div>
}
