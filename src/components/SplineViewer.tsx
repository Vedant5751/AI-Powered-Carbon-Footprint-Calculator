"use client";

import { useEffect, useRef } from "react";
import { Application } from "@splinetool/runtime";

interface SplineViewerProps {
  scene: string;
  className?: string;
}

export default function SplineViewer({
  scene,
  className = "",
}: SplineViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const app = new Application(canvasRef.current);

    if (loadingRef.current) {
      loadingRef.current.style.display = "flex";
    }

    app
      .load(scene)
      .then(() => {
        if (loadingRef.current) {
          loadingRef.current.style.display = "none";
        }
        if (app.interface) {
          try {
            if (app.interface.enableOrbitControls) {
              app.interface.enableOrbitControls(false);
            }
          } catch (e) {
            console.log("Could not adjust scene settings", e);
          }
        }
      })
      .catch((error) => {
        console.error("Error loading Spline scene:", error);
        if (loadingRef.current) {
          loadingRef.current.innerHTML = "Error loading 3D scene";
        }
      });

    // Make canvas responsive
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      app.dispose();
    };
  }, [scene]);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <div
        ref={loadingRef}
        className="absolute inset-0 flex items-center justify-center z-10 bg-opacity-70 bg-white dark:bg-opacity-70 dark:bg-gray-900"
      >
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Loading 3D scene...
          </p>
        </div>
      </div>
      <canvas ref={canvasRef} className="w-full h-full object-cover" />
    </div>
  );
}
