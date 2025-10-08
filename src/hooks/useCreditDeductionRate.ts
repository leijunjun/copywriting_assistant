/**
 * Hook for getting credit deduction rate
 */

import { useState, useEffect } from 'react';

interface CreditDeductionRateResponse {
  success: boolean;
  deduction_rate: number;
  message?: string;
  error?: string;
}

export function useCreditDeductionRate() {
  const [deductionRate, setDeductionRate] = useState<number>(5); // Default fallback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeductionRate = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/credits/deduction-rate');
        const data: CreditDeductionRateResponse = await response.json();
        
        if (data.success) {
          setDeductionRate(data.deduction_rate);
        } else {
          setError(data.error || 'Failed to get deduction rate');
          // Keep default value of 5
        }
      } catch (err) {
        console.error('Error fetching credit deduction rate:', err);
        setError('Network error');
        // Keep default value of 5
      } finally {
        setLoading(false);
      }
    };

    fetchDeductionRate();
  }, []);

  return {
    deductionRate,
    loading,
    error,
  };
}
