import {
  QUESTIONS,
  leadingChoices,
  tallyAnswers,
} from "@booth/shared";
import { WelcomeStep } from "../components/WelcomeStep";
import { LeadFormStep } from "../components/LeadFormStep";
import { QuestionStep } from "../components/QuestionStep";
import { TiebreakerStep } from "../components/TiebreakerStep";
import { ResultStep } from "../components/ResultStep";
import { useQuizState } from "../hooks/useQuizState";

export type { QuizStep, QuizState } from "../hooks/useQuizState";

export function QuizPage() {
  const {
    state,
    goToLead,
    submitLead,
    setName,
    setEmail,
    answerQuestion,
    selectTiebreaker,
    reset,
  } = useQuizState();

  const leaders =
    state.step === "tiebreaker"
      ? leadingChoices(tallyAnswers(state.answers))
      : [];

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md">
      {state.step === "welcome" && <WelcomeStep onStart={goToLead} />}

      {state.step === "lead" && (
        <LeadFormStep
          name={state.name}
          email={state.email}
          onNameChange={setName}
          onEmailChange={setEmail}
          onSubmit={submitLead}
        />
      )}

      {state.step === "question" && (
        <QuestionStep
          question={QUESTIONS[state.questionIndex]}
          index={state.questionIndex}
          total={QUESTIONS.length}
          onSelect={answerQuestion}
        />
      )}

      {state.step === "tiebreaker" && (
        <TiebreakerStep leaders={leaders} onSelect={selectTiebreaker} />
      )}

      {state.step === "result" && state.resultKey && (
        <ResultStep
          name={state.name}
          email={state.email}
          answers={state.answers}
          resultKey={state.resultKey}
          tiebreaker={state.tiebreaker}
          onReset={reset}
        />
      )}
    </main>
  );
}
