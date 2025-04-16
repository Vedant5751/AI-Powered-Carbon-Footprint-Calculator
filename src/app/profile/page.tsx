"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageWrapper } from "@/components/page-wrapper";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { Loader2, Save, User, MapPin, Briefcase, Leaf } from "lucide-react";

interface ProfileData {
  name: string;
  bio: string;
  location: string;
  occupation: string;
  carbonReductionGoals: string;
  bodyType: string;
  sex: string;
  diet: string;
  preferredUnit: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    bio: "",
    location: "",
    occupation: "",
    carbonReductionGoals: "",
    bodyType: "average",
    sex: "prefer-not-to-say",
    diet: "omnivore",
    preferredUnit: "metric",
  });

  // Fetch profile data when component mounts
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchProfileData();
    }
  }, [status, router]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setProfileData({
            name: data.name || "",
            bio: data.bio || "",
            location: data.location || "",
            occupation: data.occupation || "",
            carbonReductionGoals: data.carbonReductionGoals || "",
            bodyType: data.bodyType || "average",
            sex: data.sex || "prefer-not-to-say",
            diet: data.diet || "omnivore",
            preferredUnit: data.preferredUnit || "metric",
          });
        }
      } else if (response.status !== 404) {
        // 404 just means no profile yet, which is ok
        toast({ title: "Failed to load profile data", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({ title: "Failed to load profile data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof ProfileData,
    value: string | number
  ) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        toast({ title: "Profile updated successfully", variant: "success" });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "Failed to update profile", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="container py-10 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal information and sustainability goals.
          </p>
        </div>

        <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details shown on your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium mb-1.5 block"
              >
                Full Name
              </Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("name", e.target.value)
                }
                placeholder="Your name"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-sm font-medium mb-1.5 block">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("bio", e.target.value)
                }
                placeholder="Tell us about yourself"
                className="resize-none min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Brief description for your profile. Maximum 500 characters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label
                  htmlFor="location"
                  className="text-sm font-medium mb-1.5 block"
                >
                  <MapPin className="h-4 w-4 inline mr-1" /> Location
                </Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="City, Country"
                />
              </div>

              <div>
                <Label
                  htmlFor="occupation"
                  className="text-sm font-medium mb-1.5 block"
                >
                  <Briefcase className="h-4 w-4 inline mr-1" /> Occupation
                </Label>
                <Input
                  id="occupation"
                  value={profileData.occupation}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("occupation", e.target.value)
                  }
                  placeholder="Your occupation"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" /> Sustainability Profile
            </CardTitle>
            <CardDescription>
              Customize your carbon tracking preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label
                htmlFor="carbonReductionGoals"
                className="text-sm font-medium mb-1.5 block"
              >
                Carbon Reduction Goals
              </Label>
              <Textarea
                id="carbonReductionGoals"
                value={profileData.carbonReductionGoals}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("carbonReductionGoals", e.target.value)
                }
                placeholder="What are your sustainability goals?"
                className="resize-none min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Share your environmental goals and commitments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <Label
                  htmlFor="bodyType"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Body Type
                </Label>
                <Select
                  value={profileData.bodyType}
                  onValueChange={(value) =>
                    handleInputChange("bodyType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select body type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slim">Slim</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="athletic">Athletic</SelectItem>
                    <SelectItem value="heavy">Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="sex"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Sex
                </Label>
                <Select
                  value={profileData.sex}
                  onValueChange={(value) => handleInputChange("sex", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="prefer-not-to-say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="diet"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Diet Type
                </Label>
                <Select
                  value={profileData.diet}
                  onValueChange={(value) => handleInputChange("diet", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select diet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="pescatarian">Pescatarian</SelectItem>
                    <SelectItem value="omnivore">Omnivore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label
                htmlFor="preferredUnit"
                className="text-sm font-medium mb-1.5 block"
              >
                Preferred Measurement Unit
              </Label>
              <Select
                value={profileData.preferredUnit}
                onValueChange={(value) =>
                  handleInputChange("preferredUnit", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (kg, km)</SelectItem>
                  <SelectItem value="imperial">Imperial (lb, mi)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-8">
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
