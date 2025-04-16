"use client"; // Ensure this is a client component

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Globe, Leaf, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className=" py-10">
      <h1 className="text-3xl font-bold">About Us</h1>
      <p className="mt-4">
        EcoTrack is dedicated to helping individuals track and reduce their
        carbon footprint.
      </p>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-green-800 dark:text-green-100">
          About EcoTrack
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Our mission is to empower individuals to understand and reduce their
          environmental impact.
        </p>

        <div className="space-y-8">
          <div className="relative rounded-xl overflow-hidden">
            <Image
              src="/placeholder.svg?height=400&width=800"
              width={800}
              height={400}
              alt="Team working on environmental solutions"
              className="w-full h-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Our Story</h2>
                <p className="text-white/90">
                  Founded in 2023 by a team of environmental scientists and
                  software engineers passionate about climate action.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-100">
              Our Mission
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              At EcoTrack, we believe that understanding your environmental
              impact is the first step toward making meaningful changes. Our
              mission is to provide accessible, accurate tools that help
              individuals and communities track, analyze, and reduce their
              carbon footprints.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              We're committed to fostering a global community of environmentally
              conscious individuals who are empowered to make sustainable
              choices in their daily lives. By making carbon footprint data easy
              to understand and actionable, we aim to accelerate the transition
              to a low-carbon future.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="bg-green-100 dark:bg-green-900 p-2 w-fit rounded-full mb-2">
                  <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Environmental Impact</CardTitle>
                <CardDescription>
                  Our users have collectively reduced carbon emissions by over
                  50,000 tonnes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="bg-green-100 dark:bg-green-900 p-2 w-fit rounded-full mb-2">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Growing Community</CardTitle>
                <CardDescription>
                  Join our community of 10,000+ environmentally conscious
                  individuals.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="bg-green-100 dark:bg-green-900 p-2 w-fit rounded-full mb-2">
                  <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Global Reach</CardTitle>
                <CardDescription>
                  Users from over 50 countries are tracking their carbon
                  footprints with EcoTrack.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-100">
              Our Approach
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              EcoTrack uses the latest scientific data and methodologies to
              calculate carbon footprints. Our calculations are based on
              peer-reviewed research and industry standards, ensuring that you
              receive accurate and reliable information about your environmental
              impact.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              We believe in transparency and education. That's why we provide
              detailed breakdowns of your carbon footprint, along with
              personalized recommendations for reducing your impact. Our goal is
              not just to inform, but to empower you to take meaningful action.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-100">
              Meet the Team
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="rounded-full overflow-hidden w-24 h-24 mx-auto mb-4">
                  <Image
                    src="/placeholder.svg?height=100&width=100"
                    width={100}
                    height={100}
                    alt="Sarah Johnson"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold">Sarah Johnson</h3>
                <p className="text-sm text-gray-500">Founder & CEO</p>
              </div>

              <div className="text-center">
                <div className="rounded-full overflow-hidden w-24 h-24 mx-auto mb-4">
                  <Image
                    src="/placeholder.svg?height=100&width=100"
                    width={100}
                    height={100}
                    alt="Michael Chen"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold">Michael Chen</h3>
                <p className="text-sm text-gray-500">Lead Developer</p>
              </div>

              <div className="text-center">
                <div className="rounded-full overflow-hidden w-24 h-24 mx-auto mb-4">
                  <Image
                    src="/placeholder.svg?height=100&width=100"
                    width={100}
                    height={100}
                    alt="Dr. Amara Patel"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold">Dr. Amara Patel</h3>
                <p className="text-sm text-gray-500">Environmental Scientist</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-green-800 dark:text-green-100">
              Join Us in Making a Difference
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Ready to start your journey toward a more sustainable lifestyle?
              Calculate your carbon footprint today and join our community of
              environmentally conscious individuals making a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/calculator">Calculate Your Footprint</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Join Our Community</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
