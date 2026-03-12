'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CalendarIcon,
  UsersIcon,
  MapPinIcon,
  StarIcon,
  WifiIcon,
  CarIcon,
  CoffeeIcon,
  WavesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface RoomType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  price: number;
  available: number;
  amenities: string[];
  image: string;
}

interface BookingForm {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  specialRequests: string;
}

export default function StaysavvyBookingEngine() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BookingForm>({
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    rooms: 1,
    specialRequests: ''
  });
  
  const [availableRooms, setAvailableRooms] = useState<RoomType[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    paymentMethod: 'card'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableRooms();
  }, [formData]);

  const fetchAvailableRooms = async () => {
    try {
      const params = new URLSearchParams({
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        adults: formData.adults.toString(),
        children: formData.children.toString(),
        rooms: formData.rooms.toString()
      });
      
      const response = await fetch(`/api/staysavvy/availability?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableRooms(data.rooms);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleInputChange = (field: keyof BookingForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGuestInfoChange = (field: string, value: string) => {
    setGuestInfo(prev => ({ ...prev, [field]: value }));
  };

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const totalCost = selectedRoom ? selectedRoom.price * nights * formData.rooms : 0;

  const AmenityIcon = ({ amenity }: { amenity: string }) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <WifiIcon className="h-4 w-4 text-gray-500" />;
      case 'parking': return <CarIcon className="h-4 w-4 text-gray-500" />;
      case 'breakfast': return <CoffeeIcon className="h-4 w-4 text-gray-500" />;
      case 'pool': return <WavesIcon className="h-4 w-4 text-gray-500" />;
      default: return <WifiIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const RoomCard = ({ room }: { room: RoomType }) => (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
         onClick={() => setSelectedRoom(room)}>
      <div className="flex items-start">
        <img 
          src={room.image} 
          alt={room.name}
          className="w-24 h-24 object-cover rounded-lg mr-4"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900">{room.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{room.description}</p>
              <div className="flex items-center mt-2">
                <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-600">Sleeps {room.capacity}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">${room.price}</div>
              <div className="text-sm text-gray-500">per night</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {room.amenities.map((amenity) => (
              <div key={amenity} className="flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                <AmenityIcon amenity={amenity} />
                <span className="ml-1">{amenity}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-3 text-sm text-green-600">
            {room.available} rooms available
          </div>
        </div>
      </div>
      
      {selectedRoom?.id === room.id && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center text-blue-700">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">Selected</span>
          </div>
        </div>
      )}
    </div>
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const bookingData = {
        propertyId: 'prop_1', // Would come from context
        roomTypeId: selectedRoom?.id,
        checkInDate: formData.checkIn,
        checkOutDate: formData.checkOut,
        adults: formData.adults,
        children: formData.children,
        guestInfo,
        specialRequests: formData.specialRequests,
        totalAmount: totalCost,
        currency: 'USD'
      };

      const response = await fetch('/api/staysavvy/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();
      
      if (result.success) {
        router.push(`/staysavvy/confirmation?bookingId=${result.booking.id}`);
      } else {
        alert('Booking failed: ' + result.error);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('An error occurred while processing your booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/staysavvy" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🏨</span>
              </div>
              <span className="text-xl font-bold text-gray-900">StaySavvy</span>
            </Link>
            <div className="text-sm text-gray-600">
              Step {step} of 3
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Progress Bar */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    num <= step 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {num}
                  </div>
                  {num < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      num < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
              <div className="ml-4 text-sm font-medium text-gray-900">
                {step === 1 && 'Select Dates & Guests'}
                {step === 2 && 'Choose Room'}
                {step === 3 && 'Guest Information'}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Step 1: Dates & Guests */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Select Your Stay</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-in Date
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.checkIn}
                        onChange={(e) => handleInputChange('checkIn', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-out Date
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.checkOut}
                        onChange={(e) => handleInputChange('checkOut', e.target.value)}
                        min={formData.checkIn || new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adults
                    </label>
                    <select
                      value={formData.adults}
                      onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Children
                    </label>
                    <select
                      value={formData.children}
                      onChange={(e) => handleInputChange('children', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {[0, 1, 2, 3, 4].map(num => (
                        <option key={num} value={num}>{num} Child{num > 1 ? 'ren' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.checkIn || !formData.checkOut || nights <= 0}
                    className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Continue to Room Selection
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Room Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Choose Your Room</h2>
                  <button 
                    onClick={() => setStep(1)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ← Back to dates
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>{formData.checkIn} to {formData.checkOut}</span>
                    <span className="mx-2">•</span>
                    <span>{nights} night{nights > 1 ? 's' : ''}</span>
                    <span className="mx-2">•</span>
                    <span>{formData.adults + formData.children} guest{formData.adults + formData.children > 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {availableRooms.map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>
                
                <div className="flex justify-between pt-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!selectedRoom}
                    className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Continue to Guest Info
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Guest Information */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Guest Information</h2>
                  <button 
                    onClick={() => setStep(2)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ← Back to rooms
                  </button>
                </div>
                
                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{selectedRoom?.name}</span>
                      <span className="font-medium">${selectedRoom?.price} × {nights} nights × {formData.rooms} room</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg">${totalCost}</span>
                    </div>
                  </div>
                </div>
                
                {/* Guest Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={guestInfo.firstName}
                      onChange={(e) => handleGuestInfoChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={guestInfo.lastName}
                      onChange={(e) => handleGuestInfoChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={guestInfo.email}
                      onChange={(e) => handleGuestInfoChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={guestInfo.phone}
                      onChange={(e) => handleGuestInfoChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests
                    </label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any special requests or requirements..."
                    />
                  </div>
                </div>
                
                {/* Payment Method */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={guestInfo.paymentMethod === 'card'}
                        onChange={(e) => handleGuestInfoChange('paymentMethod', e.target.value)}
                        className="mr-2"
                      />
                      <CreditCardIcon className="h-5 w-5 mr-2 text-gray-500" />
                      Credit Card
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <button 
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !guestInfo.firstName || !guestInfo.lastName || !guestInfo.email}
                    className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm Booking
                        <ArrowRightIcon className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}