import React from 'react';
import type { StageId } from '../../engine/types';
import { Volume2, VolumeX, RotateCcw, Activity } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

import { soundManager } from '../../utils/audio';

interface HeaderProps {
  currentStage: StageId;
  onSelectStage: (stage: StageId) => void;
  onResetAll?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  onSelectStage,
  onResetAll,
}) => {
  const [audioEnabled, setAudioEnabled] = React.useState(soundManager.isEnabled());

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    soundManager.setEnabled(next);
  };

  const stages: { id: StageId; label: string; short: string }[] = [
    { id: 'stage-00-intro', label: 'INTRO', short: 'INTRO' },
    { id: 'stage-01-simulator', label: 'SIMULATE', short: 'SIMULATE' },
    { id: 'stage-02-predictor', label: 'PREDICTOR', short: 'PREDICTOR' },
    { id: 'stage-03-reality', label: 'REALITY', short: 'REALITY' },
  ];

  return (
    <header className="fixed top-0 left-0 lg:left-20 right-0 h-16 bg-surface-lowest/90 backdrop-blur-md z-40 px-4 border-b border-surface-highest/40 flex items-center justify-between transition-colors duration-200">
      {/* Brand Identity */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onSelectStage('stage-00-intro')}
          className="flex items-center gap-1.5 text-left group focus:outline-none cursor-pointer"
        >
          <span className="font-display text-xl font-bold tracking-tight text-cream group-hover:text-cream-light transition-colors">
            HALT
          </span>
          <span className="font-mono text-base font-semibold text-mint">//</span>
          <span className="font-display text-xl text-cream-dim">?</span>
        </button>

        <div className="h-4 w-px bg-surface-highest hidden sm:block"></div>

        <div className="hidden xl:flex items-center gap-2 bg-surface-low px-3 py-1 rounded-full border border-surface-highest/40">
          <span className="w-2 h-2 rounded-full bg-mint animate-pulse"></span>
          <span className="font-mono text-[11px] text-cream-dim tracking-wide">
            TURING MACHINE EXP. LAB // EVM RESOURCE SYNTHESIS
          </span>
        </div>
      </div>

      {/* Navigation Pill Strip */}
      <nav className="flex items-center gap-1 bg-surface-low p-1 rounded-full border border-surface-highest/50 shadow-inner overflow-x-auto max-w-[60vw] sm:max-w-none">
        {stages.map((st) => {
          const isActive = currentStage === st.id;
          return (
            <button
              key={st.id}
              onClick={() => onSelectStage(st.id)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all duration-200 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-cream text-canvas font-semibold shadow-md glow-cream'
                  : 'text-cream-dim hover:text-cream-light hover:bg-surface-high'
              }`}
            >
              <span className="hidden md:inline">{st.label}</span>
              <span className="md:hidden">{st.short}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Telemetry Deck */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden 2xl:flex items-center gap-2 bg-surface-low px-2.5 py-1 rounded-full border border-surface-highest/40 font-mono text-[11px]">
          <Activity className="w-3.5 h-3.5 text-mint" />
          <span className="text-muted-light">ACADEMIC_LAB:</span>
          <span className="text-cream font-medium">AAD 2026–27</span>
        </div>

        {/* Dark / Light Theme Toggle */}
        <ThemeToggle variant="header" />

        {/* Audio Synthesizer Telemetry Toggle */}
        <button
          onClick={toggleAudio}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border cursor-pointer ${
            audioEnabled
              ? 'bg-mint/20 border-mint text-mint'
              : 'bg-surface-low border-surface-highest/50 text-muted-light hover:text-cream hover:bg-surface'
          }`}
          title={
            audioEnabled
              ? 'Telemetry Audio: ACTIVE (Synthesizer clicks & feedback enabled - Click to Mute)'
              : 'Telemetry Audio: MUTED (Click to Enable subtle lab audio feedback)'
          }
          aria-label="Toggle telemetry audio"
          type="button"
        >
          {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Reset Simulation State */}
        {onResetAll && (
          <button
            onClick={onResetAll}
            className="w-8 h-8 rounded-full bg-surface-low border border-surface-highest/50 flex items-center justify-center text-muted-light hover:text-cream-light hover:bg-surface-high transition-colors cursor-pointer"
            title="Reset Global Simulation State"
            aria-label="Reset simulation"
            type="button"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
