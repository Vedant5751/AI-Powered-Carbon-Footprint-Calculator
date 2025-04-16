import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  Facebook,
  Globe,
  Instagram,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-white to-green-50 dark:from-gray-950 dark:to-green-950 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 lg:py-16">
        {/* Top section with newsletter */}
        <div className="rounded-lg md:rounded-2xl bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/50 dark:to-green-950 p-5 sm:p-8 mb-8 md:mb-12 shadow-sm">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-900 dark:text-green-50 mb-2">
                Stay Updated
              </h3>
              <p className="text-sm sm:text-base text-green-700 dark:text-green-200 mb-0 md:pr-12">
                Get the latest tips, resources, and updates on reducing your
                carbon footprint.
              </p>
            </div>
            <div>
              <form className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white dark:bg-gray-900 border-0 focus-visible:ring-green-500 focus-visible:ring-offset-2 h-10 sm:h-12"
                />
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white h-10 sm:h-12 px-4 sm:px-6"
                >
                  Subscribe
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Main footer content */}
        <div className="grid gap-8 md:grid-cols-2 mb-8 md:mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4 md:mb-6">
              <div className="bg-green-600 p-1.5 sm:p-2 rounded-full">
                <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="font-bold text-lg sm:text-xl text-green-900 dark:text-green-50">
                EcoTrack
              </span>
            </Link>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6">
              Your partner in tracking, analyzing, and reducing your carbon
              footprint for a more sustainable future.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-gray-900 text-green-600 hover:text-white hover:bg-green-600 dark:hover:bg-green-600 p-1.5 sm:p-2 rounded-full transition-colors shadow-sm"
              >
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-gray-900 text-green-600 hover:text-white hover:bg-green-600 dark:hover:bg-green-600 p-1.5 sm:p-2 rounded-full transition-colors shadow-sm"
              >
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-gray-900 text-green-600 hover:text-white hover:bg-green-600 dark:hover:bg-green-600 p-1.5 sm:p-2 rounded-full transition-colors shadow-sm"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="/"
                className="bg-white dark:bg-gray-900 text-green-600 hover:text-white hover:bg-green-600 dark:hover:bg-green-600 p-1.5 sm:p-2 rounded-full transition-colors shadow-sm"
              >
                <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Website</span>
              </Link>
            </div>
          </div>

          <div className="mt-2 md:mt-0">
            <h3 className="font-bold text-base sm:text-lg text-green-900 dark:text-green-50 mb-4 md:mb-6">
              Contact Us
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5" />
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  SRM University, Chennai
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3" />
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  +91 12345 67890
                </span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3" />
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  info@ecotrack.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="pt-6 md:pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; {currentYear} EcoTrack. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
