import { lazy } from 'react';

// Lazy load heavy components for better performance
export const LazyEditorPage = lazy(() => import('../pages/EditorPage').then(module => ({
  default: module.EditorPage
})));

export const LazyDashboardPage = lazy(() => import('../pages/DashboardPage').then(module => ({
  default: module.DashboardPage
})));

export const LazyCreateBookPage = lazy(() => import('../pages/CreateBookPage').then(module => ({
  default: module.CreateBookPage
})));

export const LazyProfilePage = lazy(() => import('../pages/ProfilePage').then(module => ({
  default: module.ProfilePage
})));

export const LazyMarkdownEditor = lazy(() => import('../components/editor/MarkdownEditor').then(module => ({
  default: module.MarkdownEditor
})));

export const LazyAIWizard = lazy(() => import('../components/ai/AIWizard').then(module => ({
  default: module.AIWizard
})));

export const LazyExportModal = lazy(() => import('../components/export/ExportModal').then(module => ({
  default: module.ExportModal
})));

export const LazyAnalyticsWidget = lazy(() => import('../components/analytics/AnalyticsWidget').then(module => ({
  default: module.AnalyticsWidget
})));

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be used soon
  import('../pages/EditorPage');
  import('../components/editor/MarkdownEditor');
  import('../components/ai/AIWizard');
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '200px',
    threshold: 0.1,
    ...options,
  });
};

// Image optimization utilities
export const optimizeImage = (src: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
}) => {
  const params = new URLSearchParams();
  
  if (options?.width) params.set('w', options.width.toString());
  if (options?.height) params.set('h', options.height.toString());
  if (options?.quality) params.set('q', options.quality.toString());
  
  const queryString = params.toString();
  return queryString ? `${src}?${queryString}` : src;
};

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization helper
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Virtual scrolling helper
export const calculateVisibleItems = (
  scrollTop: number,
  itemHeight: number,
  containerHeight: number,
  totalItems: number
) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    totalItems
  );
  
  return { startIndex, endIndex };
};
