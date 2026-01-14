
import React, { useState, useCallback } from 'react';
import { AppState, ExperimentSession, PVTTrial } from './types';
import SetupScreen from './components/SetupScreen';
import InstructionsScreen from './components/InstructionsScreen';
import PVTExperiment from './components/PVTExperiment';
import SummaryScreen from './components/SummaryScreen';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [participantId, setParticipantId] = useState<string>('');
  const [sessionData, setSessionData] = useState<ExperimentSession | null>(null);

  const handleStartSetup = (id: string) => {
    setParticipantId(id);
    setAppState(AppState.INSTRUCTIONS);
  };

  const handleStartExperiment = () => {
    setAppState(AppState.EXPERIMENT);
  };

  const handleFinishExperiment = useCallback((trials: PVTTrial[]) => {
    const session: ExperimentSession = {
      participantId,
      trials,
      startTime: trials.length > 0 ? trials[0].timestamp : Date.now(),
      endTime: Date.now(),
    };
    setSessionData(session);
    setAppState(AppState.SUMMARY);
  }, [participantId]);

  const handleRestart = () => {
    setSessionData(null);
    setAppState(AppState.SETUP);
  };

  const handleRepeatSession = () => {
    setSessionData(null);
    setAppState(AppState.INSTRUCTIONS);
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-zinc-950 text-zinc-100 overflow-hidden select-none">
      {appState === AppState.SETUP && (
        <SetupScreen onStart={handleStartSetup} initialId={participantId} />
      )}
      {appState === AppState.INSTRUCTIONS && (
        <InstructionsScreen onStart={handleStartExperiment} />
      )}
      {appState === AppState.EXPERIMENT && (
        <PVTExperiment onFinish={handleFinishExperiment} />
      )}
      {appState === AppState.SUMMARY && sessionData && (
        <SummaryScreen 
          session={sessionData} 
          onRestart={handleRestart} 
          onRepeat={handleRepeatSession} 
        />
      )}
    </div>
  );
};

export default App;
