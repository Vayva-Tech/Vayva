"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Phone, Mail, Award } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  company: string;
  bio: string;
  avatar?: string;
  specialties: string[];
  rating?: number;
  yearsExperience: number;
  propertiesCount: number;
  isVerified: boolean;
  createdAt: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      
      if (data.agents) {
        setAgents(data.agents);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.specialties.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const AgentCard = ({ agent }: { agent: Agent }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            {agent.avatar ? (
              <img 
                src={agent.avatar} 
                alt={agent.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-emerald-600">
                  {agent.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{agent.name}</h3>
                <p className="text-emerald-600 font-medium">{agent.company}</p>
              </div>
              {agent.isVerified && (
                <div className="flex items-center text-blue-600">
                  <Award className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              )}
            </div>
            <p className="text-gray-600 text-sm mt-1">{agent.licenseNumber}</p>
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{agent.bio}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {agent.specialties.slice(0, 3).map((specialty, index) => (
            <span 
              key={index} 
              className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs"
            >
              {specialty}
            </span>
          ))}
          {agent.specialties.length > 3 && (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
              +{agent.specialties.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            <span className="font-medium">
              {agent.rating ? agent.rating.toFixed(1) : 'No ratings'}
            </span>
            <span className="text-gray-500 text-sm ml-1">
              ({agent.propertiesCount} properties)
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {agent.yearsExperience} years exp.
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-emerald-700">
            ESTATELY
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/properties?purpose=sale" className="text-sm font-medium hover:text-emerald-700">
              Buy
            </Link>
            <Link href="/properties?purpose=rent" className="text-sm font-medium hover:text-emerald-700">
              Rent
            </Link>
            <Link href="/sell" className="text-sm font-medium hover:text-emerald-700">
              Sell
            </Link>
            <Link href="/agents" className="text-sm font-medium hover:text-emerald-700">
              Agents
            </Link>
          </nav>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            Contact Us
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-emerald-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Meet Our Top Agents
            </h1>
            <p className="text-emerald-100 text-lg mb-8">
              Connect with experienced real estate professionals who know your market
            </p>
            
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search agents by name, company, or specialty..."
                className="pl-10 bg-white border-0 focus-visible:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-emerald-600">{agents.length}</p>
              <p className="text-sm text-gray-600">Verified Agents</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">
                {agents.reduce((sum, agent) => sum + agent.propertiesCount, 0)}
              </p>
              <p className="text-sm text-gray-600">Properties Listed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">
                {Math.round(agents.reduce((sum, agent) => sum + (agent.rating || 0), 0) / agents.length * 10) / 10 || '4.8'}
              </p>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">
                {Math.round(agents.reduce((sum, agent) => sum + agent.yearsExperience, 0) / agents.length) || '8'}
              </p>
              <p className="text-sm text-gray-600">Avg. Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No agents found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}