import React, { useState, useEffect } from 'react';
import { Key, X, Check, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { getConfiguredApiKey, saveConfiguredApiKey } from '../services/weatherApi';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  currentProvider?: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentProvider,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getConfiguredApiKey());
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfiguredApiKey(apiKey.trim());
    setIsSaved(true);
    setTimeout(() => {
      onSave();
      onClose();
    }, 400);
  };

  const handleUseFree = () => {
    setApiKey('');
    saveConfiguredApiKey('');
    setIsSaved(true);
    setTimeout(() => {
      onSave();
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-white">
              Weather API Key
            </h3>
            <p className="text-xs text-slate-400">
              Active Provider: <strong className="text-sky-400">{currentProvider || 'Open-Meteo'}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Enter Weather API Key (Optional)
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g. OpenWeatherMap or WeatherAPI key"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono transition"
            />
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Supports <strong className="text-slate-200">OpenWeatherMap</strong> and <strong className="text-slate-200">WeatherAPI.com</strong> keys, or can be set via <code className="text-sky-300 bg-slate-800 px-1 py-0.5 rounded text-[10px]">VITE_WEATHER_API_KEY</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2.5 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              If left blank, the app will automatically use the built-in free <strong className="text-emerald-400">Open-Meteo API</strong> with no API key or sign-up required.
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleUseFree}
              className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
            >
              Reset to Free API
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 transition"
              >
                {isSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Saved</span>
                  </>
                ) : (
                  <span>Save Key</span>
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
