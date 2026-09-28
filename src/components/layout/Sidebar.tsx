import React from 'react';
import type { StageId } from '../../engine/types';
import {
  Play,
  RotateCcw,
  StepForward,
  Cpu,
  HelpCircle,
  Layers,
  Fuel,
  Terminal,
} from 'lucide-react';

interface SidebarProps {
  currentStage: StageId;
  onSelectStage: (stage: StageId) => void;
  onQuickRun?: () => void;
  onQuickStep?: () => void;
  onQuickReset?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentStage,
  onSelectStage,
  onQuickRun,
  onQuickStep,
  onQuickReset,
}) => {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-20 bg-surface-lowest z-50 flex-col items-center py-4 justify-between border-r border-surface-highest/40">
      {/* Top Cluster: Logo / Core Icon */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => onSelectStage('stage-00-intro')}
          className="w-11 h-11 rounded-full bg-cream-container/30 border border-cream/20 flex items-center justify-center hover:bg-cream-container/50 transition-all group"
          title="Return to Intro"
        >
          <Cpu className="w-5 h-5 text-cream group-hover:scale-110 transition-transform" />
        </button>

        <div className="w-6 h-px bg-surface-highest/60"></div>

        {/* Stage Shortcuts */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onSelectStage('stage-00-intro')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              currentStage === 'stage-00-intro'
                ? 'bg-cream text-canvas shadow-md'
                : 'bg-surface-low border border-surface-highest/40 text-muted-light hover:text-cream hover:bg-surface'
            }`}
            title="Stage 00: Intro"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectStage('stage-01-simulator')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              currentStage === 'stage-01-simulator'
                ? 'bg-cream text-canvas shadow-md'
                : 'bg-surface-low border border-surface-highest/40 text-muted-light hover:text-cream hover:bg-surface'
            }`}
            title="Stage 01: Program Simulator"
          >
            <Terminal className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectStage('stage-02-predictor')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              currentStage === 'stage-02-predictor'
                ? 'bg-cream text-canvas shadow-md'
                : 'bg-surface-low border border-surface-highest/40 text-muted-light hover:text-cream hover:bg-surface'
            }`}
            title="Stage 02: The Predictor Paradox"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectStage('stage-03-reality')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              currentStage === 'stage-03-reality'
                ? 'bg-cream text-canvas shadow-md'
                : 'bg-surface-low border border-surface-highest/40 text-muted-light hover:text-cream hover:bg-surface'
            }`}
            title="Stage 03: Reality & Gas Bounds"
          >
            <Fuel className="w-4 h-4" />
          </button>
        </div>

        <div className="w-6 h-px bg-surface-highest/60"></div>

        {/* Quick Simulator Execution Actions */}
        <div className="flex flex-col gap-2">
          {onQuickRun && (
            <button
              onClick={onQuickRun}
              className="w-11 h-11 rounded-full bg-mint/10 border border-mint/30 hover:bg-mint hover:text-canvas text-mint flex items-center justify-center transition-all shadow-sm"
              title="Run / Resume Execution"
            >
              <Play className="w-4 h-4 ml-0.5" />
            </button>
          )}

          {onQuickStep && (
            <button
              onClick={onQuickStep}
              className="w-11 h-11 rounded-full bg-surface-low border border-surface-highest/40 hover:bg-surface text-cream-dim hover:text-white flex items-center justify-center transition-all"
              title="Step Single Instruction"
            >
              <StepForward className="w-4 h-4" />
            </button>
          )}

          {onQuickReset && (
            <button
              onClick={onQuickReset}
              className="w-11 h-11 rounded-full bg-surface-low border border-surface-highest/40 hover:bg-surface text-muted-light hover:text-contradiction flex items-center justify-center transition-all"
              title="Reset Routine"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Status Indicator */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-col items-center font-mono text-[10px]">
          <span className="text-mint font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse"></span>
            LIVE
          </span>
          <span className="text-muted text-[9px]">DFA_LAB</span>
        </div>
      </div>
    </aside>
  );
};
