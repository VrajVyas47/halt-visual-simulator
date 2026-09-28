import React, { useState, useEffect, useRef } from 'react';
import {
  Fuel,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  StepForward,
  Terminal,
  Zap,
  Cpu,
  Layers,
  Check,
  Sliders,
} from 'lucide-react';
import {
  CASE_STUDY_LINEAR_GAS,
  CASE_STUDY_QUADRATIC_GAS,
  CASE_STUDY_FIXED_GAS,
  CASE_STUDY_EXPENSIVE_POINT,
  calculateComplexityMetrics,
} from '../../data/gasData';
import type { ComplexityClass } from '../../data/gasData';
import { soundManager } from '../../utils/audio';

interface Stage03RealityProps {
  onRestartSimulation: () => void;
}

interface OpcodeLogEntry {
  id: number;
  op: string;
  cost: number;
  gasRemaining: number;
}

export const Stage03Reality: React.FC<Stage03RealityProps> = ({
  onRestartSimulation,
}) => {
  // Mode & Complexity State
  const [mode, setMode] = useState<'theoretical' | 'casestudy'>('casestudy');
  const [complexity, setComplexity] = useState<ComplexityClass>('on2');
  const [inputN, setInputN] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'chart' | 'terminal'>('chart');
  const [chartScale, setChartScale] = useState<'auto' | 'block'>('auto');

  // Active Case Study dataset for current complexity
  const activeCaseStudyPoints = React.useMemo(() => {
    if (complexity === 'o1') return CASE_STUDY_FIXED_GAS;
    if (complexity === 'on') return CASE_STUDY_LINEAR_GAS.filter((p) => p.n <= 200);
    return CASE_STUDY_QUADRATIC_GAS;
  }, [complexity]);

  // Max Y calculation based on scale mode and complexity
  const chartMaxY = React.useMemo(() => {
    if (chartScale === 'block') return 10_000_000;
    if (complexity === 'o1') return 50_000;
    if (complexity === 'on') return 80_000;
    return 3_500_000;
  }, [chartScale, complexity]);

  // Points for SVG path
  const curvePoints = React.useMemo(() => {
    if (mode === 'casestudy') {
      return activeCaseStudyPoints.map((pt) => ({
        n: pt.n,
        gas: 21000 + pt.gas,
        notes: pt.notes,
        isAnomalous: pt.isAnomalous,
      }));
    } else {
      const nSteps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 100, 120, 140, 160, 180, 200];
      return nSteps.map((nVal) => {
        let gas = 21000;
        if (complexity === 'o1') gas += 1421;
        else if (complexity === 'on') gas += nVal * 190;
        else if (complexity === 'on2') gas += nVal * nVal * 194;
        return { n: nVal, gas, isAnomalous: false };
      });
    }
  }, [mode, complexity, activeCaseStudyPoints]);

  // Master Fuel Cell / Gas Budget state
  const [gasInitialCap, setGasInitialCap] = useState<number>(100_000);
  const [currentGas, setCurrentGas] = useState<number>(100_000);
  const [isBurningGas, setIsBurningGas] = useState<boolean>(false);
  const [simulationScenario, setSimulationScenario] = useState<string | null>(null);

  // Complexity Lab EVM Simulation State
  const [labStatus, setLabStatus] = useState<'idle' | 'running' | 'paused' | 'success' | 'revert'>('idle');
  const [labProgress, setLabProgress] = useState<number>(0); // 0 to 100%
  const [labOpsDone, setLabOpsDone] = useState<number>(0);
  const [labGasUsed, setLabGasUsed] = useState<number>(0);
  const [labLogs, setLabLogs] = useState<OpcodeLogEntry[]>([]);
  const [labSpeed, setLabSpeed] = useState<number>(1); // 1x, 5x, 20x
  const labTimerRef = useRef<number | null>(null);
  const terminalScrollRef = useRef<HTMLDivElement | null>(null);

  // Case A vs Case B Duel Simulator State
  const [duelGasLimit, setDuelGasLimit] = useState<number>(100_000);
  const [caseAStatus, setCaseAStatus] = useState<'idle' | 'running' | 'completed' | 'reverted'>('idle');
  const [caseBStatus, setCaseBStatus] = useState<'idle' | 'running' | 'reverted'>('idle');
  const [caseASteps, setCaseASteps] = useState<number>(0);
  const [caseBSteps, setCaseBSteps] = useState<number>(0);
  const [caseAGasSpent, setCaseAGasSpent] = useState<number>(0);
  const [caseBGasSpent, setCaseBGasSpent] = useState<number>(0);
  const duelTimerRef = useRef<number | null>(null);

  const metrics = calculateComplexityMetrics(complexity, inputN, gasInitialCap);

  // Auto-scroll terminal log internally without moving window or parent scroll
  useEffect(() => {
    if (viewMode === 'terminal' && terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [labLogs.length, viewMode]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (labTimerRef.current) clearInterval(labTimerRef.current);
      if (duelTimerRef.current) clearInterval(duelTimerRef.current);
    };
  }, []);

  // Reset Lab Simulation when inputs change
  useEffect(() => {
    resetLabSimulation();
  }, [complexity, inputN, gasInitialCap]);

  // Reset Fuel Cell
  const resetFuelCell = () => {
    setIsBurningGas(false);
    setCurrentGas(gasInitialCap);
    setSimulationScenario(null);
  };

  // Update Gas Budget
  const handleSetGasBudget = (newCap: number) => {
    setGasInitialCap(newCap);
    setCurrentGas(newCap);
    setIsBurningGas(false);
    setSimulationScenario(null);
  };

  // ==========================================
  // 1. COMPLEXITY LAB SIMULATOR (EVM RUNNER)
  // ==========================================
  const resetLabSimulation = () => {
    if (labTimerRef.current) clearInterval(labTimerRef.current);
    setLabStatus('idle');
    setLabProgress(0);
    setLabOpsDone(0);
    setLabGasUsed(0);
    setLabLogs([]);
    setCurrentGas(gasInitialCap);
    setIsBurningGas(false);
  };

  const sampleOpcodes = [
    { op: 'PUSH1 0x01', cost: 3 },
    { op: 'ADD', cost: 3 },
    { op: 'DUP1', cost: 3 },
    { op: 'SWAP1', cost: 3 },
    { op: 'SLOAD', cost: 2100 },
    { op: 'MSTORE', cost: 6 },
    { op: 'JUMPI', cost: 10 },
  ];

  const runLabSimulation = () => {
    if (labStatus === 'running') {
      // Pause
      if (labTimerRef.current) clearInterval(labTimerRef.current);
      setLabStatus('paused');
      setIsBurningGas(false);
      return;
    }

    setLabStatus('running');
    setIsBurningGas(true);
    setSimulationScenario(`EVM ${complexity.toUpperCase()} (N=${inputN})`);

    const totalTargetOps = metrics.operations;
    const baseGas = 21000;
    const gasPerOp = complexity === 'o1' ? 1421 : complexity === 'on' ? 190 : 194;
    const stepIncrement = Math.max(1, Math.floor(totalTargetOps / (labSpeed === 20 ? 5 : labSpeed === 5 ? 25 : 80)));
    const intervalMs = labSpeed === 20 ? 20 : labSpeed === 5 ? 50 : 80;

    let currentOps = labOpsDone;
    let currentGasBurned = labGasUsed === 0 ? baseGas : labGasUsed;

    if (currentOps === 0) {
      setLabLogs([
        {
          id: 0,
          op: 'TX INITIATE [BASE_FEE]',
          cost: 21000,
          gasRemaining: Math.max(0, gasInitialCap - 21000),
        },
      ]);
      soundManager.playStepTick();
    }

    labTimerRef.current = window.setInterval(() => {
      currentOps += stepIncrement;
      if (currentOps > totalTargetOps) currentOps = totalTargetOps;

      currentGasBurned = baseGas + currentOps * gasPerOp;
      const gasLeft = Math.max(0, gasInitialCap - currentGasBurned);

      setLabOpsDone(currentOps);
      setLabGasUsed(currentGasBurned);
      setLabProgress(Math.min(100, Math.round((currentOps / totalTargetOps) * 100)));
      setCurrentGas(gasLeft);

      // Append random realistic opcode log
      const randomOp = sampleOpcodes[Math.floor(Math.random() * sampleOpcodes.length)];
      setLabLogs((prev) => [
        ...prev.slice(-30),
        {
          id: Date.now() + Math.random(),
          op: `${randomOp.op} [ITER #${currentOps}]`,
          cost: randomOp.cost,
          gasRemaining: gasLeft,
        },
      ]);
      soundManager.playStepTick();

      // Check Out Of Gas
      if (currentGasBurned >= gasInitialCap && currentOps < totalTargetOps) {
        if (labTimerRef.current) clearInterval(labTimerRef.current);
        setLabStatus('revert');
        setIsBurningGas(false);
        setCurrentGas(0);
        soundManager.playWarningTone();
        return;
      }

      // Check Normal Completion
      if (currentOps >= totalTargetOps) {
        if (labTimerRef.current) clearInterval(labTimerRef.current);
        if (currentGasBurned > gasInitialCap) {
          setLabStatus('revert');
          setCurrentGas(0);
          soundManager.playWarningTone();
        } else {
          setLabStatus('success');
          soundManager.playHaltChime();
        }
        setIsBurningGas(false);
      }
    }, intervalMs);
  };

  const stepLabSimulation = () => {
    setLabStatus('paused');
    const totalTargetOps = metrics.operations;
    const baseGas = 21000;
    const gasPerOp = complexity === 'o1' ? 1421 : complexity === 'on' ? 190 : 194;
    const nextOps = Math.min(totalTargetOps, labOpsDone + Math.max(1, Math.floor(totalTargetOps / 15)));
    const gasBurned = baseGas + nextOps * gasPerOp;
    const gasLeft = Math.max(0, gasInitialCap - gasBurned);

    setLabOpsDone(nextOps);
    setLabGasUsed(gasBurned);
    setLabProgress(Math.min(100, Math.round((nextOps / totalTargetOps) * 100)));
    setCurrentGas(gasLeft);

    const randomOp = sampleOpcodes[Math.floor(Math.random() * sampleOpcodes.length)];
    setLabLogs((prev) => [
      ...prev.slice(-30),
      {
        id: Date.now(),
        op: `${randomOp.op} [STEP #${nextOps}]`,
        cost: randomOp.cost,
        gasRemaining: gasLeft,
      },
    ]);
    soundManager.playStepTick();

    if (gasBurned >= gasInitialCap && nextOps < totalTargetOps) {
      setLabStatus('revert');
      setCurrentGas(0);
      soundManager.playWarningTone();
    } else if (nextOps >= totalTargetOps) {
      if (gasBurned > gasInitialCap) {
        setLabStatus('revert');
        setCurrentGas(0);
        soundManager.playWarningTone();
      } else {
        setLabStatus('success');
        soundManager.playHaltChime();
      }
    }
  };

  // ==========================================
  // 2. CASE A vs CASE B DUEL SIMULATOR
  // ==========================================
  const runCaseSimulation = (scenario: 'A' | 'B' | 'BOTH') => {
    if (duelTimerRef.current) clearInterval(duelTimerRef.current);

    setIsBurningGas(true);
    setSimulationScenario(`CASE ${scenario}`);
    setCurrentGas(duelGasLimit);

    if (scenario === 'A' || scenario === 'BOTH') {
      setCaseAStatus('running');
      setCaseASteps(0);
      setCaseAGasSpent(0);
    }
    if (scenario === 'B' || scenario === 'BOTH') {
      setCaseBStatus('running');
      setCaseBSteps(0);
      setCaseBGasSpent(0);
    }

    const caseATargetSteps = 500_000;
    const gasPerStep = 3; // 3 gas per loop step
    const maxStepsAllowedByGas = Math.floor(duelGasLimit / gasPerStep);

    let aSteps = 0;
    let bSteps = 0;
    let aGas = 0;
    let bGas = 0;

    const stepInc = Math.max(1000, Math.floor(maxStepsAllowedByGas / 35));

    duelTimerRef.current = window.setInterval(() => {
      let bothDone = true;

      // Update Case A
      if (scenario === 'A' || scenario === 'BOTH') {
        if (aGas < duelGasLimit && aSteps < caseATargetSteps) {
          bothDone = false;
          aSteps = Math.min(caseATargetSteps, aSteps + stepInc);
          aGas = aSteps * gasPerStep;
          if (aGas > duelGasLimit) aGas = duelGasLimit;
          setCaseASteps(aSteps);
          setCaseAGasSpent(aGas);
        } else {
          if (aSteps >= caseATargetSteps && aGas <= duelGasLimit) {
            setCaseAStatus('completed');
          } else {
            setCaseAStatus('reverted');
          }
        }
      }

      // Update Case B (infinite, always exhausts gas)
      if (scenario === 'B' || scenario === 'BOTH') {
        if (bGas < duelGasLimit) {
          bothDone = false;
          bSteps += stepInc;
          bGas = bSteps * gasPerStep;
          if (bGas > duelGasLimit) bGas = duelGasLimit;
          setCaseBSteps(bSteps);
          setCaseBGasSpent(bGas);
        } else {
          setCaseBStatus('reverted');
        }
      }

      const highestGasUsed = Math.max(aGas, bGas);
      setCurrentGas(Math.max(0, duelGasLimit - highestGasUsed));
      soundManager.playStepTick();

      if (bothDone) {
        if (duelTimerRef.current) clearInterval(duelTimerRef.current);
        setIsBurningGas(false);

        if ((scenario === 'A' || scenario === 'BOTH') && aSteps >= caseATargetSteps && duelGasLimit >= 500_000 * gasPerStep) {
          soundManager.playHaltChime();
        } else {
          soundManager.playWarningTone();
        }
      }
    }, 45);
  };

  const resetDuel = () => {
    if (duelTimerRef.current) clearInterval(duelTimerRef.current);
    setCaseAStatus('idle');
    setCaseBStatus('idle');
    setCaseASteps(0);
    setCaseBSteps(0);
    setCaseAGasSpent(0);
    setCaseBGasSpent(0);
    setCurrentGas(gasInitialCap);
    setIsBurningGas(false);
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Gas Limit Presets */}
            <div className="flex items-center gap-1 bg-surface px-2.5 py-1 rounded-full border border-surface-highest/40 font-mono text-xs">
              <span className="text-muted-light text-[10px] mr-1 uppercase">BUDGET:</span>
              {[100_000, 500_000, 1_000_000, 10_000_000].map((cap) => (
                <button
                  key={cap}
                  onClick={() => handleSetGasBudget(cap)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                    gasInitialCap === cap
                      ? 'bg-cream text-canvas font-bold shadow-xs'
                      : 'text-muted-light hover:text-cream'
                  }`}
                  type="button"
                >
                  {cap >= 1_000_000 ? `${cap / 1_000_000}M` : `${cap / 1000}K`}
                </button>
              ))}
            </div>

            {simulationScenario && (
              <span className="px-2.5 py-1 rounded-full bg-contradiction/15 border border-contradiction/40 text-contradiction-bright font-mono text-xs font-semibold animate-pulse">
                BURNING: {simulationScenario}
              </span>
            )}

            <button
              onClick={resetFuelCell}
              className="p-1.5 rounded-full bg-surface border border-surface-highest/50 hover:bg-surface-high text-muted-light hover:text-cream transition-colors cursor-pointer"
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
                    ? 'bg-contradiction animate-pulse'
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
                {currentGas === 0 ? 'OUT OF GAS (REVERT)' : `${gasPercentage.toFixed(1)}%`}
              </span>
            </div>
          </div>

          {/* Segmented LED Rail (Single horizontal row) */}
          <div className="flex items-center gap-1 h-6 w-full bg-surface-lowest p-1 rounded border border-surface-highest/40 overflow-hidden">
            {Array.from({ length: totalSegments }).map((_, idx) => {
              const isActive = idx < activeSegments;
              const isExhausted = currentGas === 0;
              return (
                <div
                  key={idx}
                  className={`flex-1 rounded-[2px] h-full transition-all duration-150 ${
                    isExhausted
                      ? 'bg-contradiction/30 border border-contradiction/50 shadow-[0_0_4px_rgba(224,86,86,0.3)]'
                      : isActive
                      ? 'bg-mint shadow-[0_0_6px_rgba(112,219,164,0.3)]'
                      : 'bg-surface-high/60'
                  }`}
                />
              );
            })}
          </div>

          <div className="flex justify-between items-center font-mono text-[10px] text-muted-light pt-1">
            <span className="text-contradiction-bright">0 (EXHAUSTION: REVERT STATE)</span>
            <span className="text-cream-dim hidden sm:inline">BURN RATE: 21,000 BASE + OPCODE RATE</span>
            <span>{gasInitialCap.toLocaleString()} (ACTIVE GAS LIMIT)</span>
          </div>
        </div>
      </div>

      {/* Complexity & Case Study Laboratory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Controls, Big-O Selector & Interactive Simulation Deck */}
        <div className="lg:col-span-5 bg-surface-lowest border border-surface-highest/50 rounded-xl p-5 flex flex-col justify-between gap-5 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Mode Switch: Theoretical vs Case-Study */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-xs text-muted-light uppercase">
                DATA ENVIRONMENT
              </span>
              <div className="grid grid-cols-2 gap-1 bg-surface-low p-1 rounded-lg border border-surface-highest/50">
                <button
                  onClick={() => setMode('casestudy')}
                  className={`py-1.5 rounded-md font-mono text-xs font-semibold transition-all cursor-pointer ${
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
                  className={`py-1.5 rounded-md font-mono text-xs font-semibold transition-all cursor-pointer ${
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
                    className={`py-1 rounded-full font-mono text-xs transition-all cursor-pointer ${
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
                    className={`py-1 rounded-full transition-all cursor-pointer ${
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
                <span className="text-muted-light">Estimated Gas:</span>
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
                <span className="text-muted-light">Limit Assessment:</span>
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

            {/* Live Interactive EVM Transaction Stepper & Runner */}
            <div className="bg-surface-low border border-mint/30 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono text-xs text-cream font-bold">
                  <Zap className="w-3.5 h-3.5 text-mint" />
                  <span>INTERACTIVE EVM SIMULATION</span>
                </div>
                <div className="flex items-center gap-1 bg-surface px-2 py-0.5 rounded font-mono text-[10px] text-muted-light">
                  <span>SPD:</span>
                  {[1, 5, 20].map((s) => (
                    <button
                      key={s}
                      onClick={() => setLabSpeed(s)}
                      className={`px-1 rounded cursor-pointer ${
                        labSpeed === s ? 'text-mint font-bold bg-mint/10' : 'hover:text-cream'
                      }`}
                      type="button"
                    >
                      {s === 20 ? 'MAX' : `${s}x`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={runLabSimulation}
                  className={`py-2 px-3 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                    labStatus === 'running'
                      ? 'bg-amber-400 text-canvas hover:bg-amber-300'
                      : 'bg-mint text-canvas hover:bg-mint-light'
                  }`}
                  type="button"
                >
                  {labStatus === 'running' ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>PAUSE</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-canvas" />
                      <span>{labStatus === 'paused' ? 'RESUME TX' : 'RUN TX'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={stepLabSimulation}
                  disabled={labStatus === 'running' || labStatus === 'success' || labStatus === 'revert'}
                  className="py-2 px-2 bg-surface hover:bg-surface-high disabled:opacity-40 text-cream rounded-lg font-mono text-xs transition-all flex items-center justify-center gap-1 border border-surface-highest/50 cursor-pointer"
                  type="button"
                >
                  <StepForward className="w-3.5 h-3.5" />
                  <span>STEP</span>
                </button>

                <button
                  onClick={resetLabSimulation}
                  className="py-2 px-2 bg-surface hover:bg-surface-high text-muted-light hover:text-contradiction rounded-lg font-mono text-xs transition-all flex items-center justify-center gap-1 border border-surface-highest/50 cursor-pointer"
                  type="button"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET</span>
                </button>
              </div>

              {/* Live Simulation Progress Bar */}
              <div className="flex flex-col gap-1 pt-1 font-mono text-[10px]">
                <div className="flex justify-between items-center text-muted-light">
                  <span>PROGRESS: {labProgress}% ({labOpsDone.toLocaleString()} / {metrics.operations.toLocaleString()} OPS)</span>
                  <span className={labStatus === 'revert' ? 'text-contradiction-bright font-bold' : labStatus === 'success' ? 'text-mint font-bold' : 'text-cream'}>
                    {labStatus === 'revert' ? 'REVERTED' : labStatus === 'success' ? 'COMMITTED' : `${labGasUsed.toLocaleString()} GAS`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-lowest rounded-full overflow-hidden border border-surface-highest/30">
                  <div
                    className={`h-full transition-all duration-100 ${
                      labStatus === 'revert'
                        ? 'bg-contradiction'
                        : labStatus === 'success'
                        ? 'bg-cream'
                        : 'bg-mint'
                    }`}
                    style={{ width: `${labProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-center font-mono text-[11px] text-muted-light">
            <span>Deterministic Yellow Paper execution model</span>
            <span className="text-cream-dim">Big-O describes growth; Gas measures real physical cost.</span>
          </div>
        </div>

        {/* Right Column: Comparative Graph Bay & Live Terminal Stream */}
        <div className="lg:col-span-7 bg-surface-lowest border border-surface-highest/50 rounded-xl p-5 flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-mint" />
              <div className="flex flex-col">
                <span className="font-display text-sm sm:text-base text-cream font-semibold">
                  {viewMode === 'terminal'
                    ? 'LIVE EVM OPCODES & TX TRACE'
                    : mode === 'casestudy'
                    ? 'CASE-STUDY MEASURED GAS EXPENDITURE'
                    : 'THEORETICAL OPERATION GROWTH VS GAS CEILING'}
                </span>
                <span className="font-mono text-[10px] text-muted-light">
                  {complexity.toUpperCase()} COMPLEXITY • {mode === 'casestudy' ? 'EMPIRICAL BENCHMARKS' : 'ANALYTIC CURVE'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">

              {/* Scale Mode Toggle (Visible in Chart View) */}
              {viewMode === 'chart' && (
                <button
                  onClick={() => setChartScale(chartScale === 'auto' ? 'block' : 'auto')}
                  className="px-2.5 py-1 rounded font-mono text-[11px] bg-surface hover:bg-surface-high border border-surface-highest/50 text-cream-dim hover:text-cream transition-colors flex items-center gap-1 cursor-pointer select-none"
                  type="button"
                  title="Toggle between focused curve autoscaling and global 10M EVM block ceiling view"
                >
                  <Sliders className="w-3 h-3 text-mint" />
                  <span>SCALE: {chartScale === 'auto' ? 'FOCUSED' : 'BLOCK (10M)'}</span>
                </button>
              )}

              {/* View Switcher: Chart vs Live Terminal */}
              <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-surface-highest/50">
                <button
                  onClick={() => setViewMode('chart')}
                  className={`px-2.5 py-1 rounded font-mono text-xs transition-all cursor-pointer ${
                    viewMode === 'chart'
                      ? 'bg-cream text-canvas font-bold shadow-xs'
                      : 'text-muted-light hover:text-cream'
                  }`}
                  type="button"
                >
                  CHART VIEW
                </button>
                <button
                  onClick={() => setViewMode('terminal')}
                  className={`px-2.5 py-1 rounded font-mono text-xs transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === 'terminal'
                      ? 'bg-cream text-canvas font-bold shadow-xs'
                      : 'text-muted-light hover:text-cream'
                  }`}
                  type="button"
                >
                  <Terminal className="w-3 h-3" />
                  <span>TX MONITOR</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Chart Canvas OR Live Terminal */}
          <div className="relative w-full bg-surface-low border border-surface-highest/40 rounded-xl p-3 flex flex-col gap-3 overflow-hidden shadow-inner">
            {viewMode === 'terminal' ? (
              /* Live EVM Opcode Stream Terminal */
              <div className="w-full h-80 flex flex-col justify-between font-mono text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-surface-highest/40 text-[11px] text-muted-light">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-mint animate-pulse"></span>
                    <span>TX 0x7f2a...c014 (CALLDATA: {complexity.toUpperCase()})</span>
                  </div>
                  <span>GAS LIMIT: {gasInitialCap.toLocaleString()}</span>
                </div>

                <div ref={terminalScrollRef} className="flex-1 overflow-y-auto py-2 flex flex-col gap-1 pr-1 font-mono text-xs">
                  {labLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-light gap-2">
                      <Cpu className="w-8 h-8 text-muted-dark" />
                      <span>CLICK [RUN TX] OR [STEP] TO INITIATE EVM TRANSACTION SIMULATION</span>
                    </div>
                  ) : (
                    labLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between px-2 py-1 rounded bg-surface/70 hover:bg-surface text-[11px] border border-surface-highest/30 font-mono"
                      >
                        <span className="text-mint font-semibold">{log.op}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-cream-dim">-{log.cost} gas</span>
                          <span className="text-muted-light">Rem: {log.gasRemaining.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Final EVM Receipt Banner */}
                {labStatus === 'success' && (
                  <div className="p-2.5 rounded bg-mint/15 border border-mint/40 text-mint flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>TX RECEIPT: STATUS 1 (SUCCESS)</span>
                    </div>
                    <span>TOTAL GAS: {labGasUsed.toLocaleString()} | REFUNDED: {(gasInitialCap - labGasUsed).toLocaleString()}</span>
                  </div>
                )}
                {labStatus === 'revert' && (
                  <div className="p-2.5 rounded bg-contradiction/20 border border-contradiction/50 text-contradiction-bright flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <XCircle className="w-4 h-4" />
                      <span>TX RECEIPT: STATUS 0 (REVERTED: OUT_OF_GAS)</span>
                    </div>
                    <span>STATE REVERTED | 0 GAS REFUNDED</span>
                  </div>
                )}
              </div>
            ) : (
              /* High-Tech Unified Interactive SVG Chart */
              <div className="w-full flex flex-col gap-3">
                {/* SVG Visual Canvas */}
                <div className="relative w-full h-64 sm:h-72">
                  <svg className="w-full h-full" viewBox="0 0 680 230" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4EBA86" stopOpacity="0.32" />
                        <stop offset="100%" stopColor="#4EBA86" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#4EBA86" floodOpacity="0.6" />
                      </filter>
                    </defs>

                    {/* Background Precision Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
                      const val = Math.round(chartMaxY * frac);
                      const yPos = 200 - frac * 175;
                      const label =
                        chartMaxY >= 1_000_000
                          ? `${(val / 1_000_000).toFixed(1)}M`
                          : `${Math.round(val / 1000)}k`;
                      return (
                        <g key={frac}>
                          <line x1="60" y1={yPos} x2="660" y2={yPos} stroke="#22201C" strokeDasharray="3 3" />
                          <text
                            x="52"
                            y={yPos + 3.5}
                            fill="#7E7768"
                            fontFamily="JetBrains Mono"
                            fontSize="9"
                            textAnchor="end"
                          >
                            {label}
                          </text>
                        </g>
                      );
                    })}

                    {/* Vertical X Grid Lines */}
                    {[0, 50, 100, 150, 200].map((nVal) => {
                      const xPos = 60 + (nVal / 200) * 600;
                      return (
                        <g key={nVal}>
                          <line x1={xPos} y1="25" x2={xPos} y2="200" stroke="#22201C" strokeDasharray="3 3" />
                          <text
                            x={xPos}
                            y="218"
                            fill="#7E7768"
                            fontFamily="JetBrains Mono"
                            fontSize="9"
                            textAnchor="middle"
                          >
                            {nVal}
                          </text>
                        </g>
                      );
                    })}
                    <text x="360" y="228" fill="#5E584D" fontFamily="JetBrains Mono" fontSize="8.5" textAnchor="middle">
                      INPUT MAGNITUDE (N)
                    </text>

                    {/* 10M Block Ceiling Line (If within range) */}
                    {10_000_000 <= chartMaxY && (
                      <g>
                        <line
                          x1="60"
                          y1={200 - (10_000_000 / chartMaxY) * 175}
                          x2="660"
                          y2={200 - (10_000_000 / chartMaxY) * 175}
                          stroke="#E05656"
                          strokeDasharray="5 3"
                          strokeWidth="1.5"
                        />
                        <text
                          x="655"
                          y={200 - (10_000_000 / chartMaxY) * 175 - 5}
                          fill="#E05656"
                          fontFamily="JetBrains Mono"
                          fontSize="8.5"
                          textAnchor="end"
                          fontWeight="bold"
                        >
                          BLOCK CEILING: 10,000,000 GAS
                        </text>
                      </g>
                    )}

                    {/* Shaded Area Under Curve */}
                    {curvePoints.length > 1 && (
                      <path
                        d={`${curvePoints
                          .map((p, i) => {
                            const x = 60 + (p.n / 200) * 600;
                            const y = 200 - (Math.min(chartMaxY, p.gas) / chartMaxY) * 175;
                            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                          })
                          .join(' ')} L ${60 + (curvePoints[curvePoints.length - 1].n / 200) * 600} 200 L ${
                          60 + (curvePoints[0].n / 200) * 600
                        } 200 Z`}
                        fill="url(#curveGradient)"
                      />
                    )}

                    {/* Main Curve Line */}
                    {curvePoints.length > 1 && (
                      <path
                        d={curvePoints
                          .map((p, i) => {
                            const x = 60 + (p.n / 200) * 600;
                            const y = 200 - (Math.min(chartMaxY, p.gas) / chartMaxY) * 175;
                            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                          })
                          .join(' ')}
                        fill="none"
                        stroke="#4EBA86"
                        strokeWidth="2.5"
                        filter="url(#neonGlow)"
                      />
                    )}

                    {/* Active Selected N Tracer Line & Marker */}
                    {(() => {
                      const activeX = 60 + (Math.min(200, inputN) / 200) * 600;
                      const activeY = 200 - (Math.min(chartMaxY, metrics.estimatedGas) / chartMaxY) * 175;
                      return (
                        <g key="active-marker" className="pointer-events-none select-none">
                          <line
                            x1={activeX}
                            y1="200"
                            x2={activeX}
                            y2={activeY}
                            stroke="#4EBA86"
                            strokeDasharray="2 2"
                            strokeWidth="1.5"
                          />
                          <circle cx={activeX} cy={activeY} r="7" fill="#4EBA86" opacity="0.3" className="animate-ping" />
                          <circle cx={activeX} cy={activeY} r="4.5" fill="#4EBA86" stroke="#0B0B0A" strokeWidth="2" />

                          {/* Floating Pill Label */}
                          <g transform={`translate(${Math.max(105, Math.min(575, activeX))}, ${Math.max(25, activeY - 14)})`} className="pointer-events-none select-none">
                            <rect
                              x="-65"
                              y="-11"
                              width="130"
                              height="20"
                              rx="6"
                              fill="#141311"
                              stroke="#4EBA86"
                              strokeWidth="1"
                              className="shadow-md"
                            />
                            <text
                              textAnchor="middle"
                              y="3"
                              fill="#FFFFFF"
                              fontFamily="JetBrains Mono"
                              fontSize="8.5"
                              fontWeight="bold"
                            >
                              N = {inputN} • {metrics.estimatedGas.toLocaleString()} GAS
                            </text>
                          </g>
                        </g>
                      );
                    })()}

                    {/* Case Study Individual Data Nodes (Clickable) */}
                    {mode === 'casestudy' &&
                      curvePoints.map((pt) => {
                        const px = 60 + (pt.n / 200) * 600;
                        const py = 200 - (Math.min(chartMaxY, pt.gas) / chartMaxY) * 175;
                        const isCurrent = inputN === pt.n;
                        return (
                          <g
                            key={pt.n}
                            className="cursor-pointer select-none"
                            onClick={() => {
                              setInputN(pt.n);
                              soundManager.playStepTick();
                            }}
                          >
                            {/* Generous stable invisible hit target (no flicker or transform jumps) */}
                            <circle cx={px} cy={py} r="14" fill="transparent" />

                            {pt.isAnomalous && (
                              <circle cx={px} cy={py} r="10" fill="#E05656" opacity="0.3" className="animate-ping pointer-events-none" />
                            )}
                            <circle
                              cx={px}
                              cy={py}
                              r={isCurrent ? 6 : 4}
                              fill={pt.isAnomalous ? '#E05656' : isCurrent ? '#F3E9D3' : '#4EBA86'}
                              stroke="#0B0B0A"
                              strokeWidth={isCurrent ? 2 : 1.5}
                              className="pointer-events-none transition-colors duration-150"
                            />
                          </g>
                        );
                      })}
                  </svg>
                </div>

                {/* Benchmark Chips Tape: Measured Data Points */}
                <div className="flex flex-col gap-2 pt-1 border-t border-surface-highest/40 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-light text-[10px] uppercase font-semibold">
                      {mode === 'casestudy' ? 'RECORDED EMPIRICAL BENCHMARKS (CLICK TO SELECT)' : 'MODEL PARAMETER PRESETS'}
                    </span>
                    <span className="text-cream-dim text-[10px]">
                      {complexity === 'o1'
                        ? 'O(1) CONSTANT OVERHEAD: 1,421 GAS'
                        : complexity === 'on'
                        ? 'O(n) LINEAR EXPANSION: ~190 GAS/OP'
                        : 'O(n²) POLYNOMIAL SURGE: ~194 GAS/n²'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {activeCaseStudyPoints.map((pt) => {
                      const isSelected = inputN === pt.n;
                      return (
                        <button
                          key={pt.n}
                          onClick={() => {
                            setInputN(pt.n);
                            soundManager.playStepTick();
                          }}
                          className={`p-2 rounded-lg border text-left flex flex-col transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-mint/15 border-mint text-mint shadow-xs scale-[1.02]'
                              : pt.isAnomalous
                              ? 'bg-contradiction/10 border-contradiction/30 hover:bg-contradiction/20 text-cream'
                              : 'bg-surface hover:bg-surface-high border-surface-highest/40 text-cream-dim'
                          }`}
                          type="button"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold">N = {pt.n}</span>
                            {pt.isAnomalous ? (
                              <span className="px-1 py-0.2 bg-contradiction text-canvas font-bold text-[8px] rounded">
                                ERROR
                              </span>
                            ) : isSelected ? (
                              <CheckCircle2 className="w-3 h-3 text-mint" />
                            ) : null}
                          </div>
                          <span className={`text-[12px] font-bold ${isSelected ? 'text-mint' : pt.isAnomalous ? 'text-contradiction-bright' : 'text-cream'}`}>
                            {pt.gas.toLocaleString()} gas
                          </span>
                          <span className="text-[9px] text-muted-light truncate mt-0.5">
                            {pt.notes ?? (complexity === 'on' ? 'Linear step' : 'Polynomial surge')}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Finite Expensive Stress Benchmark Milestone */}
                  <div className="pt-2 border-t border-surface-highest/30 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-muted-light gap-1">
                    <span className="text-cream-dim">EMPIRICAL BOUNDARY: N = {CASE_STUDY_EXPENSIVE_POINT.n}</span>
                    <span className="text-mint font-bold">{CASE_STUDY_EXPENSIVE_POINT.gas.toLocaleString()} GAS (TERMINATED NATURALLY)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-muted-light font-mono text-xs gap-1">
            <span>
              Observation: {complexity === 'on2' ? 'Polynomial operations quickly breach block ceiling.' : 'Sub-linear algorithms remain safely within gas limits.'}
            </span>
            <span className="text-mint font-semibold">TURING BOUNDARY: METERED GAS</span>
          </div>
        </div>
      </div>

      {/* The Central Academic Demonstration: Case A vs Case B Duel Simulator */}
      <div className="bg-surface-lowest border border-surface-highest/60 rounded-xl p-5 lg:p-6 flex flex-col gap-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-highest/40 pb-4">
          <div className="flex flex-col">
            <span className="font-mono text-xs text-mint font-bold uppercase tracking-wider">
              CENTRAL EXPERIMENT // SIDE-BY-SIDE DUEL
            </span>
            <h2 className="font-display text-lg text-cream font-bold">
              THE HALTING ILLUSION: FINITE EXPENSIVE vs INFINITE MALICIOUS
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Duel Gas Budget Toggle */}
            <div className="flex items-center gap-1.5 bg-surface px-3 py-1 rounded-full border border-surface-highest/40 font-mono text-xs">
              <span className="text-muted-light font-semibold">TEST GAS LIMIT:</span>
              <button
                onClick={() => setDuelGasLimit(100_000)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  duelGasLimit === 100_000 ? 'bg-cream text-canvas font-bold' : 'text-cream-dim hover:text-white'
                }`}
                type="button"
              >
                100,000 GAS (STANDARD)
              </button>
              <button
                onClick={() => setDuelGasLimit(600_000)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  duelGasLimit === 600_000 ? 'bg-cream text-canvas font-bold' : 'text-cream-dim hover:text-white'
                }`}
                type="button"
              >
                600,000 GAS (HIGH)
              </button>
            </div>

            <button
              onClick={() => runCaseSimulation('BOTH')}
              className="px-4 py-1.5 rounded-full bg-cream text-canvas font-mono text-xs font-bold hover:bg-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              type="button"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>SIMULATE BOTH CONCURRENTLY</span>
            </button>

            <button
              onClick={resetDuel}
              className="p-1.5 rounded-full bg-surface border border-surface-highest/50 hover:bg-surface-high text-muted-light hover:text-cream transition-colors cursor-pointer"
              title="Reset Case Duel"
              type="button"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Case A: Finite but Expensive Program */}
          <div className="bg-surface-low border border-surface-highest/50 rounded-xl p-5 flex flex-col justify-between gap-4 shadow-sm">
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

              <div className="grid grid-cols-2 gap-2 bg-surface-lowest border border-surface-highest/30 p-2.5 rounded font-mono text-xs">
                <div className="flex flex-col">
                  <span className="text-muted-light text-[10px]">Theoretical Nature</span>
                  <span className="text-mint font-bold">Natural Exit @ 500k ops</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-light text-[10px]">Allocated Gas</span>
                  <span className="text-cream font-bold">{duelGasLimit.toLocaleString()} GAS</span>
                </div>
              </div>
            </div>

            {/* Outcome Action */}
            <div className="p-3 rounded-lg bg-surface border border-surface-highest/40 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-light uppercase font-semibold">
                  EXECUTION STATUS
                </span>
                <button
                  onClick={() => runCaseSimulation('A')}
                  disabled={caseAStatus === 'running'}
                  className="px-3 py-1 rounded-full bg-mint text-canvas font-mono text-xs font-bold hover:bg-mint-light disabled:opacity-40 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                  type="button"
                >
                  <Play className="w-3 h-3 fill-canvas" />
                  <span>SIMULATE CASE A</span>
                </button>
              </div>

              {/* Dynamic State Box */}
              {caseAStatus === 'idle' && (
                <div className="px-3 py-2 rounded bg-surface-lowest border border-surface-highest/40 text-cream-dim font-mono text-xs flex items-center justify-between">
                  <span>READY TO EXECUTE (500k OPS REQUIRED)</span>
                  <span className="text-muted-light text-[10px]">IDLE</span>
                </div>
              )}

              {caseAStatus === 'running' && (
                <div className="px-3 py-2 rounded bg-mint/10 border border-mint/30 text-mint font-mono text-xs flex flex-col gap-1 animate-pulse">
                  <div className="flex justify-between items-center font-bold">
                    <span>EXECUTING VALID LOGIC...</span>
                    <span>{caseASteps.toLocaleString()} / 500,000 OPS</span>
                  </div>
                  <span className="text-[10px] text-cream-dim">Gas Spent: {caseAGasSpent.toLocaleString()} / {duelGasLimit.toLocaleString()}</span>
                </div>
              )}

              {caseAStatus === 'completed' && (
                <div className="px-3 py-2 rounded bg-mint/20 border border-mint/40 text-mint font-mono text-xs font-bold flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-mint" />
                    <span>NATURAL TERMINATION — STATUS: 1 (SUCCESS)</span>
                  </div>
                  <span className="text-[10px]">STEP 500,000</span>
                </div>
              )}

              {caseAStatus === 'reverted' && (
                <div className="px-3 py-2 rounded bg-contradiction/15 border border-contradiction/30 text-contradiction-bright font-mono text-xs font-bold flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-contradiction" />
                    <span>OUT OF GAS — HALTED ABNORMALLY (STATUS: 0)</span>
                  </div>
                  <span className="opacity-80 text-[10px]">STEP {caseASteps.toLocaleString()}</span>
                </div>
              )}

              <p className="font-sans text-xs text-cream-dim">
                {caseAStatus === 'completed'
                  ? 'Outcome: Allocated gas was sufficient! Program halted naturally and returned status 1.'
                  : caseAStatus === 'reverted'
                  ? 'Outcome: Fuel exhausted before terminal condition was reached. State transitions reverted.'
                  : 'Click Simulate to test whether the allocated gas limit is sufficient for natural exit.'}
              </p>
            </div>
          </div>

          {/* Case B: Infinite Loop Program */}
          <div className="bg-surface-low border border-surface-highest/50 rounded-xl p-5 flex flex-col justify-between gap-4 shadow-sm">
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

              <div className="grid grid-cols-2 gap-2 bg-surface-lowest border border-surface-highest/30 p-2.5 rounded font-mono text-xs">
                <div className="flex flex-col">
                  <span className="text-muted-light text-[10px]">Theoretical Nature</span>
                  <span className="text-contradiction font-bold">Non-Terminating (∞)</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-light text-[10px]">Allocated Gas</span>
                  <span className="text-cream font-bold">{duelGasLimit.toLocaleString()} GAS</span>
                </div>
              </div>
            </div>

            {/* Outcome Action */}
            <div className="p-3 rounded-lg bg-surface border border-surface-highest/40 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-light uppercase font-semibold">
                  EXECUTION STATUS
                </span>
                <button
                  onClick={() => runCaseSimulation('B')}
                  disabled={caseBStatus === 'running'}
                  className="px-3 py-1 rounded-full bg-contradiction text-canvas font-mono text-xs font-bold hover:bg-contradiction-bright disabled:opacity-40 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                  type="button"
                >
                  <Play className="w-3 h-3 fill-canvas" />
                  <span>SIMULATE CASE B</span>
                </button>
              </div>

              {/* Dynamic State Box */}
              {caseBStatus === 'idle' && (
                <div className="px-3 py-2 rounded bg-surface-lowest border border-surface-highest/40 text-cream-dim font-mono text-xs flex items-center justify-between">
                  <span>READY TO EXECUTE (INFINITE LOOP)</span>
                  <span className="text-muted-light text-[10px]">IDLE</span>
                </div>
              )}

              {caseBStatus === 'running' && (
                <div className="px-3 py-2 rounded bg-contradiction/10 border border-contradiction/30 text-contradiction-bright font-mono text-xs flex flex-col gap-1 animate-pulse">
                  <div className="flex justify-between items-center font-bold">
                    <span>SPINNING IN ADVERSARIAL LOOP...</span>
                    <span>{caseBSteps.toLocaleString()} STEPS RUN</span>
                  </div>
                  <span className="text-[10px] text-cream-dim">Gas Spent: {caseBGasSpent.toLocaleString()} / {duelGasLimit.toLocaleString()}</span>
                </div>
              )}

              {caseBStatus === 'reverted' && (
                <div className="px-3 py-2 rounded bg-contradiction/15 border border-contradiction/30 text-contradiction-bright font-mono text-xs font-bold flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-contradiction" />
                    <span>OUT OF GAS — HALTED ABNORMALLY (STATUS: 0)</span>
                  </div>
                  <span className="opacity-80 text-[10px]">STEP {caseBSteps.toLocaleString()}</span>
                </div>
              )}

              <p className="font-sans text-xs text-cream-dim">
                {caseBStatus === 'reverted'
                  ? 'Outcome: Fuel exhausted at physical threshold. Node was protected from freezing forever.'
                  : 'Click Simulate to watch how metered gas forcibly terminates infinite loops.'}
              </p>
            </div>
          </div>
        </div>

        {/* Live Academic Deduction Callout */}
        {(caseAStatus === 'reverted' || caseAStatus === 'completed') && caseBStatus === 'reverted' && (
          <div className="p-4 rounded-xl bg-surface border border-mint/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-mint/20 border border-mint/40 flex items-center justify-center text-mint shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs text-mint font-bold uppercase">
                  {duelGasLimit === 100_000
                    ? 'OBSERVATION: IDENTICAL MACHINE OUTPUT (STATUS 0: REVERT)'
                    : 'OBSERVATION: HIGH BUDGET RESOLUTION'}
                </span>
                <p className="font-sans text-xs text-cream-dim">
                  {duelGasLimit === 100_000
                    ? 'At 100,000 gas, both Case A and Case B ran out of gas at step 33,333. The blockchain physical state engine cannot differentiate between a legitimate slow computation and an infinite loop!'
                    : 'At 600,000 gas, Case A completed successfully (Status 1), whereas Case B burned through all 600,000 gas and still reverted. Gas bounds execution; it does not predict termination!'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setDuelGasLimit(duelGasLimit === 100_000 ? 600_000 : 100_000)}
              className="px-3.5 py-1.5 rounded-full bg-surface-lowest hover:bg-surface-highest border border-surface-highest/60 text-cream font-mono text-xs transition-colors shrink-0 cursor-pointer"
              type="button"
            >
              SWITCH TO {duelGasLimit === 100_000 ? '600k' : '100k'} & RE-TEST
            </button>
          </div>
        )}
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
