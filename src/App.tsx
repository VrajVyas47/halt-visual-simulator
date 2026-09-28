import { useState } from 'react';
import type { StageId } from './engine/types';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Stage00Intro } from './components/stages/Stage00Intro';
import { Stage01Simulator } from './components/stages/Stage01Simulator';
import { Stage02Predictor } from './components/stages/Stage02Predictor';
import { Stage03Reality } from './components/stages/Stage03Reality';

export function App() {
  const [currentStage, setCurrentStage] = useState<StageId>('stage-00-intro');

  const handleResetAll = () => {
    setCurrentStage('stage-00-intro');
  };

  return (
    <div className="min-h-screen bg-canvas text-cream font-sans antialiased flex flex-col selection:bg-mint selection:text-canvas">
      {/* Top Persistent Header */}
      <Header
        currentStage={currentStage}
        onSelectStage={setCurrentStage}
        onResetAll={handleResetAll}
      />

      {/* Left Docking Sidebar */}
      <Sidebar
        currentStage={currentStage}
        onSelectStage={setCurrentStage}
        onQuickReset={handleResetAll}
      />

      {/* Main Viewport Workspace */}
      <main className="flex-1 w-full pt-20 px-4 sm:px-6 lg:pl-28 lg:pr-8 pb-12 max-w-[1700px] mx-auto flex flex-col">
        {currentStage === 'stage-00-intro' && (
          <Stage00Intro
            onStartSimulation={() => setCurrentStage('stage-01-simulator')}
            onNavigateStage={setCurrentStage}
          />
        )}

        {currentStage === 'stage-01-simulator' && (
          <Stage01Simulator
            onProceedToPredictor={() => setCurrentStage('stage-02-predictor')}
          />
        )}

        {currentStage === 'stage-02-predictor' && (
          <Stage02Predictor
            onProceedToReality={() => setCurrentStage('stage-03-reality')}
          />
        )}

        {currentStage === 'stage-03-reality' && (
          <Stage03Reality
            onRestartSimulation={() => setCurrentStage('stage-00-intro')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
