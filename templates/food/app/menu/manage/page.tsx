"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Utensils,
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  ArrowLeft
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  isAvailable: boolean;
  isPopular: boolean;
  prepTime: number;
  dietaryInfo: string[];
  allergens: string[];
}

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Main Course",
    prepTime: "20",
    dietaryInfo: [] as string[],
    allergens: [] as string[],
    isPopular: false,
    isAvailable: true
  });

  const categories = [
    "Appetizers", "Main Course", "Desserts", "Drinks", 
    "Breakfast", "Lunch", "Dinner", "Specials"
  ];

  const dietaryOptions = [
    "Vegetarian", "Vegan", "Gluten Free", "Dairy Free", 
    "Nut Free", "Halal", "Kosher", "Spicy"
  ];

  const allergenOptions = [
    "Nuts", "Dairy", "Gluten", "Shellfish", 
    "Eggs", "Soy", "Fish", "Wheat"
  ];

  useEffect(() => {
    // Simulate fetching menu items
    setTimeout(() => {
      setMenuItems([
        {
          id: "1",
          name: "Jollof Rice & Chicken",
          description: "Traditional Nigerian jollof rice with grilled chicken",
          price: 3500,
          category: "Main Course",
          isAvailable: true,
          isPopular: true,
          prepTime: 25,
          dietaryInfo: ["Gluten Free"],
          allergens: ["Dairy"]
        },
        {
          id: "2",
          name: "Pepperoni Pizza",
          description: "Classic pizza with pepperoni and mozzarella cheese",
          price: 6800,
          category: "Main Course",
          isAvailable: true,
          isPopular: false,
          prepTime: 35,
          dietaryInfo: [],
          allergens: ["Gluten", "Dairy"]
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: MenuItem = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) * 100,
      category: formData.category,
      isAvailable: formData.isAvailable,
      isPopular: formData.isPopular,
      prepTime: parseInt(formData.prepTime),
      dietaryInfo: formData.dietaryInfo,
      allergens: formData.allergens
    };

    if (editingItem) {
      setMenuItems(prev => prev.map(item => 
        item.id === editingItem.id ? newItem : item
      ));
    } else {
      setMenuItems(prev => [...prev, newItem]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Main Course",
      prepTime: "20",
      dietaryInfo: [],
      allergens: [],
      isPopular: false,
      isAvailable: true
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: (item.price / 100).toString(),
      category: item.category,
      prepTime: item.prepTime.toString(),
      dietaryInfo: item.dietaryInfo,
      allergens: item.allergens,
      isPopular: item.isPopular,
      isAvailable: item.isAvailable
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      setMenuItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const toggleDietary = (option: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryInfo: prev.dietaryInfo.includes(option)
        ? prev.dietaryInfo.filter(d => d !== option)
        : [...prev.dietaryInfo, option]
    }));
  };

  const toggleAllergen = (option: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(option)
        ? prev.allergens.filter(a => a !== option)
        : [...prev.allergens, option]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-orange-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowForm(!showForm)}
              variant={showForm ? "outline" : "default"}
            >
              <Plus className="h-4 w-4 mr-2" />
              {showForm ? 'Cancel' : 'Add Menu Item'}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Utensils className="h-8 w-8 text-orange-600" />
          <h1 className="text-3xl font-bold">Menu Management</h1>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter item name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the item"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="price">Price (₦) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="prepTime">Prep Time (mins) *</Label>
                    <Input
                      id="prepTime"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.prepTime}
                      onChange={(e) => setFormData({...formData, prepTime: e.target.value})}
                      placeholder="20"
                      required
                    />
                  </div>

                  <div className="flex items-end space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPopular"
                        checked={formData.isPopular}
                        onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="isPopular">Popular Item</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isAvailable"
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="isAvailable">Available</Label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Dietary Information</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {dietaryOptions.map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleDietary(option)}
                          className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                            formData.dietaryInfo.includes(option)
                              ? 'bg-green-100 border-green-500 text-green-800'
                              : 'bg-white border-gray-200 hover:border-green-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Allergens</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {allergenOptions.map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleAllergen(option)}
                          className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                            formData.allergens.includes(option)
                              ? 'bg-red-100 border-red-500 text-red-800'
                              : 'bg-white border-gray-200 hover:border-red-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map(item => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{item.category}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">₦{(item.price / 100).toFixed(2)}</Badge>
                    <Badge variant="outline">{item.prepTime} min</Badge>
                    {item.isPopular && <Badge variant="default">Popular</Badge>}
                    <Badge variant={item.isAvailable ? "default" : "secondary"}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  
                  {item.dietaryInfo.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.dietaryInfo.map(diet => (
                        <Badge key={diet} variant="outline" className="text-xs">
                          {diet}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {item.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.allergens.map(allergen => (
                        <Badge key={allergen} variant="destructive" className="text-xs">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {menuItems.length === 0 && !showForm && (
          <div className="text-center py-16">
            <Utensils className="h-24 w-24 mx-auto text-orange-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No menu items yet</h2>
            <p className="text-gray-600 mb-8">Add your first menu item to get started</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}