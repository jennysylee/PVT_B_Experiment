
import React, { useState } from 'react';

interface SetupScreenProps {
  onStart: (id: string) => void;
  initialId: string;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, initialId }) => {
  const [id, setId] = useState(initialId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id.trim()) {
      onStart(id.trim());
    }
  };

  return (
    <div className="max-w-md w-full p-8 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
      <h1 className="text-3xl font-bold mb-2 text-center text-blue-400">PVT-B</h1>
      <p className="text-zinc-400 mb-8 text-center text-sm">
        Psychomotor Vigilance Test (Brief Edition)
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="participantId" className="block text-sm font-medium text-zinc-300 mb-2">
            Participant Number / ID
          </label>
          <input
            id="participantId"
            type="text"
            autoFocus
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Enter unique ID..."
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg active:scale-[0.98]"
        >
          Begin Setup
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-zinc-800 text-xs text-zinc-500 leading-relaxed">
        <p>This experiment measures behavioral alertness by recording reaction times to visual stimuli.</p>
        <p className="mt-2">Total estimated duration: 3 minutes.</p>
      </div>
    </div>
  );
};

export default SetupScreen;
