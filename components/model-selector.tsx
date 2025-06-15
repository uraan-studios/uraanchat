'use client';

import { useState } from "react";
import { aiModels } from "@/lib/models-data";

interface ModelSelectorProps {
  onModelSelect: (modelName: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ onModelSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const filteredModels = aiModels.filter((model) =>
    model.modelName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedModels = filteredModels.reduce((groups: Record<string, typeof aiModels>, model) => {
    if (!groups[model.company]) groups[model.company] = [];
    groups[model.company].push(model);
    return groups;
  }, {});

  const handleSelect = (modelName: string) => {
    setSelectedModel(modelName);
    onModelSelect(modelName);
  };

  return (
    <div className="p-6 bg-zinc-900 text-white rounded-lg shadow-xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Select an AI Model</h2>

      <input
        type="text"
        placeholder="Search models..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400"
      />

      {Object.entries(groupedModels).map(([company, models]) => (
        <div key={company} className="mb-6">
          <h3 className="text-xl font-semibold mb-3 border-b border-zinc-700 pb-1">{company}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {models.map((model) => (
              <div
                key={model.modelName}
                className={`p-4 rounded-lg cursor-pointer transition border ${
                  selectedModel === model.modelName
                    ? "border-blue-500 bg-zinc-800"
                    : "border-zinc-700 hover:bg-zinc-800"
                }`}
                onClick={() => handleSelect(model.modelName)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={model.logo}
                    alt={model.modelName}
                    className="w-6 h-6 object-contain"
                  />
                  <span className="font-medium">{model.modelName}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {model.icons.map((icon, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-zinc-700 text-white px-2 py-0.5 rounded"
                    >
                      {icon}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModelSelector;
