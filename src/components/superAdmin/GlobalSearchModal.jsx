import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Building2,
  User,
  Users,
  DollarSign,
  FileText,
  Zap,
  ArrowRight,
  X,
  Sparkles,
  Command,
  ChevronRight,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';
import { api } from '../../services/api';

export const GlobalSearchModal = ({ isOpen: externalIsOpen, onClose: externalOnClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onClose = () => {
    if (externalOnClose) externalOnClose();
    setInternalIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  };

  // Keyboard listener for Ctrl+K, Cmd+K, and Slash '/'
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle modal with Ctrl+K or Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setInternalIsOpen((prev) => !prev);
        if (externalOnClose && isOpen) externalOnClose();
        return;
      }

      // Open with '/' if not typing in an input
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        setInternalIsOpen(true);
        return;
      }

      // Handle ESC key
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, externalOnClose]);

  // Listen for custom event trigger
  useEffect(() => {
    const handleOpen = () => setInternalIsOpen(true);
    window.addEventListener('app:open-global-search', handleOpen);
    return () => window.removeEventListener('app:open-global-search', handleOpen);
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Default suggested items & quick system actions
  const DEFAULT_SEARCH_ITEMS = [
    {
      id: 'sr-1',
      name: 'Acme Software Solutions',
      type: 'COMPANY',
      subtitle: 'Tenant Code: ACME • 620 Employees • Active Sub',
      badge: 'Active',
      badgeColor: 'teal',
      link: '/super-admin/companies',
    },
    {
      id: 'sr-2',
      name: 'Apex Global Enterprises',
      type: 'COMPANY',
      subtitle: 'Tenant Code: APEX • 450 Employees • Enterprise',
      badge: 'Enterprise',
      badgeColor: 'purple',
      link: '/super-admin/companies',
    },
    {
      id: 'sr-3',
      name: 'Vanguard Global Financial',
      type: 'COMPANY',
      subtitle: 'Tenant Code: VGND • 410 Employees • 30-Day Trial',
      badge: 'Trial',
      badgeColor: 'blue',
      link: '/super-admin/companies',
    },
    {
      id: 'sr-4',
      name: 'Samantha Reed',
      type: 'USER',
      subtitle: 'Senior Software Engineer — Acme Software',
      badge: 'Employee',
      badgeColor: 'slate',
      link: '/super-admin/employees',
    },
    {
      id: 'sr-5',
      name: 'David Miller',
      type: 'USER',
      subtitle: 'Financial & Payroll Lead — Apex Global',
      badge: 'HR Admin',
      badgeColor: 'emerald',
      link: '/super-admin/employees',
    },
    {
      id: 'sr-6',
      name: 'September 2026 Payroll Run',
      type: 'PAYROLL',
      subtitle: 'Disbursement Volume: ₹12,45,000 • 18 Runs Processed',
      badge: 'Completed',
      badgeColor: 'teal',
      link: '/super-admin/payroll',
    },
  ];

  const QUICK_ACTIONS = [
    {
      id: 'qa-1',
      name: 'Add New Tenant Company',
      type: 'ACTION',
      subtitle: 'Onboard a new enterprise tenant company workspace',
      icon: Building2,
      link: '/super-admin/companies/new',
    },
    {
      id: 'qa-2',
      name: 'Run Monthly Payroll Engine',
      type: 'ACTION',
      subtitle: 'Execute gross-to-net payroll processing calculation',
      icon: DollarSign,
      link: '/super-admin/payroll',
    },
    {
      id: 'qa-3',
      name: 'Generate Statutory PF & ECR Reports',
      type: 'ACTION',
      subtitle: 'Download monthly compliance filings and summaries',
      icon: FileText,
      link: '/super-admin/reports',
    },
    {
      id: 'qa-4',
      name: 'View Global Audit Logs',
      type: 'ACTION',
      subtitle: 'Inspect security sessions, logins, and system events',
      icon: Zap,
      link: '/super-admin/audit-logs',
    },
  ];

  // Live & Filter Search Logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      let searchPool = [...DEFAULT_SEARCH_ITEMS, ...QUICK_ACTIONS];

      try {
        const res = await api.get(`/super-admin/search?q=${encodeURIComponent(query)}`);
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          searchPool = res.data;
        }
      } catch {
        // Local search fallback
      }

      const q = query.toLowerCase();
      let filtered = searchPool.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
          item.type.toLowerCase().includes(q)
      );

      // Filter by tab if selected
      if (activeTab !== 'ALL') {
        filtered = filtered.filter((item) => item.type === activeTab);
      }

      setResults(filtered);
      setSelectedIndex(0);
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  // Keyboard navigation inside list
  const handleListKeyDown = (e) => {
    const listCount = results.length > 0 ? results.length : query ? 0 : QUICK_ACTIONS.length + DEFAULT_SEARCH_ITEMS.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(listCount, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + listCount) % Math.max(listCount, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const currentList = results.length > 0 ? results : [...QUICK_ACTIONS, ...DEFAULT_SEARCH_ITEMS];
      if (currentList[selectedIndex]) {
        handleSelectResult(currentList[selectedIndex].link);
      }
    }
  };

  const handleSelectResult = (link) => {
    onClose();
    if (link) navigate(link);
  };

  if (!isOpen) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'COMPANY':
        return <Building2 className="w-4 h-4 text-purple-600" />;
      case 'USER':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'PAYROLL':
        return <DollarSign className="w-4 h-4 text-[#0F766E]" />;
      case 'ACTION':
        return <Zap className="w-4 h-4 text-amber-600" />;
      default:
        return <Search className="w-4 h-4 text-[#0F766E]" />;
    }
  };

  const getBadgeStyle = (color) => {
    switch (color) {
      case 'teal':
        return 'bg-teal-50 text-teal-800 border-teal-300';
      case 'purple':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'blue':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const displayList = results.length > 0 ? results : !query ? [...QUICK_ACTIONS, ...DEFAULT_SEARCH_ITEMS] : [];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white border border-[#64748B] rounded-2xl shadow-2xl overflow-hidden text-slate-900 flex flex-col transform transition-all duration-200"
      >
        {/* HEADER INPUT BAR */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/70">
          <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-[#0F766E] shrink-0">
            <Search className="w-4 h-4 animate-pulse" />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search companies, employees, payroll runs, actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleListKeyDown}
            className="w-full bg-white border border-[#64748B] focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] rounded-xl px-3.5 py-2 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none font-semibold shadow-xs transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 px-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 text-xs font-semibold shrink-0 cursor-pointer"
            >
              Clear
            </button>
          )}
          <div className="flex items-center gap-1 shrink-0">
            <kbd className="px-2 py-0.5 rounded-md bg-slate-100 border border-[#94A3B8] text-[10px] font-mono text-[#0F172A] font-bold shadow-xs">
              ESC
            </kbd>
          </div>
        </div>

        {/* CATEGORY FILTER TABS */}
        <div className="px-4 py-2.5 bg-slate-50/50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Results' },
            { id: 'COMPANY', label: 'Companies' },
            { id: 'USER', label: 'Employees' },
            { id: 'PAYROLL', label: 'Payroll' },
            { id: 'ACTION', label: 'Actions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#0F766E] text-white shadow-xs border border-[#0F766E]'
                  : 'text-[#334155] hover:text-[#0F172A] hover:bg-slate-100 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* RESULTS AREA */}
        <div className="p-3 max-h-[380px] overflow-y-auto space-y-1.5">
          {isLoading ? (
            <div className="text-center py-10 text-xs text-[#475569] font-medium flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0F766E] animate-spin" />
              <span>Searching multi-tenant registry...</span>
            </div>
          ) : displayList.length > 0 ? (
            <>
              {!query && (
                <div className="px-2 pt-1 pb-1.5 text-[11px] font-bold font-mono tracking-wider text-[#475569] uppercase flex items-center justify-between">
                  <span>Suggested Actions & Recent Entries</span>
                  <span className="text-[#64748B] font-medium lowercase">Use ↑ ↓ arrows to navigate</span>
                </div>
              )}

              {displayList.map((res, index) => {
                const isSelected = selectedIndex === index;
                const IconComponent = res.icon;

                return (
                  <div
                    key={res.id || index}
                    onClick={() => handleSelectResult(res.link)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-teal-50/80 border-[#0F766E] text-[#0F172A] shadow-sm ring-1 ring-[#0F766E]/20'
                        : 'bg-white border-[#CBD5E1] text-[#0F172A] hover:bg-slate-50 hover:border-[#64748B]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg border shrink-0 ${
                          isSelected
                            ? 'bg-[#0F766E] text-white border-[#0F766E]'
                            : 'bg-slate-100 border-[#CBD5E1] text-[#0F766E]'
                        }`}
                      >
                        {IconComponent ? (
                          <IconComponent className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-amber-600'}`} />
                        ) : (
                          getTypeIcon(res.type)
                        )}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#0F172A] truncate">
                            {res.name}
                          </span>
                          {res.badge && (
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${getBadgeStyle(
                                res.badgeColor
                              )}`}
                            >
                              {res.badge}
                            </span>
                          )}
                        </div>
                        {res.subtitle && (
                          <p className="text-[11px] text-[#475569] mt-0.5 truncate font-medium">
                            {res.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {isSelected && (
                        <span className="text-[10px] font-mono text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 font-bold hidden sm:inline-block">
                          Press ↵ to open
                        </span>
                      )}
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected
                            ? 'text-[#0F766E] translate-x-0.5'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </>
          ) : query ? (
            <div className="text-center py-12 text-xs text-[#475569] space-y-2">
              <Search className="w-8 h-8 text-slate-400 mx-auto stroke-1" />
              <p>
                No matching tenant entities or records found for &ldquo;
                <span className="text-[#0F172A] font-bold">{query}</span>&rdquo;.
              </p>
              <p className="text-[11px] text-slate-500">
                Try searching for company names (e.g. Acme, Apex), employee titles, or actions.
              </p>
            </div>
          ) : null}
        </div>

        {/* FOOTER TOOLBAR & KEYBOARD SHORTCUTS */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-[#475569] font-mono font-semibold">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white text-[#0F172A] border border-[#94A3B8] text-[9px] font-bold shadow-2xs">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white text-[#0F172A] border border-[#94A3B8] text-[9px] font-bold shadow-2xs">
                ↓
              </kbd>
              <span className="ml-0.5">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white text-[#0F172A] border border-[#94A3B8] text-[9px] font-bold shadow-2xs">
                ↵
              </kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white text-[#0F172A] border border-[#94A3B8] text-[9px] font-bold shadow-2xs">
                ESC
              </kbd>
              <span>Close</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[#0F766E] text-[10px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enterprise Global Search</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
