import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { AmbientCanvas } from './components/layout/AmbientCanvas';
import { Header } from './components/layout/Header';
import { SubNav } from './components/layout/SubNav';
import { Footer } from './components/layout/Footer';

import { LandingPage } from './pages/LandingPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { CompilerPage } from './pages/CompilerPage';
import { TwoPromptPage } from './pages/TwoPromptPage';
import { TargetsPage } from './pages/TargetsPage';
import { PricingPage } from './pages/PricingPage';
import { SandboxPage } from './pages/SandboxPage';
import { DocsPage } from './pages/DocsPage';

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="relative z-10"
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/compiler" element={<CompilerPage />} />
          <Route path="/two-prompt" element={<TwoPromptPage />} />
          <Route path="/targets" element={<TargetsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/sandbox" element={<SandboxPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="bg-surface-container-lowest text-on-surface min-h-screen relative overflow-x-hidden antialiased flex flex-col justify-between">
        <AmbientCanvas />
        <div className="relative z-30">
          <Header />
          <SubNav />
        </div>
        <main className="flex-1 relative z-10">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
