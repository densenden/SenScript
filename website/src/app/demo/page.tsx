'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Download, Mic, MicOff } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CheatCard } from '@/components/ui/CheatCard';
import { cheatCardAPI, CheatCard as CheatCardType } from '@/lib/cheatcard-api';
import { DEMO_SCENARIOS, INTERVIEW_TYPES } from '@/lib/constants';

export default function DemoPage() {
  const [selectedScenario, setSelectedScenario] = useState('quantum_physics');
  const [mode, setMode] = useState<'standard' | 'interview'>('standard');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [generatedCards, setGeneratedCards] = useState<CheatCardType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  
  const scenarios = Object.entries(DEMO_SCENARIOS);
  const currentScenario = DEMO_SCENARIOS[selectedScenario as keyof typeof DEMO_SCENARIOS];

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + ' ' + finalTranscript);
          generateCardFromSpeech(finalTranscript);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      setTranscript('');
      setGeneratedCards([]);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const generateCardFromSpeech = async (text: string) => {
    if (text.trim().length < 20) return; // Skip very short texts
    
    setIsGenerating(true);
    try {
      const response = await cheatCardAPI.generateDemoCard(text, mode);
      if (response.success && response.card) {
        setGeneratedCards(prev => [...prev, response.card!]);
      }
    } catch (error) {
      console.error('Error generating card:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const playScenario = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setCurrentText('');
    setGeneratedCards([]);
    
    const text = currentScenario.content;
    const words = text.split(' ');
    
    // Simulate typing
    for (let i = 0; i < words.length; i++) {
      if (!isPlaying) break;
      setCurrentText(words.slice(0, i + 1).join(' '));
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    // Generate card after full text
    if (isPlaying) {
      setIsGenerating(true);
      try {
        const response = await cheatCardAPI.generateDemoCard(currentScenario.content, mode);
        if (response.success && response.card) {
          setGeneratedCards([response.card]);
        }
      } catch (error) {
        console.error('Error generating card:', error);
      } finally {
        setIsGenerating(false);
      }
    }
    
    setIsPlaying(false);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentText('');
    setGeneratedCards([]);
    setTranscript('');
    if (isListening) {
      stopListening();
    }
  };

  const downloadCards = () => {
    const data = {
      cards: generatedCards,
      scenario: selectedScenario,
      mode: mode,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `senscript-demo-${selectedScenario}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header />
      <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Experience CheatCards Live
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Try real AI-powered card generation with our interactive demo. 
              Choose a scenario or use your own voice.
            </p>
          </div>

          {/* Demo Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Controls */}
              <div className="space-y-6">
                {/* Scenario Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Choose Demo Scenario:
                  </label>
                  <select 
                    value={selectedScenario}
                    onChange={(e) => setSelectedScenario(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {scenarios.map(([key, scenario]) => (
                      <option key={key} value={key}>
                        {scenario.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mode Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Generation Mode:
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setMode('standard')}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        mode === 'standard' 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Standard Mode
                    </button>
                    <button
                      onClick={() => setMode('interview')}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        mode === 'interview' 
                          ? 'bg-orange-600 text-white shadow-lg' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      CheatCard Mode
                    </button>
                  </div>
                </div>

                {/* Demo Controls */}
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={playScenario}
                    disabled={isPlaying}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    <span>{isPlaying ? 'Playing...' : 'Play Scenario'}</span>
                  </button>
                  
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                      isListening 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    <span>{isListening ? 'Stop Listening' : 'Try Your Voice'}</span>
                  </button>
                  
                  <button
                    onClick={resetDemo}
                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Reset</span>
                  </button>

                  {generatedCards.length > 0 && (
                    <button
                      onClick={downloadCards}
                      className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      <span>Export Cards</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Side - Live Transcript */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Live Transcript:
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {isListening && (
                      <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Listening...</span>
                      </div>
                    )}
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      {isListening ? transcript : currentText || 'Select a scenario and click "Play Scenario" or use "Try Your Voice"'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Cards */}
          <div className="space-y-8">
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8 text-center"
              >
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                    AI generating {mode === 'interview' ? 'CheatCard' : 'flashcard'}...
                  </span>
                </div>
                <p className="text-blue-600 dark:text-blue-400">
                  This usually takes 2-3 seconds in real usage
                </p>
              </motion.div>
            )}

            {generatedCards.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                  Generated {mode === 'interview' ? 'CheatCards' : 'Flashcards'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  <AnimatePresence mode="popLayout">
                    {generatedCards.map((card, index) => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.6, 
                          delay: index * 0.1,
                          ease: "easeOut"
                        }}
                      >
                        <CheatCard 
                          card={card}
                          autoFlip={true}
                          delay={500 + index * 200}
                          showAnimation={true}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {!isGenerating && generatedCards.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to Generate Your First CheatCard?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  Choose a scenario above and click "Play Scenario", or try speaking directly 
                  using "Try Your Voice" to see real-time card generation.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  💡 Tip: CheatCard mode creates strategic interview responses, 
                  while Standard mode focuses on educational content.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}