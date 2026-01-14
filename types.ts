
export enum AppState {
  SETUP = 'SETUP',
  INSTRUCTIONS = 'INSTRUCTIONS',
  EXPERIMENT = 'EXPERIMENT',
  SUMMARY = 'SUMMARY'
}

export enum TrialOutcome {
  CORRECT = 1,
  COMMISSION = 2, // Pressed too early
  LAPSE = 3       // Pressed too late (> 500ms)
}

export interface PVTTrial {
  trialIndex: number;
  outcome: TrialOutcome;
  isiDelay: number;      // Inter-stimulus interval
  rt: number | null;     // Reaction time in ms
  totalElapsedTime: number;
  timestamp: number;
}

export interface ExperimentSession {
  participantId: string;
  trials: PVTTrial[];
  startTime: number;
  endTime: number;
}
