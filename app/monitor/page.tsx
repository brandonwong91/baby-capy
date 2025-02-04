"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import router from "next/router";

type NoiseEvent = {
  timestamp: Date;
  level: number;
  duration: number;
};

export default function Monitor() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [threshold, setThreshold] = useState(15);
  const [minDuration, setMinDuration] = useState(3);
  const [noiseEvents, setNoiseEvents] = useState<NoiseEvent[]>([]);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const thresholdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const thresholdStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isDateAuthenticated");
    if (isAuthenticated !== "true") {
      router.push("/");
    }
    // Load threshold settings from localStorage
    const storedThreshold = localStorage.getItem("noiseThreshold");
    const storedDuration = localStorage.getItem("noiseDuration");
    if (storedThreshold) setThreshold(parseInt(storedThreshold));
    if (storedDuration) setMinDuration(parseInt(storedDuration));
    setMounted(true);
    return () => {
      stopMonitoring();
    };
  }, []);

  // Save threshold settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("noiseThreshold", threshold.toString());
  }, [threshold]);

  useEffect(() => {
    localStorage.setItem("noiseDuration", minDuration.toString());
  }, [minDuration]);

  const startMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      dataArrayRef.current = dataArray;
      setIsMonitoring(true);
      setError(null);
      requestAnimationFrame(updateNoiseLevel);
    } catch (err) {
      setError("Failed to access microphone. Please check permissions.");
      console.error("Error accessing microphone:", err);
    }
  };

  const stopMonitoring = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (thresholdTimeoutRef.current) {
      clearTimeout(thresholdTimeoutRef.current);
      thresholdTimeoutRef.current = null;
    }
    thresholdStartTimeRef.current = null;
    setIsMonitoring(false);
    setNoiseLevel(0);
  };

  const updateNoiseLevel = () => {
    if (!analyserRef.current || !dataArrayRef.current || !isMonitoring) {
      return;
    }

    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const amplitude = (dataArrayRef.current[i] - 128) / 128;
      sum += amplitude * amplitude;
    }
    const rms = Math.sqrt(sum / dataArrayRef.current.length);
    const normalizedLevel = Math.min(100, rms * 100 * 5);
    setNoiseLevel(Math.round(normalizedLevel));

    if (normalizedLevel >= threshold) {
      if (thresholdStartTimeRef.current === null) {
        thresholdStartTimeRef.current = Date.now();
        thresholdTimeoutRef.current = setTimeout(() => {
          const duration = (Date.now() - thresholdStartTimeRef.current!) / 1000;
          if (duration >= minDuration) {
            setNoiseEvents((prev) => [
              {
                timestamp: new Date(),
                level: Math.round(normalizedLevel),
                duration: Math.round(duration),
              },
              ...prev,
            ]);
          }
          thresholdStartTimeRef.current = null;
        }, minDuration * 1000);
      }
    } else {
      if (thresholdTimeoutRef.current) {
        clearTimeout(thresholdTimeoutRef.current);
        thresholdTimeoutRef.current = null;
      }
      thresholdStartTimeRef.current = null;
    }

    // Schedule the next update after 1 second
    if (isMonitoring) {
      setTimeout(updateNoiseLevel, 1000);
    }
  };

  useEffect(() => {
    // Start the update loop when monitoring begins
    if (isMonitoring) {
      updateNoiseLevel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMonitoring]);

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Noise Monitor</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Threshold Level (0-100)
                </label>
                <Input
                  type="number"
                  value={threshold}
                  onChange={(e) =>
                    setThreshold(
                      Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                    )
                  }
                  min="0"
                  max="100"
                  disabled={isMonitoring}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Minimum Duration (seconds)
                </label>
                <Input
                  type="number"
                  value={minDuration}
                  onChange={(e) =>
                    setMinDuration(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min="1"
                  disabled={isMonitoring}
                />
              </div>
              <Button
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                className="w-full"
                variant={isMonitoring ? "destructive" : "default"}
              >
                {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
              </Button>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Current Noise Level</h2>
            <div className="space-y-4">
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute h-full transition-all duration-300 rounded-full ${
                    noiseLevel >= threshold ? "bg-red-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${noiseLevel}%` }}
                />
              </div>
              <div className="text-center text-2xl font-bold">
                {noiseLevel}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Noise Events</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {noiseEvents.length === 0 ? (
              <p className="text-gray-500">No noise events recorded</p>
            ) : (
              noiseEvents.map((event, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <p className="font-medium">
                    Time: {format(event.timestamp, "HH:mm:ss")}
                  </p>
                  <p>Level: {event.level}%</p>
                  <p>Duration: {event.duration}s</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
