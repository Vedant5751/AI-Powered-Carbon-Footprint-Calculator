"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  CheckCircle,
  ChevronRight,
  Globe,
  Leaf,
  Shield,
  Sparkles,
  TrendingDown,
  Users,
} from "lucide-react";
import Image from "next/image";
import SplineViewer from "@/components/SplineViewer";
import { useRef } from "react";

export default function Home() {
  const featuresRef = useRef<HTMLElement>(null);

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section with 3D Globe Background */}
      <section className="relative min-h-[90vh] bg-gradient-to-b from-green-50/80 to-green-100/80 dark:from-green-950/80 dark:to-green-900/80 overflow-hidden flex items-center">
        {/* 3D Globe Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <SplineViewer
            scene="https://prod.spline.design/LBPZcHmtAD390bZ9/scene.splinecode"
            className="w-full h-full"
          />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 container mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="max-w-3xl mx-auto md:mx-0">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-green-500 bg-green-50/80 backdrop-blur-sm text-green-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Revolutionizing Carbon Footprint Tracking
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-green-900 dark:text-green-50 drop-shadow-md mb-4 sm:mb-6">
              <span className="block">Reduce Your</span>
              <span className="block text-green-600 dark:text-green-400">
                Carbon Footprint
              </span>
              <span className="block">One Step at a Time</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-200 max-w-2xl mb-6 sm:mb-8 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 p-3 sm:p-4 rounded-lg">
              Join thousands of environmentally conscious individuals tracking,
              analyzing, and reducing their impact on the planet with our
              intelligent tools.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
              <Button
                asChild
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-base sm:text-xl h-12 sm:h-14 px-6 sm:px-8"
              >
                <Link href="/login">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm text-base sm:text-xl h-12 sm:h-14 px-6 sm:px-8 mt-2 sm:mt-0"
                onClick={scrollToFeatures}
              >
                Learn More
              </Button>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 sm:gap-8 text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <span className="text-xs sm:text-sm font-medium">
                  10,000+ Users
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <span className="text-xs sm:text-sm font-medium">
                  Proven Results
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <span className="text-xs sm:text-sm font-medium">
                  Privacy Focused
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-green-900 dark:text-green-50 mb-3 sm:mb-4">
              How EcoTrack Works
            </h2>
            <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300">
              Our simple three-step process helps you understand and reduce your
              environmental impact
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4 sm:mb-6">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                  <span className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400">
                    1
                  </span>
                </div>
                <div className="absolute top-0 right-0 -mr-2 -mt-2 sm:-mr-3 sm:-mt-3 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-green-600 text-white">
                  <Calculator className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                Calculate Your Footprint
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Answer a few simple questions about your lifestyle to get an
                accurate estimate of your carbon footprint
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4 sm:mb-6">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                  <span className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400">
                    2
                  </span>
                </div>
                <div className="absolute top-0 right-0 -mr-2 -mt-2 sm:-mr-3 sm:-mt-3 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-green-600 text-white">
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                Visualize Your Impact
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                See detailed breakdowns of your carbon footprint across
                different categories of your lifestyle
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center mt-4 sm:mt-0">
              <div className="relative mb-4 sm:mb-6">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                  <span className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400">
                    3
                  </span>
                </div>
                <div className="absolute top-0 right-0 -mr-2 -mt-2 sm:-mr-3 sm:-mt-3 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-green-600 text-white">
                  <Leaf className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                Reduce & Track Progress
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Get personalized recommendations and track your progress over
                time as you reduce your footprint
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-950"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                Powerful Features
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-green-900 dark:text-green-50 mb-4 sm:mb-6">
                Everything You Need to Make a Difference
              </h2>
              <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
                Our comprehensive platform provides all the tools you need to
                understand and reduce your environmental impact.
              </p>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-700 dark:text-green-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">
                      Accurate Calculations
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Our scientific model provides precise estimates based on
                      the latest research in carbon emissions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-700 dark:text-green-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">
                      Personalized Insights
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Get tailored recommendations based on your specific
                      lifestyle and carbon footprint profile
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-700 dark:text-green-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">
                      Progress Tracking
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Monitor your carbon reduction journey with interactive
                      charts and detailed analytics
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800">
                <Image
                  src="/dashboard-preview.png"
                  alt="EcoTrack Dashboard"
                  width={800}
                  height={450}
                  className="w-full h-full"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-xl overflow-hidden shadow-xl border-4 border-white dark:border-gray-800 w-48 h-48 bg-white dark:bg-gray-800">
                <Image
                  src="/chart-preview.png"
                  alt="Analytics Chart"
                  width={192}
                  height={192}
                  className="w-full h-full"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
