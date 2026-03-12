"use client";

import { useEffect, useState } from "react";
import { Search, ChevronRight, Car } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@vayva/ui";

export function VehicleSearchWidget(): React.JSX.Element {
  const router = useRouter();

  const [years, setYears] = useState<number[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");

  const [loading, setLoading] = useState(false);

  // Initial Load: Years
  useEffect(() => {
    fetch("/api/vehicles?type=years")
      .then((res) => res.json())
      .then((data) => setYears(data.years || []))
      .catch(console.error);
  }, []);

  // Load Makes when Year changes
  useEffect(() => {
    if (!selectedYear) return;

    fetch(`/api/vehicles?type=makes&year=${selectedYear}`)
      .then((res) => res.json())
      .then((data) => {
        setMakes(data.makes || []);
        setSelectedMake("");
        setSelectedModel("");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedYear]);

  // Load Models when Make changes
  useEffect(() => {
    if (!selectedMake) return;

    fetch(`/api/vehicles?type=models&year=${selectedYear}&make=${selectedMake}`)
      .then((res) => res.json())
      .then((data) => {
        setModels(data.models || []);
        setSelectedModel("");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedMake, selectedYear]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedYear) params.set("year", selectedYear);
    if (selectedMake) params.set("make", selectedMake);
    if (selectedModel) params.set("model", selectedModel);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto -mt-16 relative z-10">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Car className="text-blue-600" /> Find your perfect ride
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          className="h-12 w-full rounded-lg border-gray-200 bg-gray-50 px-4 text-sm focus:border-blue-500 focus:ring-blue-500"
          value={selectedYear}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => {
            const val = e.target.value;
            setSelectedYear(val);
            setMakes([]);
            setModels([]);
            setSelectedMake("");
            setSelectedModel("");
            if (val) setLoading(true);
          }}
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          className="h-12 w-full rounded-lg border-gray-200 bg-gray-50 px-4 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
          value={selectedMake}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => {
            const val = e.target.value;
            setSelectedMake(val);
            setModels([]);
            setSelectedModel("");
            if (val) setLoading(true);
          }}
          disabled={!selectedYear}
        >
          <option value="">Make</option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          className="h-12 w-full rounded-lg border-gray-200 bg-gray-50 px-4 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
          value={selectedModel}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setSelectedModel(e.target.value)}
          disabled={!selectedMake}
        >
          <option value="">Model</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <Button
          className="h-12 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? (
            "Loading..."
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" /> Search Inventory
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
