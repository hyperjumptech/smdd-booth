import { useEffect, useState } from "react";
import { getCaseById } from "@booth/shared";
import { WelcomeStep } from "../components/WelcomeStep";
import { LeadFormStep } from "../components/LeadFormStep";
import { ProblemsList } from "../components/ProblemsList";
import { CaseDetail } from "../components/CaseDetail";
import { BadgesTab } from "../components/BadgesTab";
import { ProgressHud } from "../components/ProgressHud";
import { useBoothState } from "../hooks/useBoothState";
import { tapFeedback } from "../lib/haptics";

type ExploreTab = "problems" | "badges";

export function BoothPage() {
  const {
    step,
    name,
    email,
    badges,
    submitted,
    canSubmit,
    goToLead,
    setName,
    setEmail,
    goExplore,
    earnBadge,
    hasBadge,
    markSubmitted,
    resetProgress,
  } = useBoothState();

  const [activeTab, setActiveTab] = useState<ExploreTab>("problems");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const selectedCase =
    selectedCaseId !== null ? getCaseById(selectedCaseId) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [selectedCaseId, activeTab]);

  function handleReset() {
    setSelectedCaseId(null);
    setActiveTab("problems");
    resetProgress();
  }

  function selectTab(tab: ExploreTab) {
    tapFeedback();
    setActiveTab(tab);
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md">
      {step === "welcome" && <WelcomeStep onStart={goToLead} />}

      {step === "lead" && (
        <LeadFormStep
          name={name}
          email={email}
          onNameChange={setName}
          onEmailChange={setEmail}
          onSubmit={goExplore}
        />
      )}

      {step === "explore" && (
        <div className="flex min-h-dvh flex-col px-5 pb-10 pt-6">
          {activeTab === "problems" && (
            <ProgressHud name={name} badges={badges} />
          )}

          <div
            className="sticky top-0 z-10 -mx-5 mb-5 mt-4 bg-[var(--hj-bg)]/85 px-5 py-2 backdrop-blur"
            role="tablist"
            aria-label="Booth navigation"
          >
            <div className="flex rounded-xl border border-[var(--hj-border)] bg-[var(--hj-surface)] p-1">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "problems"}
                onClick={() => selectTab("problems")}
                className={`min-h-12 flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "problems"
                    ? "bg-[var(--hj-cyan)] text-[var(--hj-on-accent)]"
                    : "text-[var(--hj-muted)]"
                }`}
              >
                Berkas Kasus
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "badges"}
                onClick={() => selectTab("badges")}
                className={`relative min-h-12 flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "badges"
                    ? "bg-[var(--hj-cyan)] text-[var(--hj-on-accent)]"
                    : "text-[var(--hj-muted)]"
                }`}
              >
                Badge ({badges.length})
                {canSubmit && !submitted && activeTab !== "badges" && (
                  <span
                    aria-hidden="true"
                    className="absolute right-3 top-2 h-2 w-2 rounded-full bg-[var(--hj-yellow)]"
                  />
                )}
              </button>
            </div>
          </div>

          <div className="flex-1">
            {activeTab === "problems" &&
              (selectedCase ? (
                <CaseDetail
                  key={selectedCase.id}
                  boothCase={selectedCase}
                  hasBadge={hasBadge(selectedCase.id)}
                  earnBadge={earnBadge}
                  onClose={() => setSelectedCaseId(null)}
                />
              ) : (
                <ProblemsList
                  badges={badges}
                  onSelectCase={setSelectedCaseId}
                />
              ))}
            {activeTab === "badges" && (
              <BadgesTab
                name={name}
                email={email}
                badges={badges}
                submitted={submitted}
                markSubmitted={markSubmitted}
                resetProgress={handleReset}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}
