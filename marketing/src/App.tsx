import React from 'react';
import Hero from './components/Hero';
import Stats from './components/Stats';
import HowItWorks from './components/HowItWorks';
import Demo from './components/Demo';
import Compare from './components/Compare';
import QuickStart from './components/QuickStart';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Hero />
      <Stats />
      <HowItWorks />
      <Demo />
      <Compare />
      <QuickStart />
      <Footer />
    </div>
  );
};

export default App;
