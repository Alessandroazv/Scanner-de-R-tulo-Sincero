
import React from 'react';
import { Goal } from '../types';

interface GoalSelectorProps {
  selectedGoal: Goal | null;
  onGoalSelect: (goal: Goal) => void;
}

const goals = [
  { id: Goal.WeightLoss, label: "Emagrecimento", icon: "📉" },
  { id: Goal.MuscleGain, label: "Ganho de Massa", icon: "💪" },
  { id: Goal.GeneralHealth, label: "Saúde Geral", icon: "❤️‍🩹" },
];

const GoalSelector: React.FC<GoalSelectorProps> = ({ selectedGoal, onGoalSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {goals.map((goal) => (
        <button
          key={goal.id}
          onClick={() => onGoalSelect(goal.id)}
          className={`p-6 rounded-lg text-left transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
            ${selectedGoal === goal.id
              ? 'bg-cyan-600 text-white shadow-lg ring-2 ring-cyan-400'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
        >
          <div className="text-4xl mb-2">{goal.icon}</div>
          <h3 className="text-lg font-bold">{goal.label}</h3>
        </button>
      ))}
    </div>
  );
};

export default GoalSelector;
