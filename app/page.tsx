"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { BookingModal } from "./components/BookingModal";
import { LandingScreen } from "./components/LandingScreen";
import { PrivacyPolicyScreen } from "./components/PrivacyPolicyScreen";
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
import {
  deleteClientAccount,
  getAuthErrorMessage,
  getOrCreateClientProfile,
  loginClient,
  loginWithGoogle,
  logoutClient,
  registerClient,
  removeClientPhoto,
  updateClientPhoto,
  type ClientProfile,
} from "../lib/client-auth";
import { auth } from "../lib/firebase";
import { getBarberById, getBarberServices, getBarbers, getBarberSlots, getClientBookings } from "../lib/firestore-read";
import { buildBookingPayload, createBooking } from "../lib/firestore-bookings";
import { buildMercadoPagoPreferencePayload, createMercadoPagoPreference, MP_CREATE_PREFERENCE_URL } from "../lib/mercado-pago";
import { calculateDistanceKm, formatDistanceKm, type Coordinates } from "../lib/distance";
import { BarberAppModal } from "./components/BarberAppModal";
import type { Barber, Booking, PaymentMethodId, Service, TimeSlot } from "./types/booking";

type AuthView = "checking" | "landing" | "privacy" | "login" | "register" | "app";

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
  const [browserLocation, setBrowserLocation] = useState<Coordinates>();
  const [locationRequested, setLocationRequested] = useState(false);
  const [clientProfile, setClientProfile] = useState<ClientProfile>();

  const selectedBarberId = selectedBarber?.id;
  const requestBrowserLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocationRequested(true);
      setBrowserLocation(undefined);
      return;
    }

    setLocationRequested(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setBrowserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setBrowserLocation(undefined);
      },
      { enableHighAccuracy: false, maximumAge: 5 * 60 * 1000, timeout: 8000 }
    );
  }, []);

  const prepareDistanceList = useCallback((barbers: Barber[], options?: { maxDistanceKm?: number; limit?: number }) => {
    return barbers
      .map((barber, index) => {
        const barberLocation = barber.location ?? barber.coordinates;
        const distanceKm = calculateDistanceKm(browserLocation, barberLocation);
        const hasRealDistance = distanceKm !== undefined;
        const mappedBarber = {
          ...barber,
          distance: hasRealDistance ? formatDistanceKm(distanceKm) : "Distancia no disponible",
          distanceKm,
          originalIndex: index,
        };

        return mappedBarber;
      })
      .filter((barber) => !browserLocation || options?.maxDistanceKm === undefined || (barber.distanceKm !== undefined && barber.distanceKm <= options.maxDistanceKm))
      .sort((firstBarber, secondBarber) => {
        const firstDistance = firstBarber.distanceKm;
        const secondDistance = secondBarber.distanceKm;

        if (firstDistance !== undefined && secondDistance !== undefined) return firstDistance - secondDistance;
        if (firstDistance !== undefined) return -1;
        if (secondDistance !== undefined) return 1;

        return firstBarber.originalIndex - secondBarber.originalIndex;
      })
      .slice(0, options?.limit)
      .map((barber) => {
        const { originalIndex, ...visibleBarber } = barber;
        void originalIndex;
        return visibleBarber;
      });
  }, [browserLocation]);
  const visibleBarbers = useMemo(
    () => prepareDistanceList(firebaseFailed ? nearbyBarbers : firebaseBarbers, { maxDistanceKm: 20, limit: 20 }),
    [firebaseBarbers, firebaseFailed, prepareDistanceList]
  );
  const visibleSearchBarbers = useMemo(
    () => prepareDistanceList(firebaseFailed ? searchBarbers : firebaseBarbers),
    [firebaseBarbers, firebaseFailed, prepareDistanceList]
  );
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
      setAuthView("landing");
      return;
    }

    return onAuthStateChanged(auth, async (user) => {
      setAuthError("");

      if (!user) {
        setClientProfile(undefined);
        setAuthView((currentView) => (currentView === "checking" ? "landing" : currentView));
        return;
      }

      try {
        const result = await getOrCreateClientProfile(user);

        if (result.status === "barber") {
          setBarberModalOpen(true);
          await logoutClient();
          setClientProfile(undefined);
          setAuthView("login");
          return;
        }

        console.log("client profile loaded", user.uid, result.profile);
        setClientProfile(result.profile);
        setAuthView("app");
      } catch (error) {
        console.error("auth state profile error", error);
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
        setClientProfile(undefined);
        setAuthView("login");
        return;
      }

      console.log("client profile loaded", result.profile.uid, result.profile);
      setClientProfile(result.profile);
      setAuthView("app");
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  };


  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError("");

    try {
      const result = await loginWithGoogle();

      if (result.status === "barber") {
        setBarberModalOpen(true);
        await logoutClient();
        setClientProfile(undefined);
        setAuthView("login");
        return;
      }

      console.log("client profile loaded", result.profile.uid, result.profile);
      setClientProfile(result.profile);
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
      const result = await registerClient(fullName, email.trim(), password);
      setClientProfile(result.profile);
      setAuthView("app");
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutClient();
    setClientProfile(undefined);
    setActiveTab("home");
    setAuthView("login");
  };

  const handleDeleteAccount = async () => {
    await deleteClientAccount();
    setClientProfile(undefined);
    setActiveTab("home");
    setAuthView("login");
  };

  const handleUpdatePhoto = async (file: File) => {
    const photoURL = await updateClientPhoto(file);
    setClientProfile((profile) => (profile ? { ...profile, photoURL } : profile));
  };

  const handleRemovePhoto = async () => {
    await removeClientPhoto();
    setClientProfile((profile) => (profile ? { ...profile, photoURL: "" } : profile));
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
    if (authView !== "app" || locationRequested) return;
    if (activeTab !== "home" && activeTab !== "search") return;

    requestBrowserLocation();
  }, [activeTab, authView, locationRequested, requestBrowserLocation]);


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
      const bookingInput = {
        barber: selectedBarber,
        clientId: currentUserId,
        paymentMethod: selectedPaymentMethod,
        service: selectedService,
        slot: selectedSlot,
      };
      const payload = buildBookingPayload(bookingInput);

      console.log("booking payload", payload);
      console.log("selected barber", selectedBarber.id);
      console.log("selected slot", selectedSlot);
      console.log("selected service", selectedService);
      console.log("selected payment method", selectedPaymentMethod);

      if (selectedPaymentMethod === "transfer") {
        console.log("mp endpoint", MP_CREATE_PREFERENCE_URL);

        const origin = window.location.origin;
        const mercadoPagoPayload = buildMercadoPagoPreferencePayload({
          booking: payload,
          payerEmail: clientProfile?.email ?? auth?.currentUser?.email ?? "",
          successUrl: `${origin}/?payment=success`,
          failureUrl: `${origin}/?payment=failure`,
          pendingUrl: `${origin}/?payment=pending`,
        });
        const preference = await createMercadoPagoPreference(mercadoPagoPayload);
        const checkoutUrl = preference.init_point || preference.sandbox_init_point;
        if (!checkoutUrl) throw new Error("Mercado Pago no devolvió un link de pago.");
        window.location.href = checkoutUrl;
        return;
      }

      const booking = await createBooking(bookingInput);

      setClientBookings((current) => [{ ...booking, dateTime: [booking.day, booking.startTime].filter(Boolean).join(" · ") }, ...current]);
      setModalOpen(false);
      setConfirmed(true);
    } catch (error) {
      console.error("booking error", error);
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
      clientId={currentUserId}
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
        onRequestLocation={requestBrowserLocation}
        showLocationHint={!browserLocation}
      />
    );
  } else if (activeTab === "search") {
    content = selectedBarber ? (
      renderReservationFlow()
    ) : (
      <SearchScreen
        barbers={visibleSearchBarbers}
        loading={barbersLoading}
        onRequestLocation={requestBrowserLocation}
        onSelectBarber={openBarberProfile}
        showLocationHint={!browserLocation}
      />
    );
  } else if (activeTab === "bookings") {
    content = <BookingsScreen bookings={clientBookings} loading={bookingsLoading} />;
  } else {
    content = (
      <ProfileScreen
        profile={clientProfile}
        onDeleteAccount={handleDeleteAccount}
        onLogout={handleLogout}
        onRemovePhoto={handleRemovePhoto}
        onUpdatePhoto={handleUpdatePhoto}
      />
    );
  }


  if (authView === "checking") {
    return (
      <main className="grid min-h-dvh place-items-center bg-zinc-50 px-4 text-center text-sm font-black text-zinc-500">
        Cargando Clipcut...
      </main>
    );
  }

  if (authView === "landing") {
    return (
      <>
        <LandingScreen
          onBarberClick={() => setBarberModalOpen(true)}
          onPrivacy={() => setAuthView("privacy")}
          onUseClipcut={() => setAuthView("login")}
        />
        <BarberAppModal onClose={() => setBarberModalOpen(false)} open={barberModalOpen} />
      </>
    );
  }

  if (authView === "privacy") {
    return <PrivacyPolicyScreen onBack={() => setAuthView("landing")} />;
  }

  if (authView === "login") {
    return (
      <>
        <LoginScreen
          error={authError}
          loading={authLoading}
          onBack={() => {
            setAuthError("");
            setAuthView("landing");
          }}
          onCreateAccount={() => {
            setAuthError("");
            setAuthView("register");
          }}
          onEnter={handleLogin}
          onGoogle={handleGoogleLogin}
        />
        <BarberAppModal onClose={() => setBarberModalOpen(false)} open={barberModalOpen} />
      </>
    );
  }

  if (authView === "register") {
    return (
      <>
        <RegisterScreen
          error={authError}
          loading={authLoading}
          onBack={() => {
            setAuthError("");
            setAuthView("landing");
          }}
          onEnter={handleRegister}
          onGoogle={handleGoogleLogin}
          onLogin={() => {
            setAuthError("");
            setAuthView("login");
          }}
        />
        <BarberAppModal onClose={() => setBarberModalOpen(false)} open={barberModalOpen} />
      </>
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
