"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { BookingModal } from "./components/BookingModal";
import { LoginScreen } from "./components/LoginScreen";
import { RegisterScreen } from "./components/RegisterScreen";
import { BookingsScreen } from "./components/BookingsScreen";
import { BottomTabs, type TabId } from "./components/BottomTabs";
import { HomeScreen } from "./components/HomeScreen";
import { LogoHeader } from "./components/LogoHeader";
import { ProfileScreen } from "./components/ProfileScreen";
import { PublicBarberProfile } from "./components/PublicBarberProfile";
import { SearchScreen } from "./components/SearchScreen";
import {
  mockBarber,
  mockServices,
  mockTimeSlots,
  nearbyBarbers,
  searchBarbers,
} from "./data/mockBooking";
import { getAuthErrorMessage, getOrCreateClientProfile, loginClient, logoutClient, registerClient } from "../lib/client-auth";
import { auth } from "../lib/firebase";
import { getBarberById, getBarberServices, getBarbers, getBarberSlots, getClientBookings } from "../lib/firestore-read";
import { createBooking } from "../lib/firestore-bookings";
import { calculateDistanceKm, formatDistanceKm, parseDistanceKm, type Coordinates } from "../lib/distance";
import { BarberAppModal } from "./components/BarberAppModal";
import type { Barber, Booking, PaymentMethodId, Service, TimeSlot } from "./types/booking";

type AuthView = "checking" | "login" | "register" | "app";

