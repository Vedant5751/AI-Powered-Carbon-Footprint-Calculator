"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, Filter, XCircle, Leaf } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { PageWrapper } from "@/components/page-wrapper";
import { toast } from "@/components/ui/toast";

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

export default function HistoryPage() {
  const [dateFilter, setDateFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
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

  // Process and prepare the calculations
  const prepareData = () => {
    if (!calculations.length) return [];

    // Sort calculations by timestamp in descending order (newest first)
    const sortedCalcs = [...calculations].sort(
      (a, b) => b.timestamp - a.timestamp
    );

    // Apply date filtering
    let filteredCalcs = sortedCalcs;
    const now = new Date().getTime();

    if (dateFilter === "last3") {
      // Last 3 months
      const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;
      filteredCalcs = sortedCalcs.filter(
        (calc) => calc.timestamp >= threeMonthsAgo
      );
    } else if (dateFilter === "last6") {
      // Last 6 months
      const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000;
      filteredCalcs = sortedCalcs.filter(
        (calc) => calc.timestamp >= sixMonthsAgo
      );
    } else if (dateFilter === "last12") {
      // Last 12 months
      const twelveMonthsAgo = now - 365 * 24 * 60 * 60 * 1000;
      filteredCalcs = sortedCalcs.filter(
        (calc) => calc.timestamp >= twelveMonthsAgo
      );
    }

    // Apply category filtering (if implemented)
    // This would be more specific in a real implementation

    return filteredCalcs;
  };

  const filteredEntries = prepareData();

  // Calculate category contributions for each entry
  const calculateCategories = (calc: Calculation) => {
    // Transportation emissions based on vehicle type and usage
    const transportEmission =
      calc.transport === "Public Transport"
        ? calc.carbonEmission * 0.1
        : parseFloat(calc.vehicleMonthlyDistanceKm || "0") > 300
        ? calc.carbonEmission * 0.35
        : parseFloat(calc.vehicleMonthlyDistanceKm || "0") > 100
        ? calc.carbonEmission * 0.25
        : calc.carbonEmission * 0.15;

    // Home energy emissions based on heating source and efficiency
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
      transportation: transportEmission,
      homeEnergy: homeEmission,
      diet: dietEmission,
      lifestyle: lifestyleEmission,
      waste: wasteEmission,
      digitalFootprint: digitalFootprintEmission,
    };
  };

  // Function to handle exporting all filtered data
  const handleExportAllData = () => {
    try {
      if (!filteredEntries.length) {
        toast({
          title: "No data to export",
          description: "There are no calculations available to export.",
          variant: "destructive",
        });
        return;
      }

      const exportData = filteredEntries.map((entry) => {
        const categories = calculateCategories(entry);
        return {
          date: new Date(entry.timestamp).toLocaleDateString(),
          totalEmission: entry.carbonEmission.toFixed(2),
          transportation: categories.transportation.toFixed(2),
          homeEnergy: categories.homeEnergy.toFixed(2),
          diet: categories.diet.toFixed(2),
          lifestyle: categories.lifestyle.toFixed(2),
          waste: categories.waste.toFixed(2),
          digitalFootprint: categories.digitalFootprint.toFixed(2),
          diet_type: entry.diet || "Not specified",
          transportMode: entry.transport || "Not specified",
          vehicleType: entry.vehicleType || "Not specified",
          heatingSource: entry.heatingEnergySource || "Not specified",
          frequency: entry.logFrequency || "Daily",
        };
      });

      // Format date for filename
      const dateStr = new Date().toISOString().split("T")[0];

      // JSON Export Option
      const jsonString = JSON.stringify(exportData, null, 2);
      const jsonBlob = new Blob([jsonString], { type: "application/json" });
      const jsonUrl = URL.createObjectURL(jsonBlob);

      // Create download link for JSON
      const jsonLink = document.createElement("a");
      jsonLink.href = jsonUrl;
      jsonLink.download = `carbon-footprint-history-${dateStr}.json`;
      document.body.appendChild(jsonLink);
      jsonLink.click();

      // Clean up JSON
      document.body.removeChild(jsonLink);
      URL.revokeObjectURL(jsonUrl);

      // CSV Export Option
      const csvHeaders = [
        "Date",
        "Total Emission (kg CO₂)",
        "Transportation (kg)",
        "Home Energy (kg)",
        "Diet (kg)",
        "Lifestyle (kg)",
        "Waste (kg)",
        "Digital Footprint (kg)",
        "Diet Type",
        "Transport Mode",
        "Vehicle Type",
        "Heating Source",
        "Frequency",
      ].join(",");

      const csvRows = exportData.map((entry) =>
        [
          entry.date,
          entry.totalEmission,
          entry.transportation,
          entry.homeEnergy,
          entry.diet,
          entry.lifestyle,
          entry.waste,
          entry.digitalFootprint,
          entry.diet_type,
          entry.transportMode,
          entry.vehicleType,
          entry.heatingSource,
          entry.frequency,
        ].join(",")
      );

      const csvContent = [csvHeaders, ...csvRows].join("\n");
      const csvBlob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const csvUrl = URL.createObjectURL(csvBlob);

      // Create download link for CSV
      const csvLink = document.createElement("a");
      csvLink.href = csvUrl;
      csvLink.download = `carbon-footprint-history-${dateStr}.csv`;
      document.body.appendChild(csvLink);
      csvLink.click();

      // Clean up CSV
      document.body.removeChild(csvLink);
      URL.revokeObjectURL(csvUrl);

      toast({
        title: "Export successful",
        description: `${exportData.length} calculations have been exported in JSON and CSV formats.`,
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export failed",
        description:
          "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to handle exporting a single calculation entry
  const handleExportEntryData = (entry: Calculation) => {
    try {
      const categories = calculateCategories(entry);
      const dateStr = new Date(entry.timestamp).toISOString().split("T")[0];

      // Format the data for export
      const exportData = {
        date: new Date(entry.timestamp).toLocaleDateString(),
        totalEmission: entry.carbonEmission.toFixed(2),
        categories: {
          transportation: categories.transportation.toFixed(2),
          homeEnergy: categories.homeEnergy.toFixed(2),
          diet: categories.diet.toFixed(2),
          lifestyle: categories.lifestyle.toFixed(2),
          waste: categories.waste.toFixed(2),
          digitalFootprint: categories.digitalFootprint.toFixed(2),
        },
        details: {
          diet_type: entry.diet || "Not specified",
          transportMode: entry.transport || "Not specified",
          vehicleType: entry.vehicleType || "Not specified",
          vehicleDistance: entry.vehicleMonthlyDistanceKm || "0",
          airTravel: entry.frequencyOfTravelingByAir || "Not specified",
          heatingSource: entry.heatingEnergySource || "Not specified",
          cookingWith: entry.cookingWith || "Not specified",
          energyEfficiency: entry.energyEfficiency || "Not specified",
          showerFrequency: entry.howOftenShower || "Not specified",
          socialActivity: entry.socialActivity || "Not specified",
          newClothesMonthly: entry.howManyNewClothesMonthly || 0,
          wasteBagSize: entry.wasteBagSize || "Not specified",
          wasteBagCount: entry.wasteBagWeeklyCount || "0",
          tvPcHours: entry.howLongTvPcDailyHour || "0",
          internetHours: entry.howLongInternetDailyHour || "0",
          recycling: entry.recycling || "Not specified",
          groceryBill: entry.monthlyGroceryBill || 0,
          frequency: entry.logFrequency || "Daily",
        },
      };

      // JSON Export Option
      const jsonString = JSON.stringify(exportData, null, 2);
      const jsonBlob = new Blob([jsonString], { type: "application/json" });
      const jsonUrl = URL.createObjectURL(jsonBlob);

      // Create download link for JSON
      const jsonLink = document.createElement("a");
      jsonLink.href = jsonUrl;
      jsonLink.download = `carbon-footprint-${dateStr}.json`;
      document.body.appendChild(jsonLink);
      jsonLink.click();

      // Clean up JSON
      document.body.removeChild(jsonLink);
      URL.revokeObjectURL(jsonUrl);

      // CSV Export Option - Flatten the structure for CSV
      const csvHeaders = [
        "Date",
        "Total Emission (kg CO₂)",
        "Transportation (kg)",
        "Home Energy (kg)",
        "Diet (kg)",
        "Lifestyle (kg)",
        "Waste (kg)",
        "Digital Footprint (kg)",
        "Diet Type",
        "Transport Mode",
        "Vehicle Type",
        "Vehicle Distance (km)",
        "Air Travel",
        "Heating Source",
        "Cooking With",
        "Energy Efficiency",
        "Shower Frequency",
        "Social Activity",
        "New Clothes Monthly",
        "Waste Bag Size",
        "Waste Bag Count",
        "TV/PC Hours",
        "Internet Hours",
        "Recycling",
        "Grocery Bill ($)",
        "Frequency",
      ].join(",");

      const csvRow = [
        exportData.date,
        exportData.totalEmission,
        exportData.categories.transportation,
        exportData.categories.homeEnergy,
        exportData.categories.diet,
        exportData.categories.lifestyle,
        exportData.categories.waste,
        exportData.categories.digitalFootprint,
        exportData.details.diet_type,
        exportData.details.transportMode,
        exportData.details.vehicleType,
        exportData.details.vehicleDistance,
        exportData.details.airTravel,
        exportData.details.heatingSource,
        exportData.details.cookingWith,
        exportData.details.energyEfficiency,
        exportData.details.showerFrequency,
        exportData.details.socialActivity,
        exportData.details.newClothesMonthly,
        exportData.details.wasteBagSize,
        exportData.details.wasteBagCount,
        exportData.details.tvPcHours,
        exportData.details.internetHours,
        exportData.details.recycling,
        exportData.details.groceryBill,
        exportData.details.frequency,
      ].join(",");

      const csvContent = [csvHeaders, csvRow].join("\n");
      const csvBlob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const csvUrl = URL.createObjectURL(csvBlob);

      // Create download link for CSV
      const csvLink = document.createElement("a");
      csvLink.href = csvUrl;
      csvLink.download = `carbon-footprint-${dateStr}.csv`;
      document.body.appendChild(csvLink);
      csvLink.click();

      // Clean up CSV
      document.body.removeChild(csvLink);
      URL.revokeObjectURL(csvUrl);

      toast({
        title: "Export successful",
        description: "Calculation has been exported in JSON and CSV formats.",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export failed",
        description:
          "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <p>Loading your carbon footprint history...</p>
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
            Complete a carbon footprint calculation to see your history.
          </p>
          <Button asChild>
            <Link href="/calculator">Calculate Now</Link>
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="py-10">
      <h1 className="text-3xl font-bold">History</h1>
      <p className="mt-4">
        Here you can view your past carbon footprint calculations and trends.
      </p>

      {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="last3">Last 3 Months</SelectItem>
              <SelectItem value="last6">Last 6 Months</SelectItem>
              <SelectItem value="last12">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="homeEnergy">Home Energy</SelectItem>
                <SelectItem value="diet">Diet</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="waste">Waste</SelectItem>
                <SelectItem value="digitalFootprint">
                  Digital Footprint
                </SelectItem>
            </SelectContent>
          </Select>
        </div>

          <Button
            variant="outline"
            className="sm:ml-auto"
            onClick={handleExportAllData}
          >
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Timeline View */}
      <div className="space-y-6">
          {filteredEntries.map((entry, index) => {
            const categories = calculateCategories(entry);
            const prevEntry =
              index < filteredEntries.length - 1
                ? filteredEntries[index + 1]
                : null;

            return (
              <Card key={entry.calculationId}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle>
                      {new Date(entry.timestamp).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-600">
                        {entry.carbonEmission.toFixed(2)} kg CO₂
                  </span>
                      {prevEntry && (
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${
                            entry.carbonEmission < prevEntry.carbonEmission
                              ? "text-green-600 bg-green-100 dark:bg-green-900/30"
                              : "text-red-600 bg-red-100 dark:bg-red-900/30"
                          }`}
                        >
                          {(
                            ((prevEntry.carbonEmission - entry.carbonEmission) /
                              prevEntry.carbonEmission) *
                        100
                      ).toFixed(1)}
                      % from previous
                    </span>
                  )}
                </div>
              </div>
              <CardDescription>
                    {entry.logFrequency} carbon footprint calculation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Detailed View</TabsTrigger>
                  <TabsTrigger value="compare">Compare</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3 mt-4">
                    <div className="space-y-2">
                          <h3 className="text-sm font-medium">
                            Transportation
                          </h3>
                      <div className="flex justify-between text-sm">
                        <span>Total</span>
                        <span className="font-medium">
                              {categories.transportation.toFixed(2)} kg
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${
                                  (categories.transportation /
                                    entry.carbonEmission) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Home Energy</h3>
                      <div className="flex justify-between text-sm">
                        <span>Total</span>
                        <span className="font-medium">
                              {categories.homeEnergy.toFixed(2)} kg
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${
                                  (categories.homeEnergy /
                                    entry.carbonEmission) *
                                  100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                          <h3 className="text-sm font-medium">Diet</h3>
                      <div className="flex justify-between text-sm">
                        <span>Total</span>
                        <span className="font-medium">
                              {categories.diet.toFixed(2)} kg
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${
                                  (categories.diet / entry.carbonEmission) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="details">
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">
                        Transportation Details
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Transport Mode:</div>
                            <div className="font-medium">
                              {entry.transport || "Not specified"}
                            </div>
                            <div>Vehicle Type:</div>
                            <div className="font-medium">
                              {entry.vehicleType || "Not specified"}
                            </div>
                            <div>Monthly Distance:</div>
                        <div className="font-medium">
                              {entry.vehicleMonthlyDistanceKm || 0} km
                        </div>
                        <div>Air Travel:</div>
                        <div className="font-medium">
                              {entry.frequencyOfTravelingByAir ||
                                "Not specified"}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">
                        Home Energy Details
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Heating Source:</div>
                            <div className="font-medium">
                              {entry.heatingEnergySource || "Not specified"}
                            </div>
                            <div>Cooking With:</div>
                            <div className="font-medium">
                              {entry.cookingWith || "Not specified"}
                            </div>
                            <div>Energy Efficiency:</div>
                        <div className="font-medium">
                              {entry.energyEfficiency || "Not specified"}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">
                            Diet & Lifestyle Details
                          </h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Diet Type:</div>
                            <div className="font-medium">
                              {entry.diet || "Not specified"}
                            </div>
                            <div>Monthly Grocery:</div>
                            <div className="font-medium">
                              ${entry.monthlyGroceryBill || 0}
                            </div>
                            <div>Recycling:</div>
                        <div className="font-medium">
                              {entry.recycling || "Not specified"}
                        </div>
                            <div>Shower Frequency:</div>
                        <div className="font-medium">
                              {entry.howOftenShower || "Not specified"}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">
                            Waste & Digital Details
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Waste Bag Size:</div>
                            <div className="font-medium">
                              {entry.wasteBagSize || "Not specified"}
                            </div>
                            <div>Weekly Waste Bags:</div>
                        <div className="font-medium">
                              {entry.wasteBagWeeklyCount || "0"}
                        </div>
                            <div>TV/PC Hours Daily:</div>
                        <div className="font-medium">
                              {entry.howLongTvPcDailyHour || "0"} hours
                        </div>
                            <div>Internet Hours Daily:</div>
                        <div className="font-medium">
                              {entry.howLongInternetDailyHour || "0"} hours
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="compare">
                  <div className="space-y-4 mt-4">
                    <div className="text-sm text-center text-gray-500 mb-2">
                      Comparing with previous calculation
                    </div>

                        {prevEntry ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">
                            Total Footprint
                          </h3>
                          <div className="flex items-center gap-4">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative">
                              <div
                                className="bg-green-600 h-4 rounded-l-full absolute left-0 top-0"
                                style={{
                                      width: `${
                                        (entry.carbonEmission /
                                          Math.max(
                                            entry.carbonEmission,
                                            prevEntry.carbonEmission
                                          )) *
                                        100
                                      }%`,
                                }}
                              ></div>
                              <div
                                className="absolute -top-6 text-xs"
                                style={{
                                      left: `${
                                        (entry.carbonEmission /
                                          Math.max(
                                            entry.carbonEmission,
                                            prevEntry.carbonEmission
                                          )) *
                                        100
                                      }%`,
                                    }}
                                  >
                                    {entry.carbonEmission.toFixed(2)}
                              </div>
                              <div
                                className="bg-blue-500 h-4 rounded-l-full absolute left-0 top-0 opacity-50"
                                style={{
                                  width: `${
                                        (prevEntry.carbonEmission /
                                          Math.max(
                                            entry.carbonEmission,
                                            prevEntry.carbonEmission
                                          )) *
                                    100
                                  }%`,
                                }}
                              ></div>
                              <div
                                className="absolute -bottom-6 text-xs text-blue-600"
                                style={{
                                  left: `${
                                        (prevEntry.carbonEmission /
                                          Math.max(
                                            entry.carbonEmission,
                                            prevEntry.carbonEmission
                                          )) *
                                    100
                                  }%`,
                                }}
                              >
                                    {prevEntry.carbonEmission.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">
                              Transportation
                            </h3>
                            <div className="flex justify-between text-xs">
                              <span>Current</span>
                              <span>Previous</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">
                                    {categories.transportation.toFixed(2)} kg
                              </span>
                              <span className="font-medium text-blue-600">
                                    {calculateCategories(
                                      prevEntry
                                    ).transportation.toFixed(2)}{" "}
                                    kg
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 relative">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                        (categories.transportation /
                                          Math.max(
                                            categories.transportation,
                                            calculateCategories(prevEntry)
                                              .transportation
                                          )) *
                                        100
                                  }%`,
                                }}
                              ></div>
                              <div
                                className="bg-blue-500 h-2 rounded-full absolute left-0 top-0 opacity-50"
                                style={{
                                  width: `${
                                        (calculateCategories(prevEntry)
                                      .transportation /
                                          Math.max(
                                            categories.transportation,
                                            calculateCategories(prevEntry)
                                              .transportation
                                          )) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="space-y-2">
                                <h3 className="text-sm font-medium">
                                  Home Energy
                                </h3>
                            <div className="flex justify-between text-xs">
                              <span>Current</span>
                              <span>Previous</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">
                                    {categories.homeEnergy.toFixed(2)} kg
                              </span>
                              <span className="font-medium text-blue-600">
                                    {calculateCategories(
                                      prevEntry
                                    ).homeEnergy.toFixed(2)}{" "}
                                    kg
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 relative">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                        (categories.homeEnergy /
                                          Math.max(
                                            categories.homeEnergy,
                                            calculateCategories(prevEntry)
                                              .homeEnergy
                                          )) *
                                        100
                                  }%`,
                                }}
                              ></div>
                              <div
                                className="bg-blue-500 h-2 rounded-full absolute left-0 top-0 opacity-50"
                                style={{
                                  width: `${
                                        (calculateCategories(prevEntry)
                                          .homeEnergy /
                                          Math.max(
                                            categories.homeEnergy,
                                            calculateCategories(prevEntry)
                                              .homeEnergy
                                          )) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="space-y-2">
                                <h3 className="text-sm font-medium">Diet</h3>
                            <div className="flex justify-between text-xs">
                              <span>Current</span>
                              <span>Previous</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">
                                    {categories.diet.toFixed(2)} kg
                              </span>
                              <span className="font-medium text-blue-600">
                                    {calculateCategories(
                                      prevEntry
                                    ).diet.toFixed(2)}{" "}
                                    kg
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 relative">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                        (categories.diet /
                                          Math.max(
                                            categories.diet,
                                            calculateCategories(prevEntry).diet
                                          )) *
                                        100
                                  }%`,
                                }}
                              ></div>
                              <div
                                className="bg-blue-500 h-2 rounded-full absolute left-0 top-0 opacity-50"
                                style={{
                                  width: `${
                                        (calculateCategories(prevEntry).diet /
                                          Math.max(
                                            categories.diet,
                                            calculateCategories(prevEntry).diet
                                          )) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No previous calculation available for comparison
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportEntryData(entry)}
                  >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardFooter>
          </Card>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
