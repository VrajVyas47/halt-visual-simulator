import React, { useState } from 'react';
import {
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  Terminal,
  Activity,
  Cpu,
} from 'lucide-react';
import { evaluateParadox } from '../../engine/predictor';
import type { PredictorDecision, ParadoxEvaluation } from '../../engine/predictor';
import { soundManager } from '../../utils/audio';

interface Stage02PredictorProps {
  onProceedToReality: () => void;
}

export const Stage02Predictor: React.FC<Stage02PredictorProps> = ({
  onProceedToReality,
}) => {
  const [selectedDecision, setSelectedDecision] = useState<PredictorDecision | null>(null);
  const [testedDecisions, setTestedDecisions] = useState<Set<PredictorDecision>>(new Set());

  const evaluation: ParadoxEvaluation | null = selectedDecision
    ? evaluateParadox(selectedDecision)
    : null;

  const handleSelectDecision = (decision: PredictorDecision) => {
    setSelectedDecision(decision);
    setTestedDecisions((prev) => new Set(prev).add(decision));
    soundManager.playContradictionBuzz();
  };

  const handleReset = () => {
    setSelectedDecision(null);
  };

  const bothTested = testedDecisions.has('YES') && testedDecisions.has('NO');

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Top Analytical Header Block */}
      <div className="bg-surface-low border border-surface-highest/60 rounded-xl p-6 lg:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-md">
        <div className="flex flex-col gap-2 max-w-4xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-mint shadow-sm"></span>
            <span className="font-mono text-xs text-mint tracking-widest uppercase font-semibold">
              Stage 02 // Reductio Ad Absurdum Proof
            </span>
            <span className="font-mono text-xs text-muted-light px-2 py-0.5 bg-surface rounded-full border border-surface-highest/40">
              THEOREM : ALAN TURING (1936)
            </span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl text-cream font-bold tracking-tight">
            THE HYPOTHETICAL PREDICTOR // HALT(P, X)
          </h1>
          <p className="font-sans text-sm text-cream-dim/90 leading-relaxed">
            Assume an oracle algorithm exists that can compute in finite steps whether any arbitrary program{' '}
            <code className="font-mono text-mint font-semibold">P</code> halts when executed on input{' '}
            <code className="font-mono text-cream font-semibold">X</code>. We now construct a lethal self-referential adversary to test its axiomatic limits.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 bg-surface px-4 py-2 rounded-lg border border-surface-highest/50 self-start lg:self-center">
          <div className="flex flex-col items-end font-mono">
            <span className="text-[11px] text-muted-light">AXIOMATIC STATE</span>
            <span className="text-xs text-mint font-semibold">
              {bothTested
                ? 'PROOF COMPLETE: Q.E.D.'
                : selectedDecision
                ? 'CONTRADICTION DETECTED'
                : 'HYPOTHESIS ACTIVE'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-surface-high border border-surface-highest/60 flex items-center justify-center text-cream">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Dual Blueprint Rack: Oracle Machine vs Adversary Construction */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Panel 1: The Canonical Oracle Machine Blueprint */}
        <div className="xl:col-span-6 bg-surface-lowest border border-surface-highest/50 rounded-xl p-5 lg:p-6 flex flex-col justify-between gap-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 bg-surface text-cream font-semibold rounded-full border border-surface-highest/40">
                SCHEMA 01
              </span>
              <span className="font-display text-sm text-cream-dim uppercase font-semibold">
                Canonical Oracle Machine
              </span>
            </div>
            <span className="font-mono text-[11px] text-mint">
              DETERMINISTIC // B = &#123;0, 1&#125;
            </span>
          </div>

          {/* Visual Circuit Diagram */}
          <div className="bg-surface-low border border-surface-highest/40 p-5 rounded-lg flex flex-col items-center gap-4 relative overflow-hidden">
            {/* Input Vectors */}
            <div className="w-full flex justify-center items-center gap-4 sm:gap-8 z-10">
              <div className="flex flex-col items-center gap-1">
                <span className="font-mono text-[10px] text-muted-light">TARGET PROGRAM</span>
                <div className="px-3 py-1 bg-surface rounded-full border border-surface-highest/50 text-cream font-mono text-xs flex items-center gap-1.5 shadow-sm">
                  <Terminal className="w-3.5 h-3.5 text-mint" />
                  <span>PROGRAM [P]</span>
                </div>
              </div>

              <span className="text-muted text-sm font-mono">+</span>

              <div className="flex flex-col items-center gap-1">
                <span className="font-mono text-[10px] text-muted-light">REGISTER INPUT</span>
                <div className="px-3 py-1 bg-surface rounded-full border border-surface-highest/50 text-cream font-mono text-xs flex items-center gap-1.5 shadow-sm">
                  <Activity className="w-3.5 h-3.5 text-cream" />
                  <span>INPUT [X]</span>
                </div>
              </div>
            </div>

            {/* Connecting Bus In */}
            <div className="flex flex-col items-center text-muted">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>

            {/* Oracle Core Box */}
            <div className="w-full max-w-sm bg-surface border border-surface-highest/60 p-4 rounded-xl flex flex-col items-center text-center gap-1.5 shadow-lg">
              <div className="flex items-center gap-1.5 text-mint font-mono text-xs font-semibold">
                <Cpu className="w-4 h-4" />
                <span>HYPOTHETICAL DECIDER BLACK-BOX</span>
              </div>
              <span className="font-mono text-xl text-cream font-bold">HALT(P, X)</span>
              <p className="font-sans text-xs text-cream-dim max-w-xs">
                Analyzes program encoding &lt;P&gt; and input X. Must complete evaluation without hanging.
              </p>
            </div>

            {/* Connecting Bus Out */}
            <div className="flex flex-col items-center text-muted">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>

            {/* Decider Output Nodes */}
            <div className="w-full max-w-sm grid grid-cols-2 gap-3 z-10">
              <div
                className={`p-3 rounded-lg border flex flex-col items-center text-center transition-all ${
                  selectedDecision === 'YES'
                    ? 'bg-surface-high border-mint text-cream glow-mint'
                    : 'bg-surface border-surface-highest/40'
                }`}
              >
                <span className="font-mono text-[10px] text-mint font-semibold">BRANCH A</span>
                <span className="font-mono text-sm text-cream font-bold">RETURN YES</span>
                <span className="font-sans text-[11px] text-cream-dim">P halts on X</span>
              </div>

              <div
                className={`p-3 rounded-lg border flex flex-col items-center text-center transition-all ${
                  selectedDecision === 'NO'
                    ? 'bg-surface-high border-mint text-cream glow-mint'
                    : 'bg-surface border-surface-highest/40'
                }`}
              >
                <span className="font-mono text-[10px] text-muted-light font-semibold">BRANCH B</span>
                <span className="font-mono text-sm text-cream font-bold">RETURN NO</span>
                <span className="font-sans text-[11px] text-cream-dim">P loops forever</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-surface-low border border-surface-highest/40 rounded-lg flex items-center justify-between text-muted-light font-mono text-xs">
            <span className="text-cream-dim">Decider premise: Always yields definitive answer in finite time.</span>
            <span className="text-mint">P(X) ∈ &#123;HALT, LOOP&#125;</span>
          </div>
        </div>

        {/* Panel 2: The Inverted Paradox Engine Construction */}
        <div className="xl:col-span-6 bg-surface-lowest border border-surface-highest/50 rounded-xl p-5 lg:p-6 flex flex-col justify-between gap-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 bg-contradiction/20 text-contradiction-bright font-bold rounded-full border border-contradiction/40">
                SCHEMA 02
              </span>
              <span className="font-display text-sm text-cream uppercase font-semibold">
                Adversary : Paradox(P)
              </span>
            </div>
            <span className="font-mono text-[11px] text-contradiction font-semibold">
              SELF-INVERTING WRAPPER
            </span>
          </div>

          {/* Logic Routing Architecture Diagram */}
          <div className="bg-surface-low border border-surface-highest/40 p-5 rounded-lg flex flex-col gap-4 relative">
            <div className="flex items-center justify-between bg-surface p-3 rounded-lg border border-surface-highest/40">
              <span className="font-mono text-xs text-cream font-bold">ADVERSARIAL COUPLING:</span>
              <code className="font-mono text-xs text-mint bg-surface-lowest px-3 py-1 rounded-full border border-surface-highest/50">
                ASK: HALT(P, P)
              </code>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Trap Branch 1 */}
              <div
                className={`p-4 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                  selectedDecision === 'YES'
                    ? 'bg-surface-high border-contradiction glow-red scale-[1.02]'
                    : 'bg-surface border-surface-highest/40 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-mint">IF HALT SAYS:</span>
                  <span className="px-1.5 py-0.5 bg-mint/20 text-mint rounded font-bold">
                    YES (HALTS)
                  </span>
                </div>
                <div className="flex flex-col gap-1 my-1">
                  <span className="font-mono text-[10px] text-muted-light">SUBVERSION TRIGGER</span>
                  <div className="flex items-center gap-1.5 text-contradiction font-bold font-mono text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>FORCE: LOOP FOREVER ∞</span>
                  </div>
                </div>
                <span className="font-sans text-xs text-cream-dim">
                  Intentionally defies prediction by entering <code className="text-cream">while(true)</code>.
                </span>
              </div>

              {/* Trap Branch 2 */}
              <div
                className={`p-4 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                  selectedDecision === 'NO'
                    ? 'bg-surface-high border-contradiction glow-red scale-[1.02]'
                    : 'bg-surface border-surface-highest/40 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-muted-light">IF HALT SAYS:</span>
                  <span className="px-1.5 py-0.5 bg-surface-highest text-cream-dim rounded font-bold">
                    NO (LOOPS)
                  </span>
                </div>
                <div className="flex flex-col gap-1 my-1">
                  <span className="font-mono text-[10px] text-muted-light">SUBVERSION TRIGGER</span>
                  <div className="flex items-center gap-1.5 text-mint font-bold font-mono text-xs">
                    <CheckCircle className="w-4 h-4" />
                    <span>FORCE: STOP IMMEDIATELY ■</span>
                  </div>
                </div>
                <span className="font-sans text-xs text-cream-dim">
                  Intentionally defies prediction by halting at instruction 0.
                </span>
              </div>
            </div>

            <div className="bg-surface-lowest p-3 rounded-lg border border-surface-highest/30 flex items-center gap-2 text-cream-dim">
              <HelpCircle className="w-4 h-4 text-cream shrink-0" />
              <span className="font-sans text-xs">
                The adversary&apos;s sole function: observe what HALT claims it will do, and immediately execute the polar opposite.
              </span>
            </div>
          </div>

          <div className="p-3 bg-surface-low border border-surface-highest/40 rounded-lg flex items-center justify-between text-cream font-mono text-xs">
            <span className="text-muted-light">TARGET QUESTION:</span>
            <span className="text-cream font-bold">WHAT HAPPENS WHEN WE RUN: PARADOX(PARADOX)?</span>
          </div>
        </div>
      </div>

      {/* Interactive Choice Arena */}
      <div className="bg-surface-lowest border border-surface-highest/50 rounded-xl p-6 lg:p-7 flex flex-col gap-6 text-cream shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <span className="font-mono text-xs text-mint uppercase tracking-widest font-semibold">
              Interactive Proof Arena
            </span>
            <h2 className="font-display text-xl text-cream font-bold mt-0.5">
              SELECT THE PREDICTOR&apos;S HYPOTHETICAL VERDICT:
            </h2>
            <p className="font-sans text-xs text-cream-dim mt-1">
              Test both branches of the hypothetical Oracle on its own mirror image. Watch the logic collapse under either decision.
            </p>
          </div>
          <div className="font-mono text-xs text-muted-light bg-surface px-3 py-1 rounded-full border border-surface-highest/50 shrink-0">
            INPUT TARGET: <code className="text-cream font-bold">P = PARADOX</code>
          </div>
        </div>

        {/* Decision Option Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Option A Card */}
          <button
            onClick={() => handleSelectDecision('YES')}
            className={`group text-left p-5 rounded-xl border flex flex-col gap-3 transition-all duration-200 cursor-pointer shadow-sm ${
              selectedDecision === 'YES'
                ? 'bg-surface-high border-contradiction glow-red ring-1 ring-contradiction'
                : 'bg-surface border-surface-highest/50 hover:bg-surface-high hover:border-surface-highest'
            }`}
            type="button"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-surface-highest flex items-center justify-center font-mono text-xs text-cream font-bold group-hover:bg-cream group-hover:text-canvas transition-colors">
                  A
                </span>
                <span className="font-mono text-xs text-muted-light">ASSUMPTION 01</span>
              </div>
              <span
                className={`font-mono text-xs px-2.5 py-0.5 rounded-full ${
                  selectedDecision === 'YES'
                    ? 'bg-contradiction/20 text-contradiction-bright font-bold'
                    : testedDecisions.has('YES')
                    ? 'bg-surface-lowest text-mint border border-mint/30'
                    : 'bg-surface-lowest text-muted-light'
                }`}
              >
                {selectedDecision === 'YES'
                  ? 'ACTIVE VERDICT'
                  : testedDecisions.has('YES')
                  ? 'TESTED ✓'
                  : 'TEST VERDICT'}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-mono text-base text-cream tracking-tight font-bold">
                HALT PREDICTS: YES (WILL HALT)
              </span>
              <p className="font-sans text-xs text-cream-dim">
                The decider evaluates <code className="text-cream font-mono">PARADOX(PARADOX)</code> and affirms that it reaches a terminal halting state.
              </p>
            </div>

            <div className="pt-2 mt-auto flex items-center justify-between text-muted-light font-mono text-xs border-t border-surface-highest/30">
              <span>PREDICTOR OUTCOME: HALTS</span>
              <ArrowRight className="w-4 h-4 text-mint group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Option B Card */}
          <button
            onClick={() => handleSelectDecision('NO')}
            className={`group text-left p-5 rounded-xl border flex flex-col gap-3 transition-all duration-200 cursor-pointer shadow-sm ${
              selectedDecision === 'NO'
                ? 'bg-surface-high border-contradiction glow-red ring-1 ring-contradiction'
                : 'bg-surface border-surface-highest/50 hover:bg-surface-high hover:border-surface-highest'
            }`}
            type="button"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-surface-highest flex items-center justify-center font-mono text-xs text-cream font-bold group-hover:bg-cream group-hover:text-canvas transition-colors">
                  B
                </span>
                <span className="font-mono text-xs text-muted-light">ASSUMPTION 02</span>
              </div>
              <span
                className={`font-mono text-xs px-2.5 py-0.5 rounded-full ${
                  selectedDecision === 'NO'
                    ? 'bg-contradiction/20 text-contradiction-bright font-bold'
                    : testedDecisions.has('NO')
                    ? 'bg-surface-lowest text-mint border border-mint/30'
                    : 'bg-surface-lowest text-muted-light'
                }`}
              >
                {selectedDecision === 'NO'
                  ? 'ACTIVE VERDICT'
                  : testedDecisions.has('NO')
                  ? 'TESTED ✓'
                  : 'TEST VERDICT'}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-mono text-base text-cream tracking-tight font-bold">
                HALT PREDICTS: NO (WILL LOOP)
              </span>
              <p className="font-sans text-xs text-cream-dim">
                The decider evaluates <code className="text-cream font-mono">PARADOX(PARADOX)</code> and affirms that it enters a non-terminating infinite sequence.
              </p>
            </div>

            <div className="pt-2 mt-auto flex items-center justify-between text-muted-light font-mono text-xs border-t border-surface-highest/30">
              <span>PREDICTOR OUTCOME: LOOPS</span>
              <ArrowRight className="w-4 h-4 text-mint group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Contradiction Consequence Walkthrough Panel */}
      {evaluation && (
        <div className="bg-surface-lowest border border-contradiction/50 rounded-xl p-6 lg:p-7 flex flex-col gap-6 text-cream shadow-2xl animate-fadeIn">
          {/* Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-low p-4 rounded-lg border border-surface-highest/40">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-contradiction animate-ping"></span>
              <span className="font-mono text-xs text-cream font-bold">
                DIAGNOSTIC STATUS: {evaluation.headline}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-3 py-1 rounded-full bg-surface text-cream border border-surface-highest/40">
                PROOF REGISTER:{' '}
                <span className="text-contradiction-bright font-bold">
                  {selectedDecision === 'YES' ? 'HALT → ACT: LOOP' : 'LOOP → ACT: HALT'}
                </span>
              </span>
              <span className="font-mono text-xs px-3 py-1 rounded-full bg-contradiction/20 text-contradiction-bright border border-contradiction/40 font-bold">
                REDUCTIO AD ABSURDUM
              </span>
            </div>
          </div>

          {/* 3 Sequential Consequence Walkthrough Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {evaluation.steps.map((st) => (
              <div
                key={st.stepNumber}
                className="bg-surface border border-surface-highest/50 p-4 rounded-xl flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-center justify-between text-muted-light font-mono text-xs">
                  <span>STEP 0{st.stepNumber}</span>
                  <span className="text-mint font-bold">{st.codeSnippet}</span>
                </div>
                <span className="font-mono text-xs text-cream font-bold">{st.title}</span>
                <p className="font-sans text-xs text-cream-dim leading-relaxed">{st.description}</p>
              </div>
            ))}
          </div>

          {/* Massive Contradiction Callout Banner */}
          <div className="p-6 rounded-xl bg-surface border border-contradiction/40 flex flex-col gap-4 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-contradiction/20 border border-contradiction/50 flex items-center justify-center text-contradiction shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-xs text-contradiction-bright tracking-widest uppercase font-bold">
                    ● LOGICAL CONTRADICTION DETECTED
                  </span>
                  <h3 className="font-display text-xl text-cream font-bold mt-0.5">
                    {evaluation.headline}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-surface-low px-4 py-2 rounded-lg border border-surface-highest/40 flex flex-col items-center font-mono">
                  <span className="text-[10px] text-muted-light">BOOLEAN STATE</span>
                  <span className="text-sm font-bold text-contradiction">
                    {evaluation.booleanState}
                  </span>
                </div>
                <div className="bg-surface-low px-4 py-2 rounded-lg border border-surface-highest/40 flex flex-col items-center font-mono">
                  <span className="text-[10px] text-muted-light">THEOREM VERDICT</span>
                  <span className="text-sm font-bold text-cream">CONTRADICTION</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-surface-lowest rounded-lg border border-surface-highest/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <p className="font-sans text-xs text-cream-dim/95 leading-relaxed max-w-3xl">
                {evaluation.explanation}
              </p>

              <button
                onClick={handleReset}
                className="shrink-0 px-3 py-1.5 rounded-full bg-surface border border-surface-highest/50 hover:bg-surface-high text-muted-light hover:text-cream font-mono text-xs flex items-center gap-1.5 cursor-pointer"
                type="button"
              >
                <RotateCcw className="w-3 h-3" />
                <span>TRY OTHER BRANCH</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Banner When Both Branches Explored */}
      {bothTested && (
        <div className="bg-surface-low border border-mint/50 rounded-xl p-6 lg:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl animate-fadeIn">
          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-mint" />
              <span className="font-mono text-xs text-mint uppercase tracking-wider font-semibold">
                BOTH BRANCHES COLLAPSE INTO CONTRADICTION
              </span>
            </div>
            <h2 className="font-display text-2xl lg:text-3xl text-cream font-bold">
              NO UNIVERSAL HALT PREDICTOR CAN EXIST
            </h2>
            <p className="font-sans text-xs text-cream-dim leading-relaxed">
              The problem is not a lack of computing power, memory, or sophisticated AI. A single universal procedure that correctly decides termination for every possible arbitrary program and input is mathematically impossible.
            </p>
          </div>

          <button
            onClick={onProceedToReality}
            className="shrink-0 px-6 py-3.5 rounded-full bg-cream hover:bg-cream-light text-canvas font-mono text-xs font-bold tracking-wide transition-all glow-cream hover:glow-mint shadow-xl flex items-center gap-2 cursor-pointer"
            type="button"
          >
            <span>EXPLORE PRACTICAL BOUNDS: REALITY</span>
            <ArrowRight className="w-4 h-4 text-mint" />
          </button>
        </div>
      )}
    </div>
  );
};
