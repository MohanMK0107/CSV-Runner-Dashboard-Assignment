"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { FaArrowTrendUp, FaUsers } from "react-icons/fa6";
import { FiActivity, FiUpload } from "react-icons/fi";
import { FaRegFileAlt } from "react-icons/fa";
import { IoAlertCircle } from "react-icons/io5";
import { useCSVParser } from "@/hooks/UseCSVParser";
import { OverallMetrics, PersonMetrics, RunningData } from "@/lib/types";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { SelectTrigger } from "@radix-ui/react-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Home() {
  const [fileName, setFileName] = useState<string>("");
  const [selectedPerson, setSelectedPerson] = useState<string>("all");

  const requiredColumns: string[] = ["date", "person", "miles run"];

  const customValidation = (row: any, index: number): string[] => {
    const errors: string[] = [];
    const rowNum = index + 2;

    if (!row.person || String(row.person).trim() === "") {
      errors.push(`Row ${rowNum}: "person" cannot be empty`);
    }

    if (!row.date || String(row.date).trim() === "") {
      errors.push(`Row ${rowNum}: "date" cannot be empty`);
    } else {
      const dateValue = new Date(row.date);
      if (isNaN(dateValue.getTime())) {
        errors.push(`Row ${rowNum}: "${row.date}" is not a valid date`);
      }
    }

    const milesValue = row["miles run"];
    if (
      milesValue === undefined ||
      milesValue === null ||
      String(milesValue).trim() === ""
    ) {
      errors.push(`Row ${rowNum}: "miles run" cannot be empty`);
    } else {
      const miles = parseFloat(milesValue);
      if (isNaN(miles)) {
        errors.push(
          `Row ${rowNum}: "miles run" must be a number (got "${milesValue}")`
        );
      } else if (miles < 0) {
        errors.push(`Row ${rowNum}: "miles run" cannot be negative`);
      }
    }

    return errors;
  };

  const { data, errors, isLoading, isValid, parseCSV, reset } =
    useCSVParser<RunningData>(requiredColumns);

  const overallMetrics = useMemo<OverallMetrics | null>(() => {
    if (!data || data.length === 0) return null;

    const miles = data.map((d) => Number(d["miles run"]));
    const uniquePeople = new Set(data.map((d) => d.person));

    return {
      totalMiles: miles.reduce((a, b) => a + b, 0),
      averageMiles: miles.reduce((a, b) => a + b, 0) / miles.length,
      minMiles: Math.min(...miles),
      maxMiles: Math.max(...miles),
      totalRuns: data.length,
      uniqueRunners: uniquePeople.size,
    };
  }, [data]);

  const personMetrics = useMemo<PersonMetrics[]>(() => {
    if (!data || data.length === 0) return [];

    const grouped = data.reduce((acc, run) => {
      const person = run.person;
      if (!acc[person]) acc[person] = [];
      acc[person].push(Number(run["miles run"]));
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(grouped)
      .map(([person, miles]) => ({
        person,
        totalMiles: miles.reduce((a, b) => a + b, 0),
        averageMiles: miles.reduce((a, b) => a + b, 0) / miles.length,
        minMiles: Math.min(...miles),
        maxMiles: Math.max(...miles),
        runs: miles.length,
      }))
      .sort((a, b) => b.totalMiles - a.totalMiles);
  }, [data]);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const filteredData =
      selectedPerson === "all"
        ? data
        : data.filter((d) => d.person === selectedPerson);

    return filteredData
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((d) => ({
        date: new Date(d.date).toLocaleDateString(),
        miles: Number(d["miles run"]),
        person: d.person,
      }));
  }, [data, selectedPerson]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setSelectedPerson("all");
    await parseCSV(file, { customValidation });
  };

  const handleReset = (): void => {
    setFileName("");
    setSelectedPerson("all");
    reset();
  };

  const COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#232526] to-[#414345] p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <Card className="items-center w-full ">
          <div className="w-full flex">
            <CardHeader className="w-full ">
              <CardTitle className="text-3xl ">
                🏃‍♀️‍➡️CSV Runner Dashboard
              </CardTitle>
              <CardDescription className=" flex justify-center gap-1 items-center text-lg">
                Upload CSV with Columns:
                <span className="font-semibold">date, person, miles run</span>
              </CardDescription>
            </CardHeader>
            <Button onClick={handleReset} className="mr-10" variant="newtheme">
              Reset
            </Button>
          </div>

          <div className="w-full px-10">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-black/20 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                ) : (
                  <>
                    <FiUpload className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">CSV files only</p>
                  </>
                )}
              </div>
              <Input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isLoading}
              />
            </label>
            {fileName && (
              <div className="flex items-center mt-2 text-sm text-gray-300 ">
                <FaRegFileAlt className="w-4 h-4 mr-2" />
                {fileName}
              </div>
            )}
          </div>
        </Card>

        {/* Dashboard Content */}
        {isValid && data && overallMetrics && (
          <>
            {/* Overall Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <Card className="bg-black/50 shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm text-gray-200 mb-1">
                      Total Miles
                    </CardTitle>
                    <CardContent className="text-3xl font-bold text-blue-600">
                      {overallMetrics.totalMiles.toFixed(1)}
                    </CardContent>
                  </div>
                  <FaArrowTrendUp className="w-12 h-12 text-blue-300 " />
                </div>
              </Card>

              <Card className="bg-black/50 rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm text-gray-200 mb-1">
                      Average Miles
                    </CardTitle>
                    <CardContent className="text-3xl font-bold text-purple-600">
                      {overallMetrics.averageMiles.toFixed(2)}
                      {/* {overallMetrics.uniqueRunners} */}
                    </CardContent>
                  </div>
                  <FiActivity className="w-12 h-12 text-purple-300" />
                </div>
              </Card>

              <Card className="bg-black/50 rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm text-gray-200 mb-1">
                      Total Runners
                    </CardTitle>
                    <CardContent className="text-3xl font-bold text-purple-600">
                      {overallMetrics.uniqueRunners}
                    </CardContent>
                  </div>
                  <FaUsers className="w-12 h-12 text-purple-300" />
                </div>
              </Card>

              <Card className="bg-black/50 rounded-xl shadow p-6">
                <div>
                  <CardTitle className="text-sm text-gray-200 mb-1">
                    Min Miles
                  </CardTitle>
                  <CardContent className="text-2xl font-bold text-white">
                    {overallMetrics.minMiles.toFixed(1)}
                  </CardContent>
                </div>
              </Card>

              <Card className="bg-black/50 rounded-xl shadow p-6">
                <div>
                  <CardTitle className="text-sm text-gray-200 mb-1">
                    Max Miles
                  </CardTitle>
                  <CardContent className="text-2xl font-bold text-white">
                    {overallMetrics.maxMiles.toFixed(1)}
                  </CardContent>
                </div>
              </Card>

              <Card className="bg-black/50 rounded-xl shadow p-6">
                <div>
                  <CardTitle className="text-sm text-gray-200 mb-1">
                    Total Runs
                  </CardTitle>
                  <CardContent className="text-2xl font-bold text-white">
                    {overallMetrics.totalRuns}
                  </CardContent>
                </div>
              </Card>
            </div>

            {/* View Selector */}
            <Card className="bg-black/50 rounded-xl shadow p-4 mb-6">
              <label className="block text-sm font-medium text-gray-200 ">
                View Data For:
              </label>
              <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                <SelectTrigger className="w-full md:w-64 px-4 py-2 border border-gray-300 bg-black/30 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Runners</SelectItem>
                    {personMetrics.map((pm) => (
                      <SelectItem key={pm.person} value={pm.person}>
                        {pm.person}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Line Chart */}
              <div className="bg-black rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">
                  Miles Over Time{" "}
                  {selectedPerson !== "all" && `- ${selectedPerson}`}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="miles"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Miles Run"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div className="bg-black rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">
                  Total Miles by Runner
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={personMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="person" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="totalMiles"
                      fill="#8b5cf6"
                      name="Total Miles"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Per-Person Metrics Table */}
            <div className="bg-black rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">
                Per-Person Statistics
              </h3>
              <div className="overflow-x-auto">
                <Table className="w-full text-sm ">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-lg font-semibold text-white " >Runner</TableHead>
                      <TableHead className="text-lg font-semibold text-white " >Toatl Miles</TableHead>
                      <TableHead className="text-lg font-semibold text-white " >Average</TableHead>
                      <TableHead className="text-lg font-semibold text-white " >Min</TableHead>
                      <TableHead className="text-lg font-semibold text-white " >Max</TableHead>
                      <TableHead className="text-lg font-semibold text-white " >Runs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personMetrics.map((pm, idx) => (
                      <TableRow  key={pm.person}>
                        <TableCell>{pm.person}</TableCell>
                        <TableCell>{pm.totalMiles}</TableCell>
                        <TableCell>{pm.averageMiles}</TableCell>
                        <TableCell>{pm.minMiles}</TableCell>
                        <TableCell>{pm.maxMiles}</TableCell>
                        <TableCell>{pm.runs}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
