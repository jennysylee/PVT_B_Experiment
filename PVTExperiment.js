
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PVTTrial, TrialOutcome } from '../types';

const TOTAL_DURATION_MS = 180000; // 3 minutes
const MIN_RT = 100;
const LAPSE_TIME = 500;
const FEEDBACK_DURATION = 1000;
const RSI_MIN = 0;
const RSI_MAX = 3000;

interface PVTExperimentProps {
  onFinish: (trials: PVTTrial[]) => void;
}

type ExperimentPhase = 'WAITING' | 'STIMULUS' | 'FEEDBACK';

const PVTExperiment: React.FC<PVTExperimentProps> = ({ onFinish }) => {
  const [phase, setPhase] = useState<ExperimentPhase>('WAITING');
  const [counter, setCounter] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const [trialCount, setTrialCount] = useState(0);

  const experimentStartTime = useRef<number>(performance.now());
  const rsiDelay = useRef<number>(0);
  const trialStartTime = useRef<number>(0);
  const stimulusStartTime = useRef<number>(0);
  const trials = useRef<PVTTrial[]>([]);
  const frameRef = useRef<number>(0);
  const hasResponded = useRef<boolean>(false);

  const finishExperiment = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    onFinish(trials.current);
  }, [onFinish]);

  const startNextTrial = useCallback(() => {
    const elapsed = performance.now() - experimentStartTime.current;
    if (elapsed >= TOTAL_DURATION_MS) {
      finishExperiment();
      return;
    }

    setPhase('WAITING');
    setTrialCount(prev => prev + 1);
    hasResponded.current = false;
    rsiDelay.current = Math.random() * (RSI_MAX - RSI_MIN) + RSI_MIN;
    trialStartTime.current = performance.now();
    setFeedback(null);
    setCounter(0);
  }, [finishExperiment]);

  const handleResponse = useCallback(() => {
    if (hasResponded.current) return;
    
    const now = performance.now();
    const elapsedTotal = now - experimentStartTime.current;
    
    let outcome: TrialOutcome;
    let rt: number | null = null;
    let feedbackText = "";
    let feedbackColor = "text-yellow-400";

    if (phase === 'WAITING') {
      // Early press (Commission Error)
      outcome = TrialOutcome.COMMISSION;
      feedbackText = "ERROR";
      feedbackColor = "text-red-500";
      hasResponded.current = true;
    } else if (phase === 'STIMULUS') {
      rt = Math.floor(now - stimulusStartTime.current);
      if (rt < MIN_RT) {
        outcome = TrialOutcome.COMMISSION; // Still too early
        feedbackText = "ERROR";
        feedbackColor = "text-red-500";
      } else if (rt > LAPSE_TIME) {
        outcome = TrialOutcome.LAPSE;
        feedbackText = "TOO SLOW";
        feedbackColor = "text-red-500";
      } else {
        outcome = TrialOutcome.CORRECT;
        feedbackText = rt.toString();
        feedbackColor = "text-green-500";
      }
      hasResponded.current = true;
    } else {
      return; // Already in feedback
    }

    const trial: PVTTrial = {
      trialIndex: trials.current.length + 1,
      outcome,
      isiDelay: rsiDelay.current,
      rt,
      totalElapsedTime: elapsedTotal,
      timestamp: Date.now()
    };
    trials.current.push(trial);
    
    setPhase('FEEDBACK');
    setFeedback({ text: feedbackText, color: feedbackColor });
    setCounter(rt || 0);

    setTimeout(() => {
      startNextTrial();
    }, FEEDBACK_DURATION);
  }, [phase, startNextTrial]);

  useEffect(() => {
    const loop = () => {
      const now = performance.now();
      const elapsedInTrial = now - trialStartTime.current;
      const totalElapsed = now - experimentStartTime.current;

      if (totalElapsed >= TOTAL_DURATION_MS) {
        finishExperiment();
        return;
      }

      if (phase === 'WAITING' && !hasResponded.current) {
        if (elapsedInTrial >= rsiDelay.current) {
          setPhase('STIMULUS');
          stimulusStartTime.current = performance.now();
        }
      } else if (phase === 'STIMULUS' && !hasResponded.current) {
        const rt = Math.floor(now - stimulusStartTime.current);
        setCounter(rt);
        // Automatic lapse if time > 30s (as per script check)
        if (rt >= 30000) {
           handleResponse();
        }
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [phase, finishExperiment, handleResponse]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'b' || e.code === 'Space') {
        handleResponse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleResponse]);

  return (
    <div 
      className="h-full w-full flex flex-col items-center justify-center cursor-pointer"
      onClick={handleResponse}
    >
      <div className="mb-12 text-zinc-500 font-mono text-sm tracking-widest uppercase">
        Progress: {Math.min(100, Math.floor(((performance.now() - experimentStartTime.current) / TOTAL_DURATION_MS) * 100))}%
      </div>

      <div className="relative w-80 h-48 border-[10px] border-red-600 rounded-lg flex items-center justify-center bg-black overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)]">
        {phase === 'STIMULUS' && !feedback && (
          <div className="text-6xl font-bold font-mono text-yellow-400">
            {counter}
          </div>
        )}
        
        {phase === 'FEEDBACK' && feedback && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200">
            <div className={`text-6xl font-black font-mono ${feedback.color}`}>
              {feedback.text}
            </div>
          </div>
        )}
      </div>

      <div className="mt-16 text-zinc-600 text-sm italic animate-pulse">
        {phase === 'WAITING' ? "Focus on the screen..." : "React quickly!"}
      </div>

      <div className="absolute bottom-10 left-0 right-0 text-center text-zinc-700 text-xs">
        Press <kbd className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">B</kbd> or click the screen to respond
      </div>
    </div>
  );
};

export default PVTExperiment;
