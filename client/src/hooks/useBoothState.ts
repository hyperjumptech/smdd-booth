import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import {
  canSubmitBadges,
  countKinds,
  getCaseById,
  type Badge,
} from "@booth/shared";
import {
  loadBoothProgress,
  saveBoothProgress,
  type BoothProgress,
} from "../lib/boothStorage";

export type BoothStep = "welcome" | "lead" | "explore";

type BoothState = {
  step: BoothStep;
  name: string;
  email: string;
  badges: Badge[];
  submitted: boolean;
  submissionId?: number;
};

function toProgress(
  state: Pick<
    BoothState,
    "name" | "email" | "badges" | "submitted" | "submissionId"
  >,
): BoothProgress {
  return {
    name: state.name,
    email: state.email,
    badges: state.badges,
    submitted: state.submitted,
    submissionId: state.submissionId,
  };
}

function createInitialState(): BoothState {
  const progress = loadBoothProgress();
  return {
    step: "welcome",
    name: progress.name,
    email: progress.email,
    badges: progress.badges,
    submitted: progress.submitted,
    submissionId: progress.submissionId,
  };
}

function updateState(
  setState: Dispatch<SetStateAction<BoothState>>,
  updater: (prev: BoothState) => BoothState,
) {
  setState((prev) => {
    const next = updater(prev);
    saveBoothProgress(toProgress(next));
    return next;
  });
}

export function useBoothState() {
  const [state, setState] = useState<BoothState>(createInitialState);

  const goToLead = useCallback(() => {
    updateState(setState, (prev) => ({ ...prev, step: "lead" }));
  }, []);

  const setName = useCallback((name: string) => {
    updateState(setState, (prev) => ({ ...prev, name }));
  }, []);

  const setEmail = useCallback((email: string) => {
    updateState(setState, (prev) => ({ ...prev, email }));
  }, []);

  const setLead = useCallback((name: string, email: string) => {
    updateState(setState, (prev) => ({
      ...prev,
      name: name.trim(),
      email: email.trim(),
    }));
  }, []);

  const goExplore = useCallback(() => {
    updateState(setState, (prev) => {
      const name = prev.name.trim();
      const email = prev.email.trim();
      return { ...prev, name, email, step: "explore" };
    });
  }, []);

  const earnBadge = useCallback((caseId: string) => {
    updateState(setState, (prev) => {
      if (prev.badges.some((b) => b.caseId === caseId)) {
        return prev;
      }
      const boothCase = getCaseById(caseId);
      if (!boothCase) {
        return prev;
      }
      const badge: Badge = {
        caseId: boothCase.id,
        kind: boothCase.kind,
        revealName: boothCase.revealName,
      };
      return { ...prev, badges: [...prev.badges, badge] };
    });
  }, []);

  const hasBadge = useCallback(
    (caseId: string) => state.badges.some((b) => b.caseId === caseId),
    [state.badges],
  );

  const resetBadges = useCallback(() => {
    updateState(setState, (prev) => ({
      ...prev,
      badges: [],
    }));
  }, []);

  const resetProgress = useCallback(() => {
    updateState(setState, (prev) => ({
      ...prev,
      badges: [],
      submitted: false,
      submissionId: undefined,
      step: "explore",
    }));
  }, []);

  const markSubmitted = useCallback((submissionId: number) => {
    updateState(setState, (prev) => ({
      ...prev,
      submitted: true,
      submissionId,
    }));
  }, []);

  const counts = countKinds(state.badges);
  const canSubmit = canSubmitBadges(state.badges);

  return {
    step: state.step,
    name: state.name,
    email: state.email,
    badges: state.badges,
    submitted: state.submitted,
    submissionId: state.submissionId,
    counts,
    canSubmit,
    goToLead,
    setLead,
    setName,
    setEmail,
    goExplore,
    earnBadge,
    hasBadge,
    resetBadges,
    resetProgress,
    markSubmitted,
  };
}
