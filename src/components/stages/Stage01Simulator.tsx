import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Sliders,
  Minus,
  Plus,
} from 'lucide-react';
import {
  FINITE_COUNTER_PROGRAM,
  INFINITE_LOOP_PROGRAM,
  INPUT_DEPENDENT_PROGRAM,
} from '../../engine/programs';
import { createInitialState, executeStep } from '../../engine/interpreter';
import type { ExecutionState } from '../../engine/interpreter';
import type { ProgramDefinition } from '../../engine/types';
import { soundManager } from '../../utils/audio';

interface Stage01SimulatorProps {
  onProceedToPredictor: () => void;
}

export const Stage01Simulator: React.FC<Stage01SimulatorProps> = ({
  onProceedToPredictor,
}) => {
  const [selectedProgramId, setSelectedProgramId] = useState<
    'finite-counter' | 'infinite-loop' | 'input-dependent'
  >('finite-counter');
  const [inputN, setInputN] = useState<number>(5);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // 1x = 400ms, 2x = 200ms, 4x = 100ms

  // Current active program definition
  const currentProgram: ProgramDefinition = React.useMemo(() => {
    if (selectedProgramId === 'finite-counter') return FINITE_COUNTER_PROGRAM;
    if (selectedProgramId === 'infinite-loop') return INFINITE_LOOP_PROGRAM;
    return INPUT_DEPENDENT_PROGRAM(inputN);
  }, [selectedProgramId, inputN]);

  // Execution state managed by pure interpreter
  const [executionState, setExecutionState] = useState<ExecutionState>(() =>
    createInitialState(currentProgram)
  );

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [nextCheckpointStep, setNextCheckpointStep] = useState<number>(67);
  const [showCheckpointModal, setShowCheckpointModal] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const traceEndRef = useRef<HTMLDivElement | null>(null);

  // When program selection changes, reset
  useEffect(() => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setNextCheckpointStep(67);
    setShowCheckpointModal(false);
    setExecutionState(createInitialState(currentProgram));
  }, [currentProgram]);

  // Controlled execution scheduler
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const interval = Math.max(80, Math.floor(400 / speedMultiplier));
    timerRef.current = window.setInterval(() => {
      setExecutionState((prev) => {
        if (prev.status === 'halted') {
          setIsPlaying(false);
          soundManager.playHaltChime();
          return prev;
        }

        const nextState = executeStep(currentProgram, prev);
        soundManager.playStepTick();

        if (nextState.status === 'halted') {
          setIsPlaying(false);
          soundManager.playHaltChime();
          return nextState;
        }

        // Automatic stop at checkpoint (67, 134, 201...)
        if (nextState.step >= nextCheckpointStep) {
          setIsPlaying(false);
          soundManager.playWarningTone();
          setShowCheckpointModal(true);
        } else if (nextState.step === 60) {
          soundManager.playWarningTone();
        }

        return nextState;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMultiplier, currentProgram, nextCheckpointStep]);

  // Auto-scroll execution trace
  useEffect(() => {
    traceEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [executionState.trace.length]);

  const handleStep = () => {
    setIsPlaying(false);
    setExecutionState((prev) => {
      const nextState = executeStep(currentProgram, prev);
      soundManager.playStepTick();
      if (nextState.status === 'halted') {
        soundManager.playHaltChime();
      }
      if (nextState.step >= nextCheckpointStep) {
        soundManager.playWarningTone();
        setShowCheckpointModal(true);
      }
      return nextState;
    });
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setNextCheckpointStep(67);
    setShowCheckpointModal(false);
    setExecutionState(createInitialState(currentProgram));
  };

  const handleContinueCheckpoint = () => {
    setNextCheckpointStep((prev) => prev + 67);
    setShowCheckpointModal(false);
    setIsPlaying(true);
  };

  const toggleRun = () => {
    if (executionState.status === 'halted') {
      const freshState = createInitialState(currentProgram);
      setExecutionState(freshState);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const isHalted = executionState.status === 'halted';
  const isInfinite = selectedProgramId === 'infinite-loop';
  const regI = executionState.variables['i'] ?? 0;

  return (
    <div className="w-full flex flex-col gap-5 animate-fadeIn">
      {/* Top Control & Telemetry Deck */}
      <div className="w-full bg-surface-low border border-surface-highest/60 rounded-xl p-4 shadow-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Program Selection Cluster */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-light">
              SELECT ROUTINE:
            </span>
            <div className="inline-flex p-1 bg-surface-lowest rounded-full border border-surface-highest/50 shrink-0 overflow-x-auto shadow-inner">
              <button
                onClick={() => setSelectedProgramId('finite-counter')}
                className={`px-3 py-1.5 rounded-full font-mono text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  selectedProgramId === 'finite-counter'
                    ? 'bg-cream text-canvas font-semibold shadow-sm'
                    : 'text-cream-dim hover:text-white hover:bg-surface'
                }`}
                type="button"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    selectedProgramId === 'finite-counter' ? 'bg-mint' : 'bg-muted-light'
                  }`}
                ></span>
                <span>PROG α: FINITE</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    selectedProgramId === 'finite-counter'
                      ? 'bg-canvas/10 text-canvas font-bold'
                      : 'bg-surface text-muted-light'
                  }`}
                >
                  [i &lt; 5]
                </span>
              </button>

              <button
                onClick={() => setSelectedProgramId('infinite-loop')}
                className={`px-3 py-1.5 rounded-full font-mono text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  selectedProgramId === 'infinite-loop'
                    ? 'bg-cream text-canvas font-semibold shadow-sm'
                    : 'text-cream-dim hover:text-white hover:bg-surface'
                }`}
                type="button"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    selectedProgramId === 'infinite-loop' ? 'bg-contradiction' : 'bg-muted-light'
                  }`}
                ></span>
                <span>PROG β: UNBOUNDED</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    selectedProgramId === 'infinite-loop'
                      ? 'bg-canvas/10 text-canvas font-bold'
                      : 'bg-surface text-muted-light'
                  }`}
                >
                  [∞]
                </span>
              </button>

              <button
                onClick={() => setSelectedProgramId('input-dependent')}
                className={`px-3 py-1.5 rounded-full font-mono text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  selectedProgramId === 'input-dependent'
                    ? 'bg-cream text-canvas font-semibold shadow-sm'
                    : 'text-cream-dim hover:text-white hover:bg-surface'
                }`}
                type="button"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    selectedProgramId === 'input-dependent' ? 'bg-mint' : 'bg-muted-light'
                  }`}
                ></span>
                <span>PROG γ: PARAMETERIZED</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    selectedProgramId === 'input-dependent'
                      ? 'bg-canvas/10 text-canvas font-bold'
                      : 'bg-surface text-muted-light'
                  }`}
                >
                  [i &lt; {inputN}]
                </span>
              </button>
            </div>

            {/* Scroll line / Range Slider for Parameter N */}
            {selectedProgramId === 'input-dependent' && (
              <div className="flex items-center gap-2 font-mono text-xs bg-surface px-3 py-1 rounded-full border border-surface-highest/50 shadow-inner">
                <span className="text-muted-light whitespace-nowrap font-semibold">N:</span>
                <button
                  onClick={() => setInputN((prev) => Math.max(1, prev - 1))}
                  disabled={inputN <= 1}
                  className="w-5 h-5 rounded-full bg-surface-lowest hover:bg-surface-high disabled:opacity-30 border border-surface-highest/60 flex items-center justify-center text-cream cursor-pointer transition-colors"
                  title="Decrease N by 1"
                  type="button"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={inputN}
                  onChange={(e) => setInputN(Number(e.target.value))}
                  className="w-20 sm:w-28 accent-mint cursor-pointer h-1.5 bg-surface-highest rounded-lg appearance-none"
                  title={`Scroll line: N = ${inputN}`}
                />
                <button
                  onClick={() => setInputN((prev) => Math.min(25, prev + 1))}
                  disabled={inputN >= 25}
                  className="w-5 h-5 rounded-full bg-surface-lowest hover:bg-surface-high disabled:opacity-30 border border-surface-highest/60 flex items-center justify-center text-cream cursor-pointer transition-colors"
                  title="Increase N by 1"
                  type="button"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <span className="px-2 py-0.5 bg-mint/15 border border-mint/40 text-mint font-bold rounded text-xs min-w-[28px] text-center">
                  {inputN}
                </span>
              </div>
            )}
          </div>

          {/* Live Execution Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={toggleRun}
              className={`px-5 py-2 rounded-full font-mono text-xs font-semibold tracking-wide transition-all flex items-center gap-2 shadow-md cursor-pointer ${
                isPlaying
                  ? 'bg-amber-400 text-canvas hover:bg-amber-300'
                  : 'bg-mint text-canvas hover:bg-mint-light'
              }`}
              type="button"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-canvas" />
                  <span>{isHalted ? 'RE-RUN PROGRAM' : 'RUN PROGRAM'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleStep}
              disabled={isHalted}
              className="px-4 py-2 bg-surface hover:bg-surface-high disabled:opacity-40 text-cream rounded-full font-mono text-xs transition-all flex items-center gap-1.5 border border-surface-highest/50 cursor-pointer"
              type="button"
            >
              <StepForward className="w-3.5 h-3.5" />
              <span>STEP</span>
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2 bg-surface hover:bg-surface-high text-muted-light hover:text-contradiction rounded-full font-mono text-xs transition-all flex items-center gap-1.5 border border-surface-highest/50 cursor-pointer"
              type="button"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>

            {/* Speed Control Pill */}
            <div className="flex items-center gap-1 bg-surface px-2 py-1 rounded-full border border-surface-highest/40 font-mono text-xs">
              <Sliders className="w-3 h-3 text-muted-light" />
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSpeedMultiplier(spd)}
                  className={`px-1.5 py-0.5 rounded text-[11px] ${
                    speedMultiplier === spd
                      ? 'bg-cream text-canvas font-bold'
                      : 'text-muted-light hover:text-cream'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry Status Strip */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="bg-surface-lowest px-3 py-1.5 rounded-full border border-surface-highest/40 flex items-center gap-2 shrink-0">
              <span
                className={`w-2 h-2 rounded-full ${
                  isHalted
                    ? 'bg-cream'
                    : isPlaying
                    ? 'bg-mint animate-pulse'
                    : 'bg-muted-light'
                }`}
              ></span>
              <span
                className={`font-mono text-xs font-bold ${
                  isHalted ? 'text-cream' : isPlaying ? 'text-mint' : 'text-cream-dim'
                }`}
              >
                {isHalted
                  ? '■ HALTED (COMPLETED)'
                  : isPlaying
                  ? '● RUNNING'
                  : 'PAUSED / READY'}
              </span>
            </div>

            <div className="bg-surface-lowest px-3 py-1.5 rounded-full border border-surface-highest/40 flex items-center gap-1.5 font-mono text-xs shrink-0">
              <span className="text-muted-light">STEPS:</span>
              <span className="text-cream font-bold tracking-wider">
                {String(executionState.step).padStart(4, '0')}
              </span>
            </div>

            <div className="bg-surface-lowest px-3 py-1.5 rounded-full border border-surface-highest/40 flex items-center gap-2 font-mono text-xs shrink-0">
              <span className="text-muted-light">R[i]:</span>
              <span className="text-mint font-bold text-sm">{regI}</span>
              <span className="text-muted-dark">|</span>
              <span className="text-muted-light">ACC:</span>
              <span className="text-cream">0x0{regI.toString(16)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 60+ Warning Banner for Unbounded Execution */}
      {isInfinite && executionState.step >= 60 && !showCheckpointModal && (
        <div className="w-full bg-surface-low border border-amber-500/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
                  ⚠️ INFINITE RUNAWAY WARNING: STEP {executionState.step}
                </span>
                <span className="text-[10px] font-mono text-cream-dim bg-surface px-2 py-0.5 rounded-full border border-surface-highest/40">
                  NO HALT CONDITION
                </span>
              </div>
              <p className="font-sans text-xs text-cream-dim mt-0.5">
                The execution has reached step {executionState.step} and will continue indefinitely unless stopped. Automatic safety pause will trigger at Step {nextCheckpointStep}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {isPlaying && (
              <button
                onClick={() => setIsPlaying(false)}
                className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500 hover:text-canvas text-amber-300 font-mono text-xs font-semibold transition-all cursor-pointer"
                type="button"
              >
                STOP EXECUTION
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-full bg-surface hover:bg-surface-high border border-surface-highest/50 text-cream-dim hover:text-contradiction font-mono text-xs transition-all cursor-pointer"
              type="button"
            >
              RESTART
            </button>
          </div>
        </div>
      )}

      {/* Step 67 Checkpoint Automatic Pause Modal Overlay */}
      {showCheckpointModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-low border border-contradiction/50 max-w-lg w-full rounded-2xl p-6 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-contradiction/20 border border-contradiction/50 flex items-center justify-center text-contradiction shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs text-contradiction-bright font-bold uppercase tracking-wider">
                  AUTOMATIC SAFETY PAUSE AT STEP {executionState.step}
                </span>
                <h3 className="font-display text-lg text-cream font-bold">
                  UNBOUNDED LOOP THRESHOLD REACHED
                </h3>
              </div>
            </div>

            <p className="font-sans text-xs text-cream-dim leading-relaxed">
              Execution has completed another <strong>67 steps</strong> without terminating. Because this program lacks a termination predicate, it will run infinitely on an ideal Turing tape. In physical computers, an external resource bound is mandatory to stop execution.
            </p>

            <div className="bg-surface-lowest p-3 rounded-lg border border-surface-highest/40 font-mono text-xs text-muted-light flex justify-between items-center">
              <span>CURRENT ITERATIONS:</span>
              <span className="text-mint font-bold text-sm">i = {regI}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-full bg-surface hover:bg-surface-high border border-surface-highest/60 text-muted-light hover:text-contradiction font-mono text-xs font-semibold transition-all cursor-pointer"
                type="button"
              >
                RESTART ROUTINE
              </button>
              <button
                onClick={handleContinueCheckpoint}
                className="px-5 py-2.5 rounded-full bg-cream hover:bg-white text-canvas font-mono text-xs font-bold tracking-wide transition-all glow-cream hover:glow-mint shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                type="button"
              >
                <span>CONTINUE (+67 STEPS)</span>
                <ArrowRight className="w-3.5 h-3.5 text-mint" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Dual-Pane: Graph & Execution Trace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left / Center: Interactive State Graph Canvas */}
        <div className="xl:col-span-8 bg-surface-lowest border border-surface-highest/50 rounded-xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
          {/* Canvas Header Meta */}
          <div className="flex items-center justify-between mb-4 z-10">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-mint">BAY.01 //</span>
              <h2 className="font-display text-lg text-cream font-semibold">
                STATE TRANSITION TOPOLOGY
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-surface px-3 py-1 rounded-full border border-surface-highest/40 text-muted-light font-mono text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-mint"></span>
              <span>DETERMINISTIC FINITE AUTOMATON (DFA)</span>
            </div>
          </div>

          {/* SVG Graph Canvas with Interactive Visual Nodes */}
          <div className="relative w-full h-[480px] bg-surface-low rounded-lg border border-surface-highest/40 p-4 flex items-center justify-center overflow-hidden">
            {/* Background Precision Grid */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f3e9d3_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

            {/* Program Graph Topology Rendering */}
            <div className="relative w-full h-full">
              {/* SVG Edges Layer */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <marker
                    id="arrow-default"
                    markerHeight="6"
                    markerWidth="6"
                    orient="auto-start-reverse"
                    refX="7"
                    refY="5"
                    viewBox="0 0 10 10"
                  >
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#7E7768" />
                  </marker>
                  <marker
                    id="arrow-active"
                    markerHeight="6"
                    markerWidth="6"
                    orient="auto-start-reverse"
                    refX="7"
                    refY="5"
                    viewBox="0 0 10 10"
                  >
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#4EBA86" />
                  </marker>
                </defs>

                {/* If Finite or Parameterized Counter */}
                {selectedProgramId !== 'infinite-loop' ? (
                  <>
                    {/* q0 to q_eval */}
                    <line
                      x1="50%"
                      y1="75"
                      x2="50%"
                      y2="150"
                      stroke={
                        executionState.currentInstructionId === 'q_eval'
                          ? '#4EBA86'
                          : '#7E7768'
                      }
                      strokeWidth={
                        executionState.currentInstructionId === 'q_eval' ? 2.5 : 1.5
                      }
                      markerEnd={
                        executionState.currentInstructionId === 'q_eval'
                          ? 'url(#arrow-active)'
                          : 'url(#arrow-default)'
                      }
                    />

                    {/* q_eval to q_inc (YES branch) */}
                    <path
                      d="M 44% 210 L 26% 210 L 26% 305"
                      fill="none"
                      stroke={
                        executionState.currentInstructionId === 'q_inc'
                          ? '#4EBA86'
                          : '#7E7768'
                      }
                      strokeWidth={
                        executionState.currentInstructionId === 'q_inc' ? 2.5 : 1.5
                      }
                      markerEnd={
                        executionState.currentInstructionId === 'q_inc'
                          ? 'url(#arrow-active)'
                          : 'url(#arrow-default)'
                      }
                    />

                    {/* q_inc loop back to q_eval */}
                    <path
                      d="M 20% 360 L 12% 360 L 12% 210 L 36% 210"
                      fill="none"
                      stroke={
                        executionState.activeEdgeId === 'e-inc-eval'
                          ? '#4EBA86'
                          : '#7E7768'
                      }
                      strokeDasharray="4 4"
                      strokeWidth={
                        executionState.activeEdgeId === 'e-inc-eval' ? 2.5 : 1.5
                      }
                      markerEnd={
                        executionState.activeEdgeId === 'e-inc-eval'
                          ? 'url(#arrow-active)'
                          : 'url(#arrow-default)'
                      }
                    />

                    {/* q_eval to q_halt (NO branch) */}
                    <path
                      d="M 56% 210 L 74% 210 L 74% 305"
                      fill="none"
                      stroke={isHalted ? '#4EBA86' : '#7E7768'}
                      strokeWidth={isHalted ? 2.5 : 1.5}
                      markerEnd={isHalted ? 'url(#arrow-active)' : 'url(#arrow-default)'}
                    />
                  </>
                ) : (
                  /* Infinite loop edges */
                  <>
                    <line
                      x1="50%"
                      y1="85"
                      x2="35%"
                      y2="200"
                      stroke="#7E7768"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow-default)"
                    />
                    <path
                      d="M 42% 240 L 58% 240"
                      fill="none"
                      stroke="#E05656"
                      strokeWidth="2"
                      markerEnd="url(#arrow-active)"
                    />
                    <path
                      d="M 65% 285 C 65% 360, 35% 360, 35% 285"
                      fill="none"
                      stroke="#E05656"
                      strokeDasharray="4 4"
                      strokeWidth="2"
                      markerEnd="url(#arrow-active)"
                    />
                  </>
                )}
              </svg>

              {/* Node Layout - Finite Counter or Parameterized */}
              {selectedProgramId !== 'infinite-loop' ? (
                <div className="relative w-full h-full flex flex-col justify-between items-center py-4 z-10 pointer-events-auto">
                  {/* 1. START NODE */}
                  <div
                    className={`w-52 p-2 rounded-full border transition-all flex items-center justify-center gap-2 ${
                      executionState.currentInstructionId === 'q0_start'
                        ? 'bg-surface border-mint text-mint glow-mint scale-105'
                        : 'bg-surface-lowest border-surface-highest/60 text-cream-dim'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-mint"></span>
                    <span className="font-mono text-xs uppercase tracking-wider font-semibold">
                      q0 // ENTRY : START
                    </span>
                  </div>

                  {/* 2. DECISION DIAMOND CONDITIONAL */}
                  <div className="flex items-center justify-center relative w-full my-1">
                    {/* Left Branch Label */}
                    <div className="absolute left-[28%] -top-5 bg-surface-lowest px-2.5 py-0.5 rounded-full font-mono text-[11px] text-mint border border-mint/30 shadow-sm">
                      YES : [i &lt; {selectedProgramId === 'finite-counter' ? 5 : inputN}]
                    </div>

                    {/* Condition Node */}
                    <div
                      className={`w-64 p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                        executionState.currentInstructionId === 'q_eval'
                          ? 'bg-surface-high border-mint shadow-xl glow-mint scale-105'
                          : 'bg-surface border-surface-highest/60 text-cream-dim'
                      }`}
                    >
                      <span className="font-mono text-[11px] text-muted-light">
                        q_eval // BRANCH_TEST
                      </span>
                      <span className="font-mono text-base text-cream font-bold mt-1">
                        CHECK (i &lt; {selectedProgramId === 'finite-counter' ? 5 : inputN})
                      </span>
                      <span className="font-mono text-xs text-mint mt-1">
                        EVAL: {regI} &lt;{' '}
                        {selectedProgramId === 'finite-counter' ? 5 : inputN} →{' '}
                        {regI < (selectedProgramId === 'finite-counter' ? 5 : inputN)
                          ? 'TRUE'
                          : 'FALSE'}
                      </span>
                    </div>

                    {/* Right Branch Label */}
                    <div className="absolute right-[28%] -top-5 bg-surface-lowest px-2.5 py-0.5 rounded-full font-mono text-[11px] text-muted-light border border-surface-highest/40">
                      NO : [i ≥ {selectedProgramId === 'finite-counter' ? 5 : inputN}]
                    </div>
                  </div>

                  {/* 3. BOTTOM ACTION ROW: INCREMENT vs HALT */}
                  <div className="w-full flex items-start justify-around px-4">
                    {/* ACTIVE WORKER NODE: INCREMENT */}
                    <div
                      className={`w-60 p-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        executionState.currentInstructionId === 'q_inc'
                          ? 'bg-surface-high border-mint shadow-xl glow-mint scale-105'
                          : 'bg-surface border-surface-highest/60 opacity-70'
                      }`}
                    >
                      {executionState.currentInstructionId === 'q_inc' && (
                        <div className="px-2 py-0.5 bg-mint text-canvas rounded-full font-mono text-[10px] font-bold shadow-sm">
                          ACTIVE EXECUTION HEAD
                        </div>
                      )}
                      <span className="font-mono text-[11px] text-muted-light">
                        q_loop // ACC_MUTATE
                      </span>
                      <span className="font-mono text-lg text-mint font-bold">
                        i = i + 1
                      </span>
                      <div className="w-full bg-surface-lowest px-2 py-1 rounded border border-surface-highest/40 font-mono text-xs text-cream-dim flex justify-between">
                        <span>R[i] NEXT:</span>
                        <span className="text-cream font-bold">{regI + 1}</span>
                      </div>
                    </div>

                    {/* TERMINAL STATE: HALT ACCEPT */}
                    <div
                      className={`w-60 p-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        isHalted
                          ? 'bg-surface-high border-mint shadow-2xl glow-mint scale-105'
                          : 'bg-surface border-surface-highest/40 opacity-50'
                      }`}
                    >
                      <span className="font-mono text-[11px] text-muted-light">
                        q_accept // TERMINAL
                      </span>
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-5 h-5 ${isHalted ? 'text-mint' : 'text-muted-light'}`}
                        />
                        <span className="font-mono text-base text-cream font-bold">
                          HALT (q_accept)
                        </span>
                      </div>
                      <div className="w-full bg-surface-lowest px-2 py-1 rounded border border-surface-highest/40 font-mono text-xs text-muted-light flex justify-between">
                        <span>STATUS:</span>
                        <span className={isHalted ? 'text-mint font-bold' : 'text-cream-dim'}>
                          {isHalted ? 'TERMINATED' : 'WAITING'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Infinite Loop Nodes Layout */
                <div className="relative w-full h-full flex flex-col justify-around items-center py-4 z-10 pointer-events-auto">
                  <div
                    className={`w-52 p-2 rounded-full border transition-all flex items-center justify-center gap-2 ${
                      executionState.currentInstructionId === 'q0_start'
                        ? 'bg-surface border-mint text-mint glow-mint'
                        : 'bg-surface-lowest border-surface-highest/60 text-cream-dim'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-mint"></span>
                    <span className="font-mono text-xs uppercase tracking-wider font-semibold">
                      q0 // ENTRY : START
                    </span>
                  </div>

                  <div className="w-full flex items-center justify-around px-8">
                    {/* Node 1: Spin */}
                    <div
                      className={`w-64 p-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        executionState.currentInstructionId === 'q_loop'
                          ? 'bg-surface-high border-contradiction shadow-xl glow-red scale-105'
                          : 'bg-surface border-surface-highest/60'
                      }`}
                    >
                      <span className="font-mono text-[11px] text-muted-light">
                        q_spin // CYCLE
                      </span>
                      <span className="font-mono text-lg text-contradiction font-bold">
                        i = i + 1
                      </span>
                      <span className="font-mono text-xs text-cream">CURRENT: i = {regI}</span>
                    </div>

                    {/* Node 2: Jump */}
                    <div
                      className={`w-64 p-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        executionState.currentInstructionId === 'q_jump'
                          ? 'bg-surface-high border-contradiction shadow-xl glow-red scale-105'
                          : 'bg-surface border-surface-highest/60'
                      }`}
                    >
                      <span className="font-mono text-[11px] text-muted-light">
                        q_recurse // UNBOUNDED
                      </span>
                      <span className="font-mono text-base text-cream font-bold">
                        GOTO q_spin
                      </span>
                      <span className="font-mono text-xs text-contradiction-bright">
                        NO TERMINAL EXIT (∞)
                      </span>
                    </div>
                  </div>

                  <div className="bg-surface-lowest px-4 py-2 rounded-full border border-contradiction/40 text-contradiction-bright font-mono text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-contradiction" />
                    <span>NON-TERMINATING COMPUTATIONAL RUN :: NO HALT PREDICATE</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Canvas Footer Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-muted-light font-mono text-xs bg-surface-low border border-surface-highest/40 p-3 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-mint"></span>
                <span className="text-cream">Active Node</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-surface-highest border border-surface-highest"></span>
                <span>Dormant Node</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-contradiction"></span>
                <span>Unbounded Cycle</span>
              </div>
            </div>
            <span className="text-cream-dim">
              PROGRAM ID: {currentProgram.shortTag} • EXPECTED:{' '}
              {currentProgram.theoreticalBehavior.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Right: Execution Trace Tape & Termination Verdict */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          {/* Card 1: Execution Trace Tape */}
          <div className="bg-surface-lowest border border-surface-highest/50 rounded-xl p-5 shadow-sm flex flex-col h-[320px]">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-mint">BAY.02 //</span>
                <h3 className="font-display text-base text-cream font-semibold">
                  EXECUTION TRACE TAPE
                </h3>
              </div>
              <span className="font-mono text-[10px] text-muted-light bg-surface px-2 py-0.5 rounded-full border border-surface-highest/40">
                HISTORY: {executionState.trace.length} STEPS
              </span>
            </div>

            {/* Trace List Viewport */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 font-mono text-xs">
              {executionState.trace.map((entry, idx) => {
                const isLatest = idx === executionState.trace.length - 1;
                return (
                  <div
                    key={`${entry.step}-${idx}`}
                    className={`flex items-center justify-between p-2 rounded border transition-all ${
                      isLatest
                        ? 'bg-surface-high border-mint text-cream glow-mint font-semibold'
                        : 'bg-surface-low border-surface-highest/30 text-cream-dim'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={isLatest ? 'text-mint font-bold' : 'text-muted-light'}>
                        {entry.timeLabel}
                      </span>
                      <span className="truncate max-w-[140px]">{entry.instructionLabel}</span>
                    </div>
                    <span className="px-1.5 py-0.5 bg-surface-lowest rounded text-[11px] border border-surface-highest/40 text-cream">
                      [ i = {entry.variableSnapshot['i'] ?? 0} ]
                    </span>
                  </div>
                );
              })}
              <div ref={traceEndRef} />
            </div>

            <div className="mt-3 pt-2 border-t border-surface-highest/40 flex items-center justify-between text-muted-light font-mono text-[11px] shrink-0">
              <span>ACTIVE POINTER: 0x0{regI}</span>
              <span className="text-mint font-semibold">
                {isHalted
                  ? 'TERMINAL STATE REACHED'
                  : isInfinite
                  ? 'CYCLE CONTINUES (UNBOUNDED)'
                  : `${Math.max(0, 5 - regI)} STEPS REMAINING`}
              </span>
            </div>
          </div>

          {/* Card 2: Termination Proof Analysis */}
          <div className="bg-surface-lowest border border-surface-highest/50 rounded-xl p-5 shadow-sm flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-mint">BAY.03 //</span>
                  <h3 className="font-display text-base text-cream font-semibold">
                    TERMINATION OBSERVATION
                  </h3>
                </div>
                {isHalted ? (
                  <CheckCircle2 className="w-4 h-4 text-mint" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                )}
              </div>

              {/* Gauge & Mathematical Verdict */}
              <div className="flex items-center gap-4 my-2 bg-surface-low border border-surface-highest/40 p-4 rounded-lg">
                {/* SVG Gauge Ring */}
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
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
                      stroke={isHalted ? '#4EBA86' : isInfinite ? '#E05656' : '#E5DECE'}
                      strokeDasharray="88, 100"
                      strokeDashoffset={
                        isHalted
                          ? '0'
                          : isInfinite
                          ? '88'
                          : String(88 - Math.min(88, (regI / 5) * 88))
                      }
                      strokeLinecap="round"
                      strokeWidth="3.5"
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-display text-sm text-cream font-bold">
                      {isHalted
                        ? 'HALT'
                        : isInfinite
                        ? '∞'
                        : `${Math.min(100, Math.round((regI / 5) * 100))}%`}
                    </span>
                    <span className="font-mono text-[9px] text-muted-light">
                      {isHalted ? 'EXIT' : isInfinite ? 'CYCLE' : 'PROG'}
                    </span>
                  </div>
                </div>

                {/* Verdict Info */}
                <div className="flex flex-col gap-1">
                  <span
                    className={`font-mono text-xs font-semibold uppercase ${
                      isHalted ? 'text-mint' : isInfinite ? 'text-contradiction' : 'text-cream'
                    }`}
                  >
                    {isHalted
                      ? '✓ PROVABLY TERMINATES'
                      : isInfinite
                      ? '∞ NON-TERMINATING EXAMPLE'
                      : 'EXECUTION IN PROGRESS'}
                  </span>
                  <p className="font-sans text-xs text-cream-dim/90 leading-relaxed">
                    {isHalted
                      ? 'Strict monotonically increasing ranking function reached lower bound. Routine stopped.'
                      : isInfinite
                      ? 'No ranking function exists. The cycle repeats indefinitely without a terminal state.'
                      : `Evaluating step ${executionState.step}. Head advances monotonically.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Advance to Predictor Button */}
            <div className="mt-4 pt-3 border-t border-surface-highest/40 flex flex-col gap-2">
              <div className="flex items-center justify-between text-muted-light font-mono text-[11px]">
                <span>NEXT DISCOVERY:</span>
                <span className="text-cream">THE PREDICTOR PARADOX</span>
              </div>
              <button
                onClick={onProceedToPredictor}
                className="w-full py-3 bg-cream hover:bg-white text-canvas rounded-full font-mono text-xs font-bold tracking-wide flex items-center justify-center gap-2 transition-all glow-cream hover:glow-mint shadow-md cursor-pointer"
                type="button"
              >
                <span>PROCEED TO PREDICTOR : PARADOX</span>
                <ArrowRight className="w-4 h-4 text-mint" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
