import React, { useState } from 'react';
import {
  Fuel,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Play,
} from 'lucide-react';
import {
  CASE_STUDY_LINEAR_GAS,
  CASE_STUDY_QUADRATIC_GAS,
  CASE_STUDY_FIXED_GAS,
  CASE_STUDY_EXPENSIVE_POINT,
  calculateComplexityMetrics,
} from '../../data/gasData';
import type { ComplexityClass } from '../../data/gasData';

interface Stage03RealityProps {
  onRestartSimulation: () => void;
}

export const Stage03Reality: React.FC<Stage03RealityProps> = ({
  onRestartSimulation,
}) => {
  const [mode, setMode] = useState<'theoretical' | 'casestudy'>('casestudy');
  const [complexity, setComplexity] = useState<ComplexityClass>('on2');
  const [inputN, setInputN] = useState<number>(100);

  // Dynamic Fuel Cell / Gas Meter state
  const [gasInitialCap] = useState<number>(100_000);
  const [currentGas, setCurrentGas] = useState<number>(32_400);
  const [isBurningGas, setIsBurningGas] = useState<boolean>(false);
  const [simulationScenario, setSimulationScenario] = useState<'A' | 'B' | null>(null);

  const metrics = calculateComplexityMetrics(complexity, inputN);

  // Trigger simulated gas consumption animation
  const runGasBurnSimulation = (scenario: 'A' | 'B') => {
    setSimulationScenario(scenario);
    setIsBurningGas(true);
    setCurrentGas(gasInitialCap);

    let current = gasInitialCap;
    // Both scenarios consume gas until 0 (Out Of Gas threshold)
    const target = 0;
    const interval = window.setInterval(() => {
      current -= 5000;
      if (current <= target) {
        current = target;
        clearInterval(interval);
        setIsBurningGas(false);
      }
      setCurrentGas(current);
    }, 40);
  };

  const resetFuelCell = () => {
    setIsBurningGas(false);
    setCurrentGas(32_400);
    setSimulationScenario(null);
  };

  const gasPercentage = Math.max(0, Math.min(100, (currentGas / gasInitialCap) * 100));
  const totalSegments = 30;
  const activeSegments = Math.round((gasPercentage / 100) * totalSegments);

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn pb-12">
      {/* Top Manifesto Header Strip */}
      <div className="bg-surface-low border border-surface-highest/60 rounded-xl p-6 lg:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-md">
        <div className="flex flex-col gap-2 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-mint tracking-widest uppercase font-semibold">
              STAGE 03 // PRAGMATIC SYNTHESIS
            </span>
            <span className="text-muted-dark font-mono text-xs">/</span>
            <span className="font-mono text-xs text-cream-dim">
              THEORETICAL LIMITS MEET SYSTEM BOUNDS
            </span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl text-cream font-bold tracking-tight">
            WE CANNOT SOLVE HALT. WE CAN CONTROL EXECUTION.
          </h1>
          <p className="font-sans text-sm text-cream-dim/90 leading-relaxed">
            Turing proved algorithmic prediction of arbitrary termination is mathematically impossible. Therefore, decentralized state engines like the Ethereum Virtual Machine (EVM) bound execution using metered computational resource limits (gas).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 bg-surface px-4 py-2.5 rounded-lg border border-surface-highest/50 self-start lg:self-center">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#25231F"
                strokeWidth="3.5"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#4EBA86"
                strokeDasharray="88, 100"
                strokeDashoffset="26"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <span className="absolute font-mono text-xs text-cream font-bold">30M</span>
          </div>
          <div className="flex flex-col font-mono text-xs">
            <span className="text-[10px] text-muted-light uppercase">BLOCK GAS CEILING</span>
            <span className="text-mint font-bold">30,000,000 GAS</span>
            <span className="text-muted text-[10px]">TARGET: 15,000,000</span>
          </div>
        </div>
      </div>

      {/* Master Physical Fuel Cell / Gas Meter Panel */}
      <div className="bg-surface-lowest border border-surface-highest/50 rounded-xl p-5 lg:p-6 flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Fuel className="w-5 h-5 text-mint" />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-muted-light uppercase tracking-wider">
                DYNAMIC RESOURCE METER
              </span>
              <span className="font-display text-base text-cream font-bold">
                RUNTIME GAS FUEL CELL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {simulationScenario && (
              <span className="px-2.5 py-1 rounded-full bg-contradiction/15 border border-contradiction/40 text-contradiction-bright font-mono text-xs font-semibold">
                BURNING: SCENARIO {simulationScenario}
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint font-mono text-xs font-semibold">
              BURN RATE: 21,000 BASE + 3 GAS/OPCODE
            </span>
            <button
              onClick={resetFuelCell}
              className="p-1.5 rounded-full bg-surface border border-surface-highest/50 hover:bg-surface-high text-muted-light hover:text-cream transition-colors"
              title="Reset fuel cell to default"
              type="button"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 30-Segment Hardware LED Fuel Rail */}
        <div className="bg-surface-low border border-surface-highest/40 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex justify-between items-end">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl lg:text-3xl text-cream font-bold">
                {currentGas.toLocaleString()}
              </span>
              <span className="font-mono text-xs text-muted-light">
                / {gasInitialCap.toLocaleString()} GAS REMAINING
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  currentGas === 0
                    ? 'bg-contradiction'
                    : isBurningGas
                    ? 'bg-mint animate-ping'
                    : 'bg-mint'
                }`}
              ></span>
              <span
                className={`text-sm font-bold ${
                  currentGas === 0 ? 'text-contradiction' : 'text-mint'
                }`}
              >
                {currentGas === 0 ? 'OUT OF GAS' : `${gasPercentage.toFixed(1)}%`}
              </span>
            </div>
          </div>

          {/* Segmented LED Rail */}
          <div className="grid grid-cols-15 sm:grid-cols-30 gap-1 h-6 w-full bg-surface-lowest p-1 rounded border border-surface-highest/40">
            {Array.from({ length: totalSegments }).map((_, idx) => {
              const isActive = idx < activeSegments;
              const isExhausted = currentGas === 0;
              return (
                <div
                  key={idx}
                  className={`rounded-xs h-full transition-all duration-100 ${
                    isExhausted
                      ? 'bg-contradiction/30 border border-contradiction/50'
                      : isActive
                      ? 'bg-mint shadow-[0_0_6px_rgba(112,219,164,0.3)]'
                      : 'bg-surface-high'
                  }`}
                />
              );
            })}
          </div>

          <div className="flex justify-between items-center font-mono text-[10px] text-muted-light pt-1">
            <span className="text-contradiction-bright">0 (EXHAUSTION: REVERT STATE)</span>
            <span className="text-cream-dim">SAFE BUFFER: &gt; 21,000 GAS</span>
            <span>{gasInitialCap.toLocaleString()} (GAS LIMIT BUDGET)</span>
          </div>
        </div>
      </div>

      {/* Complexity & Case Study Laboratory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Controls & Big-O Selector */}
        <div className="lg:col-span-4 bg-surface-lowest border border-surface-highest/50 rounded-xl p-5 flex flex-col justify-between gap-5 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Mode Switch: Theoretical vs Case-Study */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-xs text-muted-light uppercase">
                DATA ENVIRONMENT
              </span>
              <div className="grid grid-cols-2 gap-1 bg-surface-low p-1 rounded-lg border border-surface-highest/50">
                <button
                  onClick={() => setMode('casestudy')}
                  className={`py-1.5 rounded-md font-mono text-xs font-semibold transition-all ${
                    mode === 'casestudy'
                      ? 'bg-cream text-canvas shadow-sm'
                      : 'text-cream-dim hover:text-white'
                  }`}
                  type="button"
                >
                  CASE-STUDY DATA
                </button>
                <button
                  onClick={() => setMode('theoretical')}
                  className={`py-1.5 rounded-md font-mono text-xs font-semibold transition-all ${
                    mode === 'theoretical'
                      ? 'bg-cream text-canvas shadow-sm'
                      : 'text-cream-dim hover:text-white'
                  }`}
                  type="button"
                >
                  THEORETICAL MODE
                </button>
              </div>
            </div>

            {/* Complexity Class Buttons */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs text-muted-light">
                COMPLEXITY CLASS [BIG-O]
              </label>
              <div className="grid grid-cols-3 gap-1 bg-surface-low p-1 rounded-full border border-surface-highest/40 text-center">
                {(['o1', 'on', 'on2'] as ComplexityClass[]).map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setComplexity(cls)}
                    className={`py-1 rounded-full font-mono text-xs transition-all ${
                      complexity === cls
                        ? 'bg-cream text-canvas font-bold shadow-sm'
                        : 'text-cream-dim hover:text-white'
                    }`}
                    type="button"
                  >
                    {cls === 'o1' ? 'O(1)' : cls === 'on' ? 'O(n)' : 'O(n²)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Magnitude Selector */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-muted-light">INPUT MAGNITUDE (N)</span>
                <span className="text-mint font-bold">{inputN} ITEMS</span>
              </div>
              <div className="grid grid-cols-5 gap-1 bg-surface-low p-1 rounded-full border border-surface-highest/40 text-center font-mono text-xs">
                {[10, 20, 50, 100, 200].map((nVal) => (
                  <button
                    key={nVal}
                    onClick={() => setInputN(nVal)}
                    className={`py-1 rounded-full transition-all ${
                      inputN === nVal
                        ? 'bg-cream text-canvas font-bold shadow-sm'
                        : 'text-cream-dim hover:text-white'
                    }`}
                    type="button"
                  >
                    {nVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculation Telemetry Breakdown */}
            <div className="bg-surface-low border border-surface-highest/40 rounded-lg p-3 flex flex-col gap-2 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-light">EVM Operations:</span>
                <span className="text-cream font-bold">
                  {metrics.operations.toLocaleString()} ops
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-light">Gas Consumed:</span>
                <span
                  className={
                    metrics.exceedsCeiling
                      ? 'text-contradiction-bright font-bold'
                      : 'text-mint font-bold'
                  }
                >
                  {metrics.estimatedGas.toLocaleString()} GAS
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-surface-highest/30">
                <span className="text-muted-light">Block Ceiling Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    metrics.exceedsCeiling
                      ? 'bg-contradiction/20 text-contradiction-bright border border-contradiction/40'
                      : 'bg-mint/20 text-mint border border-mint/40'
                  }`}
                >
                  {metrics.statusLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-center font-mono text-[11px] text-muted-light">
            <span>Deterministic Yellow Paper execution model</span>
            <span className="text-cream-dim">Big-O describes growth; Gas measures real cost.</span>
          </div>
        </div>

        {/* Right Column: Comparative Graph Bay (Theoretical vs Case Study) */}
        <div className="lg:col-span-8 bg-surface-lowest border border-surface-highest/50 rounded-xl p-5 flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-mint" />
              <span className="font-display text-base text-cream font-semibold">
                {mode === 'casestudy'
                  ? 'CASE-STUDY MEASURED GAS EXPENDITURE'
                  : 'THEORETICAL OPERATION GROWTH VS GAS CEILING'}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-mint"></span>
                <span className="text-cream-dim">{complexity.toUpperCase()} Curve</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-contradiction border-dashed"></span>
                <span className="text-contradiction-bright">10M Ceiling</span>
              </div>
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="relative w-full h-64 bg-surface-low border border-surface-highest/40 rounded-lg p-3 flex items-center justify-center overflow-hidden">
            {mode === 'casestudy' ? (
              /* Case Study Data Display */
              <div className="w-full h-full flex flex-col justify-between">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  {complexity === 'o1' &&
                    CASE_STUDY_FIXED_GAS.map((pt) => (
                      <div
                        key={pt.n}
                        className="bg-surface p-2 rounded border border-surface-highest/40 flex flex-col"
                      >
                        <span className="text-muted-light">N = {pt.n}</span>
                        <span className="text-cream font-bold">{pt.gas.toLocaleString()} gas</span>
                        <span className="text-[10px] text-mint">{pt.notes}</span>
                      </div>
                    ))}

                  {complexity === 'on' &&
                    CASE_STUDY_LINEAR_GAS.map((pt) => (
                      <div
                        key={pt.n}
                        className="bg-surface p-2 rounded border border-surface-highest/40 flex flex-col"
                      >
                        <span className="text-muted-light">N = {pt.n}</span>
                        <span className="text-mint font-bold">{pt.gas.toLocaleString()} gas</span>
                        <span className="text-[10px] text-cream-dim">Linear step: ~190 gas</span>
                      </div>
                    ))}

                  {complexity === 'on2' &&
                    CASE_STUDY_QUADRATIC_GAS.map((pt) => (
                      <div
                        key={pt.n}
                        className={`p-2 rounded border flex flex-col ${
                          pt.isAnomalous
                            ? 'bg-contradiction/15 border-contradiction/40'
                            : 'bg-surface border-surface-highest/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-muted-light">N = {pt.n}</span>
                          {pt.isAnomalous && (
                            <span className="text-[9px] px-1 bg-contradiction text-canvas rounded font-bold">
                              ANOMALOUS
                            </span>
                          )}
                        </div>
                        <span
                          className={`font-bold ${
                            pt.isAnomalous ? 'text-contradiction-bright' : 'text-cream'
                          }`}
                        >
                          {pt.gas.toLocaleString()} gas
                        </span>
                        <span className="text-[10px] text-muted-light truncate">
                          {pt.notes ?? 'Polynomial surge'}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Additional case study insight badge */}
                <div className="p-2.5 bg-surface-lowest rounded border border-surface-highest/30 flex items-center justify-between font-mono text-xs">
                  <span className="text-cream-dim">
                    Finite Expensive Benchmark: N = {CASE_STUDY_EXPENSIVE_POINT.n}
                  </span>
                  <span className="text-mint font-bold">
                    {CASE_STUDY_EXPENSIVE_POINT.gas.toLocaleString()} GAS (COMPLETED)
                  </span>
                </div>
              </div>
            ) : (
              /* Theoretical SVG Curve Canvas */
              <svg className="w-full h-full" viewBox="0 0 600 200">
                {/* Horizontal reference grid lines */}
                <line x1="50" y1="20" x2="580" y2="20" stroke="#25231F" strokeDasharray="3 3" />
                <line x1="50" y1="65" x2="580" y2="65" stroke="#25231F" strokeDasharray="3 3" />
                <line x1="50" y1="110" x2="580" y2="110" stroke="#25231F" strokeDasharray="3 3" />
                <line x1="50" y1="155" x2="580" y2="155" stroke="#25231F" strokeDasharray="3 3" />
                <line x1="50" y1="180" x2="580" y2="180" stroke="#353534" strokeWidth="1.5" />

                {/* Y-Axis Labels */}
                <text x="40" y="24" fill="#7E7768" fontFamily="JetBrains Mono" fontSize="9" textAnchor="end">
                  12M
                </text>
                <text x="40" y="69" fill="#7E7768" fontFamily="JetBrains Mono" fontSize="9" textAnchor="end">
                  10M
                </text>
                <text x="40" y="114" fill="#7E7768" fontFamily="JetBrains Mono" fontSize="9" textAnchor="end">
                  6M
                </text>
                <text x="40" y="159" fill="#7E7768" fontFamily="JetBrains Mono" fontSize="9" textAnchor="end">
                  2M
                </text>

                {/* 10M Gas Ceiling Line */}
                <line x1="50" y1="65" x2="580" y2="65" stroke="#E05656" strokeDasharray="6 4" strokeWidth="1.5" />
                <text x="500" y="58" fill="#E05656" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle">
                  BLOCK CEILING: 10,000,000
                </text>

                {/* Active Dynamic Curve */}
                {complexity === 'o1' && (
                  <path d="M 50 175 L 580 175" fill="none" stroke="#4EBA86" strokeWidth="3" />
                )}
                {complexity === 'on' && (
                  <path d="M 50 180 L 580 120" fill="none" stroke="#4EBA86" strokeWidth="3" />
                )}
                {complexity === 'on2' && (
                  <>
                    <path
                      d="M 50 180 C 180 175, 320 140, 420 65 S 500 15, 540 5"
                      fill="none"
                      stroke="#4EBA86"
                      strokeWidth="3.5"
                    />
                    <circle cx="420" cy="65" r="5" fill="#E05656" className="animate-pulse" />
                    <text x="420" y="85" fill="#E05656" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" fontWeight="bold">
                      CEILING BREACH (N ~ 72)
                    </text>
                  </>
                )}

                {/* X-Axis Labels */}
                <text x="50" y="195" fill="#7E7768" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle">0</text>
                <text x="180" y="195" fill="#7E7768" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle">50</text>
                <text x="310" y="195" fill="#7E7768" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle">100</text>
                <text x="440" y="195" fill="#7E7768" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle">150</text>
                <text x="570" y="195" fill="#7E7768" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle">200</text>
              </svg>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-muted-light font-mono text-xs gap-1">
            <span>
              Observation: Computational work scales with algorithm structure, bounded by block limit.
            </span>
            <span className="text-mint font-semibold">REVERT ON EXHAUSTION</span>
          </div>
        </div>
      </div>

      {/* The Central Academic Demonstration: Case A vs Case B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Case A: Finite but Expensive Program */}
        <div className="bg-surface-lowest border border-surface-highest/50 rounded-xl p-5 flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-surface font-mono text-[10px] text-cream border border-surface-highest/40">
                SCENARIO 01
              </span>
              <span className="font-mono text-xs text-mint font-semibold">
                TERMINATES NATURALLY (IN THEORY)
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-display text-base text-cream font-bold">
                CASE A: FINITE BUT EXPENSIVE PROGRAM
              </h3>
              <p className="font-sans text-xs text-cream-dim leading-relaxed">
                A valid deterministic algorithm (e.g., sorting matrix). It is mathematically proven to terminate at step 500,000.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-surface-low border border-surface-highest/30 p-2.5 rounded font-mono text-xs">
              <div className="flex flex-col">
                <span className="text-muted-light text-[10px]">Theoretical Nature</span>
                <span className="text-mint font-bold">Natural Exit @ 500k ops</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-light text-[10px]">Allocated Gas</span>
                <span className="text-cream font-bold">100,000 GAS max</span>
              </div>
            </div>
          </div>

          {/* Outcome Action */}
          <div className="p-3 rounded-lg bg-surface border border-surface-highest/40 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-light uppercase font-semibold">
                EXECUTION SIMULATION
              </span>
              <button
                onClick={() => runGasBurnSimulation('A')}
                className="px-3 py-1 rounded-full bg-mint text-canvas font-mono text-xs font-bold hover:bg-mint-light transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                type="button"
              >
                <Play className="w-3 h-3 fill-canvas" />
                <span>SIMULATE CASE A</span>
              </button>
            </div>

            <div className="px-3 py-2 rounded bg-contradiction/15 border border-contradiction/30 text-contradiction-bright font-mono text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-contradiction" />
                <span>OUT OF GAS — HALTED ABNORMALLY</span>
              </div>
              <span className="opacity-80 text-[10px]">STEP 33,333</span>
            </div>

            <p className="font-sans text-xs text-cream-dim">
              Outcome: Fuel exhausted before terminal condition was reached. State transitions reverted.
            </p>
          </div>
        </div>

        {/* Case B: Infinite Loop Program */}
        <div className="bg-surface-lowest border border-surface-highest/50 rounded-xl p-5 flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-surface font-mono text-[10px] text-contradiction-bright border border-surface-highest/40">
                SCENARIO 02
              </span>
              <span className="font-mono text-xs text-contradiction font-semibold">
                NEVER HALTS (TRUE LOOP)
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-display text-base text-cream font-bold">
                CASE B: INFINITE MALICIOUS LOOP
              </h3>
              <p className="font-sans text-xs text-cream-dim leading-relaxed">
                An adversarial non-terminating routine: <code className="font-mono text-contradiction">while(true) &#123; SLOAD; &#125;</code> designed to stall nodes indefinitely.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-surface-low border border-surface-highest/30 p-2.5 rounded font-mono text-xs">
              <div className="flex flex-col">
                <span className="text-muted-light text-[10px]">Theoretical Nature</span>
                <span className="text-contradiction font-bold">Non-Terminating (∞)</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-light text-[10px]">Allocated Gas</span>
                <span className="text-cream font-bold">100,000 GAS max</span>
              </div>
            </div>
          </div>

          {/* Outcome Action */}
          <div className="p-3 rounded-lg bg-surface border border-surface-highest/40 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-light uppercase font-semibold">
                EXECUTION SIMULATION
              </span>
              <button
                onClick={() => runGasBurnSimulation('B')}
                className="px-3 py-1 rounded-full bg-contradiction text-canvas font-mono text-xs font-bold hover:bg-contradiction-bright transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                type="button"
              >
                <Play className="w-3 h-3 fill-canvas" />
                <span>SIMULATE CASE B</span>
              </button>
            </div>

            <div className="px-3 py-2 rounded bg-contradiction/15 border border-contradiction/30 text-contradiction-bright font-mono text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-contradiction" />
                <span>OUT OF GAS — HALTED ABNORMALLY</span>
              </div>
              <span className="opacity-80 text-[10px]">STEP 33,333</span>
            </div>

            <p className="font-sans text-xs text-cream-dim">
              Outcome: Fuel exhausted at the exact same physical threshold. State transitions reverted.
            </p>
          </div>
        </div>
      </div>

      {/* Core Academic Synthesis Banner */}
      <div className="bg-surface-lowest border border-surface-highest/50 rounded-xl p-6 lg:p-8 flex flex-col items-center text-center gap-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 z-10">
          <CheckCircle2 className="w-5 h-5 text-mint" />
          <span className="font-mono text-xs text-mint tracking-widest uppercase font-semibold">
            Fundamental Axiom of Pragmatic Computing
          </span>
        </div>

        <div className="flex flex-col gap-2 max-w-4xl z-10">
          <h2 className="font-display text-2xl lg:text-3xl text-cream font-bold tracking-tight">
            SAME EXECUTION RESULT (OUT OF GAS) ≠ SAME PROGRAM BEHAVIOR
          </h2>
          <p className="font-sans text-sm text-cream-dim/90 max-w-2xl mx-auto leading-relaxed">
            From the vantage point of the physical machine, a program that would finish in 100,001 steps is indistinguishable from a paradox loop that would run forever.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 z-10">
          <div className="px-5 py-2.5 rounded-full bg-mint/15 border border-mint/40 text-mint font-mono text-xs font-bold shadow-sm">
            GAS BOUNDS EXECUTION. IT DOES NOT SOLVE THE HALTING PROBLEM.
          </div>

          <button
            onClick={onRestartSimulation}
            className="px-6 py-2.5 rounded-full bg-cream hover:bg-white text-canvas font-mono text-xs font-bold tracking-wide transition-all shadow-md flex items-center gap-2 cursor-pointer"
            type="button"
          >
            <RotateCcw className="w-4 h-4 text-canvas" />
            <span>RESTART SIMULATION</span>
          </button>
        </div>
      </div>
    </div>
  );
};
