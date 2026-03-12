"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Star, ArrowRight, ShoppingBag } from "lucide-react";

const books = [
  { id: 1, title: "Things Fall Apart", author: "Chinua Achebe", price: 4500, rating: 4.8, image: "bg-gradient-to-br from-amber-700 to-amber-900" },
  { id: 2, title: "Half of a Yellow Sun", author: "Chimamanda Ngozi Adichie", price: 5500, rating: 4.9, image: "bg-gradient-to-br from-red-700 to-red-900" },
  { id: 3, title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", price: 5000, rating: 4.7, image: "bg-gradient-to-br from-slate-700 to-slate-900" },
  { id: 4, title: "Atomic Habits", author: "James Clear", price: 6000, rating: 4.9, image: "bg-gradient-to-br from-blue-700 to-blue-900" },
];

const categories = [
  { name: "Fiction", count: "2,500+" },
  { name: "Non-Fiction", count: "1,800+" },
  { name: "Academic", count: "900+" },
  { name: "Children's", count: "600+" },
];

export default function BooksHome() {
  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-800 flex items-center gap-2">
            <BookOpen className="h-6 w-6" /> BookHaven
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/bestsellers" className="text-stone-600 hover:text-amber-800">Bestsellers</Link>
            <Link href="/new-arrivals" className="text-stone-600 hover:text-amber-800">New Arrivals</Link>
            <Link href="/categories" className="text-stone-600 hover:text-amber-800">Categories</Link>
            <Link href="/authors" className="text-stone-600 hover:text-amber-800">Authors</Link>
          </nav>
          <div className="flex items-center gap-4">
            <ShoppingBag className="h-6 w-6 text-stone-600" />
            <Button className="bg-amber-800 hover:bg-amber-900">Sign In</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-800 via-amber-700 to-orange-700 py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Discover Your Next Great Read
          </h1>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Thousands of books from local and international authors. Fiction, non-fiction, academic, and more.
          </p>
          <div className="max-w-2xl mx-auto bg-white rounded-xl p-2 flex gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-stone-100 rounded-lg">
              <Search className="h-5 w-5 text-stone-500" />
              <input placeholder="Search books, authors, ISBN..." className="bg-transparent flex-1 outline-none text-stone-900" />
            </div>
            <Button size="lg" className="bg-amber-800 hover:bg-amber-900">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div key={cat.name} className="p-6 rounded-xl bg-amber-50 hover:bg-amber-100 cursor-pointer transition text-center">
                <p className="font-semibold text-stone-900">{cat.name}</p>
                <p className="text-sm text-stone-500">{cat.count} books</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-stone-900">Bestsellers</h2>
            <Link href="/bestsellers" className="text-amber-800 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition">
                <div className={`h-56 ${book.image}`} />
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-stone-900">{book.title}</h3>
                  <p className="text-sm text-stone-500">{book.author}</p>
                  <div className="flex items-center gap-1 my-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm text-stone-600">{book.rating}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xl font-bold text-amber-800">₦{(book.price / 100).toFixed(0)}</p>
                    <Button size="sm" className="bg-amber-800 hover:bg-amber-900">Buy</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
