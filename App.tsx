
import React, { useState, useCallback } from 'react';
import { Goal } from './types';
import type { AnalysisResultData } from './types';
import { analyzeProduct } from './services/geminiService';
import Header from './components/Header';
import GoalSelector from './components/GoalSelector';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import { CameraIcon } from './components/icons/CameraIcon';

const App: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (images.length === 0 || !goal) {
      setError("Por favor, envie ao menos uma imagem e selecione um objetivo.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeProduct(images, goal);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      setError("Ocorreu um erro na análise. O Nutri Sincero deve ter ficado sem café. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [images, goal]);

  const handleReset = () => {
    setImages([]);
    setGoal(null);
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
  };

  const isButtonDisabled = images.length === 0 || !goal || isLoading;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <Header />

        <main className="mt-8 space-y-8">
          {!analysis && !isLoading && (
            <div className="space-y-8 animate-fade-in">
              <section>
                <h2 className="text-xl font-bold text-cyan-400 mb-4">1. Envie as fotos do produto</h2>
                <p className="text-slate-400 mb-4">Frente, tabela nutricional e lista de ingredientes. Quanto mais, melhor.</p>
                <ImageUploader onImagesChange={setImages} />
              </section>

              <section>
                <h2 className="text-xl font-bold text-cyan-400 mb-4">2. Qual seu objetivo?</h2>
                <GoalSelector selectedGoal={goal} onGoalSelect={setGoal} />
              </section>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-800/50 rounded-lg">
                <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-lg text-slate-300">Analisando os detalhes sórdidos...</p>
            </div>
          )}
          
          {error && <div className="p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg">{error}</div>}

          {analysis && (
             <div className="animate-fade-in">
                <AnalysisResult result={analysis} />
             </div>
          )}

          <div className="sticky bottom-4 w-full bg-slate-900/80 backdrop-blur-sm py-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!analysis && !isLoading ? (
                <button
                  onClick={handleAnalyze}
                  disabled={isButtonDisabled}
                  className="w-full sm:w-auto flex-grow text-lg font-bold px-8 py-4 bg-cyan-500 text-slate-900 rounded-lg shadow-lg hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
                >
                  Desmascarar Produto
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto flex-grow text-lg font-bold px-8 py-4 bg-amber-500 text-slate-900 rounded-lg shadow-lg hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    <CameraIcon /> Analisar Outro Produto
                  </span>
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
