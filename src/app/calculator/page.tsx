"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  RotateCcw,
  Calculator,
  BarChart,
  InfoIcon,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { PageWrapper } from "@/components/page-wrapper";
import { toast } from "@/components/ui/toast";

interface ProfileData {
  bodyType: string;
  sex: string;
  diet: string;
  preferredUnit: string;
}

interface FormData {
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
  logFrequency: string;
  logDate: Date;
}

export default function CalculatorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<ProfileData>({
    bodyType: "average",
    sex: "prefer-not-to-say",
    diet: "omnivore",
    preferredUnit: "metric",
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    bodyType: "Average",
    sex: "Unknown",
    diet: "Omnivore",
    howOftenShower: "Daily",
    heatingEnergySource: "Electricity",
    transport: "Private Vehicle",
    vehicleType: "Gasoline Vehicle",
    socialActivity: "Moderate",
    monthlyGroceryBill: 300,
    frequencyOfTravelingByAir: "None",
    vehicleMonthlyDistanceKm: "0",
    wasteBagSize: "Medium",
    wasteBagWeeklyCount: "2",
    howLongTvPcDailyHour: "4",
    howManyNewClothesMonthly: 2,
    howLongInternetDailyHour: "4",
    energyEfficiency: "Medium",
    recycling: "Moderate",
    cookingWith: "Electricity",
    logFrequency: "daily",
    logDate: new Date(),
  });

  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForm, setShowForm] = useState(true);

  // Fetch profile data when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          if (data) {
            // Update profile data
            setProfileData({
              bodyType: data.bodyType || "average",
              sex: data.sex || "prefer-not-to-say",
              diet: data.diet || "omnivore",
              preferredUnit: data.preferredUnit || "metric",
            });

            // Update form data with profile values
            setFormData((prev) => ({
              ...prev,
              bodyType: capitalizeFirstLetter(data.bodyType) || "Average",
              sex:
                data.sex === "male"
                  ? "Male"
                  : data.sex === "female"
                  ? "Female"
                  : "Unknown",
              diet: capitalizeFirstLetter(data.diet) || "Omnivore",
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({ title: "Failed to load profile data", variant: "destructive" });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, []);

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string: string | undefined) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | number | Date
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Step 1: Calculate carbon footprint
      const calculateResponse = await fetch("/api/calculator/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const calculateData = await calculateResponse.json();

      if (!calculateResponse.ok) {
        throw new Error(
          calculateData.error || "Failed to calculate carbon footprint"
        );
      }

      setCalculationResult(calculateData);

      // Step 2: Save the result to AWS automatically
      const saveResponse = await fetch("/api/calculator/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData,
          result: calculateData,
          logDate: formData.logDate.toISOString(),
          logFrequency: formData.logFrequency,
        }),
      });

      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        console.error("Error saving data:", saveData);
        // We still show results even if saving fails
      }

      // Hide the form and show only results
      setShowForm(false);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to process your request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetCalculator = () => {
    setFormData({
      bodyType: capitalizeFirstLetter(profileData.bodyType) || "Average",
      sex:
        profileData.sex === "male"
          ? "Male"
          : profileData.sex === "female"
          ? "Female"
          : "Unknown",
      diet: capitalizeFirstLetter(profileData.diet) || "Omnivore",
      howOftenShower: "Daily",
      heatingEnergySource: "Electricity",
      transport: "Private Vehicle",
      vehicleType: "Gasoline Vehicle",
      socialActivity: "Moderate",
      monthlyGroceryBill: 300,
      frequencyOfTravelingByAir: "None",
      vehicleMonthlyDistanceKm: "0",
      wasteBagSize: "Medium",
      wasteBagWeeklyCount: "2",
      howLongTvPcDailyHour: "4",
      howManyNewClothesMonthly: 2,
      howLongInternetDailyHour: "4",
      energyEfficiency: "Medium",
      recycling: "Moderate",
      cookingWith: "Electricity",
      logFrequency: "daily",
      logDate: new Date(),
    });
    setCalculationResult(null);
    setErrorMessage("");
    setShowForm(true);
  };

  if (!showForm && calculationResult) {
    return (
      <PageWrapper className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Your Carbon Footprint Results
        </h1>

        <Card className="mb-8 shadow-md">
          <CardHeader className="text-center bg-green-50 dark:bg-green-900/20 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-100">
              {parseFloat(calculationResult.prediction).toFixed(2)}{" "}
              {calculationResult.unit}
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Your estimated annual carbon footprint
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Calculator className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Body Type
                </p>
                <p className="font-medium">{formData.bodyType}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Diet Type
                </p>
                <p className="font-medium">{formData.diet}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Transportation
                </p>
                <p className="font-medium">{formData.transport}</p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={resetCalculator}
              >
                <RotateCcw className="h-4 w-4" /> Recalculate
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <BarChart className="h-4 w-4" /> View Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            This calculation is based on your inputs and uses a predictive model
            to estimate your carbon footprint.
          </p>
          <p className="mt-2">
            Track your progress over time and discover ways to reduce your
            environmental impact on the dashboard.
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="py-6">
      <div className="flex flex-col space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Carbon Footprint Calculator
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Answer the questions below to estimate your carbon footprint
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:h-9"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Dashboard
            </Button>
            {!showForm && calculationResult && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 sm:h-9"
                onClick={() => setShowForm(true)}
              >
                <RotateCcw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-start gap-2">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {showForm ? (
          <div className="grid gap-6">
            {!isLoadingProfile && (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Personal Form Fields */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      These values are pre-filled from your profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="bodyType">Body Type</Label>
                      <Select
                        value={formData.bodyType}
                        onValueChange={(value) =>
                          handleInputChange("bodyType", value)
                        }
                      >
                        <SelectTrigger id="bodyType">
                          <SelectValue placeholder="Select body type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Small">Small</SelectItem>
                          <SelectItem value="Average">Average</SelectItem>
                          <SelectItem value="Large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="sex">Sex</Label>
                      <Select
                        value={formData.sex}
                        onValueChange={(value) =>
                          handleInputChange("sex", value)
                        }
                      >
                        <SelectTrigger id="sex">
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Prefer not to say">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="diet">Diet Type</Label>
                      <Select
                        value={formData.diet}
                        onValueChange={(value) =>
                          handleInputChange("diet", value)
                        }
                      >
                        <SelectTrigger id="diet">
                          <SelectValue placeholder="Select diet type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Omnivore">Omnivore</SelectItem>
                          <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="Vegan">Vegan</SelectItem>
                          <SelectItem value="Pescetarian">
                            Pescetarian
                          </SelectItem>
                          <SelectItem value="Pork">Pork</SelectItem>
                          <SelectItem value="Beef">Beef</SelectItem>
                          <SelectItem value="Chicken">Chicken</SelectItem>
                          <SelectItem value="Fish">Fish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Transportation Form Fields */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Transportation</CardTitle>
                    <CardDescription>
                      Select your primary transport method and vehicle type
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="transport">
                        Primary Transport Method
                      </Label>
                      <Select
                        value={formData.transport}
                        onValueChange={(value) =>
                          handleInputChange("transport", value)
                        }
                      >
                        <SelectTrigger id="transport">
                          <SelectValue placeholder="Select transport method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Public Transport">
                            Public Transport
                          </SelectItem>
                          <SelectItem value="Private Vehicle">
                            Private Vehicle
                          </SelectItem>
                          <SelectItem value="Walking/Cycling">
                            Walking/Cycling
                          </SelectItem>
                          <SelectItem value="Mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="vehicleType">Vehicle Type</Label>
                      <Select
                        value={formData.vehicleType}
                        onValueChange={(value) =>
                          handleInputChange("vehicleType", value)
                        }
                      >
                        <SelectTrigger id="vehicleType">
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gasoline Vehicle">
                            Gasoline Vehicle
                          </SelectItem>
                          <SelectItem value="Diesel Vehicle">
                            Diesel Vehicle
                          </SelectItem>
                          <SelectItem value="Electric Vehicle">
                            Electric Vehicle
                          </SelectItem>
                          <SelectItem value="Hybrid Vehicle">
                            Hybrid Vehicle
                          </SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="vehicleMonthlyDistanceKm">
                        Monthly Distance (km)
                      </Label>
                      <Input
                        type="number"
                        value={formData.vehicleMonthlyDistanceKm}
                        onChange={(e) =>
                          handleInputChange(
                            "vehicleMonthlyDistanceKm",
                            e.target.value
                          )
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="frequencyOfTravelingByAir">
                        Air Travel Frequency
                      </Label>
                      <Select
                        value={formData.frequencyOfTravelingByAir}
                        onValueChange={(value) =>
                          handleInputChange("frequencyOfTravelingByAir", value)
                        }
                      >
                        <SelectTrigger id="frequencyOfTravelingByAir">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="1-2 times a year">
                            1-2 times a year
                          </SelectItem>
                          <SelectItem value="3-5 times a year">
                            3-5 times a year
                          </SelectItem>
                          <SelectItem value="6+ times a year">
                            6+ times a year
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Home Energy Form Fields */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Home Energy</CardTitle>
                    <CardDescription>
                      Select your heating energy source and cooking method
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="heatingEnergySource">
                        Heating Energy Source
                      </Label>
                      <Select
                        value={formData.heatingEnergySource}
                        onValueChange={(value) =>
                          handleInputChange("heatingEnergySource", value)
                        }
                      >
                        <SelectTrigger id="heatingEnergySource">
                          <SelectValue placeholder="Select heating source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Electricity">
                            Electricity
                          </SelectItem>
                          <SelectItem value="Natural Gas">
                            Natural Gas
                          </SelectItem>
                          <SelectItem value="Oil">Oil</SelectItem>
                          <SelectItem value="Propane">Propane</SelectItem>
                          <SelectItem value="Wood">Wood</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="cookingWith">Cooking Energy Source</Label>
                      <Select
                        value={formData.cookingWith}
                        onValueChange={(value) =>
                          handleInputChange("cookingWith", value)
                        }
                      >
                        <SelectTrigger id="cookingWith">
                          <SelectValue placeholder="Select cooking source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Electricity">
                            Electricity
                          </SelectItem>
                          <SelectItem value="Natural Gas">
                            Natural Gas
                          </SelectItem>
                          <SelectItem value="Propane">Propane</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="energyEfficiency">
                        Home Energy Efficiency
                      </Label>
                      <Select
                        value={formData.energyEfficiency}
                        onValueChange={(value) =>
                          handleInputChange("energyEfficiency", value)
                        }
                      >
                        <SelectTrigger id="energyEfficiency">
                          <SelectValue placeholder="Select efficiency level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="howLongTvPcDailyHour">
                        Daily TV/PC Hours
                      </Label>
                      <Input
                        type="number"
                        value={formData.howLongTvPcDailyHour}
                        onChange={(e) =>
                          handleInputChange(
                            "howLongTvPcDailyHour",
                            e.target.value
                          )
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="howLongInternetDailyHour">
                        Daily Internet Hours
                      </Label>
                      <Input
                        type="number"
                        value={formData.howLongInternetDailyHour}
                        onChange={(e) =>
                          handleInputChange(
                            "howLongInternetDailyHour",
                            e.target.value
                          )
                        }
                        placeholder="0"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Lifestyle Form Fields */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Lifestyle</CardTitle>
                    <CardDescription>
                      Select your shower frequency and social activity level
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="howOftenShower">Shower Frequency</Label>
                      <Select
                        value={formData.howOftenShower}
                        onValueChange={(value) =>
                          handleInputChange("howOftenShower", value)
                        }
                      >
                        <SelectTrigger id="howOftenShower">
                          <SelectValue placeholder="Select shower frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Multiple Times Daily">
                            Multiple Times Daily
                          </SelectItem>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Every Other Day">
                            Every Other Day
                          </SelectItem>
                          <SelectItem value="Twice a Week">
                            Twice a Week
                          </SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="socialActivity">
                        Social Activity Level
                      </Label>
                      <Select
                        value={formData.socialActivity}
                        onValueChange={(value) =>
                          handleInputChange("socialActivity", value)
                        }
                      >
                        <SelectTrigger id="socialActivity">
                          <SelectValue placeholder="Select social activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Very Low">Very Low</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Very High">Very High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="monthlyGroceryBill">
                        Monthly Grocery Bill ($)
                      </Label>
                      <Input
                        type="number"
                        value={formData.monthlyGroceryBill}
                        onChange={(e) =>
                          handleInputChange(
                            "monthlyGroceryBill",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="howManyNewClothesMonthly">
                        New Clothes Monthly
                      </Label>
                      <Input
                        type="number"
                        value={formData.howManyNewClothesMonthly}
                        onChange={(e) =>
                          handleInputChange(
                            "howManyNewClothesMonthly",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Waste Management Form Fields */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Waste Management
                    </CardTitle>
                    <CardDescription>
                      Select your recycling habits and waste bag size
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="recycling">Recycling Habits</Label>
                      <Select
                        value={formData.recycling}
                        onValueChange={(value) =>
                          handleInputChange("recycling", value)
                        }
                      >
                        <SelectTrigger id="recycling">
                          <SelectValue placeholder="Select recycling level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Minimal">Minimal</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="Extensive">Extensive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="wasteBagSize">Waste Bag Size</Label>
                      <Select
                        value={formData.wasteBagSize}
                        onValueChange={(value) =>
                          handleInputChange("wasteBagSize", value)
                        }
                      >
                        <SelectTrigger id="wasteBagSize">
                          <SelectValue placeholder="Select bag size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Small">Small</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="wasteBagWeeklyCount">
                        Waste Bags Per Week
                      </Label>
                      <Input
                        type="number"
                        value={formData.wasteBagWeeklyCount}
                        onChange={(e) =>
                          handleInputChange(
                            "wasteBagWeeklyCount",
                            e.target.value
                          )
                        }
                        placeholder="0"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Log Information Form Fields */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Log Information</CardTitle>
                <CardDescription>
                  Select your log frequency and date
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="logFrequency">Log Frequency</Label>
                  <Select
                    value={formData.logFrequency}
                    onValueChange={(value) =>
                      handleInputChange("logFrequency", value)
                    }
                  >
                    <SelectTrigger id="logFrequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="logDate">Log Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {formData.logDate
                          ? format(formData.logDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.logDate}
                        onSelect={(date) =>
                          handleInputChange("logDate", date || new Date())
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 mt-8">
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>Calculate Carbon Footprint</>
                )}
              </Button>
            </div>
          </div>
        ) : calculationResult ? (
          <div className="space-y-6">
            {/* Display calculation results */}
            <Card>
              <CardHeader>
                <CardTitle>Your Carbon Footprint Results</CardTitle>
                <CardDescription>
                  Based on your information, here's your estimated carbon
                  footprint
                </CardDescription>
              </CardHeader>
              <CardContent>{/* Results would be shown here */}</CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </PageWrapper>
  );
}
