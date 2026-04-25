import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { GrainOverlay } from './components/GrainOverlay';
import { Navigation } from './components/Navigation';
import { Ticker } from './components/Ticker';
import { Footer } from './components/Footer';
import { CTASection } from './components/CTASection';
import { Hero } from './pages/Hero';
import { About } from './pages/About';
import { Process } from './pages/Process';
import { Gallery } from './pages/Gallery';
import { FAQ } from './pages/FAQ';
import { Upload } from './pages/Upload';
import { Preview } from './pages/Preview';
import { Success } from './pages/Success';
import SmrithiDefinitiveAtelier from './pages/ops';

function AppContent() {
  const location = useLocation();

  if (location.pathname === '/ops') {
    return <SmrithiDefinitiveAtelier />;
  }

  return (
    <div className="relative">
      <ScrollToTop />
      <GrainOverlay />

      <Navigation />

      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <Ticker />
            <hr className="border-none border-t border-[var(--border)] m-0" />
            <About />
            <Process />
            <CTASection />
            <hr className="border-none border-t border-[var(--border)] m-0" />
            <Footer />
          </>
        } />
        <Route path="/gallery" element={
          <>
            <Gallery />
            <CTASection />
            <hr className="border-none border-t border-[var(--border)] m-0" />
            <Footer />
          </>
        } />
        <Route path="/faq" element={
          <>
            <FAQ />
            <CTASection />
            <hr className="border-none border-t border-[var(--border)] m-0" />
            <Footer />
          </>
        } />
        <Route path="/process" element={
          <>
            <Process isFullPage />
            <CTASection />
            <hr className="border-none border-t border-[var(--border)] m-0" />
            <Footer />
          </>
        } />
        <Route path="/upload" element={
          <>
            <Upload />
            <hr className="border-none border-t border-[var(--border)] m-0" />
            <Footer />
          </>
        } />
        <Route path="/preview" element={
          <>
            <Preview />
            <CTASection />
            <hr className="border-none border-t border-[var(--border)] m-0" />
            <Footer />
          </>
        } />
        <Route path="/success" element={
          <Success />
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;