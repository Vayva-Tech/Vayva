"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@vayva/ui";
import { ShoppingBag, Truck, ChefHat, Leaf, Clock, Users } from "lucide-react";

interface MealPlan {
  id: string;
  name: string;
  servings: number;
  mealsPerWeek: number;
  pricePerServing: number;
  image: string;
  popular?: boolean;
}

const MEAL_PLANS: MealPlan[] = [
  {
    id: "starter",
    name: "Starter Box",
    servings: 2,
    mealsPerWeek: 3,
    pricePerServing: 8.99,
    image: "/meal-kit/starter-box.jpg",
  },
  {
    id: "family",
    name: "Family Box",
    servings: 4,
    mealsPerWeek: 4,
    pricePerServing: 7.99,
    image: "/meal-kit/family-box.jpg",
    popular: true,
  },
  {
    id: "veggie",
    name: "Veggie Box",
    servings: 2,
    mealsPerWeek: 3,
    pricePerServing: 9.99,
    image: "/meal-kit/veggie-box.jpg",
  },
];

export default function MealKitHomePage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-100" />
        <div className="absolute inset-0 opacity-20 bg-[url('/meal-kit/hero-pattern.svg')] bg-repeat" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-5xl mx-auto px-6"
        >
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-6 tracking-tight">
            Fresh Ingredients,<br />
            <span className="text-emerald-600">Delivered Ready-to-Cook</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Skip the grocery store. Get pre-portioned ingredients and chef-designed recipes delivered to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" className="h-16 px-10 text-lg font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700">
              Get Started - First Box Free
            </Button>
            <Button size="xl" variant="outline" className="h-16 px-10 text-lg font-bold rounded-2xl border-2">
              View This Week's Menu
            </Button>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to delicious meals</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: ChefHat,
                title: "Choose Your Meals",
                description: "Pick from 20+ weekly recipes designed by our culinary team",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: Truck,
                title: "We Deliver",
                description: "Fresh, pre-portioned ingredients arrive at your doorstep",
                color: "bg-emerald-100 text-emerald-600",
              },
              {
                icon: Clock,
                title: "Cook & Enjoy",
                description: "Follow easy recipe cards and have dinner ready in 30 minutes",
                color: "bg-amber-100 text-amber-600",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center"
              >
                <div className={`w-24 h-24 ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-6`}>
                  <step.icon className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-lg text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meal Plans */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-600">Flexible boxes for every household</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {MEAL_PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative cursor-pointer rounded-3xl border-2 transition-all ${
                  selectedPlan === plan.id
                    ? "border-emerald-600 bg-emerald-50 shadow-2xl scale-105"
                    : "border-gray-200 bg-white hover:border-emerald-300"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                
                <div className="aspect-video bg-gray-200 rounded-t-3xl overflow-hidden">
                  <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="p-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-center gap-4 text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span>{plan.servings} servings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-5 h-5" />
                      <span>{plan.mealsPerWeek} meals/week</span>
                    </div>
                  </div>
                  
                  <div className="text-5xl font-black text-emerald-600 mb-6">
                    ${plan.pricePerServing}
                    <span className="text-lg font-medium text-gray-600">/serving</span>
                  </div>
                  
                  <Button 
                    className={`w-full h-14 text-lg font-bold rounded-2xl ${
                      selectedPlan === plan.id
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    {selectedPlan === plan.id ? "Selected ✓" : "Select Plan"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Leaf,
                title: "Farm-Fresh Quality",
                description: "Locally sourced when possible, always organic options",
              },
              {
                icon: Clock,
                title: "30-Minute Meals",
                description: "Quick recipes that don't compromise on flavor",
              },
              {
                icon: ShoppingBag,
                title: "Zero Food Waste",
                description: "Pre-portioned ingredients mean no leftovers to spoil",
              },
              {
                icon: ChefHat,
                title: "Chef-Designed",
                description: "Recipes created by professional chefs and nutritionists",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-gray-50"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-black mb-6"
          >
            Ready to Start Cooking?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-2xl mb-8 opacity-90"
          >
            Get your first box FREE when you sign up today
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button size="xl" className="h-16 px-12 text-lg font-bold rounded-2xl bg-white text-emerald-600 hover:bg-gray-100">
              Claim Your Free Box
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
