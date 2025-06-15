'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Beaker, Diamond } from "lucide-react";
import { MODELS } from "@/lib/models";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  onModelSelect: (modelId: string) => void;
  initialModel?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ onModelSelect, initialModel }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState<string | null>(initialModel || null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredModels = MODELS.filter((model) =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.supports.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupedModels = filteredModels.reduce((groups: Record<string, typeof MODELS>, model) => {
    if (!groups[model.provider]) groups[model.provider] = [];
    groups[model.provider].push(model);
    return groups;
  }, {});

  const handleSelect = (modelId: string) => {
    setSelectedModel(modelId);
    onModelSelect(modelId);
  };

  const getProviderLogo = (provider: string): string => {
    const logoMap: Record<string, string> = {
      'anthropic': '/claude-logo.png',
      'google': '/gemini-logo.png',
      'openai': '/openai-logo.png',
      'meta': '/meta-logo.png',
      'mistral': '/mistral-logo.png',
      'deepseek': '/deepseek-logo.png',
      'perplexity': '/perplexity-logo.png',
    };
    return logoMap[provider.toLowerCase()] || '/default-logo.png';
  };

  const getFeatureIcon = (feature: string) => {
    const iconClasses = "w-4 h-4";
    switch (feature.toLowerCase()) {
      case 'text':
        return <span className={iconClasses}>📝</span>;
      case 'image':
        return <span className={iconClasses}>🖼️</span>;
      case 'document':
        return <span className={iconClasses}>📄</span>;
      case 'reasoning':
        return <span className={iconClasses}>🧠</span>;
      case 'web_search':
        return <span className={iconClasses}>🔍</span>;
      default:
        return <span className={iconClasses}>✨</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-zinc-900/95 backdrop-blur-sm text-white rounded-xl shadow-2xl max-w-4xl mx-auto border border-zinc-800/50"
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
      >
        Select an AI Model
      </motion.h2>

      <div className="relative mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "relative transition-all duration-300",
            isSearchFocused && "ring-2 ring-blue-500/50"
          )}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by model name, provider, or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-zinc-800/90 border border-zinc-700/50 text-white placeholder-gray-400
                     focus:outline-none focus:border-blue-500/50 transition-all duration-300"
          />
        </motion.div>
      </div>

      <AnimatePresence>
        {Object.entries(groupedModels).map(([provider, models], companyIndex) => (
          <motion.div
            key={provider}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: companyIndex * 0.1 }}
            className="mb-6"
          >
            <h3 className="text-xl font-semibold mb-3 border-b border-zinc-700/50 pb-2">
              <div className="flex items-center gap-2">
                <img
                  src={getProviderLogo(provider)}
                  alt={provider}
                  className="w-6 h-6 object-contain"
                />
                {provider}
              </div>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {models.map((model) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "p-4 rounded-lg cursor-pointer transition-all duration-300",
                      selectedModel === model.id
                        ? "border-2 border-blue-500 bg-zinc-800/90 shadow-lg shadow-blue-500/10"
                        : "border border-zinc-700/50 hover:bg-zinc-800/50 hover:border-zinc-600/50"
                    )}
                    onClick={() => handleSelect(model.id)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={getProviderLogo(model.provider)}
                        alt={model.name}
                        className="w-8 h-8 object-contain"
                      />
                      <span className="font-medium truncate">{model.name}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {model.supports.map((feature, idx) => (
                        <TooltipProvider key={idx}>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full
                                          bg-blue-500/20 text-blue-300 border border-blue-500/30
                                          hover:bg-blue-500/30 transition-colors">
                                {getFeatureIcon(feature)}
                                <span>{feature}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Supports {feature.toLowerCase()} capabilities</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                      {model.premium && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full
                                          bg-yellow-500/20 text-yellow-300 border border-yellow-500/30
                                          hover:bg-yellow-500/30 transition-colors">
                                <Diamond className="w-3 h-3" />
                                <span>Premium</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Premium model with advanced capabilities</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {model.experimental && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full
                                          bg-purple-500/20 text-purple-300 border border-purple-500/30
                                          hover:bg-purple-500/30 transition-colors">
                                <Beaker className="w-3 h-3" />
                                <span>Beta</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Experimental feature in beta testing</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default ModelSelector;
