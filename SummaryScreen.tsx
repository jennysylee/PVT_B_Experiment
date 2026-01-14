
import React from 'react';
import { ExperimentSession, TrialOutcome } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SummaryScreenProps {
  session: ExperimentSession;
  onRestart: () => void;
  onRepeat: () => void;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ session, onRestart, onRepeat }) => {
  const correctTrials = session.trials.filter(t => t.outcome === TrialOutcome.CORRECT);
  const averageRt = correctTrials.length > 0 
    ? Math.round(correctTrials.reduce((acc, t) => acc + (t.rt || 0), 0) / correctTrials.length)
    : 0;
  
  const lapses = session.trials.filter(t => t.outcome === TrialOutcome.LAPSE).length;
  const errors = session.trials.filter(t => t.outcome === TrialOutcome.COMMISSION).length;
  const totalTrials = session.trials.length;

  const downloadData = () => {
    const headers = ["ParticipantID", "Trial", "Outcome", "RT_ms", "ISI_ms", "Elapsed_ms", "Timestamp"];
    const rows = session.trials.map(t => [
      session.participantId,
      t.trialIndex,
      TrialOutcome[t.outcome],
      t.rt || 'NA',
      Math.round(t.isiDelay),
      Math.round(t.totalElapsedTime),
      new Date(t.timestamp).toISOString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `PVTB_Result_${session.participantId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = session.trials.map(t => ({
    trial: t.trialIndex,
    rt: t.rt || 0,
    outcome: t.outcome
  }));

  return (
    <div className="max-w-4xl w-full p-8 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 overflow-y-auto max-h-[90vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Experiment Complete</h2>
          <p className="text-zinc-400">Participant ID: <span className="text-blue-400 font-mono">{session.participantId}</span></p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadData}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Avg. Response" value={`${averageRt}ms`} sub="Correct trials" color="text-green-400" />
        <StatCard label="Total Trials" value={totalTrials} sub="Attempts" color="text-blue-400" />
        <StatCard label="Lapses" value={lapses} sub="> 500ms" color="text-red-400" />
        <StatCard label="Errors" value={errors} sub="Too early" color="text-orange-400" />
      </div>

      <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 mb-8 h-80">
        <h3 className="text-sm font-semibold text-zinc-500 mb-4 uppercase tracking-wider">Reaction Time Timeline</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
            <XAxis dataKey="trial" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} unit="ms" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#fff' }}
              itemStyle={{ color: '#60a5fa' }}
            />
            <Bar dataKey="rt" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.outcome === TrialOutcome.CORRECT ? '#22c55e' : entry.outcome === TrialOutcome.LAPSE ? '#ef4444' : '#f97316'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onRepeat}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 px-6 rounded-lg transition-colors border border-zinc-700"
        >
          Repeat (Same User)
        </button>
        <button
          onClick={onRestart}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
        >
          New Participant
        </button>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, sub: string, color: string }> = ({ label, value, sub, color }) => (
  <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-800/50">
    <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">{label}</div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-[10px] text-zinc-600 font-medium">{sub}</div>
  </div>
);

export default SummaryScreen;
