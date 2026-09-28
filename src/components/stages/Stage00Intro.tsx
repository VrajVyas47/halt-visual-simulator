import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Terminal } from 'lucide-react';
import type { StageId } from '../../engine/types';

interface Stage00IntroProps {
  onStartSimulation: () => void;
  onNavigateStage: (stage: StageId) => void;
}

export const Stage00Intro: React.FC<Stage00IntroProps> = ({
  onStartSimulation,
  onNavigateStage,
}) => {
  // Dynamic animated tape head and state cycling simulation for the live preview
  const [activeTapeIdx, setActiveTapeIdx] = useState(4);
  const [activeStateLabel, setActiveStateLabel] = useState('q0_INIT');
  const [activeCycleMs] = useState(8.42);

  const tapeCells = [
    { idx: '00', val: '1' },
    { idx: '01', val: '0' },
    { idx: '02', val: '1' },
    { idx: '03', val: '1' },
    { idx: '04', val: '1' },
    { idx: '05', val: '0' },
    { idx: '06', val: '_' },
    { idx: '07', val: '_' },
  ];

  const stateCycle = ['q0_INIT', 'q1_SCAN', 'q_eval', 'q_inc', 'q_eval'];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTapeIdx((prev) => (prev + 1) % tapeCells.length);
      setActiveStateLabel((prev) => {
        const nextIdx = (stateCycle.indexOf(prev) + 1) % stateCycle.length;
        return stateCycle[nextIdx];
      });
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Hero Laboratory Module */}
      <div className="w-full relative overflow-hidden rounded-xl bg-surface-low border border-surface-highest/60 p-6 lg:p-8 flex flex-col gap-6 shadow-2xl">
        {/* Ambient Subtle Lighting Glows */}
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-cream/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-36 -right-24 w-[28rem] h-[28rem] bg-mint/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Inner Canvas Basin */}
        <div className="w-full bg-surface-lowest rounded-lg border border-surface-highest/40 p-6 lg:p-8 flex flex-col gap-6 relative overflow-hidden shadow-inner">
          {/* Top Telemetry Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-highest/50 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-mint shadow-[0_0_8px_currentColor] animate-pulse"></span>
              <span className="font-mono text-xs uppercase text-mint tracking-wider font-semibold">
                EXP_ENV // STAGE_INIT
              </span>
              <span className="text-muted-dark font-mono text-xs">/</span>
              <span className="font-mono text-xs text-cream-dim">
                COMPUTATIONAL BOUNDARY EXPERIMENT
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <div className="px-3 py-1 rounded-full bg-surface border border-surface-highest/50 text-cream-dim flex items-center gap-1.5">
                <span className="text-mint font-bold">STATE:</span>
                <span className="text-cream font-semibold">{activeStateLabel}</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-surface border border-surface-highest/50 text-cream-dim hidden sm:flex items-center gap-1.5">
                <span className="text-cream font-bold">DETERMINISTIC:</span>
                <span className="text-mint">TRUE</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-surface border border-surface-highest/50 text-cream-dim flex items-center gap-1.5">
                <span className="text-muted-light">HEAD:</span>
                <span className="text-cream">ADDR_0x0{activeTapeIdx}</span>
              </div>
            </div>
          </div>

          {/* Main Grid: Left Manifesto / Right Topology Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            {/* Left Column: Mission Core */}
            <div className="lg:col-span-6 flex flex-col items-start gap-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-surface-highest/60 text-cream">
                <Sparkles className="w-3.5 h-3.5 text-mint" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-cream-dim font-medium">
                  UNDECIDABILITY PROOF LAB
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h1 className="font-display text-4xl lg:text-5xl tracking-tight text-cream font-semibold">
                  HALT <span className="text-mint font-bold">//</span> <span className="text-cream-dim">?</span>
                </h1>
                <p className="font-display text-xl text-cream-dim font-normal tracking-wide">
                  CAN YOU PREDICT A PROGRAM?
                </p>
              </div>

              <p className="font-sans text-sm text-cream-dim/90 max-w-xl leading-relaxed">
                In 1936, Alan Turing demonstrated that no general algorithm can determine whether an arbitrary computational routine will finish execution or spin into infinite recursive decay. Test the boundary below.
              </p>

              {/* Progress Milestones */}
              <div className="flex flex-wrap items-center gap-2 py-1">
                <div className="flex items-center gap-1.5 bg-surface-high border border-mint/40 px-3 py-1 rounded-full shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-mint shadow-[0_0_8px_currentColor]"></span>
                  <span className="font-mono text-xs text-cream font-semibold">01 SIMULATE</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-dark" />
                <button
                  onClick={() => onNavigateStage('stage-02-predictor')}
                  className="flex items-center gap-1.5 bg-surface border border-surface-highest/40 px-3 py-1 rounded-full opacity-70 hover:opacity-100 transition-opacity"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-light"></span>
                  <span className="font-mono text-xs text-cream-dim">02 PREDICTOR</span>
                </button>
                <ArrowRight className="w-3.5 h-3.5 text-muted-dark opacity-50" />
                <button
                  onClick={() => onNavigateStage('stage-03-reality')}
                  className="flex items-center gap-1.5 bg-surface border border-surface-highest/40 px-3 py-1 rounded-full opacity-50 hover:opacity-100 transition-opacity"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-light"></span>
                  <span className="font-mono text-xs text-cream-dim">03 REALITY</span>
                </button>
              </div>

              {/* CTA Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={onStartSimulation}
                  className="group relative px-7 py-3.5 rounded-full bg-cream hover:bg-white text-canvas font-mono text-sm font-semibold flex items-center justify-center gap-3 transition-all glow-cream hover:glow-mint hover:-translate-y-0.5 active:translate-y-0 shadow-lg cursor-pointer"
                  type="button"
                >
                  <span>START SIMULATION</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-mint" />
                </button>
                <div className="flex flex-col justify-center">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-mint font-semibold">
                    RUN INITIALIZER
                  </span>
                  <span className="font-mono text-xs text-muted-light">
                    TRACE RUNNER :: READY
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic State Graph & Tape Viewport */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="w-full bg-surface-low border border-surface-highest/50 rounded-lg p-4 flex flex-col gap-3 relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cream" />
                    <span className="font-mono text-xs uppercase tracking-wider text-cream font-medium">
                      STATE TRANSITION TOPOLOGY PREVIEW
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-mint bg-surface px-2.5 py-0.5 rounded-full border border-surface-highest/40">
                    TRANSIT_CYCLE : {activeCycleMs}ms
                  </span>
                </div>

                {/* Animated Graph SVG Canvas */}
                <div className="relative w-full h-52 bg-surface-lowest rounded-md p-2 overflow-hidden flex items-center justify-center border border-surface-highest/30">
                  <svg
                    className="w-full h-full"
                    fill="none"
                    viewBox="0 0 540 200"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <marker
                        id="arrow-intro"
                        markerHeight="6"
                        markerWidth="6"
                        orient="auto-start-reverse"
                        refX="8"
                        refY="5"
                        viewBox="0 0 10 10"
                      >
                        <path d="M 0 1 L 9 5 L 0 9 z" fill="#cfc6b1" />
                      </marker>
                      <marker
                        id="arrow-green-intro"
                        markerHeight="6"
                        markerWidth="6"
                        orient="auto-start-reverse"
                        refX="8"
                        refY="5"
                        viewBox="0 0 10 10"
                      >
                        <path d="M 0 1 L 9 5 L 0 9 z" fill="#70dba4" />
                      </marker>
                      <marker
                        id="arrow-red-intro"
                        markerHeight="6"
                        markerWidth="6"
                        orient="auto-start-reverse"
                        refX="8"
                        refY="5"
                        viewBox="0 0 10 10"
                      >
                        <path d="M 0 1 L 9 5 L 0 9 z" fill="#E05656" />
                      </marker>
                    </defs>

                    {/* Paths */}
                    <path
                      className="animate-pulse"
                      d="M 75 100 L 155 100"
                      markerEnd="url(#arrow-green-intro)"
                      stroke="#70dba4"
                      strokeDasharray="4 4"
                      strokeWidth="2"
                    />
                    <path
                      d="M 195 100 L 275 100"
                      markerEnd="url(#arrow-intro)"
                      stroke="#cfc6b1"
                      strokeDasharray="3 3"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M 315 85 C 340 40, 420 40, 445 80"
                      markerEnd="url(#arrow-green-intro)"
                      stroke="#70dba4"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M 315 115 C 345 160, 420 160, 445 120"
                      markerEnd="url(#arrow-red-intro)"
                      stroke="#E05656"
                      strokeDasharray="3 3"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M 465 130 C 475 180, 435 195, 305 125"
                      markerEnd="url(#arrow-red-intro)"
                      stroke="#E05656"
                      strokeDasharray="2 2"
                      strokeWidth="1.5"
                    />

                    {/* Nodes */}
                    <g transform="translate(55, 100)">
                      <circle
                        cx="0"
                        cy="0"
                        r="18"
                        fill="#1C1A17"
                        stroke="#70dba4"
                        strokeWidth="2"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="5"
                        fill="#70dba4"
                        opacity="0.5"
                        className="animate-ping"
                      />
                      <text
                        dy="4"
                        fill="#F4EFE6"
                        fontFamily="JetBrains Mono"
                        fontSize="11"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        q₀
                      </text>
                      <text
                        dy="-24"
                        fill="#70dba4"
                        fontFamily="JetBrains Mono"
                        fontSize="9"
                        textAnchor="middle"
                      >
                        START
                      </text>
                    </g>

                    <g transform="translate(175, 100)">
                      <circle
                        cx="0"
                        cy="0"
                        r="16"
                        fill="#1C1A17"
                        stroke="#cfc6b1"
                        strokeWidth="1.5"
                      />
                      <text
                        dy="4"
                        fill="#F4EFE6"
                        fontFamily="JetBrains Mono"
                        fontSize="11"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        q₁
                      </text>
                      <text
                        dy="26"
                        fill="#CCC6BB"
                        fontFamily="JetBrains Mono"
                        fontSize="9"
                        textAnchor="middle"
                      >
                        SET i=0
                      </text>
                    </g>

                    <g transform="translate(295, 100)">
                      <circle
                        cx="0"
                        cy="0"
                        r="18"
                        fill="#1C1A17"
                        stroke="#E5DECE"
                        strokeWidth="2"
                      />
                      <text
                        dy="4"
                        fill="#F4EFE6"
                        fontFamily="JetBrains Mono"
                        fontSize="10"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        q_eval
                      </text>
                      <text
                        dy="-24"
                        fill="#F4EFE6"
                        fontFamily="JetBrains Mono"
                        fontSize="9"
                        textAnchor="middle"
                      >
                        i &lt; 5?
                      </text>
                    </g>

                    <g transform="translate(465, 80)">
                      <circle
                        cx="0"
                        cy="0"
                        r="16"
                        fill="#1C1A17"
                        stroke="#70dba4"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="12"
                        fill="none"
                        stroke="#70dba4"
                        strokeWidth="1"
                      />
                      <text
                        dy="4"
                        fill="#70dba4"
                        fontFamily="JetBrains Mono"
                        fontSize="10"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        q_halt
                      </text>
                      <text
                        dy="-22"
                        fill="#70dba4"
                        fontFamily="JetBrains Mono"
                        fontSize="9"
                        textAnchor="middle"
                      >
                        HALT [0]
                      </text>
                    </g>

                    <g transform="translate(465, 120)">
                      <circle
                        cx="0"
                        cy="0"
                        r="16"
                        fill="#1C1A17"
                        stroke="#E05656"
                        strokeWidth="1.5"
                      />
                      <text
                        dy="4"
                        fill="#E05656"
                        fontFamily="JetBrains Mono"
                        fontSize="10"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        q_loop
                      </text>
                      <text
                        dy="26"
                        fill="#E05656"
                        fontFamily="JetBrains Mono"
                        fontSize="9"
                        textAnchor="middle"
                      >
                        PARADOX ∞
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Linear Tape Viewport */}
                <div className="flex flex-col gap-2 bg-surface-lowest p-3 rounded-md border border-surface-highest/30">
                  <div className="flex items-center justify-between text-muted-light font-mono text-[11px]">
                    <span className="text-cream-dim">LINEAR TAPE VIEWPORT (64-CELL WINDOW)</span>
                    <span className="text-mint font-semibold">TAPE HEAD: [INDEX 0{activeTapeIdx}]</span>
                  </div>
                  <div className="grid grid-cols-8 gap-1.5 font-mono text-xs">
                    {tapeCells.map((cell, idx) => {
                      const isActive = idx === activeTapeIdx;
                      return (
                        <div
                          key={cell.idx}
                          className={`h-9 rounded-sm flex flex-col items-center justify-center transition-all ${
                            isActive
                              ? 'bg-mint text-canvas font-bold scale-105 shadow-[0_0_12px_rgba(112,219,164,0.4)]'
                              : 'bg-surface border border-surface-highest/40 text-cream-dim'
                          }`}
                        >
                          <span className={`text-[8px] ${isActive ? 'text-canvas/80' : 'text-muted'}`}>
                            {cell.idx}
                          </span>
                          <span className="text-xs">{cell.val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Philosophical & Technical Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1 */}
        <div className="bg-surface-low border border-surface-highest/50 rounded-lg p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-surface-highest transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-light font-medium">
                THEORETICAL BOUNDARY
              </span>
              <span className="font-display text-base text-cream font-semibold">
                UNDECIDABILITY PRINCIPLE
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface border border-surface-highest/40 flex items-center justify-center text-mint">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="font-sans text-xs text-cream-dim/90 leading-relaxed">
            No universal predictor can exist that correctly determines termination for every possible arbitrary program and input.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-surface-highest/40 text-muted-light font-mono text-[11px]">
            <span>FOUNDATION</span>
            <span className="text-mint font-semibold">ALAN TURING (1936)</span>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="bg-surface-low border border-surface-highest/50 rounded-lg p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-surface-highest transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-light font-medium">
                PROOF TECHNIQUE
              </span>
              <span className="font-display text-base text-cream font-semibold">
                REDUCTIO AD ABSURDUM
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface border border-surface-highest/40 flex items-center justify-center text-cream">
              <Terminal className="w-4 h-4" />
            </div>
          </div>
          <p className="font-sans text-xs text-cream-dim/90 leading-relaxed">
            Assume a universal predictor exists. Wrap it inside a self-referential paradox that inverts the verdict. Contradiction is mathematically inevitable.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-surface-highest/40 text-muted-light font-mono text-[11px]">
            <span>PARADOX MAPPING</span>
            <span className="text-cream font-semibold">P(P) INVERSION</span>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="bg-surface-low border border-surface-highest/50 rounded-lg p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-surface-highest transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-mint font-medium">
                PRACTICAL REALITY
              </span>
              <span className="font-display text-base text-cream font-semibold">
                EVM RESOURCE LIMITS
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface border border-surface-highest/40 flex items-center justify-center text-contradiction">
              <span className="font-mono text-xs font-bold text-mint">GAS</span>
            </div>
          </div>
          <p className="font-sans text-xs text-cream-dim/90 leading-relaxed">
            Since computers cannot predict arbitrary loops, Ethereum meters execution: finite gas bounds runtime without claiming to solve the Halting Problem.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-surface-highest/40 text-muted-light font-mono text-[11px]">
            <span>SYNTHESIS</span>
            <span className="text-contradiction-bright font-semibold">GAS BOUNDS ≠ HALT DECIDER</span>
          </div>
        </div>
      </div>
    </div>
  );
};
