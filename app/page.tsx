"use client";

import { useEffect, useState } from "react";
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
import { getBarberById, getBarberServices, getBarbers, getBarberSlots } from "../lib/firestore-read";
import { BarberAppModal } from "./components/BarberAppModal";
import type { Barber, Service, TimeSlot } from "./types/booking";

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

  const selectedBarberId = selectedBarber?.id;
  const visibleBarbers = firebaseFailed ? nearbyBarbers : firebaseBarbers;
  const visibleSearchBarbers = firebaseFailed ? searchBarbers : firebaseBarbers;

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
            Te esperamos para {selectedService?.name} a las {selectedSlot?.label}. Esta es una confirmación mock para la versión web de Clipcut.
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
      />
    );
  } else if (activeTab === "search") {
    content = selectedBarber ? renderReservationFlow() : <SearchScreen barbers={visibleSearchBarbers} loading={barbersLoading} onSelectBarber={openBarberProfile} />;
  } else if (activeTab === "bookings") {
    content = <BookingsScreen />;
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
          }
          setActiveTab(tab);
        }}
      />
      <BookingModal
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          setModalOpen(false);
          setConfirmed(true);
        }}
        open={modalOpen}
        service={selectedService}
        services={profileServices}
        servicesLoading={servicesLoading}
        emptyServicesMessage="Este peluquero todavía no agregó servicios."
        slot={selectedSlot}
        onSelectService={setSelectedService}
      />
    </main>
  );
}
