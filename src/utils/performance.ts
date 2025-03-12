
import { onCLS, onFID, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

const reportMetric = (metric: Metric) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(metric);
  }
  
  // In production, you could send to an analytics service
  // Example: sendToAnalytics(metric);
};

export const reportWebVitals = () => {
  onCLS(reportMetric);
  onFID(reportMetric);
  onLCP(reportMetric);
  onFCP(reportMetric);
  onTTFB(reportMetric);
};

// Helper to measure component render time
export const measureRenderTime = (componentName: string) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    console.log(`[Performance] ${componentName} rendered in ${endTime - startTime}ms`);
  };
};

// Helper to record interaction timing
export const recordInteraction = (interactionName: string) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    console.log(`[Performance] ${interactionName} took ${endTime - startTime}ms`);
  };
};
