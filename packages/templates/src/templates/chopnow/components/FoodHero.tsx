import React from "react";

export const FoodHero = (): React.JSX.Element => {
  return (
    <section className="relative h-64 bg-yellow-500 overflow-hidden">
      <img
        src="https://placehold.co/800x400/F59E0B/fff?text=Hot+Meals"
        alt="Food Hero"
        className="w-full h-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
        <div>
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
            30-45 Mins
          </span>
          <h1 className="text-white text-3xl font-extrabold mt-2 leading-none drop-shadow-md">
            Crave it? Get it.
          </h1>
          <p className="text-gray-200 text-sm mt-1 font-medium">
            Free delivery on orders over ₦10,000
          </p>
        </div>
      </div>
    </section>
  );
};
