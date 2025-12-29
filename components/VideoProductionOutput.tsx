
import React from 'react';
import type { Language, VideoPlan } from '../types';
import { TEXTS } from '../constants';
import { CopyButton } from './CopyButton';

interface VideoProductionOutputProps {
  language: Language;
  plan: VideoPlan;
}

export const VideoProductionOutput: React.FC<VideoProductionOutputProps> = ({ language, plan }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center text-white border-b border-gray-700 pb-4">
        {plan.title || TEXTS[language].outputTitle}
      </h2>

      {/* Script Section */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-indigo-400">{TEXTS[language].scriptSection}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="p-3 font-semibold uppercase text-gray-400 text-sm border-b border-gray-700">{TEXTS[language].sceneHeader}</th>
                <th className="p-3 font-semibold uppercase text-gray-400 text-sm border-b border-gray-700">{TEXTS[language].descriptionHeader}</th>
                <th className="p-3 font-semibold uppercase text-gray-400 text-sm border-b border-gray-700">{TEXTS[language].voHeader}</th>
              </tr>
            </thead>
            <tbody>
              {plan.script.map((item, index) => (
                <tr key={index} className="hover:bg-gray-700/50 transition-colors duration-150">
                  <td className="p-3 border-b border-gray-700 font-medium text-white whitespace-nowrap">{item.scene}</td>
                  <td className="p-3 border-b border-gray-700 text-gray-300">{item.description}</td>
                  <td className="p-3 border-b border-gray-700 text-gray-300 italic">"{item.vo}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shot List Section */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-indigo-400">{TEXTS[language].shotListSection}</h3>
        <ul className="list-disc list-inside space-y-2 bg-gray-900/30 p-4 rounded-md">
          {plan.shotList.map((shot, index) => (
            <li key={index} className="text-gray-300">{shot}</li>
          ))}
        </ul>
      </div>

      {/* AI Prompts Section */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-indigo-400">{TEXTS[language].aiPromptsSection}</h3>
        <div className="space-y-4">
          {plan.aiPrompts.map((prompt, index) => (
            <div key={index} className="bg-gray-900/50 p-4 rounded-md relative group">
              <p className="text-gray-300 font-mono text-sm pr-20">{prompt}</p>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton language={language} textToCopy={prompt} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
