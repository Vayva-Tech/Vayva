"use client";

import { useState } from 'react';
import Header from "@/components/Header";
import { Calendar, MapPin, Ticket, Image, Plus, Trash2, Upload, Clock, Users } from "lucide-react";

interface TicketTier {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  salesStart: string;
  salesEnd: string;
  maxPerOrder: number;
  benefits: string[];
}

export default function CreateEventPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    venue: '',
    address: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    capacity: '',
    bannerImage: '',
    isPublic: true,
    requiresApproval: false
  });

  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    {
      id: 'tier-1',
      name: 'General Admission',
      description: '',
      price: 0,
      quantity: 100,
      salesStart: new Date().toISOString().split('T')[0],
      salesEnd: '',
      maxPerOrder: 10,
      benefits: []
    }
  ]);

  const [newBenefit, setNewBenefit] = useState('');
  const [currentTierIndex, setCurrentTierIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Conference', 'Music', 'Business', 'Sports', 'Arts & Culture', 
    'Technology', 'Food & Drink', 'Education', 'Charity', 'Other'
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTicketTier = () => {
    const newTier: TicketTier = {
      id: `tier-${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      quantity: 100,
      salesStart: new Date().toISOString().split('T')[0],
      salesEnd: '',
      maxPerOrder: 10,
      benefits: []
    };
    setTicketTiers([...ticketTiers, newTier]);
    setCurrentTierIndex(ticketTiers.length);
  };

  const updateTicketTier = (index: number, field: string, value: string | number) => {
    const updatedTiers = [...ticketTiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setTicketTiers(updatedTiers);
  };

  const addBenefit = (tierIndex: number) => {
    if (newBenefit.trim()) {
      const updatedTiers = [...ticketTiers];
      updatedTiers[tierIndex].benefits.push(newBenefit.trim());
      setTicketTiers(updatedTiers);
      setNewBenefit('');
    }
  };

  const removeBenefit = (tierIndex: number, benefitIndex: number) => {
    const updatedTiers = [...ticketTiers];
    updatedTiers[tierIndex].benefits.splice(benefitIndex, 1);
    setTicketTiers(updatedTiers);
  };

  const removeTicketTier = (index: number) => {
    if (ticketTiers.length > 1) {
      const updatedTiers = ticketTiers.filter((_, i) => i !== index);
      setTicketTiers(updatedTiers);
      if (currentTierIndex >= updatedTiers.length) {
        setCurrentTierIndex(updatedTiers.length - 1);
      }
    }
  };

  const validateStep1 = () => {
    return formData.title && formData.description && formData.category;
  };

  const validateStep2 = () => {
    return formData.venue && formData.address && formData.startDate && formData.startTime;
  };

  const validateStep3 = () => {
    return ticketTiers.every(tier => tier.name && tier.quantity > 0);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Combine date and time
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = formData.endDate && formData.endTime 
        ? new Date(`${formData.endDate}T${formData.endTime}`)
        : new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        venue: formData.venue,
        address: formData.address,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        capacity: parseInt(formData.capacity) || 100,
        ticketTiers: ticketTiers.map(tier => ({
          name: tier.name,
          description: tier.description,
          price: tier.price,
          quantity: tier.quantity,
          salesStart: new Date(tier.salesStart).toISOString(),
          salesEnd: tier.salesEnd ? new Date(tier.salesEnd).toISOString() : undefined,
          maxPerOrder: tier.maxPerOrder,
          benefits: tier.benefits
        }))
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      const result = await response.json();
      
      if (result.event) {
        alert('Event created successfully!');
        // Redirect to event management page
        window.location.href = `/manage-events/${result.event.id}`;
      } else {
        throw new Error(result.error || 'Failed to create event');
      }
    } catch (error: any) {
      alert(`Error creating event: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
            stepNum <= currentStep 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            {stepNum}
          </div>
          {stepNum < 4 && (
            <div className={`w-16 h-1 h-1 mx-2 ${
              stepNum < currentStep ? 'bg-purple-600' : 'bg-gray-200'
            }`}></div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[
        { label: "Organizer Dashboard", href: "/organizer" },
        { label: "Create Event" }
      ]} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
          <p className="text-gray-600 mb-8">Fill in the details to create your event</p>

          <StepIndicator currentStep={step} />

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe your event..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={!validateStep1()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Event Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => handleInputChange('venue', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Venue name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Full address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    min={formData.startDate}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="100"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!validateStep2()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Ticket Tiers */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ticket Tiers</h2>
              
              <div className="flex gap-4 mb-6">
                <button
                  onClick={addTicketTier}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Ticket Tier
                </button>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <div className="flex border-b bg-gray-50">
                  {ticketTiers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTierIndex(index)}
                      className={`px-6 py-3 font-medium border-r ${
                        currentTierIndex === index
                          ? 'bg-white text-purple-600 border-b-2 border-b-purple-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Tier {index + 1}
                    </button>
                  ))}
                </div>

                {ticketTiers.length > 0 && (
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ticket Name *
                        </label>
                        <input
                          type="text"
                          value={ticketTiers[currentTierIndex].name}
                          onChange={(e) => updateTicketTier(currentTierIndex, 'name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., General Admission"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (₦)
                        </label>
                        <input
                          type="number"
                          value={ticketTiers[currentTierIndex].price}
                          onChange={(e) => updateTicketTier(currentTierIndex, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="0"
                          min="0"
                          step="100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          value={ticketTiers[currentTierIndex].quantity}
                          onChange={(e) => updateTicketTier(currentTierIndex, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="100"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Per Order
                        </label>
                        <input
                          type="number"
                          value={ticketTiers[currentTierIndex].maxPerOrder}
                          onChange={(e) => updateTicketTier(currentTierIndex, 'maxPerOrder', parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="10"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={ticketTiers[currentTierIndex].description}
                        onChange={(e) => updateTicketTier(currentTierIndex, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Describe this ticket tier..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sales Start Date
                        </label>
                        <input
                          type="date"
                          value={ticketTiers[currentTierIndex].salesStart}
                          onChange={(e) => updateTicketTier(currentTierIndex, 'salesStart', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sales End Date
                        </label>
                        <input
                          type="date"
                          value={ticketTiers[currentTierIndex].salesEnd}
                          onChange={(e) => updateTicketTier(currentTierIndex, 'salesEnd', e.target.value)}
                          min={ticketTiers[currentTierIndex].salesStart}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Benefits
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newBenefit}
                          onChange={(e) => setNewBenefit(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Add a benefit..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addBenefit(currentTierIndex);
                            }
                          }}
                        />
                        <button
                          onClick={() => addBenefit(currentTierIndex)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      {ticketTiers[currentTierIndex].benefits.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {ticketTiers[currentTierIndex].benefits.map((benefit, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                            >
                              {benefit}
                              <button
                                onClick={() => removeBenefit(currentTierIndex, index)}
                                className="hover:text-green-900"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {ticketTiers.length > 1 && (
                      <button
                        onClick={() => removeTicketTier(currentTierIndex)}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove This Tier
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!validateStep3()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Publish */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Publish</h2>
              
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Event Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-600">Title:</span> {formData.title}</div>
                  <div><span className="text-gray-600">Category:</span> {formData.category}</div>
                  <div><span className="text-gray-600">Venue:</span> {formData.venue}</div>
                  <div><span className="text-gray-600">Address:</span> {formData.address}</div>
                  <div><span className="text-gray-600">Start:</span> {formData.startDate} at {formData.startTime}</div>
                  <div><span className="text-gray-600">Capacity:</span> {formData.capacity || 'Not specified'}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Ticket Tiers</h3>
                <div className="space-y-3">
                  {ticketTiers.map((tier, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="font-medium text-gray-900">{tier.name}</div>
                      <div className="text-sm text-gray-600">
                        ₦{tier.price.toLocaleString()} • {tier.quantity} tickets • Max {tier.maxPerOrder} per order
                      </div>
                      {tier.benefits.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tier.benefits.map((benefit, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {benefit}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    'Publish Event'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}