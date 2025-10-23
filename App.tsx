import React, { useState } from 'react';
import HairTryOn from './components/HairTryOn';
import StyleEditor from './components/StyleEditor';
import IdeaGenerator from './components/IdeaGenerator';
import TrendWatch from './components/TrendWatch';
import VideoAnalyzer from './components/VideoAnalyzer';

type Tab = 'try-on' | 'editor' | 'generator' | 'trends' | 'video';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('try-on');

  const tabs: { id: Tab; label: string; component: React.ReactNode }[] = [
    { id: 'try-on', label: 'Hair Try-On', component: <HairTryOn /> },
    { id: 'editor', label: 'Style Editor', component: <StyleEditor /> },
    { id: 'generator', label: 'Idea Generator', component: <IdeaGenerator /> },
    { id: 'trends', label: 'Trend Watch', component: <TrendWatch /> },
    { id: 'video', label: 'Video Analyzer', component: <VideoAnalyzer /> },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            HairFlair Studio
          </h1>
          <p className="mt-2 text-lg text-gray-400">Your AI-powered style suite</p>
        </header>

        <nav className="mb-8 flex flex-wrap justify-center gap-2 sm:gap-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm sm:text-base font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <main>
            {tabs.find(tab => tab.id === activeTab)?.component}
        </main>
      </div>
    </div>
  );
};

export default App;
