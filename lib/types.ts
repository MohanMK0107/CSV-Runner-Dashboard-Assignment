export interface RunningData {
  date:string;
  person:string;
  "miles run":number;
}

export interface ParseOptions {
  customValidation?:(row:any,index:number)=>string[];
  skipEmptyLines?:boolean;
  dynamicTyping?:boolean;
}

export interface ParseResult<T = any>{
  data:T[] | null;
  isValid:boolean;
  errors?:string[];
}

export interface PersonMetrics {
  person: string;
  totalMiles: number;
  averageMiles: number;
  minMiles: number;
  maxMiles: number;
  runs: number;
}

export interface OverallMetrics {
  totalMiles: number;
  averageMiles: number;
  minMiles: number;
  maxMiles: number;
  totalRuns: number;
  uniqueRunners: number;
}
