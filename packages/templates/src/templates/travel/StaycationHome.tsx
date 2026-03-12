import React from "react";

import { BookingWidget } from "@vayva/templates/components/travel/BookingWidget";
import { MapPin, Wifi, Coffee, Wind } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function StaycationHome({ store }: { store: any }): React.JSX.Element {
    // Mock Product for Demo
    const mockRoom = {
        id: "room-123",
        title: "Oceanview Deluxe Suite",
        price: 85000,
        description: "Wake up to the sound of waves in this spacious suite featuring a private balcony, king-sized bed, and rain shower.",
        images: ["/images/hotel-room.jpg"]
    };

    return (
        <div className="bg-transparent min-h-screen font-sans">
            {/* Header / Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 h-[500px]">
                <div className="bg-gray-200 bg-[url('/images/hotel-room.jpg')] bg-cover bg-center" />
                <div className="bg-background/50 backdrop-blur-sm hidden md:grid grid-cols-2 gap-1 p-1">
                    <div className="bg-gray-300" />
                    <div className="bg-gray-400" />
                    <div className="bg-background/40 backdrop-blur-sm0" />
                    <div className="bg-gray-600" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
                {/* Main Content */}
                <div>
                    <div className="mb-8 border-b pb-8">
                        <h1 className="text-3xl font-bold mb-2">{mockRoom.title}</h1>
                        <p className="flex items-center text-gray-500"><MapPin className="w-4 h-4 mr-1" /> Lagos, Nigeria</p>
                    </div>

                    <div className="prose max-w-none text-gray-600 mb-8">
                        <p>{mockRoom.description}</p>
                    </div>

                    <h3 className="text-xl font-bold mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="flex items-center gap-3"><Wifi className="w-5 h-5 text-gray-400" /> High-speed Wifi</div>
                        <div className="flex items-center gap-3"><Wind className="w-5 h-5 text-gray-400" /> Air Conditioning</div>
                        <div className="flex items-center gap-3"><Coffee className="w-5 h-5 text-gray-400" /> Breakfast Included</div>
                    </div>
                </div>

                {/* Sidebar Widget */}
                <div>
                    <BookingWidget productId={mockRoom.id} price={mockRoom.price} store={store} />
                </div>
            </div>
        </div>
    );
}
