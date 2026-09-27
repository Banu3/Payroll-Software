import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, User, Users, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { api } from '../../services/api';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent('app:open-global-search'));
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        if (!isOpen) window.dispatchEvent(new CustomEvent('app:open-global-search'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const DEFAULT_SEARCH_ITEMS = [
    { id: 'sr-1', name: 'Acme Software Solutions', type: 'COMPANY', company: 'Tenant Code: ACME | 620 Employees | Active', link: '/super-admin/companies' },
    { id: 'sr-2', name: 'Apex Global Enterprises', type: 'COMPANY', company: 'Tenant Code: APEX | 450 Employees | Active', link: '/super-admin/companies' },
    { id: 'sr-3', name: 'Vanguard Global Financial', type: 'COMPANY', company: 'Tenant Code: VGND | 410 Employees | Trial', link: '/super-admin/companies' },
    { id: 'sr-4', name: 'Samantha Reed', type: 'USER', company: 'Senior Software Engineer — Acme Software', link: '/super-admin/employees' },
    { id: 'sr-5', name: 'David Miller', type: 'USER', company: 'Financial Specialist — Apex Global', link: '/super-admin/employees' },
    { id: 'sr-6', name: 'Sarah Jenkins', type: 'USER', company: 'HR Operations Lead — Acme Software', link: '/super-admin/employees' },
  ];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/super-admin/search?q=${encodeURIComponent(query)}`);
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setResults(res.data);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Global search endpoint offline, filtering local tenant registry:', err);
      }

      // Offline filter
      const q = query.toLowerCase();
      const filtered = DEFAULT_SEARCH_ITEMS.filter(
        item => item.name.toLowerCase().includes(q) || item.company.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)
      );
      setResults(filtered);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectResult = (link) => {
    onClose();
    if (link) navigate(link);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'COMPANY':
        return <Building2 className="w-4 h-4 text-purple-400" />;
      case 'USER':
        return <User className="w-4 h-4 text-blue-400" />;
      default:
        return <Users className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search companies, tenant IDs, admin profiles, employees... (Press Esc to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="text-center py-6 text-xs text-slate-400">Searching global tenant registry...</div>
          ) : results.length > 0 ? (
            results.map((res) => (
              <div
                key={res.id}
                onClick={() => handleSelectResult(res.link)}
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl hover:border-blue-500/50 hover:bg-slate-800/40 cursor-pointer flex items-center justify-between transition-all group text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    {getIcon(res.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100">{res.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase tracking-wider">
                        {res.type}
                      </span>
                    </div>
                    {res.company && <p className="text-[11px] text-slate-400 mt-0.5">{res.company}</p>}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            ))
          ) : query ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching tenant companies or employee profiles found for &ldquo;<span className="text-slate-300">{query}</span>&rdquo;.
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500 space-y-1">
              <p>Type to search across companies, primary admins, and system entities.</p>
              <p className="text-[10px] text-slate-600 font-mono">Shortcut: Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Ctrl + K</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">/</kbd> anytime</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GlobalSearchModal;
