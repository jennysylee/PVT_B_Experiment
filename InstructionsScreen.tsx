
import React from 'react';

interface InstructionsScreenProps {
  onStart: () => void;
}

const InstructionsScreen: React.FC<InstructionsScreenProps> = ({ onStart }) => {
  return (
    <div className="max-w-2xl w-full p-8 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-blue-500">How to Play</span>
      </h2>
      
      <div className="space-y-4 text-zinc-300">
        <p className="leading-relaxed">
          A red box will appear in the center of the screen. Inside the box, numbers will start counting up.
        </p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li>As soon as you see the numbers start, press the <kbd className="bg-zinc-800 px-2 py-1 rounded text-white border border-zinc-600 font-mono">B</kbd> key (or click the screen).</li>
          <li>Your goal is to stop the counter as fast as you can.</li>
          <li>Try not to press the key <strong>before</strong> the numbers appear. That counts as an error.</li>
          <li>If you take longer than 500ms, it is counted as a "lapse".</li>
        </ul>

        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mt-6">
          <p className="text-sm text-blue-300 font-medium">
            The experiment lasts for exactly 3 minutes. Stay focused!
          </p>
        </div>
      </div>
      
      <button
        onClick={onStart}
        className="w-full mt-10 bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-lg transition-colors shadow-lg active:scale-[0.98] text-lg uppercase tracking-wider"
      >
        Start Experiment
      </button>
    </div>
  );
};

export default InstructionsScreen;
