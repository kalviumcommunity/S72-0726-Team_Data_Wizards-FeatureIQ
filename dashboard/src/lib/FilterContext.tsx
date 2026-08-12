'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface FilterState {
  dateRange: 'ALL' | '30D' | '60D' | '90D';
  userSegment: 'ALL' | 'High' | 'Medium' | 'Low';
  industry: 'ALL' | 'Enterprise' | 'Mid-Market SaaS' | 'Growth / SMB' | 'Startup / Seed';
  plan: 'ALL' | 'STARTER' | 'PRO' | 'BUSINESS';
}

interface FilterContextType {
  filters: FilterState;
  setDateRange: (val: FilterState['dateRange']) => void;
  setUserSegment: (val: FilterState['userSegment']) => void;
  setIndustry: (val: FilterState['industry']) => void;
  setPlan: (val: FilterState['plan']) => void;
  resetFilters: () => void;
}

const defaultFilters: FilterState = {
  dateRange: 'ALL',
  userSegment: 'ALL',
  industry: 'ALL',
  plan: 'ALL',
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const setDateRange = (dateRange: FilterState['dateRange']) => setFilters((prev) => ({ ...prev, dateRange }));
  const setUserSegment = (userSegment: FilterState['userSegment']) => setFilters((prev) => ({ ...prev, userSegment }));
  const setIndustry = (industry: FilterState['industry']) => setFilters((prev) => ({ ...prev, industry }));
  const setPlan = (plan: FilterState['plan']) => setFilters((prev) => ({ ...prev, plan }));
  const resetFilters = () => setFilters(defaultFilters);

  return (
    <FilterContext.Provider value={{ filters, setDateRange, setUserSegment, setIndustry, setPlan, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
