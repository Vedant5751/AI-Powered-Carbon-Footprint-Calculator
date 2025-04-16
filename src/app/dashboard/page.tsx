"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent as ShardCardContent,
  CardDescription,
  CardHeader as ShardCardHeader,
  CardTitle as ShardCardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  TooltipProps,
  AreaChart,
  Area,
} from "recharts";
import {
  ArrowRight,
  Award,
  BarChart3,
  Calendar,
  Car,
  Home as HomeIcon,
  Leaf,
  ShoppingBag,
  TrendingDown,
  XCircle,
  ArrowDownIcon,
  ArrowUpIcon,
  MinusIcon,
  Utensils,
  User,
  Trash2,
  Monitor,
  LightbulbIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import {
  DashboardCard,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/dashboard-card";
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
}

interface CategoryDataPoint {
  name: string;
  value: number;
}

interface ComparisonDataPoint {
  name: string;
  value: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const processChartData = () => {
    if (!calculations.length) {
      return {
        timelineData: [] as ChartDataPoint[],
        categoryData: [] as CategoryDataPoint[],
        comparisonData: [] as ComparisonDataPoint[],
      };
    }

    // Sort calculations by timestamp
    const sortedCalcs = [...calculations].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    // Timeline data - carbon emissions over time
    const timelineData: ChartDataPoint[] = sortedCalcs.map((calc) => {
      // Format the date
      const dateStr = calc.logDate
        ? new Date(calc.logDate).toLocaleDateString()
        : calc.timestamp
        ? new Date(calc.timestamp).toLocaleDateString()
        : "Unknown";

      // Extract and estimate category contributions based on direct field access
      // Transportation emissions based on vehicle type and usage
      const transportEmission =
        calc.transport === "Public Transport"
          ? calc.carbonEmission * 0.1
          : parseFloat(calc.vehicleMonthlyDistanceKm || "0") > 300
          ? calc.carbonEmission * 0.35
          : parseFloat(calc.vehicleMonthlyDistanceKm || "0") > 100
          ? calc.carbonEmission * 0.25
          : calc.carbonEmission * 0.15;

      // Home energy emissions based on heating source and energy efficiency
      const homeEmission =
        calc.heatingEnergySource === "Electricity" &&
        calc.energyEfficiency === "High"
          ? calc.carbonEmission * 0.2
          : calc.heatingEnergySource === "Natural Gas"
          ? calc.carbonEmission * 0.3
          : calc.carbonEmission * 0.25;

      // Diet emissions based on diet type
      const dietEmission =
        calc.diet === "Vegan"
          ? calc.carbonEmission * 0.05
          : calc.diet === "Vegetarian"
          ? calc.carbonEmission * 0.1
          : calc.diet === "Pescatarian"
          ? calc.carbonEmission * 0.15
          : calc.carbonEmission * 0.25;

      // Lifestyle emissions (shower frequency, social activity, etc.)
      const lifestyleEmission =
        calc.howOftenShower === "Multiple Times Daily"
          ? calc.carbonEmission * 0.1
          : calc.howOftenShower === "Daily"
          ? calc.carbonEmission * 0.05
          : calc.carbonEmission * 0.02;

      // Waste emissions based on waste bag size and count
      const wasteEmission =
        calc.wasteBagSize === "Large" &&
        parseInt(calc.wasteBagWeeklyCount || "0") > 2
          ? calc.carbonEmission * 0.15
          : calc.wasteBagSize === "Medium" &&
            parseInt(calc.wasteBagWeeklyCount || "0") > 1
          ? calc.carbonEmission * 0.1
          : calc.carbonEmission * 0.05;

      // Digital footprint emissions based on device usage time
      const digitalFootprintEmission =
        parseInt(calc.howLongTvPcDailyHour || "0") > 5 ||
        parseInt(calc.howLongInternetDailyHour || "0") > 5
          ? calc.carbonEmission * 0.15
          : calc.carbonEmission * 0.08;

      return {
        date: dateStr,
        timestamp: calc.timestamp || 0,
        emission: calc.carbonEmission,
        transportation: parseFloat(transportEmission.toFixed(4)),
        homeEnergy: parseFloat(homeEmission.toFixed(4)),
        diet: parseFloat(dietEmission.toFixed(4)),
        lifestyle: parseFloat(lifestyleEmission.toFixed(4)),
        waste: parseFloat(wasteEmission.toFixed(4)),
        digitalFootprint: parseFloat(digitalFootprintEmission.toFixed(4)),
        frequency: calc.logFrequency || "daily",
      };
    });

    // Get the most recent calculation
    const latestCalc = sortedCalcs[sortedCalcs.length - 1];

    // Category breakdown for the pie chart (from most recent calculation)
    const categoryData: CategoryDataPoint[] = [
      {
        name: "Transportation",
        value: timelineData[timelineData.length - 1].transportation,
      },
      {
        name: "Home Energy",
        value: timelineData[timelineData.length - 1].homeEnergy,
      },
      { name: "Diet", value: timelineData[timelineData.length - 1].diet },
      {
        name: "Lifestyle",
        value: timelineData[timelineData.length - 1].lifestyle,
      },
      { name: "Waste", value: timelineData[timelineData.length - 1].waste },
      {
        name: "Digital Footprint",
        value: timelineData[timelineData.length - 1].digitalFootprint,
      },
    ];

    // Comparison data - if we have at least 2 calculations
    let comparisonData: ComparisonDataPoint[] = [];
    if (sortedCalcs.length > 1) {
      const previousCalc = sortedCalcs[sortedCalcs.length - 2];
      comparisonData = [
        { name: "Previous", value: previousCalc.carbonEmission },
        { name: "Current", value: latestCalc.carbonEmission },
      ];
    }

    return { timelineData, categoryData, comparisonData };
  };

  const { timelineData, categoryData, comparisonData } = processChartData();

  // Colors for charts
  const COLORS = [
    "#ff7700",
    "#00C49F",
    "#FFBB28",
    "#0088FE",
    "#FF8042",
    "#9966FF",
  ];

  // Calculate stats
  const calculateStats = () => {
    if (!calculations.length) return { latest: 0, average: 0, reduction: 0 };

    const sortedCalcs = [...calculations].sort(
      (a, b) => a.timestamp - b.timestamp
    );
    const latest = sortedCalcs[sortedCalcs.length - 1].carbonEmission;
    const average =
      sortedCalcs.reduce((sum, calc) => sum + calc.carbonEmission, 0) /
      sortedCalcs.length;

    let reduction = 0;
    if (sortedCalcs.length > 1) {
      const first = sortedCalcs[0].carbonEmission;
      const last = sortedCalcs[sortedCalcs.length - 1].carbonEmission;
      reduction = ((first - last) / first) * 100;
    }

    return { latest, average, reduction };
  };

  const stats = calculateStats();

  // Custom formatter for Recharts tooltips
  const customTooltipFormatter = (value: number | string) => {
    if (typeof value === "number") {
      return [`${value.toFixed(2)} tonnes`, "Carbon Emission"];
    }
    return [`${value}`, "Carbon Emission"];
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <p>Loading your carbon footprint data...</p>
          </div>
        </div>
      </PageWrapper>
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

  if (calculations.length === 0) {
    return (
      <PageWrapper>
        <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
          <Leaf className="h-12 w-12 text-primary" />
          <p className="text-xl font-semibold">No carbon footprint data yet</p>
          <p className="text-muted-foreground">
            Complete a carbon footprint calculation to see your dashboard.
          </p>
          <Button asChild>
            <Link href="/calculator">Calculate Now</Link>
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Carbon Stats */}
        <DashboardCard className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Carbon Footprint</CardTitle>
            <CardDescription>Your latest measurements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Latest</p>
                <p className="text-3xl font-bold">
                  {stats.latest.toFixed(1)}{" "}
                  <span className="text-xl">kg CO₂</span>
                </p>
              </div>
              <div
                className={cn(
                  "rounded-lg px-3 py-2 text-xs font-medium",
                  stats.reduction > 0
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : stats.reduction < 0
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                )}
              >
                {stats.reduction > 0 ? (
                  <ArrowDownIcon className="mr-1 inline h-3 w-3" />
                ) : stats.reduction < 0 ? (
                  <ArrowUpIcon className="mr-1 inline h-3 w-3" />
                ) : (
                  <MinusIcon className="mr-1 inline h-3 w-3" />
                )}
                {Math.abs(stats.reduction).toFixed(1)}% since first calculation
              </div>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average
                </p>
                <p className="text-lg font-medium">
                  {stats.average.toFixed(1)} kg
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Frequency
                </p>
                <p className="text-lg font-medium">
                  {calculations[calculations.length - 1]?.logFrequency ||
                    "Daily"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Entries
                </p>
                <p className="text-lg font-medium">{calculations.length}</p>
              </div>
            </div>
          </CardContent>
        </DashboardCard>

        {/* Timeline Chart */}
        <DashboardCard className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Emissions Over Time</CardTitle>
            <CardDescription>Your carbon footprint trend</CardDescription>
          </CardHeader>
          <CardContent className="h-[240px]">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timelineData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value} kg`}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(2)} kg`,
                      "Carbon Emissions",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="emission"
                    stroke="#ff7700"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Not enough data to show a timeline
                </p>
              </div>
            )}
          </CardContent>
        </DashboardCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Category Breakdown */}
        <DashboardCard className="md:col-span-1">
          <CardHeader>
            <CardTitle>Carbon Breakdown</CardTitle>
            <CardDescription>Latest calculation by category</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(2)} kg`,
                      "Carbon Emissions",
                    ]}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Not enough data to show a breakdown
                </p>
              </div>
            )}
          </CardContent>
        </DashboardCard>

        {/* Stacked Area Chart */}
        <DashboardCard className="md:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Category Trends</CardTitle>
            <CardDescription>
              Carbon emissions by category over time
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {timelineData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timelineData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `${value} kg`} />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(2)} kg`,
                      "",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="transportation"
                    stackId="1"
                    stroke={COLORS[0]}
                    fill={COLORS[0]}
                  />
                  <Area
                    type="monotone"
                    dataKey="homeEnergy"
                    stackId="1"
                    stroke={COLORS[1]}
                    fill={COLORS[1]}
                  />
                  <Area
                    type="monotone"
                    dataKey="diet"
                    stackId="1"
                    stroke={COLORS[2]}
                    fill={COLORS[2]}
                  />
                  <Area
                    type="monotone"
                    dataKey="lifestyle"
                    stackId="1"
                    stroke={COLORS[3]}
                    fill={COLORS[3]}
                  />
                  <Area
                    type="monotone"
                    dataKey="waste"
                    stackId="1"
                    stroke={COLORS[4]}
                    fill={COLORS[4]}
                  />
                  <Area
                    type="monotone"
                    dataKey="digitalFootprint"
                    stackId="1"
                    stroke={COLORS[5]}
                    fill={COLORS[5]}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Not enough data to show category trends
                </p>
              </div>
            )}
          </CardContent>
        </DashboardCard>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Transportation Details */}
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="h-5 w-5" />
              Transportation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Transport Mode:</span>
                <span className="text-sm font-medium">
                  {calculations[calculations.length - 1]?.transport ||
                    "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Vehicle Type:</span>
                <span className="text-sm font-medium">
                  {calculations[calculations.length - 1]?.vehicleType ||
                    "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Monthly Distance:</span>
                <span className="text-sm font-medium">
                  {calculations[calculations.length - 1]
                    ?.vehicleMonthlyDistanceKm || 0}{" "}
                  km
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Air Travel:</span>
                <span className="text-sm font-medium">
                  {calculations[calculations.length - 1]
                    ?.frequencyOfTravelingByAir || "Not specified"}
                </span>
              </div>
            </div>
          </CardContent>
        </DashboardCard>

        {/* Home Energy Details */}
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <HomeIcon className="h-5 w-5" />
              Home Energy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Heating Source:</span>
                <span className="text-sm font-medium">
                  {calculations[calculations.length - 1]?.heatingEnergySource ||
                    "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Cooking With:</span>
                <span className="text-sm font-medium">
                  {calculations[calculations.length - 1]?.cookingWith ||
                    "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Energy Efficiency:</span>
                <span className="text-sm font-medium">
                  {calculations[calculations.length - 1]?.energyEfficiency ||
                    "Not specified"}
                </span>
              </div>
            </div>
          </CardContent>
        </DashboardCard>

        {/* Food & Diet Details */}
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Utensils className="h-5 w-5" />
              Food & Diet
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Diet Type:</span>
                <span className="text-sm font-medium">
                  {calculations[calculations.length - 1]?.diet ||
                    "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Monthly Grocery Bill:</span>
                <span className="text-sm font-medium">
                  $
                  {calculations[calculations.length - 1]?.monthlyGroceryBill ||
                    0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Recycling:</span>
                <span className="text-sm font-medium">
                  {calculations[calculations.length - 1]?.recycling ||
                    "Not specified"}
                </span>
              </div>
            </div>
          </CardContent>
        </DashboardCard>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Lifestyle Details */}
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5" />
              Lifestyle
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Shower Frequency:</span>
                <span className="text-sm font-medium">
                  {calculations[calculations.length - 1]?.howOftenShower ||
                    "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Social Activity:</span>
                <span className="text-sm font-medium">
                  {calculations[calculations.length - 1]?.socialActivity ||
                    "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">New Clothes Monthly:</span>
                <span className="text-sm font-medium">
                  {calculations[calculations.length - 1]
                    ?.howManyNewClothesMonthly || "0"}{" "}
                  items
                </span>
              </div>
            </div>
          </CardContent>
        </DashboardCard>

        {/* Waste Management */}
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trash2 className="h-5 w-5" />
              Waste Management
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Waste Bag Size:</span>
                <span className="text-sm font-medium">
                  {calculations[calculations.length - 1]?.wasteBagSize ||
                    "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Weekly Waste Bags:</span>
                <span className="text-sm font-medium">
                  {calculations[calculations.length - 1]?.wasteBagWeeklyCount ||
                    "0"}
                </span>
              </div>
            </div>
          </CardContent>
        </DashboardCard>

        {/* Digital Footprint */}
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Monitor className="h-5 w-5" />
              Digital Footprint
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">TV/PC Daily Hours:</span>
                <span className="text-sm font-medium">
                  {calculations[calculations.length - 1]
                    ?.howLongTvPcDailyHour || "0"}{" "}
                  hours
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Internet Daily Hours:</span>
                <span className="text-sm font-medium">
                  {calculations[calculations.length - 1]
                    ?.howLongInternetDailyHour || "0"}{" "}
                  hours
                </span>
              </div>
            </div>
          </CardContent>
        </DashboardCard>
      </div>

      {/* Tips Based on User Data */}
      <DashboardCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LightbulbIcon className="h-5 w-5" />
            Personalized Reduction Tips
          </CardTitle>
          <CardDescription>
            Based on your latest carbon footprint calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Dynamically generate tips based on user data */}
            {calculations[calculations.length - 1]?.vehicleType !==
              "electric" && (
              <div className="flex gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full h-fit">
                  <Car className="h-5 w-5 text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium">Consider an electric vehicle</h4>
                  <p className="text-sm text-muted-foreground">
                    Electric vehicles produce zero direct emissions, which can
                    significantly reduce your carbon footprint.
                  </p>
                </div>
              </div>
            )}

            {calculations[calculations.length - 1]?.diet !== "Vegan" && (
              <div className="flex gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full h-fit">
                  <Utensils className="h-5 w-5 text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium">Reduce meat consumption</h4>
                  <p className="text-sm text-muted-foreground">
                    Plant-based foods generally have a much lower carbon
                    footprint than animal products. Try having a few meat-free
                    days each week.
                  </p>
                </div>
              </div>
            )}

            {calculations[calculations.length - 1]?.energyEfficiency !==
              "High" && (
              <div className="flex gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full h-fit">
                  <HomeIcon className="h-5 w-5 text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium">Improve home efficiency</h4>
                  <p className="text-sm text-muted-foreground">
                    Consider energy-efficient appliances, LED lighting, and
                    better insulation to reduce your home energy consumption.
                  </p>
                </div>
              </div>
            )}

            {(parseInt(
              calculations[calculations.length - 1]?.howLongTvPcDailyHour || "0"
            ) > 5 ||
              parseInt(
                calculations[calculations.length - 1]
                  ?.howLongInternetDailyHour || "0"
              ) > 5) && (
              <div className="flex gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full h-fit">
                  <Monitor className="h-5 w-5 text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium">Reduce screen time</h4>
                  <p className="text-sm text-muted-foreground">
                    Digital devices contribute to your carbon footprint through
                    electricity usage. Try to limit daily screen time and turn
                    off devices when not in use.
                  </p>
                </div>
              </div>
            )}

            {calculations[calculations.length - 1]?.wasteBagSize === "Large" &&
              parseInt(
                calculations[calculations.length - 1]?.wasteBagWeeklyCount ||
                  "0"
              ) > 2 && (
                <div className="flex gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full h-fit">
                    <Trash2 className="h-5 w-5 text-green-700 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">Reduce waste production</h4>
                    <p className="text-sm text-muted-foreground">
                      You're producing a significant amount of waste. Consider
                      composting organic waste and buying products with less
                      packaging.
                    </p>
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </DashboardCard>
    </PageWrapper>
  );
}
