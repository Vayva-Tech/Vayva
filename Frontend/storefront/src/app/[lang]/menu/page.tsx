"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { LOCALES, LocaleKey } from "@/data/locales";
import { WeekSelector } from "@/components/menu/WeekSelector";
import { MenuFilterBar } from "@/components/menu/MenuFilterBar";
import { MealCard } from "@/components/menu/MealCard";
import { SelectionSummary } from "@/components/menu/SelectionSummary";
import { Meal, Week } from "@/types/menu";
import { useStore } from "@/context/StoreContext";
import { reportError } from "@/lib/error";
import { Button } from "@vayva/ui";

export default function MenuPage({
  params: _params,
}: {
  params: Promise<{ lang: string }>;
}): React.JSX.Element {
  const { lang: rawLang } = useParams() as { lang: string };
  const lang = (rawLang === "tr" ? "tr" : "en") as LocaleKey;
  const { store } = useStore();
  const t = LOCALES[lang];

  const [weeks, setWeeks] = useState<Week[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedWeekId, setSelectedWeekId] = useState("");
  const [selections, setSelections] = useState<Record<string, string[]>>({}); // weekId -> mealId[]
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    if (!store) return;

    fetch(`/api/menu?slug=${store.slug}`)
      .then((res: any) => res.json())
      .then((data: any) => {
        if (data.weeks && data.meals) {
          setWeeks(data.weeks);
          setMeals(data.meals);
          if (data.weeks.length > 0) {
            setSelectedWeekId(
              data.weeks.find((w: Week) => !w.isLocked)?.id || data.weeks[0].id,
            );
          }
        }
        setLoading(false);
      })
      .catch((err: any) => {
        reportError(err, { scope: "MenuPage.fetchMenu", app: "storefront" });
        setLoading(false);
      });
  }, [store]);

  // Derived State
  const activeWeek = weeks.find((w) => w.id === selectedWeekId) || weeks[0];
  const selectedMealIds = selections[selectedWeekId] || [];
  const isLocked = activeWeek?.isLocked || false;
  const mealsPerWeek = 4; // Test Config

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Menu...
      </div>
    );
  if (!activeWeek)
    return (
      <div className="min-h-screen flex items-center justify-center">
        No active menu found.
      </div>
    );

  // Filter Logic
  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      const matchesSearch = meal.title[lang]
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Test filter logic
      const matchesFilters =
        activeFilters.length === 0 ||
        activeFilters.every((filter) => {
          if (filter === "under20") return meal.tags.prepTime < 20;
          if (filter === "vegetarian")
            return (
              meal.tags.category === "Vejetaryen" ||
              !meal.ingredients.some(
                (i: any) =>
                  i.name.includes("Et") ||
                  i.name.includes("Tavuk") ||
                  i.name.includes("Kıyma") ||
                  i.name.includes("Somon"),
              )
            );
          if (filter === "family")
            return (
              meal.tags.category === "Aile" || meal.tags.category === "Klasik"
            );
          if (filter === "fit")
            return meal.tags.category === "Fit" || meal.tags.kcal < 500;
          return true;
        });

      return matchesSearch && matchesFilters;
    });
  }, [searchQuery, activeFilters, lang]);

  const selectedMealsData = useMemo(() => {
    return meals.filter((m) => selectedMealIds.includes(m.id));
  }, [selectedMealIds, meals]);

  // Handlers
  const handleToggleMeal = (mealId: string) => {
    if (isLocked) return;

    setSelections((prev) => {
      const current = prev[selectedWeekId] || [];
      if (current.includes(mealId)) {
        return {
          ...prev,
          [selectedWeekId]: current.filter((id) => id !== mealId),
        };
      } else {
        if (current.length >= mealsPerWeek) {
          alert(t.errors.maxMeals);
          return prev;
        }
        return { ...prev, [selectedWeekId]: [...current, mealId] };
      }
    });
  };

  const handleSave = () => {
    alert("Selection Saved! (Test)");
  };

  return (
    <div className="min-h-screen bg-background/40 backdrop-blur-sm pb-20 bg-noise">
      {/* Header */}
      <div className="glass-panel sticky top-0 z-30 border-b border-white/20 pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Menüm</h1>
          <p className="text-gray-500 text-sm mt-1">{t.planSummary}</p>
        </div>
      </div>

      {/* Week Selector */}
      <WeekSelector
        weeks={weeks}
        selectedWeekId={selectedWeekId}
        onSelectWeek={setSelectedWeekId}
        lang={lang}
      />

      {/* Filters */}
      <MenuFilterBar
        lang={lang}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilters={activeFilters}
        onToggleFilter={(f: any) => {
          setActiveFilters((prev) =>
            prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
          );
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  isSelected={selectedMealIds.includes(meal.id)}
                  isLocked={isLocked}
                  lang={lang}
                  onToggle={handleToggleMeal}
                  onViewDetails={() => {}}
                />
              ))}
            </div>
            {filteredMeals.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500">
                  No meals found matching your criteria.
                </p>
              </div>
            )}
          </div>

          {/* Desktop Sidebar Summary */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <SelectionSummary
              selectedMeals={selectedMealsData}
              mealsPerWeek={mealsPerWeek}
              totalCost={1200} // Test
              lang={lang}
              isLocked={isLocked}
              onSave={handleSave}
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Summary Drawer */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-background/70 backdrop-blur-xl border-t border-gray-200 p-4 pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40 transition-transform duration-300">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-gray-900">
                {selectedMealIds.length}/{mealsPerWeek} {t.selected}
              </span>
              {selectedMealIds.length === mealsPerWeek && (
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              )}
            </div>
            <div className="text-xs text-gray-500 font-medium">Tot: ₺1200</div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isLocked || selectedMealIds.length !== mealsPerWeek}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 h-auto ${
              selectedMealIds.length === mealsPerWeek
                ? "bg-black text-white hover:bg-gray-900 shadow-black/20"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            aria-label="Save selection"
          >
            {isLocked ? "Locked" : t.saveSelection}
          </Button>
        </div>
      </div>
    </div>
  );
}
