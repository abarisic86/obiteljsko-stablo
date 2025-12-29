import { useState, useCallback } from 'react'
import { Person } from '../types/family'

export interface QuizQuestion {
  type: 'guess-year' | 'guess-person'
  prompt: string
  correctAnswer: string
  options: string[]
  personId: string
  correctYear?: number
}

interface QuizState {
  questions: QuizQuestion[]
  currentIndex: number
  score: number
  isFinished: boolean
  answers: boolean[]
}

const TOTAL_QUESTIONS = 10

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generateYearOptions(correctYear: number): number[] {
  const options = [correctYear]
  const usedYears = new Set([correctYear])
  
  while (options.length < 4) {
    const offset = Math.floor(Math.random() * 20) - 10 // ±10 years
    const candidate = correctYear + offset
    
    if (candidate > 1900 && candidate <= new Date().getFullYear() && !usedYears.has(candidate)) {
      options.push(candidate)
      usedYears.add(candidate)
    }
  }
  
  return shuffleArray(options)
}

function generatePersonOptions(correctPerson: Person, allPeople: Person[]): Person[] {
  const correctYear = new Date(correctPerson.birthdate).getFullYear()
  const options = [correctPerson]
  const usedIds = new Set([correctPerson.id])
  
  // Filter people born in different years
  const candidates = allPeople.filter(
    (p) => p.birthdate && 
    new Date(p.birthdate).getFullYear() !== correctYear &&
    !usedIds.has(p.id)
  )
  
  // Shuffle and take 3 more
  const shuffled = shuffleArray(candidates)
  for (let i = 0; i < shuffled.length && options.length < 4; i++) {
    if (!usedIds.has(shuffled[i].id)) {
      options.push(shuffled[i])
      usedIds.add(shuffled[i].id)
    }
  }
  
  return shuffleArray(options)
}

function generateQuestions(people: Person[]): QuizQuestion[] {
  // Filter people with valid birthdates
  const validPeople = people.filter((p) => p.birthdate && p.birthdate.trim() !== '')
  
  if (validPeople.length === 0) {
    return []
  }
  
  const questions: QuizQuestion[] = []
  
  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const questionType = Math.random() < 0.5 ? 'guess-year' : 'guess-person'
    const randomPerson = validPeople[Math.floor(Math.random() * validPeople.length)]
    const birthYear = new Date(randomPerson.birthdate).getFullYear()
    
    if (questionType === 'guess-year') {
      const yearOptions = generateYearOptions(birthYear)
      questions.push({
        type: 'guess-year',
        prompt: `Koje godine je rođen/a ${randomPerson.name}?`,
        correctAnswer: birthYear.toString(),
        options: yearOptions.map((y) => y.toString()),
        personId: randomPerson.id,
        correctYear: birthYear,
      })
    } else {
      const personOptions = generatePersonOptions(randomPerson, validPeople)
      if (personOptions.length < 4) {
        // Fallback to guess-year if not enough candidates
        const yearOptions = generateYearOptions(birthYear)
        questions.push({
          type: 'guess-year',
          prompt: `Koje godine je rođen/a ${randomPerson.name}?`,
          correctAnswer: birthYear.toString(),
          options: yearOptions.map((y) => y.toString()),
          personId: randomPerson.id,
          correctYear: birthYear,
        })
      } else {
        questions.push({
          type: 'guess-person',
          prompt: `Tko je rođen ${birthYear}. godine?`,
          correctAnswer: randomPerson.name,
          options: personOptions.map((p) => p.name),
          personId: randomPerson.id,
          correctYear: birthYear,
        })
      }
    }
  }
  
  return questions
}

export function useQuiz(people: Person[]) {
  const [state, setState] = useState<QuizState>({
    questions: [],
    currentIndex: 0,
    score: 0,
    isFinished: false,
    answers: [],
  })

  const startQuiz = useCallback(() => {
    const questions = generateQuestions(people)
    setState({
      questions,
      currentIndex: 0,
      score: 0,
      isFinished: false,
      answers: [],
    })
  }, [people])

  const answerQuestion = useCallback((answer: string) => {
    setState((prev) => {
      if (prev.isFinished || prev.currentIndex >= prev.questions.length) {
        return prev
      }

      const currentQuestion = prev.questions[prev.currentIndex]
      const isCorrect = answer === currentQuestion.correctAnswer
      const newScore = isCorrect ? prev.score + 1 : prev.score
      const newAnswers = [...prev.answers, isCorrect]
      const nextIndex = prev.currentIndex + 1
      const isFinished = nextIndex >= prev.questions.length

      return {
        ...prev,
        score: newScore,
        currentIndex: nextIndex,
        isFinished,
        answers: newAnswers,
      }
    })
  }, [])

  const resetQuiz = useCallback(() => {
    startQuiz()
  }, [startQuiz])

  return {
    ...state,
    startQuiz,
    answerQuestion,
    resetQuiz,
    currentQuestion: state.questions[state.currentIndex],
    totalQuestions: TOTAL_QUESTIONS,
  }
}

