import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import EnterprisesPage from './pages/EnterprisesPage';
import EnterpriseDetailPage from './pages/EnterpriseDetailPage';
import SearchResultPage from './pages/SearchResultPage';
import AnalyticsPage from './pages/AnalyticsPage';
import OntologyViewerPage from './pages/OntologyViewerPage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-secondary-50">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/enterprises" element={<EnterprisesPage />} />
            <Route path="/enterprises/:id" element={<EnterpriseDetailPage />} />
            <Route path="/search" element={<SearchResultPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/ontology" element={<OntologyViewerPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
