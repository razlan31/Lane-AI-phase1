import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value, options = {}) {
  const {
    style = 'decimal',
    currency = 'USD',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  if (typeof value !== 'number' || isNaN(value)) return '—';

  return new Intl.NumberFormat('en-US', {
    style,
    currency: style === 'currency' ? currency : undefined,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

export function formatPercentage(value, decimals = 1) {
  if (typeof value !== 'number' || isNaN(value)) return '—';
  return `${value.toFixed(decimals)}%`;
}

export function getStateClasses(state) {
  const stateMap = {
    draft: 'state-draft',
    live: 'state-live',
    warning: 'state-warning',
    alert: 'state-alert',
  };
  return stateMap[state] || '';
}