export default function Home() {
  const [selectedBarber, setSelectedBarber] = useState<Barber>();
  const [selectedService, setSelectedService] = useState<Service>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [authView, setAuthView] = useState<AuthView>("checking");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [barberModalOpen, setBarberModalOpen] = useState(false);
  const [firebaseBarbers, setFirebaseBarbers] = useState<Barber[]>([]);
  const [barbersLoading, setBarbersLoading] = useState(false);
  const [profileSlots, setProfileSlots] = useState<TimeSlot[]>([]);
  const [profileServices, setProfileServices] = useState<Service[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [firebaseFailed, setFirebaseFailed] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodId>();
  const [bookingError, setBookingError] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [clientBookings, setClientBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [clientCoordinates, setClientCoordinates] = useState<Coordinates>();

  const selectedBarberId = selectedBarber?.id;
  const prepareDistanceList = (barbers: Barber[]) =>
    barbers
      .map((barber) => {
        const realDistanceKm = calculateDistanceKm(clientCoordinates, barber.coordinates);
        const fallbackDistanceKm = barber.distanceKm ?? parseDistanceKm(barber.distance);
        const distanceKm = realDistanceKm ?? fallbackDistanceKm;

        return {
          ...barber,
          distance: realDistanceKm !== undefined ? formatDistanceKm(realDistanceKm) : barber.distance || "Ubicación no disponible",
          distanceKm,
        };
      })
      .filter((barber) => barber.distanceKm === undefined || barber.distanceKm <= 20)
      .sort((firstBarber, secondBarber) => (firstBarber.distanceKm ?? Number.POSITIVE_INFINITY) - (secondBarber.distanceKm ?? Number.POSITIVE_INFINITY))
      .slice(0, 20);
  const visibleBarbers = prepareDistanceList(firebaseFailed ? nearbyBarbers : firebaseBarbers);
  const visibleSearchBarbers = prepareDistanceList(firebaseFailed ? searchBarbers : firebaseBarbers);
  const currentUserId = auth?.currentUser?.uid ?? "";
  const activeBooking = useMemo(() => clientBookings.find((booking) => booking.status !== "cancelled"), [clientBookings]);

  useEffect(() => {
    let ignore = false;

    async function loadBarbers() {
      setBarbersLoading(true);
      try {
        const barbers = await getBarbers();
        if (!ignore) {
          setFirebaseBarbers(barbers);
          setFirebaseFailed(false);
        }
      } catch (error) {
        console.warn("No se pudieron cargar peluqueros desde Firebase. Usando mocks.", error);
        if (!ignore) setFirebaseFailed(true);
      } finally {
        if (!ignore) setBarbersLoading(false);
      }
    }

    loadBarbers();

    return () => {
      ignore = true;
    };
  }, []);


  useEffect(() => {
    if (!auth) {
      setAuthView("login");
      return;
    }

    return onAuthStateChanged(auth, async (user) => {
      setAuthError("");

      if (!user) {
        setAuthView("login");
        return;
      }

      try {
        const result = await getOrCreateClientProfile(user);

        if (result.status === "barber") {
          setBarberModalOpen(true);
          await logoutClient();
          setAuthView("login");
          return;
        }

        setClientCoordinates(result.profile.coordinates);
        setAuthView("app");
      } catch (error) {
        setAuthError(getAuthErrorMessage(error));
        setAuthView("login");
      }
    });
  }, []);

  const handleLogin = async (email: string, password: string) => {
    if (!email.trim() || !password) {
      setAuthError("Completá tu correo y contraseña para ingresar.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const result = await loginClient(email.trim(), password);

      if (result.status === "barber") {
        setBarberModalOpen(true);
        await logoutClient();
        setAuthView("login");
        return;
      }

      setClientCoordinates(result.profile.coordinates);
      setAuthView("app");
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (fullName: string, email: string, password: string) => {
    if (!fullName.trim() || !email.trim() || !password) {
      setAuthError("Completá nombre, correo y contraseña para crear tu cuenta.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      await registerClient(fullName, email.trim(), password);
      setClientCoordinates(undefined);
      setAuthView("app");
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutClient();
    setActiveTab("home");
    setAuthView("login");
  };

  const openBarberProfile = (barber: Barber) => {
    setSelectedBarber(barber);
    setSelectedSlot(undefined);
    setSelectedService(undefined);
    setSelectedPaymentMethod(undefined);
    setBookingError("");
    setProfileSlots(firebaseFailed ? mockTimeSlots : []);
    setProfileServices(firebaseFailed ? mockServices : []);
    setActiveTab("search");
  };

  useEffect(() => {
    if (!selectedBarberId) return;

    let ignore = false;

    async function loadProfile() {
      setProfileLoading(true);
      setServicesLoading(true);
      try {
        const [freshBarber, slots, services] = await Promise.all([
          getBarberById(selectedBarberId),
          getBarberSlots(selectedBarberId),
          getBarberServices(selectedBarberId),
        ]);

        if (ignore) return;
        setSelectedBarber(freshBarber);
        setProfileSlots(slots);
        setProfileServices(services);
        setSelectedService((currentService) =>
          currentService && services.some((service) => service.id === currentService.id) ? currentService : undefined
        );
        setSelectedPaymentMethod((currentMethod) =>
          currentMethod && freshBarber.paymentMethods?.some((method) => method.id === currentMethod) ? currentMethod : undefined
        );
      } catch (error) {
        console.warn("No se pudo cargar el perfil desde Firebase. Usando mocks.", error);
        if (!ignore) {
          setProfileSlots(mockTimeSlots);
          setProfileServices(mockServices);
        }
      } finally {
        if (!ignore) {
          setProfileLoading(false);
          setServicesLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [firebaseFailed, selectedBarberId]);


  useEffect(() => {
    if (!currentUserId || authView !== "app") return;

    let ignore = false;

    async function loadBookings() {
      setBookingsLoading(true);
      try {
        const bookings = await getClientBookings(currentUserId);
        if (!ignore) setClientBookings(bookings);
      } catch (error) {
        console.warn("No se pudieron cargar reservas reales.", error);
        if (!ignore) setClientBookings([]);
      } finally {
        if (!ignore) setBookingsLoading(false);
      }
    }

    loadBookings();

    return () => {
      ignore = true;
    };
  }, [authView, currentUserId]);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setSelectedPaymentMethod(undefined);
  };

  const handleConfirmBooking = async () => {
    setBookingError("");

    if (!currentUserId) {
      setBookingError("Iniciá sesión para reservar.");
      return;
    }
    if (!selectedBarber || !selectedService || !selectedSlot || !selectedPaymentMethod) {
      setBookingError("Elegí servicio, horario y método de pago para continuar.");
      return;
    }
    if (!selectedSlot.available) {
      setBookingError("Ese horario ya fue reservado. Elegí otro turno.");
      return;
    }

    setBookingSubmitting(true);
    try {
      const booking = await createBooking({
        barber: selectedBarber,
        clientId: currentUserId,
        paymentMethod: selectedPaymentMethod,
        service: selectedService,
        slot: selectedSlot,
      });

      if (selectedPaymentMethod === "transfer") {
        const response = await fetch("/api/mp/create-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: booking.id, barberId: selectedBarber.id, clientId: currentUserId }),
        });

        if (!response.ok) throw new Error("No se pudo iniciar Mercado Pago. Probá nuevamente.");
        const preference = await response.json();
        const checkoutUrl = preference.init_point ?? preference.url ?? preference.checkoutUrl;
        if (!checkoutUrl) throw new Error("Mercado Pago no devolvió un link de pago.");
        window.location.href = checkoutUrl;
        return;
      }

      setClientBookings((current) => [{ ...booking, dateTime: [booking.day, booking.startTime].filter(Boolean).join(" · ") }, ...current]);
      setModalOpen(false);
      setConfirmed(true);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : "No se pudo crear la reserva. Intentá nuevamente.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const renderReservationFlow = () => (
    <PublicBarberProfile
      barber={selectedBarber ?? mockBarber}
      onBackToSearch={() => {
        setSelectedBarber(undefined);
        setActiveTab("search");
      }}
      onReserve={() => setModalOpen(true)}
      onSelectSlot={setSelectedSlot}
      selectedSlot={selectedSlot}
      loading={profileLoading}
      slots={profileSlots}
    />
  );

  let content = null;

  if (confirmed) {
    content = (
      <section className="flex min-h-[calc(100dvh-13rem)] flex-col justify-center">
        <LogoHeader subtitle="Reserva confirmada" />
        <div className="rounded-[2.25rem] bg-white p-6 text-center shadow-2xl shadow-green-950/10 ring-1 ring-zinc-200/70">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-green-100 text-5xl">
            ✓
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-green-600">
            Reserva confirmada
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">¡Tu turno está listo!</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Solicitud enviada al peluquero.
          </p>
          <div className="mt-6 rounded-3xl bg-zinc-50 p-4 text-left">
            <p className="text-sm font-black text-zinc-950">{(selectedBarber ?? mockBarber).name}</p>
            <p className="mt-1 text-sm text-zinc-500">{(selectedBarber ?? mockBarber).address}</p>
          </div>
          <button
            className="mt-6 h-14 w-full rounded-2xl bg-green-600 font-black text-white shadow-xl shadow-green-600/25 transition active:scale-[0.98]"
            onClick={() => setConfirmed(false)}
            type="button"
          >
            Hacer otra reserva
          </button>
        </div>
      </section>
    );
  } else if (activeTab === "home") {
    content = (
      <HomeScreen
        barbers={visibleBarbers}
        loading={barbersLoading}
        onSearchBarbers={() => {
          setSelectedBarber(undefined);
          setActiveTab("search");
        }}
        onSelectBarber={openBarberProfile}
        activeBooking={activeBooking}
      />
    );
  } else if (activeTab === "search") {
    content = selectedBarber ? renderReservationFlow() : <SearchScreen barbers={visibleSearchBarbers} loading={barbersLoading} onSelectBarber={openBarberProfile} />;
  } else if (activeTab === "bookings") {
    content = <BookingsScreen bookings={clientBookings} loading={bookingsLoading} />;
  } else {
    content = <ProfileScreen onLogout={handleLogout} />;
  }


  if (authView === "checking") {
    return (
      <main className="grid min-h-dvh place-items-center bg-zinc-50 px-4 text-center text-sm font-black text-zinc-500">
        Cargando Clipcut...
      </main>
    );
  }

  if (authView === "login") {
    return (
      <>
        <LoginScreen
          error={authError}
          loading={authLoading}
          onCreateAccount={() => {
            setAuthError("");
            setAuthView("register");
          }}
          onEnter={handleLogin}
        />
        <BarberAppModal onClose={() => setBarberModalOpen(false)} open={barberModalOpen} />
      </>
    );
  }

  if (authView === "register") {
    return (
      <RegisterScreen
        error={authError}
        loading={authLoading}
        onEnter={handleRegister}
        onLogin={() => {
          setAuthError("");
          setAuthView("login");
        }}
      />
    );
  }

  return (
    <main className="min-h-dvh bg-zinc-50 px-4 py-5 text-zinc-950">
      <div className="mx-auto w-full max-w-md pb-32">{content}</div>
      <BottomTabs
        activeTab={activeTab}
        onChange={(tab) => {
          setConfirmed(false);
          if (tab === "search") {
            setSelectedBarber(undefined);
            setSelectedService(undefined);
            setSelectedSlot(undefined);
            setSelectedPaymentMethod(undefined);
            setBookingError("");
          }
          setActiveTab(tab);
        }}
      />
      <BookingModal
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmBooking}
        open={modalOpen}
        service={selectedService}
        services={profileServices}
        servicesLoading={servicesLoading}
        emptyServicesMessage="Este peluquero todavía no agregó servicios."
        slot={selectedSlot}
        paymentMethods={selectedBarber?.paymentMethods ?? []}
        selectedPaymentMethod={selectedPaymentMethod}
        onSelectPaymentMethod={setSelectedPaymentMethod}
        error={bookingError}
        submitting={bookingSubmitting}
        onSelectService={handleSelectService}
      />
    </main>
  );
}
