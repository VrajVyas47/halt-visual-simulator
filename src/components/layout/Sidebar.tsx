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
import { ThemeToggle } from './ThemeToggle';

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
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-20 bg-surface-lowest z-50 flex-col items-center py-4 justify-between border-r border-surface-highest/40 transition-colors duration-200">
      {/* Top Cluster: Logo / Core Icon */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => onSelectStage('stage-00-intro')}
          className="w-11 h-11 rounded-full bg-cream-container/30 border border-cream/20 flex items-center justify-center hover:bg-cream-container/50 transition-all group cursor-pointer"
          title="Return to Intro"
          type="button"
        >
          <Cpu className="w-5 h-5 text-cream group-hover:scale-110 transition-transform" />
        </button>

        <div className="w-6 h-px bg-surface-highest/60"></div>

        {/* Stage Shortcuts */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onSelectStage('stage-00-intro')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              currentStage === 'stage-00-intro'
                ? 'bg-cream text-canvas shadow-md'
                : 'bg-surface-low border border-surface-highest/40 text-muted-light hover:text-cream hover:bg-surface'
            }`}
            title="Stage 00: Intro"
            type="button"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectStage('stage-01-simulator')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              currentStage === 'stage-01-simulator'
                ? 'bg-cream text-canvas shadow-md'
                : 'bg-surface-low border border-surface-highest/40 text-muted-light hover:text-cream hover:bg-surface'
            }`}
            title="Stage 01: Program Simulator"
            type="button"
          >
            <Terminal className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectStage('stage-02-predictor')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              currentStage === 'stage-02-predictor'
                ? 'bg-cream text-canvas shadow-md'
                : 'bg-surface-low border border-surface-highest/40 text-muted-light hover:text-cream hover:bg-surface'
            }`}
            title="Stage 02: The Predictor Paradox"
            type="button"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectStage('stage-03-reality')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              currentStage === 'stage-03-reality'
                ? 'bg-cream text-canvas shadow-md'
                : 'bg-surface-low border border-surface-highest/40 text-muted-light hover:text-cream hover:bg-surface'
            }`}
            title="Stage 03: Reality & Gas Bounds"
            type="button"
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
              className="w-11 h-11 rounded-full bg-mint/10 border border-mint/30 hover:bg-mint hover:text-canvas text-mint flex items-center justify-center transition-all shadow-sm cursor-pointer"
              title="Run / Resume Execution"
              type="button"
            >
              <Play className="w-4 h-4 ml-0.5" />
            </button>
          )}

          {onQuickStep && (
            <button
              onClick={onQuickStep}
              className="w-11 h-11 rounded-full bg-surface-low border border-surface-highest/40 hover:bg-surface text-cream-dim hover:text-cream-light flex items-center justify-center transition-all cursor-pointer"
              title="Step Single Instruction"
              type="button"
            >
              <StepForward className="w-4 h-4" />
            </button>
          )}

          {onQuickReset && (
            <button
              onClick={onQuickReset}
              className="w-11 h-11 rounded-full bg-surface-low border border-surface-highest/40 hover:bg-surface text-muted-light hover:text-contradiction flex items-center justify-center transition-all cursor-pointer"
              title="Reset Routine"
              type="button"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Cluster: Theme Toggle + Status Indicator */}
      <div className="flex flex-col items-center gap-3">
        {/* Sidebar Theme Changer */}
        <ThemeToggle variant="sidebar" />

        <div className="w-6 h-px bg-surface-highest/60"></div>

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
