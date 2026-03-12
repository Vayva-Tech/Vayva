import React from "react";

export const RecentDonations = (): React.JSX.Element => {
  const donations = [
    { name: "Anonymous", amount: 5000, time: "2 mins ago" },
    {
      name: "Sarah J.",
      amount: 25000,
      time: "5 mins ago",
      message: "Keep up the great work!",
    },
    { name: "Michael O.", amount: 10000, time: "12 mins ago" },
    {
      name: "Faith K.",
      amount: 50000,
      time: "1 hour ago",
      message: "Sending love from Lagos.",
    },
  ];

  return (
    <div className="bg-transparent border-t border-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h3 className="font-bold text-xl text-gray-900 mb-8">
          Recent Donations
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {donations.map((d, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-xl hover:bg-white/60 transition-colors"
            >
              <div className="w-12 h-12 bg-green-100 text-[#16A34A] rounded-full flex items-center justify-center font-bold text-lg">
                {d.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900">{d.name}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-[#16A34A] font-bold">
                    donated ₦{d.amount.toLocaleString()}
                  </span>
                </div>
                {d.message && (
                  <p className="text-sm text-gray-600 italic">"{d.message}"</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{d.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
