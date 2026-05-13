import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getProgressResults } from "../../src/features/progress/api";
import { ProgressScreenContent } from "../../src/features/progress/components/ProgressScreenContent";
import { ProgressResult } from "../../src/features/progress/types";
import { calculateProgressSummary } from "../../src/features/progress/utils";

export default function ProgressScreen() {
  const [results, setResults] = useState<ProgressResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => calculateProgressSummary(results), [results]);

  const loadResults = useCallback(async (refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const nextResults = await getProgressResults();
      setResults(nextResults);
    } catch (loadError) {
      console.error("Lỗi tải tiến độ học tập:", loadError);
      setError("Vui lòng kiểm tra kết nối hoặc đăng nhập lại rồi thử tiếp.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  return (
    <ProgressScreenContent
      summary={summary}
      results={results}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error}
      onRefresh={() => loadResults(true)}
    />
  );
}
