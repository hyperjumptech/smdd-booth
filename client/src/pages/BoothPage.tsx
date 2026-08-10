import { useState } from "react";
import { WelcomeStep } from "../components/WelcomeStep";
import { LeadFormStep } from "../components/LeadFormStep";
import { ProblemsList } from "../components/ProblemsList";
import { BadgesTab } from "../components/BadgesTab";
import { useBoothState } from "../hooks/useBoothState";

type ExploreTab = "problems" | "badges";

export function BoothPage() {
  const {
    step,
    name,
    email,
    goToLead,
    setName,
    setEmail,
    goExplore,
  } = useBoothState();

  const [activeTab, setActiveTab] = useState<ExploreTab>("problems");

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
        <div className="flex min-h-dvh flex-col px-6 py-8">
          <header className="mb-6">
            <h1 className="text-xl font-bold">Kasus Tech Detective</h1>
            {name.trim() && (
              <p className="mt-1 text-sm text-[var(--hj-muted)]">
                Detektif {name.trim()}
              </p>
            )}
          </header>

          <div
            className="mb-6 flex rounded-xl border border-[var(--hj-border)] bg-[var(--hj-surface)] p-1"
            role="tablist"
            aria-label="Booth navigation"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "problems"}
              onClick={() => setActiveTab("problems")}
              className={`min-h-12 flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "problems"
                  ? "bg-[var(--hj-cyan)] text-[var(--hj-on-accent)]"
                  : "text-[var(--hj-muted)]"
              }`}
            >
              Problems
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "badges"}
              onClick={() => setActiveTab("badges")}
              className={`min-h-12 flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "badges"
                  ? "bg-[var(--hj-cyan)] text-[var(--hj-on-accent)]"
                  : "text-[var(--hj-muted)]"
              }`}
            >
              Badges
            </button>
          </div>

          <div className="flex-1">
            {activeTab === "problems" && <ProblemsList />}
            {activeTab === "badges" && <BadgesTab />}
          </div>
        </div>
      )}
    </main>
  );
}
