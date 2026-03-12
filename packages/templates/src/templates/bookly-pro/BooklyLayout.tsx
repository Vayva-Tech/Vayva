import React, { useState } from "react";
import { PublicStore, PublicProduct } from "@vayva/templates/types/storefront";
import { BooklyHeader } from "./components/BooklyHeader";
import { ServiceHero } from "./components/ServiceHero";
import { ServiceList } from "./components/ServiceList";
import { BookingWizard } from "./components/BookingWizard";
import { BookingConfirmation, BookingDetails } from "./components/BookingConfirmation";

interface BooklyLayoutProps {
  store: PublicStore;
  products: PublicProduct[];
}

export const BooklyLayout = ({ store, products }: BooklyLayoutProps): React.JSX.Element => {
  const [selectedService, setSelectedService] = useState<PublicProduct | null>(
    null,
  );
  const [bookingSuccess, setBookingSuccess] = useState<BookingDetails | null>(null);

  const handleBook = (service: PublicProduct) => {
    setSelectedService(service);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBookingComplete = (details: any) => {
    setBookingSuccess(details as BookingDetails);
    setSelectedService(null);
  };

  const handleCloseWizard = () => {
    setSelectedService(null);
  };

  const handleCloseSuccess = () => {
    setBookingSuccess(null);
  };

  return (
    <div className="min-h-screen bg-background/40 backdrop-blur-sm font-sans text-gray-900">
      <BooklyHeader storeName={store.name} phone={store.contact.phone} />

      <main>
        <ServiceHero
          headline={store.tagline || undefined}
          subheadline="Experience the difference of a professional service."
        />

        <ServiceList services={products} onBook={handleBook} />

        {/* Footer Test */}
        <footer className="bg-gray-900 text-white py-12 px-6 text-center">
          <h4 className="font-bold text-lg mb-4">{store.name}</h4>
          <p className="text-gray-400 text-sm mb-8">
            {store.policies?.shipping ||
              "Professional services directly to you."}
          </p>
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Bookly Pro. Powered by Vayva.
          </p>
        </footer>
      </main>

      {/* Modals */}
      {selectedService && (
        <BookingWizard
          service={selectedService}
          onClose={handleCloseWizard}
          onComplete={handleBookingComplete}
        />
      )}

      {bookingSuccess && (
        <BookingConfirmation
          bookingDetails={bookingSuccess}
          onClose={handleCloseSuccess}
        />
      )}
    </div>
  );
};
