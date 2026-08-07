import { useCallback, useState } from "react";
import {
  QUESTIONS,
  leadingChoices,
  resolveResultKey,
  tallyAnswers,
  type Answer,
  type Choice,
} from "@booth/shared";
import { loadLead, saveLead } from "../lib/leadStorage";

export type QuizStep =
  | "welcome"
  | "lead"
  | "question"
  | "tiebreaker"
  | "result";

export type QuizState = {
  step: QuizStep;
  name: string;
  email: string;
  questionIndex: number;
  answers: Answer[];
  tiebreaker?: Choice;
  resultKey?: Choice;
};

const INITIAL_STATE: QuizState = {
  step: "welcome",
  name: "",
  email: "",
  questionIndex: 0,
  answers: [],
};

function createInitialState(): QuizState {
  const lead = loadLead();
  return {
    ...INITIAL_STATE,
    name: lead.name,
    email: lead.email,
  };
}

export function useQuizState() {
  const [state, setState] = useState<QuizState>(createInitialState);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...INITIAL_STATE,
      name: prev.name,
      email: prev.email,
      step: "lead",
      answers: [],
    }));
  }, []);

  const goToLead = useCallback(() => {
    setState((prev) => ({ ...prev, step: "lead" }));
  }, []);

  const submitLead = useCallback(() => {
    setState((prev) => {
      const name = prev.name.trim();
      const email = prev.email.trim();
      saveLead(name, email);
      return { ...prev, name, email, step: "question" };
    });
  }, []);

  const setName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, name }));
  }, []);

  const setEmail = useCallback((email: string) => {
    setState((prev) => ({ ...prev, email }));
  }, []);

  const answerQuestion = useCallback((choice: Choice) => {
    setState((prev) => {
      if (prev.step !== "question") return prev;
      if (prev.questionIndex >= QUESTIONS.length) return prev;
      if (prev.answers.length !== prev.questionIndex) return prev;

      const question = QUESTIONS[prev.questionIndex];
      const answers: Answer[] = [
        ...prev.answers,
        { questionId: question.id, choice },
      ];

      if (answers.length < QUESTIONS.length) {
        return {
          ...prev,
          answers,
          questionIndex: prev.questionIndex + 1,
        };
      }

      const leaders = leadingChoices(tallyAnswers(answers));
      if (leaders.length > 1) {
        return { ...prev, answers, step: "tiebreaker" };
      }

      return {
        ...prev,
        answers,
        resultKey: resolveResultKey(answers),
        step: "result",
      };
    });
  }, []);

  const selectTiebreaker = useCallback((choice: Choice) => {
    setState((prev) => ({
      ...prev,
      tiebreaker: choice,
      resultKey: resolveResultKey(prev.answers, choice),
      step: "result",
    }));
  }, []);

  return {
    state,
    reset,
    goToLead,
    submitLead,
    setName,
    setEmail,
    answerQuestion,
    selectTiebreaker,
  };
}
