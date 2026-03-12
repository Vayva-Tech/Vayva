"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Search, Car } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@vayva/ui";
export function VehicleSearchWidget() {
    const router = useRouter();
    const [years, setYears] = useState([]);
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMake, setSelectedMake] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [loading, setLoading] = useState(false);
    // Initial Load: Years
    useEffect(() => {
        fetch("/api/vehicles?type=years")
            .then(res => res.json())
            .then(data => setYears(data.years || []))
            .catch(console.error);
    }, []);
    // Load Makes when Year changes
    useEffect(() => {
        if (!selectedYear) {
            setMakes([]);
            return;
        }
        setLoading(true);
        fetch(`/api/vehicles?type=makes&year=${selectedYear}`)
            .then(res => res.json())
            .then(data => {
            setMakes(data.makes || []);
            setSelectedMake(""); // Reset make
            setSelectedModel(""); // Reset model
        })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedYear]);
    // Load Models when Make changes
    useEffect(() => {
        if (!selectedMake) {
            setModels([]);
            return;
        }
        setLoading(true);
        fetch(`/api/vehicles?type=models&year=${selectedYear}&make=${selectedMake}`)
            .then(res => res.json())
            .then(data => {
            setModels(data.models || []);
            setSelectedModel("");
        })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedMake, selectedYear]);
    const handleSearch = () => {
        const params = new URLSearchParams();
        if (selectedYear)
            params.set("year", selectedYear);
        if (selectedMake)
            params.set("make", selectedMake);
        if (selectedModel)
            params.set("model", selectedModel);
        router.push(`/search?${params.toString()}`);
    };
    return (_jsxs("div", { className: "bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto -mt-16 relative z-10", children: [_jsxs("h2", { className: "text-lg font-bold mb-4 flex items-center gap-2", children: [_jsx(Car, { className: "text-blue-600" }), " Find your perfect ride"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("select", { className: "h-12 w-full rounded-lg border-gray-200 bg-gray-50 px-4 text-sm focus:border-blue-500 focus:ring-blue-500", value: selectedYear, onChange: (e) => setSelectedYear(e.target.value), children: [_jsx("option", { value: "", children: "Year" }), years.map(y => _jsx("option", { value: y, children: y }, y))] }), _jsxs("select", { className: "h-12 w-full rounded-lg border-gray-200 bg-gray-50 px-4 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50", value: selectedMake, onChange: (e) => setSelectedMake(e.target.value), disabled: !selectedYear, children: [_jsx("option", { value: "", children: "Make" }), makes.map(m => _jsx("option", { value: m, children: m }, m))] }), _jsxs("select", { className: "h-12 w-full rounded-lg border-gray-200 bg-gray-50 px-4 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50", value: selectedModel, onChange: (e) => setSelectedModel(e.target.value), disabled: !selectedMake, children: [_jsx("option", { value: "", children: "Model" }), models.map(m => _jsx("option", { value: m, children: m }, m))] }), _jsx(Button, { className: "h-12 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all", onClick: handleSearch, disabled: loading, children: loading ? "Loading..." : _jsxs(_Fragment, { children: [_jsx(Search, { className: "w-4 h-4 mr-2" }), " Search Inventory"] }) })] })] }));
}
