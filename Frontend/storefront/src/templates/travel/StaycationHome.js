import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BookingWidget } from "@/components/travel/BookingWidget";
import { MapPin, Wifi, Coffee, Wind } from "lucide-react";
export default function StaycationHome({ store }) {
    // Mock Product for Demo
    const mockRoom = {
        id: "room-123",
        title: "Oceanview Deluxe Suite",
        price: 85000,
        description: "Wake up to the sound of waves in this spacious suite featuring a private balcony, king-sized bed, and rain shower.",
        images: ["/images/hotel-room.jpg"]
    };
    return (_jsxs("div", { className: "bg-background/70 backdrop-blur-xl min-h-screen font-sans", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 h-[500px]", children: [_jsx("div", { className: "bg-gray-200 bg-[url('/images/hotel-room.jpg')] bg-cover bg-center" }), _jsxs("div", { className: "bg-background/50 backdrop-blur-sm hidden md:grid grid-cols-2 gap-1 p-1", children: [_jsx("div", { className: "bg-gray-300" }), _jsx("div", { className: "bg-gray-400" }), _jsx("div", { className: "bg-background/40 backdrop-blur-sm0" }), _jsx("div", { className: "bg-gray-600" })] })] }), _jsxs("div", { className: "max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12", children: [_jsxs("div", { children: [_jsxs("div", { className: "mb-8 border-b pb-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: mockRoom.title }), _jsxs("p", { className: "flex items-center text-gray-500", children: [_jsx(MapPin, { className: "w-4 h-4 mr-1" }), " Lagos, Nigeria"] })] }), _jsx("div", { className: "prose max-w-none text-gray-600 mb-8", children: _jsx("p", { children: mockRoom.description }) }), _jsx("h3", { className: "text-xl font-bold mb-4", children: "Amenities" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-8", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Wifi, { className: "w-5 h-5 text-gray-400" }), " High-speed Wifi"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Wind, { className: "w-5 h-5 text-gray-400" }), " Air Conditioning"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Coffee, { className: "w-5 h-5 text-gray-400" }), " Breakfast Included"] })] })] }), _jsx("div", { children: _jsx(BookingWidget, { productId: mockRoom.id, price: mockRoom.price, store: store }) })] })] }));
}
