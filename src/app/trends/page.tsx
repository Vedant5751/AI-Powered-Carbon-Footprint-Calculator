"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Download,
  Filter,
  X,
  XCircle,
  Leaf,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { subMonths, isAfter, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { PageWrapper } from "@/components/page-wrapper";

// Interface for the calculation data (updated for new backend)
interface Calculation {
  calculationId: string;
  userId: string;
  timestamp: number;
  logDate: string;
  logFrequency: string;
  carbonEmission: number;
  bodyType: string;
  sex: string;
  diet: string;
  howOftenShower: string;
  heatingEnergySource: string;
  transport: string;
  vehicleType: string;
  socialActivity: string;
  monthlyGroceryBill: number;
  frequencyOfTravelingByAir: string;
  vehicleMonthlyDistanceKm: string;
  wasteBagSize: string;
  wasteBagWeeklyCount: string;
  howLongTvPcDailyHour: string;
  howManyNewClothesMonthly: number;
  howLongInternetDailyHour: string;
  energyEfficiency: string;
  recycling: string;
  cookingWith: string;
  unit: string;
}

// Interface for chart data (expanded with more categories)
interface ChartDataPoint {
  date: string;
  timestamp: number; // For sorting
  emission: number;
  transportation: number;
  homeEnergy: number;
  diet: number;
  lifestyle: number; // New category for shower, clothes, etc.
  waste: number; // New category for waste management
  digitalFootprint: number; // New category for device usage, internet, etc.
  frequency: string; // daily, weekly, or monthly
  calculationId?: string; // Reference to the original calculation
}

export default function TrendsPage() {
  const { data: session } = useSession();
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [filteredData, setFilteredData] = useState<ChartDataPoint[]>([]);

  // For calculation details dialog
  const [selectedCalc, setSelectedCalc] = useState<Calculation | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // References for PDF export
  const lineChartRef = useRef<HTMLDivElement>(null);
  const areaChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);
  const radarChartRef = useRef<HTMLDivElement>(null);

  // Date range filter
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });

  // Chart options
  const [chartTab, setChartTab] = useState("line");

  // Frequency filter
  const [frequencyFilter, setFrequencyFilter] = useState<string | null>(null);

  // Fetch user's carbon footprint calculations
  useEffect(() => {
    async function fetchCalculations() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/calculator/fetch");

        if (!response.ok) {
          throw new Error("Failed to fetch calculations");
        }

        const data = await response.json();
        setCalculations(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCalculations();
  }, []);

  // Process data for charts
  useEffect(() => {
    if (!calculations.length) return;

    try {
      // Sort calculations by timestamp
      const sortedCalcs = [...calculations].sort(
        (a, b) => a.timestamp - b.timestamp
      );

      // Prepare chart data with category breakdown
      const processedData: ChartDataPoint[] = sortedCalcs.map((calc) => {
        if (!calc || typeof calc !== "object") {
          console.error("Invalid calculation object:", calc);
          // Return a default data point to avoid breaking the chart
          return {
            date: "Unknown",
            timestamp: 0,
            emission: 0,
            transportation: 0,
            homeEnergy: 0,
            diet: 0,
            lifestyle: 0,
            waste: 0,
            digitalFootprint: 0,
            frequency: "daily",
          };
        }

        // Ensure carbonEmission exists or default to 0
        const emission =
          typeof calc.carbonEmission === "number" ? calc.carbonEmission : 0;

        // Extract and estimate category contributions based on direct field access
        // Transportation emissions based on vehicle type and usage
        const transportEmission =
          calc.transport === "Public Transport"
            ? emission * 0.1
            : parseFloat(calc.vehicleMonthlyDistanceKm || "0") > 300
            ? emission * 0.35
            : parseFloat(calc.vehicleMonthlyDistanceKm || "0") > 100
            ? emission * 0.25
            : emission * 0.15;

        // Home energy emissions based on heating source and energy efficiency
        const homeEmission =
          calc.heatingEnergySource === "Electricity" &&
          calc.energyEfficiency === "High"
            ? emission * 0.2
            : calc.heatingEnergySource === "Natural Gas"
            ? emission * 0.3
            : emission * 0.25;

        // Diet emissions based on diet type
        const dietEmission =
          calc.diet === "Vegan"
            ? emission * 0.05
            : calc.diet === "Vegetarian"
            ? emission * 0.1
            : calc.diet === "Pescatarian"
            ? emission * 0.15
            : emission * 0.25;

        // Lifestyle emissions (shower frequency, social activity, etc.)
        const lifestyleEmission =
          calc.howOftenShower === "Multiple Times Daily"
            ? emission * 0.1
            : calc.howOftenShower === "Daily"
            ? emission * 0.05
            : emission * 0.02;

        // Waste emissions based on waste bag size and count
        const wasteEmission =
          calc.wasteBagSize === "Large" &&
          parseInt(calc.wasteBagWeeklyCount || "0") > 2
            ? emission * 0.15
            : calc.wasteBagSize === "Medium" &&
              parseInt(calc.wasteBagWeeklyCount || "0") > 1
            ? emission * 0.1
            : emission * 0.05;

        // Digital footprint emissions based on device usage time
        const digitalFootprintEmission =
          parseInt(calc.howLongTvPcDailyHour || "0") > 5 ||
          parseInt(calc.howLongInternetDailyHour || "0") > 5
            ? emission * 0.15
            : emission * 0.08;

        // Format the date
        const dateStr = calc.logDate
          ? new Date(calc.logDate).toLocaleDateString()
          : calc.timestamp
          ? new Date(calc.timestamp).toLocaleDateString()
          : "Unknown";

        return {
          date: dateStr,
          timestamp: calc.timestamp || 0,
          emission: emission,
          transportation: parseFloat(transportEmission.toFixed(4)),
          homeEnergy: parseFloat(homeEmission.toFixed(4)),
          diet: parseFloat(dietEmission.toFixed(4)),
          lifestyle: parseFloat(lifestyleEmission.toFixed(4)),
          waste: parseFloat(wasteEmission.toFixed(4)),
          digitalFootprint: parseFloat(digitalFootprintEmission.toFixed(4)),
          frequency: calc.logFrequency || "daily",
          calculationId: calc.calculationId,
        };
      });

      setChartData(processedData);
      setFilteredData(processedData);
    } catch (err) {
      console.error("Error processing chart data:", err);
      setError("Failed to process chart data. Please try again later.");
    }
  }, [calculations]);

  // Handle data point click - find calculation and show details
  const handleDataPointClick = (payload: ChartDataPoint) => {
    if (payload && payload.calculationId) {
      // Find the full calculation details
      const calculation = calculations.find(
        (calc) => calc.calculationId === payload.calculationId
      );
      if (calculation) {
        setSelectedCalc(calculation);
        setShowDetails(true);
      }
    }
  };

  // Apply date range and frequency filters
  useEffect(() => {
    if (!chartData.length) return;

    try {
      // First filter by date range
      let filtered = chartData;

      if (dateRange.from || dateRange.to) {
        filtered = filtered.filter((dataPoint) => {
          try {
            // Skip items with invalid timestamps
            if (!dataPoint.timestamp) return false;

            const pointDate = new Date(dataPoint.timestamp);

            // Skip if we couldn't create a valid date
            if (isNaN(pointDate.getTime())) return false;

            if (dateRange.from && dateRange.to) {
              return pointDate >= dateRange.from && pointDate <= dateRange.to;
            }
            if (dateRange.from) {
              return pointDate >= dateRange.from;
            }
            if (dateRange.to) {
              return pointDate <= dateRange.to;
            }
            return true;
          } catch (err) {
            console.error("Error filtering data point:", err, dataPoint);
            return false;
          }
        });
      }

      // Then filter by frequency if specified
      if (frequencyFilter) {
        filtered = filtered.filter(
          (dataPoint) => dataPoint.frequency === frequencyFilter
        );
      }

      setFilteredData(filtered);
    } catch (err) {
      console.error("Error applying filters:", err);
      // Fallback to showing all data
      setFilteredData(chartData);
    }
  }, [dateRange, frequencyFilter, chartData]);

  // Custom formatter for Recharts tooltips
  const customTooltipFormatter = (value: number | string) => {
    if (typeof value === "number") {
      return [`${value.toFixed(2)} kg`, "Carbon Emission"];
    }
    return [`${value}`, "Carbon Emission"];
  };

  // Export chart as PDF
  const exportToPDF = async (
    chartRef: React.RefObject<HTMLDivElement>,
    title: string
  ) => {
    if (!chartRef.current) {
      console.error("Chart reference is not available");
      return;
    }

    try {
      // Show an exporting indicator
      const indicator = document.createElement("div");
      indicator.innerText = "Exporting...";
      indicator.style.position = "absolute";
      indicator.style.top = "50%";
      indicator.style.left = "50%";
      indicator.style.transform = "translate(-50%, -50%)";
      indicator.style.padding = "10px";
      indicator.style.background = "rgba(0, 0, 0, 0.7)";
      indicator.style.color = "white";
      indicator.style.borderRadius = "5px";
      indicator.style.zIndex = "9999";
      document.body.appendChild(indicator);

      // Use a timeout to let the UI update before starting the export
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(chartRef.current!);
          const imgData = canvas.toDataURL("image/png");

          const pdf = new jsPDF("landscape", "mm", "a4");
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          pdf.text(title, 14, 10);

          // Add date range info if set
          if (dateRange.from || dateRange.to) {
            const fromText = dateRange.from
              ? format(dateRange.from, "PPP")
              : "Start";
            const toText = dateRange.to
              ? format(dateRange.to, "PPP")
              : "Present";
            pdf.text(`Date Range: ${fromText} to ${toText}`, 14, 20);
          }

          pdf.addImage(imgData, "PNG", 10, 30, pdfWidth - 20, pdfHeight - 20);
          pdf.save(`carbon-emissions-${title.toLowerCase()}-chart.pdf`);

          // Remove the indicator
          document.body.removeChild(indicator);
        } catch (err) {
          console.error("Error in PDF generation:", err);
          document.body.removeChild(indicator);
          alert("Failed to export chart. Please try again.");
        }
      }, 100);
    } catch (err) {
      console.error("Error initiating PDF export:", err);
      alert("Failed to start export. Please try again.");
    }
  };

  // Reset filters
  const resetFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setFrequencyFilter(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-10">
        <div className="flex flex-col items-center gap-2">
          <Spinner size="lg" />
          <p>Loading your carbon footprint trends...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
          <XCircle className="h-12 w-12 text-destructive" />
          <p className="text-xl font-semibold">Error loading data</p>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </PageWrapper>
    );
  }

  if (calculations.length <= 1) {
    return (
      <PageWrapper>
        <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
          <Leaf className="h-12 w-12 text-primary" />
          <p className="text-xl font-semibold">Not Enough Data</p>
          <p className="text-muted-foreground">
            You need at least two calculations to view trends.
          </p>
          <Button asChild>
            <Link href="/calculator">Calculate Again</Link>
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold mb-2">Carbon Footprint Trends</h1>
      <p className="text-muted-foreground mb-6">
        Analyze your carbon emissions over time and identify patterns
      </p>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filter Data
            </CardTitle>
            <Button variant="ghost" onClick={resetFilters} size="sm">
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div>
              <p className="text-sm font-medium mb-2">Date Range</p>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[200px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        <span className="flex items-center">
                          {format(dateRange.from, "PPP")}
                          <Button
                            variant="ghost"
                            className="h-4 w-4 p-0 ml-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDateRange((prev) => ({
                                ...prev,
                                from: undefined,
                              }));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </span>
                      ) : (
                        <span>Start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) =>
                        setDateRange((prev) => ({ ...prev, from: date }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span className="self-center">to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[200px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? (
                        <span className="flex items-center">
                          {format(dateRange.to, "PPP")}
                          <Button
                            variant="ghost"
                            className="h-4 w-4 p-0 ml-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDateRange((prev) => ({
                                ...prev,
                                to: undefined,
                              }));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </span>
                      ) : (
                        <span>End date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) =>
                        setDateRange((prev) => ({ ...prev, to: date }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Frequency</p>
              <div className="flex items-center">
                <Select
                  value={frequencyFilter || "all"}
                  onValueChange={(value) =>
                    setFrequencyFilter(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Frequencies</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                {frequencyFilter && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2"
                    onClick={() => setFrequencyFilter(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {filteredData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Summary Statistics</CardTitle>
            <CardDescription>
              Key metrics for {filteredData.length} calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-slate-500 dark:text-slate-400">
                  Average Emission
                </h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {(
                    filteredData.reduce((acc, curr) => acc + curr.emission, 0) /
                    filteredData.length
                  ).toFixed(2)}
                  <span className="text-sm ml-1 font-normal">kg</span>
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-slate-500 dark:text-slate-400">
                  Total Emission
                </h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {filteredData
                    .reduce((acc, curr) => acc + curr.emission, 0)
                    .toFixed(2)}
                  <span className="text-sm ml-1 font-normal">kg</span>
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-slate-500 dark:text-slate-400">
                  First to Last Change
                </h3>
                {filteredData.length > 1 ? (
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {(
                      ((filteredData[filteredData.length - 1].emission -
                        filteredData[0].emission) /
                        filteredData[0].emission) *
                      100
                    ).toFixed(1)}
                    <span className="text-sm ml-1 font-normal">%</span>
                  </p>
                ) : (
                  <p className="text-lg text-slate-500">Need more data</p>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-slate-500 dark:text-slate-400">
                  Largest Category
                </h3>
                {filteredData.length > 0 &&
                  (() => {
                    const latest = filteredData[filteredData.length - 1];
                    const categories = [
                      { name: "Transportation", value: latest.transportation },
                      { name: "Home Energy", value: latest.homeEnergy },
                      { name: "Diet", value: latest.diet },
                      { name: "Lifestyle", value: latest.lifestyle },
                      { name: "Waste", value: latest.waste },
                      { name: "Digital", value: latest.digitalFootprint },
                    ];
                    const largest = categories.reduce(
                      (max, obj) => (obj.value > max.value ? obj : max),
                      categories[0]
                    );

                    return (
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {largest.name}
                        <span className="text-sm ml-1 font-normal">
                          {((largest.value / latest.emission) * 100).toFixed(0)}
                          %
                        </span>
                      </p>
                    );
                  })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Emission Trends</CardTitle>
              <CardDescription>
                {filteredData.length
                  ? `Showing data for ${filteredData.length} calculations`
                  : "No data available for the selected filters"}
              </CardDescription>
            </div>
            {filteredData.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentRef =
                      chartTab === "line"
                        ? lineChartRef
                        : chartTab === "area"
                        ? areaChartRef
                        : chartTab === "bar"
                        ? barChartRef
                        : chartTab === "pie"
                        ? pieChartRef
                        : radarChartRef;
                    exportToPDF(
                      currentRef,
                      `${
                        chartTab.charAt(0).toUpperCase() + chartTab.slice(1)
                      } Chart`
                    );
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-2">
            Click on any data point to see detailed information about that
            calculation.
          </p>
          <Tabs
            defaultValue="line"
            className="w-full"
            onValueChange={(value) => setChartTab(value)}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="line">Line Chart</TabsTrigger>
              <TabsTrigger value="area">Area Chart</TabsTrigger>
              <TabsTrigger value="bar">Bar Chart</TabsTrigger>
              <TabsTrigger value="pie">Pie Chart</TabsTrigger>
              <TabsTrigger value="radar">Radar Chart</TabsTrigger>
            </TabsList>
            <TabsContent value="line" ref={lineChartRef}>
              <div className="h-[400px] mt-2">
                {filteredData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={filteredData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value} kg`}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          `${Number(value).toFixed(2)} kg`,
                          name.charAt(0).toUpperCase() + name.slice(1),
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="emission"
                        stroke="#4f46e5"
                        activeDot={{
                          r: 8,
                          onClick: (e, payload) =>
                            handleDataPointClick(payload),
                        }}
                        name="Total Emission"
                      />
                      <Line
                        type="monotone"
                        dataKey="transportation"
                        stroke="#ef4444"
                        activeDot={{
                          r: 6,
                          onClick: (e, payload) =>
                            handleDataPointClick(payload),
                        }}
                        name="Transportation"
                      />
                      <Line
                        type="monotone"
                        dataKey="homeEnergy"
                        stroke="#f97316"
                        activeDot={{
                          r: 6,
                          onClick: (e, payload) =>
                            handleDataPointClick(payload),
                        }}
                        name="Home Energy"
                      />
                      <Line
                        type="monotone"
                        dataKey="diet"
                        stroke="#10b981"
                        activeDot={{
                          r: 6,
                          onClick: (e, payload) =>
                            handleDataPointClick(payload),
                        }}
                        name="Diet"
                      />
                      <Line
                        type="monotone"
                        dataKey="lifestyle"
                        stroke="#a855f7"
                        activeDot={{
                          r: 6,
                          onClick: (e, payload) =>
                            handleDataPointClick(payload),
                        }}
                        name="Lifestyle"
                      />
                      <Line
                        type="monotone"
                        dataKey="waste"
                        stroke="#6366f1"
                        activeDot={{
                          r: 6,
                          onClick: (e, payload) =>
                            handleDataPointClick(payload),
                        }}
                        name="Waste"
                      />
                      <Line
                        type="monotone"
                        dataKey="digitalFootprint"
                        stroke="#0ea5e9"
                        activeDot={{
                          r: 6,
                          onClick: (e, payload) =>
                            handleDataPointClick(payload),
                        }}
                        name="Digital"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <p className="text-muted-foreground">No data available</p>
                    {error && (
                      <p className="text-sm text-destructive mt-2">
                        Error: {error}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="area" ref={areaChartRef}>
              <div className="h-[400px] mt-2">
                {filteredData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={filteredData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      onClick={(data) =>
                        data &&
                        data.activePayload &&
                        handleDataPointClick(data.activePayload[0].payload)
                      }
                    >
                      <defs>
                        <linearGradient
                          id="colorTransport"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#ff7700"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#ff7700"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorHome"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#00C49F"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#00C49F"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorDiet"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#FFBB28"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#FFBB28"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorLifestyle"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#0088FE"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#0088FE"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorWaste"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#FF8042"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#FF8042"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorDigital"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#9966FF"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#9966FF"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `${value} kg`} />
                      <Tooltip
                        formatter={(value, name) => [
                          `${Number(value).toFixed(2)} kg`,
                          name.charAt(0).toUpperCase() + name.slice(1),
                        ]}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="transportation"
                        name="Transportation"
                        stackId="1"
                        stroke="#ff7700"
                        fillOpacity={1}
                        fill="url(#colorTransport)"
                      />
                      <Area
                        type="monotone"
                        dataKey="homeEnergy"
                        name="Home Energy"
                        stackId="1"
                        stroke="#00C49F"
                        fillOpacity={1}
                        fill="url(#colorHome)"
                      />
                      <Area
                        type="monotone"
                        dataKey="diet"
                        name="Diet"
                        stackId="1"
                        stroke="#FFBB28"
                        fillOpacity={1}
                        fill="url(#colorDiet)"
                      />
                      <Area
                        type="monotone"
                        dataKey="lifestyle"
                        name="Lifestyle"
                        stackId="1"
                        stroke="#0088FE"
                        fillOpacity={1}
                        fill="url(#colorLifestyle)"
                      />
                      <Area
                        type="monotone"
                        dataKey="waste"
                        name="Waste Management"
                        stackId="1"
                        stroke="#FF8042"
                        fillOpacity={1}
                        fill="url(#colorWaste)"
                      />
                      <Area
                        type="monotone"
                        dataKey="digitalFootprint"
                        name="Digital Footprint"
                        stackId="1"
                        stroke="#9966FF"
                        fillOpacity={1}
                        fill="url(#colorDigital)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <p className="text-muted-foreground">No data available</p>
                    {error && (
                      <p className="text-sm text-destructive mt-2">
                        Error: {error}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="bar" ref={barChartRef}>
              <div className="h-[400px] mt-2">
                {filteredData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={filteredData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      onClick={(data) =>
                        data &&
                        data.activePayload &&
                        handleDataPointClick(data.activePayload[0].payload)
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `${value} kg`} />
                      <Tooltip
                        formatter={(value, name) => [
                          `${Number(value).toFixed(2)} kg`,
                          name.charAt(0).toUpperCase() + name.slice(1),
                        ]}
                      />
                      <Legend />
                      <Bar
                        dataKey="transportation"
                        name="Transportation"
                        stackId="a"
                        fill="#ff7700"
                      />
                      <Bar
                        dataKey="homeEnergy"
                        name="Home Energy"
                        stackId="a"
                        fill="#00C49F"
                      />
                      <Bar
                        dataKey="diet"
                        name="Diet"
                        stackId="a"
                        fill="#FFBB28"
                      />
                      <Bar
                        dataKey="lifestyle"
                        name="Lifestyle"
                        stackId="a"
                        fill="#0088FE"
                      />
                      <Bar
                        dataKey="waste"
                        name="Waste Management"
                        stackId="a"
                        fill="#FF8042"
                      />
                      <Bar
                        dataKey="digitalFootprint"
                        name="Digital Footprint"
                        stackId="a"
                        fill="#9966FF"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <p className="text-muted-foreground">No data available</p>
                    {error && (
                      <p className="text-sm text-destructive mt-2">
                        Error: {error}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="pie" ref={pieChartRef}>
              <div className="h-[400px] mt-2">
                {filteredData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          filteredData.length > 0
                            ? [
                                {
                                  name: "Transportation",
                                  value: parseFloat(
                                    filteredData
                                      .reduce(
                                        (sum, item) =>
                                          sum + item.transportation,
                                        0
                                      )
                                      .toFixed(2)
                                  ),
                                },
                                {
                                  name: "Home Energy",
                                  value: parseFloat(
                                    filteredData
                                      .reduce(
                                        (sum, item) => sum + item.homeEnergy,
                                        0
                                      )
                                      .toFixed(2)
                                  ),
                                },
                                {
                                  name: "Diet",
                                  value: parseFloat(
                                    filteredData
                                      .reduce((sum, item) => sum + item.diet, 0)
                                      .toFixed(2)
                                  ),
                                },
                                {
                                  name: "Lifestyle",
                                  value: parseFloat(
                                    filteredData
                                      .reduce(
                                        (sum, item) => sum + item.lifestyle,
                                        0
                                      )
                                      .toFixed(2)
                                  ),
                                },
                                {
                                  name: "Waste",
                                  value: parseFloat(
                                    filteredData
                                      .reduce(
                                        (sum, item) => sum + item.waste,
                                        0
                                      )
                                      .toFixed(2)
                                  ),
                                },
                                {
                                  name: "Digital",
                                  value: parseFloat(
                                    filteredData
                                      .reduce(
                                        (sum, item) =>
                                          sum + item.digitalFootprint,
                                        0
                                      )
                                      .toFixed(2)
                                  ),
                                },
                              ]
                            : []
                        }
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        onClick={(data) => {
                          // For pie chart, we show the most recent calculation as an example
                          if (filteredData.length > 0) {
                            handleDataPointClick(
                              filteredData[filteredData.length - 1]
                            );
                          }
                        }}
                      >
                        {filteredData.length > 0 &&
                          [
                            { name: "Transportation", fill: "#ff7700" },
                            { name: "Home Energy", fill: "#00C49F" },
                            { name: "Diet", fill: "#FFBB28" },
                            { name: "Lifestyle", fill: "#0088FE" },
                            { name: "Waste", fill: "#FF8042" },
                            { name: "Digital", fill: "#9966FF" },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          `${value.toFixed(2)} kg`,
                          "Carbon Emission",
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <p className="text-muted-foreground">No data available</p>
                    {error && (
                      <p className="text-sm text-destructive mt-2">
                        Error: {error}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="radar" ref={radarChartRef}>
              <div className="h-[400px] mt-2">
                {filteredData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      data={[
                        {
                          subject: "Transportation",
                          A: parseFloat(
                            filteredData
                              .reduce(
                                (sum, item) => sum + item.transportation,
                                0
                              )
                              .toFixed(2)
                          ),
                          fullMark: filteredData
                            .reduce((sum, item) => sum + item.emission, 0)
                            .toFixed(2),
                        },
                        {
                          subject: "Home Energy",
                          A: parseFloat(
                            filteredData
                              .reduce((sum, item) => sum + item.homeEnergy, 0)
                              .toFixed(2)
                          ),
                          fullMark: filteredData
                            .reduce((sum, item) => sum + item.emission, 0)
                            .toFixed(2),
                        },
                        {
                          subject: "Diet",
                          A: parseFloat(
                            filteredData
                              .reduce((sum, item) => sum + item.diet, 0)
                              .toFixed(2)
                          ),
                          fullMark: filteredData
                            .reduce((sum, item) => sum + item.emission, 0)
                            .toFixed(2),
                        },
                        {
                          subject: "Lifestyle",
                          A: parseFloat(
                            filteredData
                              .reduce((sum, item) => sum + item.lifestyle, 0)
                              .toFixed(2)
                          ),
                          fullMark: filteredData
                            .reduce((sum, item) => sum + item.emission, 0)
                            .toFixed(2),
                        },
                        {
                          subject: "Waste",
                          A: parseFloat(
                            filteredData
                              .reduce((sum, item) => sum + item.waste, 0)
                              .toFixed(2)
                          ),
                          fullMark: filteredData
                            .reduce((sum, item) => sum + item.emission, 0)
                            .toFixed(2),
                        },
                        {
                          subject: "Digital",
                          A: parseFloat(
                            filteredData
                              .reduce(
                                (sum, item) => sum + item.digitalFootprint,
                                0
                              )
                              .toFixed(2)
                          ),
                          fullMark: filteredData
                            .reduce((sum, item) => sum + item.emission, 0)
                            .toFixed(2),
                        },
                      ]}
                      onClick={() => {
                        // For radar chart, we show the most recent calculation
                        if (filteredData.length > 0) {
                          handleDataPointClick(
                            filteredData[filteredData.length - 1]
                          );
                        }
                      }}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis />
                      <Radar
                        name="Carbon Impact"
                        dataKey="A"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                      />
                      <Tooltip
                        formatter={(value) => [`${value.toFixed(2)} kg`, ""]}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <p className="text-muted-foreground">No data available</p>
                    {error && (
                      <p className="text-sm text-destructive mt-2">
                        Error: {error}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Calculation Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Calculation Details</DialogTitle>
            <DialogDescription>
              Carbon footprint calculation from{" "}
              {selectedCalc
                ? format(new Date(selectedCalc.timestamp), "PPP")
                : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedCalc && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <h3 className="font-semibold text-sm">Carbon Emission</h3>
                  <p className="text-sm">
                    {selectedCalc.carbonEmission.toFixed(2)} kg CO2e
                  </p>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <h3 className="font-semibold text-sm">Date</h3>
                  <p className="text-sm">
                    {format(new Date(selectedCalc.timestamp), "PPP")}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-3">
                  <h3 className="font-semibold mb-2">Transportation</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Frequency
                      </span>
                      <span className="text-sm">
                        {selectedCalc.logFrequency || "Daily"}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Mode
                      </span>
                      <span className="text-sm">
                        {selectedCalc.transport || "Not specified"}
                      </span>
                    </div>
                    {selectedCalc.vehicleType && (
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-muted-foreground">
                          Vehicle Type
                        </span>
                        <span className="text-sm">
                          {selectedCalc.vehicleType || "Not specified"}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Emission
                      </span>
                      <span className="text-sm">
                        {selectedCalc.transportation.toFixed(2)} kg CO2e
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-3">
                  <h3 className="font-semibold mb-2">Diet</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Type
                      </span>
                      <span className="text-sm">
                        {selectedCalc.diet || "Not specified"}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Emission
                      </span>
                      <span className="text-sm">
                        {selectedCalc.diet.toFixed(2)} kg CO2e
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-3">
                  <h3 className="font-semibold mb-2">Home Energy</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Efficiency
                      </span>
                      <span className="text-sm">
                        {selectedCalc.energyEfficiency || "Not specified"}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Emission
                      </span>
                      <span className="text-sm">
                        {selectedCalc.homeEnergy.toFixed(2)} kg CO2e
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-3">
                  <h3 className="font-semibold mb-2">Waste</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Bag Size
                      </span>
                      <span className="text-sm">
                        {selectedCalc.wasteBagSize || "Not specified"}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Weekly Bags
                      </span>
                      <span className="text-sm">
                        {selectedCalc.wasteBagWeeklyCount || "0"}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Emission
                      </span>
                      <span className="text-sm">
                        {selectedCalc.waste.toFixed(2)} kg CO2e
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-3">
                  <h3 className="font-semibold mb-2">Digital Footprint</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">
                        TV/PC Usage
                      </span>
                      <span className="text-sm">
                        {selectedCalc.howLongTvPcDailyHour || "0"} hours
                      </span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Internet Usage
                      </span>
                      <span className="text-sm">
                        {selectedCalc.howLongInternetDailyHour || "0"} hours
                      </span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Emission
                      </span>
                      <span className="text-sm">
                        {selectedCalc.digitalFootprint.toFixed(2)} kg CO2e
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
