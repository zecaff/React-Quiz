import {createContext, ReactNode, useContext, useReducer} from "react";
import {QuestionType} from "../types/QuestionType";

const API = 'http://localhost:8000/questions'
const TIMEPERQUESTION = 30

type QuizContextType = State & {
    loadQuiz: () => void,
    saveAnswer: (index:number) => void,
    nextQuestion: () => void,
    tick: () => void,
    reset: () => void,
    startQuiz: () => void,
}

const QuizContext = createContext<QuizContextType>({
    questions: [],
    status: 'ready',
    index: 0,
    answers: [],
    points: 0,
    highScore: 0,
    secondsRemaining:0,
    loadQuiz: () => {},
    saveAnswer: () => {},
    nextQuestion: () => {},
    tick: () => {},
    reset: () => {},
    startQuiz: () => {},
})

type State = {
    questions: QuestionType[],
    status: string,
    index: number,
    answers: number[],
    points: number,
    highScore: number,
    secondsRemaining: number,
}

type Action = {
    type?: string,
    payload?: QuestionType[] | number,
}

function reducer(state: State, action: Action): State | never {
    switch (action.type) {
        case 'reset':
            return {...state, status: 'start', index: 0, answers: [], points: 0, secondsRemaining:state.questions.length * TIMEPERQUESTION}
        case 'dataReceived':
            return Array.isArray(action.payload) ? {...state, secondsRemaining:action.payload.length * TIMEPERQUESTION,  questions: action.payload!, status: 'ready'} : {
                ...state,
                status: 'error'
            }
        case 'error':
            return {...state, status: 'error'}
        case 'start':
            return {...state, status: 'start'}
        case 'answer':
            const question = state.questions[state.index]
            return typeof action.payload === "number" ? {
                ...state,
                answers: [...state.answers, action.payload],
                points: action.payload === question.correctOption ? state.points + question.points : state.points
            } : {...state, status: 'error'}
        case 'nextAnswer':
            const nextIndex = state.index++
            const isFinished = nextIndex >= state.questions.length
            return isFinished ? {
                    ...state,
                    status: 'finished',
                    highScore: state.points > state.highScore ? state.points : state.highScore
                }
                : {...state, status: 'start', index: nextIndex}
        case 'tick':
            const isRanOut = state.secondsRemaining - 1 <= 0
            return isRanOut? {...state, secondsRemaining:10, status: 'finished' }: {...state, secondsRemaining: state.secondsRemaining - 1, status:  state.status}
        default:
            throw new Error("Unknown Action")
    }
}


function QuizProvider({children}: { children: ReactNode }) {
    const [{questions, status,index,answers,points,highScore, secondsRemaining}, dispatch] =
        useReducer(reducer, {questions: [], status: 'ready', index: 0, answers: [], points: 0, highScore: 0, secondsRemaining:0})

    async function loadQuiz(){
        try {
            const response = await fetch(API)
            const data: QuestionType[] = await response.json()
            dispatch({type: 'dataReceived', payload: data})
        } catch {
            dispatch({type: 'error'})
        }
    }

    function startQuiz(){
        dispatch({type: 'start'})
    }

    function saveAnswer(index:number){
        dispatch({type: 'answer', payload: index})
    }

    function nextQuestion(){
        dispatch({type: 'nextAnswer'})
    }

    function tick(){
        dispatch({type: "tick"})
    }

    function reset(){
        dispatch({type: "reset"})
    }

    return <QuizContext.Provider value={{
        questions,
        status,
        index,
        answers,
        points,
        highScore,
        secondsRemaining,
        loadQuiz,
        saveAnswer,
        nextQuestion,
        startQuiz,
        tick,
        reset
    }}>
        {children}
    </QuizContext.Provider>
}

function useQuiz() {
    const context = useContext(QuizContext)
    if (context === undefined) throw new Error("CitiesContext was used outside of the CitiesProvider")

    return context;
}

export {QuizProvider, useQuiz}
