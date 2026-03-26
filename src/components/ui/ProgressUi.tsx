// ProgressUI.tsx
import React, { useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "./card";
import { Progress } from "./progress";

interface GenerateStats {
  [key: string]: number;
}

interface ProgressUIProps {
  message: string;
  progress: number;
  stats?: GenerateStats | null;
  warnings?: string[];
  status: "streaming" | "success" | "error";
}

export const ProgressUI: React.FC<ProgressUIProps> = ({
  message,
  progress,
  stats,
  warnings,
  status
}) => {
  const isSuccess = status === "success";
  const isError = status === "error";
  const isStreaming = status === "streaming";
    useEffect(() => {
    document.title = `${Math.round(progress)}% complete | Adventist University of Central Africa - Exam Management System`;
    return ()=>{
        document.title = `Adventist University of Central Africa - Exam Management System`;
    }
  }, [progress]);


  return (
    <div className="w-full">
        <div className="flex flex-col gap-4">
          {/* Header with status icon */}
          <div className="flex items-center gap-3">
            
            {isSuccess && (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            )}
            {isError && (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            <div className="flex-1">
               
              {isStreaming && (
                <p className="text-sm text-muted-foreground">
                  {Math.round(progress)}% complete
                </p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {isStreaming && (
            <Progress value={progress} className="h-2" />
          )}

          {/* Stats display */}
          {stats && Object.keys(stats).length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {warnings && warnings.length > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded-md">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Warnings:
              </p>
              <ul className="list-disc list-inside text-xs text-yellow-700 dark:text-yellow-300">
                {warnings.slice(0, 3).map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
                {warnings.length > 3 && (
                  <li>...and {warnings.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
    </div>
  );
};