import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/caregivers', label: 'Caregivers' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg py-4' : 'bg-white/95 backdrop-blur-sm py-6'
    }`}>
      <div className="container-custom flex items-center justify-between px-6">
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="90210 Love Care" className="h-12 w-auto" />
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-bold text-brand-purple leading-none">90210</span>
            <span className="text-sm font-sans text-gray-600 uppercase tracking-wider">Love Care</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-medium transition-colors ${
                location.pathname === link.to ? 'text-brand-purple' : 'text-gray-700 hover:text-brand-purple'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a href="tel:+13105559999" className="btn-primary">Call Now</a>
        </div>

        <button
          className="md:hidden p-2 text-gray-700 hover:text-brand-purple transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4">
          <div className="container-custom px-6 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setIsMobileMenuOpen(false)} className={`font-medium py-2 ${location.pathname === link.to ? 'text-brand-purple' : 'text-gray-700'}`}>
                {link.label}
              </Link>
            ))}
            <a href="tel:+13105559999" className="btn-primary text-center">Call Now</a>
          </div>
        </div>
      )}
    </nav>
  );
}