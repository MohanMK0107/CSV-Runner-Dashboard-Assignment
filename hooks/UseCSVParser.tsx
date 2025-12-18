import { useState } from "react";
import Papa from "papaparse";
import { ParseOptions, ParseResult } from "@/lib/types";

export const useCSVParser = <T extends any = any>(
  requiredColumns: string[]
) => {
  const [data, setData] = useState<T[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);

  const ValidateHeaders = (headers: string[]): string[] => {
    const validationErrors: string[] = [];
    const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());
    requiredColumns.forEach((col) => {
      if (!normalizedHeaders.includes(col.toLowerCase())) {
        validationErrors.push(`Missing required column: "${col}"`);
      }
    });

    return validationErrors;
  };

  const parseCSV = (
    file: File,
    options: ParseOptions = {}
  ): Promise<ParseResult<T>> => {
    const {
      customValidation,
      skipEmptyLines = true,
      dynamicTyping = false,
    } = options;
    setIsLoading(true);
    setErrors([]);
    setData(null);
    setIsValid(false);

    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines,
        dynamicTyping,
        complete: (results: any) => {
          const allErrors: string[] = [];

          if (results.meta.fields && requiredColumns.length > 0) {
            const headerErrors = ValidateHeaders(results.meta.fields);
            allErrors.push(...headerErrors);
          }
          if (
            allErrors.length === 0 &&
            results.data.length > 0 &&
            customValidation
          ) {
            results.data.forEach((row: any, index: number) => {
              const rowErrors = customValidation(row, index);
              allErrors.push(...rowErrors);
            });
          }
          setIsLoading(false);

          if (allErrors.length === 0) {
            setData(results.data);
            setIsValid(true);
            resolve({ data: results.data, isValid: true });
          } else {
            setErrors(allErrors);
            setIsValid(false);
            resolve({ data: null, isValid: false, errors: allErrors });
          }
        },
        error: (error: Error) => {
          const errorMsg = `Failed to parse CSV: ${error.message}`;
          setErrors([errorMsg]);
          setIsLoading(false);
          setIsValid(false);
          resolve({ data: null, isValid: false, errors: [errorMsg] });
        },
      });
    });
  };
  const reset = (): void => {
    setData(null);
    setErrors([]);
    setIsValid(false);
    setIsLoading(false);
  };

  return { data, errors, isLoading, isValid, parseCSV, reset };
};
