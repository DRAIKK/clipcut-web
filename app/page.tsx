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
import { getClientBarberRating } from "../lib/firestore-ratings";
import { createRatingFromWeb } from "../lib/cloud-ratings";
import { createBookingFromWeb } from "../lib/cloud-bookings";
import { createMercadoPagoPreference } from "../lib/mercado-pago";
import { calculateDistanceKm, formatDistanceKm, type Coordinates } from "../lib/distance";
import { getBookingEndMillis, getNextSlotDateRange, isActiveBlockingBooking, isReviewableBooking, isVisibleUpcomingBooking, toBookingMillis } from "./booking-rules";
import { BarberAppModal } from "./components/BarberAppModal";
import { AccessRequiredModal } from "./components/AccessRequiredModal";
import type { Barber, Booking, PaymentMethodId, Service, TimeSlot } from "./types/booking";

type SlotWithTimeAliases = TimeSlot & { start?: string; end?: string };
type BarberWithLocationAddress = Barber & { location?: Barber["location"] & { address?: string } };

function parseServicePrice(price: string) {
  const normalized = price.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : price;
}

function isPresentBookingField(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) && value > 0;
  return typeof value === "string" && value.trim().length > 0;
}


type AuthView = "checking" | "landing" | "privacy" | "login" | "register" | "app";

const PAYMENT_RETURN_STORAGE_KEY = "clipcut:payment-return";

function getSafeReturnTo() {
  if (typeof window === "undefined") return undefined;

  const returnTo = new URLSearchParams(window.location.search).get("returnTo");
  return returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : undefined;
}

function getCurrentReturnTo() {
  if (typeof window === "undefined") return "/";

  const url = new URL(window.location.href);
  url.searchParams.delete("returnTo");
  return `${url.pathname}${url.search}${url.hash}`;
}

function getPaymentReturnUrls() {
  if (typeof window === "undefined") {
    return {
      successUrl: "http://localhost:3000/payment-success",
      failureUrl: "http://localhost:3000/payment-failure",
      pendingUrl: "http://localhost:3000/payment-pending",
    };
  }

  const origin = window.location.hostname === "localhost" ? "http://localhost:3000" : window.location.origin;

  return {
    successUrl: `${origin}/payment-success`,
    failureUrl: `${origin}/payment-failure`,
    pendingUrl: `${origin}/payment-pending`,
  };
}

type HomeProps = {
  publicBarberId?: string;
};

export default function Home({ publicBarberId }: HomeProps) {
  const [selectedBarber, setSelectedBarber] = useState<Barber>();
  const [selectedService, setSelectedService] = useState<Service>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>();
  const [modalOpen, setModalOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>(() => (publicBarberId ? "search" : "home"));
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
  const [ratedBarberIds, setRatedBarberIds] = useState<Record<string, number>>({});
  const [ratingSubmittingBarberId, setRatingSubmittingBarberId] = useState<string>();
  const [ratingErrors, setRatingErrors] = useState<Record<string, string>>({});
  const [paymentReturnMessage, setPaymentReturnMessage] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const selectedBarberId = selectedBarber?.id;
  const isPublicProfile = Boolean(publicBarberId);
  const profileRefreshTick = Math.floor(now / (60 * 1000));
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
  const upcomingBooking = useMemo(() => {
    return clientBookings
      .filter((booking) => isVisibleUpcomingBooking(booking, now))
      .sort((firstBooking, secondBooking) => {
        const firstStart = toBookingMillis(firstBooking.startAt) ?? getBookingEndMillis(firstBooking, now) ?? Number.MAX_SAFE_INTEGER;
        const secondStart = toBookingMillis(secondBooking.startAt) ?? getBookingEndMillis(secondBooking, now) ?? Number.MAX_SAFE_INTEGER;

        return firstStart - secondStart;
      })[0];
  }, [clientBookings, now]);
  const reviewableBarbers = useMemo(() => {
    const seen = new Set<string>();

    return clientBookings
      .filter(isReviewableBooking)
      .map((booking) => {
        const barber = (firebaseFailed ? nearbyBarbers : firebaseBarbers).find((candidate) => candidate.id === booking.barberId);
        return {
          id: booking.barberId,
          name: booking.barberName || barber?.name || "Peluquero Clipcut",
          photoUrl: barber?.photoUrl,
          initials: barber?.initials || (booking.barberName || "CC").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
        };
      })
      .filter((barber) => {
        if (!barber.id || seen.has(barber.id)) return false;
        seen.add(barber.id);
        return true;
      });
  }, [clientBookings, firebaseBarbers, firebaseFailed]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

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
      setAuthView(publicBarberId ? "app" : "landing");
      return;
    }

    return onAuthStateChanged(auth, async (user) => {
      setAuthError("");

      if (!user) {
        setClientProfile(undefined);
        setRatedBarberIds({});
        setAuthView((currentView) => (currentView === "checking" ? (publicBarberId ? "app" : "landing") : currentView));
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
  }, [publicBarberId]);

  const finishAuthentication = () => {
    const returnTo = getSafeReturnTo();

    if (returnTo && returnTo !== getCurrentReturnTo()) {
      window.location.replace(returnTo);
      return;
    }

    setAuthView("app");
  };

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
      finishAuthentication();
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
      finishAuthentication();
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
      finishAuthentication();
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutClient();
    setClientProfile(undefined);
    setRatedBarberIds({});
    setActiveTab("home");
    setAuthView("login");
  };

  const handleDeleteAccount = async () => {
    await deleteClientAccount();
    setClientProfile(undefined);
    setRatedBarberIds({});
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
  const openRatedBarberProfile = (barberId: string) => {
    const barber = (firebaseFailed ? nearbyBarbers : firebaseBarbers).find((candidate) => candidate.id === barberId);
    if (barber) openBarberProfile(barber);
  };

  useEffect(() => {
    if (authView !== "app" || !publicBarberId || selectedBarber?.id === publicBarberId) return;

    const barberId = publicBarberId;
    let ignore = false;

    async function openPublicBarberProfile() {
      try {
        const barber = await getBarberById(barberId);
        if (ignore) return;

        setSelectedBarber(barber);
        setSelectedSlot(undefined);
        setSelectedService(undefined);
        setSelectedPaymentMethod(undefined);
        setBookingError("");
        setProfileSlots([]);
        setProfileServices([]);
        setActiveTab("search");
      } catch (error) {
        console.warn("No se pudo abrir el perfil público del peluquero.", error);
      }
    }

    openPublicBarberProfile();

    return () => {
      ignore = true;
    };
  }, [authView, publicBarberId, selectedBarber?.id]);

  useEffect(() => {
    if (authView !== "app" || locationRequested) return;
    if (activeTab !== "home" && activeTab !== "search") return;

    requestBrowserLocation();
  }, [activeTab, authView, locationRequested, requestBrowserLocation]);


  useEffect(() => {
    if (!selectedBarberId) return;

    const barberId = selectedBarberId;
    let ignore = false;

    async function loadProfile() {
      setProfileLoading(true);
      setServicesLoading(true);
      try {
        const [freshBarber, slots, services] = await Promise.all([
          getBarberById(barberId),
          getBarberSlots(barberId),
          getBarberServices(barberId),
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
  }, [firebaseFailed, profileRefreshTick, selectedBarberId]);


  const refreshClientBookings = useCallback(async () => {
    if (!currentUserId || authView !== "app") return;

    setBookingsLoading(true);
    try {
      const bookings = await getClientBookings(currentUserId);
      setClientBookings(bookings);
    } catch (error) {
      console.warn("No se pudieron cargar reservas reales.", error);
      setClientBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [authView, currentUserId]);

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


  useEffect(() => {
    if (!currentUserId || reviewableBarbers.length === 0) return;

    let ignore = false;

    async function loadClientRatings() {
      const entries = await Promise.all(
        reviewableBarbers.map(async (barber) => {
          try {
            const rating = await getClientBarberRating(currentUserId, barber.id);
            return rating ? ([barber.id, rating] as const) : undefined;
          } catch (error) {
            console.warn("No se pudo cargar la calificación del peluquero.", error);
            return undefined;
          }
        })
      );

      if (!ignore) {
        setRatedBarberIds((currentRatings) => ({
          ...currentRatings,
          ...Object.fromEntries(entries.filter((entry): entry is readonly [string, number] => Boolean(entry))),
        }));
      }
    }

    void loadClientRatings();

    return () => {
      ignore = true;
    };
  }, [currentUserId, reviewableBarbers]);

  const handleRateBarber = async (barberId: string, rating: number) => {
    const canRateBarber = reviewableBarbers.some((barber) => barber.id === barberId);
    if (!currentUserId || !canRateBarber || ratingSubmittingBarberId) return;
    if (ratedBarberIds[barberId]) {
      setRatingErrors((errors) => ({ ...errors, [barberId]: "Ya calificaste a este peluquero." }));
      return;
    }

    setRatingSubmittingBarberId(barberId);
    setRatingErrors((errors) => ({ ...errors, [barberId]: "" }));
    try {
      const updatedRating = await createRatingFromWeb({ barberId, clientId: currentUserId, rating });
      setRatedBarberIds((ratings) => ({ ...ratings, [barberId]: rating }));
      setFirebaseBarbers((barbers) =>
        barbers.map((barber) => (barber.id === barberId ? { ...barber, rating: updatedRating.ratingAvg, ratingCount: updatedRating.ratingCount } : barber))
      );
    } catch (error) {
      console.warn("No se pudo guardar la calificación del peluquero.", error);
      const message = error instanceof Error ? error.message : "No se pudo enviar la calificación. Probá nuevamente.";
      setRatingErrors((errors) => ({ ...errors, [barberId]: message }));
      if (message.toLowerCase().includes("ya calificaste")) {
        const savedRating = await getClientBarberRating(currentUserId, barberId);
        if (savedRating) setRatedBarberIds((ratings) => ({ ...ratings, [barberId]: savedRating }));
      }
    } finally {
      setRatingSubmittingBarberId(undefined);
    }
  };

  useEffect(() => {
    if (authView !== "app") return;

    const paymentReturnStatus = window.localStorage.getItem(PAYMENT_RETURN_STORAGE_KEY);
    if (paymentReturnStatus) {
      window.localStorage.removeItem(PAYMENT_RETURN_STORAGE_KEY);
      setActiveTab("home");
      void refreshClientBookings();

      if (paymentReturnStatus === "success") {
        setPaymentReturnMessage("Pago aprobado. Estamos actualizando tus reservas con la confirmación de Mercado Pago.");
        const refreshAttempts = [1500, 3500, 7000];
        refreshAttempts.forEach((delay) => {
          window.setTimeout(() => void refreshClientBookings(), delay);
        });
      } else if (paymentReturnStatus === "pending") {
        setPaymentReturnMessage("Pago pendiente. Actualizamos tus reservas y volveremos a mostrar el estado cuando Mercado Pago confirme.");
      } else if (paymentReturnStatus === "failure") {
        setPaymentReturnMessage("El pago no se completó. Revisá tus reservas o intentá nuevamente cuando quieras.");
      }
    }

    const refreshOnReturn = () => {
      if (document.visibilityState === "visible") void refreshClientBookings();
    };

    window.addEventListener("focus", refreshClientBookings);
    document.addEventListener("visibilitychange", refreshOnReturn);

    return () => {
      window.removeEventListener("focus", refreshClientBookings);
      document.removeEventListener("visibilitychange", refreshOnReturn);
    };
  }, [authView, refreshClientBookings]);

  const resetBookingModalState = () => {
    setModalOpen(false);
    setSelectedService(undefined);
    setSelectedPaymentMethod(undefined);
    setBookingError("");
  };

  const requireAuthentication = () => {
    setAccessModalOpen(true);
  };

  const continueOnWeb = () => {
    const returnTo = getCurrentReturnTo();
    const url = new URL(window.location.href);
    url.searchParams.set("returnTo", returnTo);
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    setAccessModalOpen(false);
    setAuthError("");
    setAuthView("login");
  };

  const handlePublicBarberBack = () => {
    if (!isPublicProfile) {
      setSelectedBarber(undefined);
      setActiveTab("search");
      return;
    }

    if (currentUserId) {
      window.location.assign("/");
      return;
    }

    requireAuthentication();
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setSelectedPaymentMethod(undefined);
    setBookingError("");
  };

  const handleConfirmBooking = async () => {
    setBookingError("");

    if (!currentUserId) {
      resetBookingModalState();
      requireAuthentication();
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
    if (!selectedBarber.paymentMethods?.some((method) => method.id === selectedPaymentMethod)) {
      setBookingError("Este método de pago ya no está disponible para este peluquero.");
      return;
    }

    setBookingSubmitting(true);
    try {
      const latestBookings = await getClientBookings(currentUserId);
      setClientBookings(latestBookings);

      if (latestBookings.some((booking) => isActiveBlockingBooking(booking, Date.now()))) {
        setBookingError("Ya tenés una reserva activa. Podés hacer otra cuando finalice o se cancele.");
        return;
      }

      const clientEmail = auth?.currentUser?.email ?? clientProfile?.email ?? "";
      const clientName = clientProfile?.fullName ?? auth?.currentUser?.displayName ?? clientEmail;
      const barberWithAddress = selectedBarber as BarberWithLocationAddress;
      const slotWithAliases = selectedSlot as SlotWithTimeAliases;
      const startTime = selectedSlot.startTime ?? slotWithAliases.start ?? "";
      const endTime = selectedSlot.endTime ?? slotWithAliases.end ?? "";
      const dateRange = getNextSlotDateRange(selectedSlot.day, startTime, endTime);
      if (!dateRange) {
        setBookingError("No se pudo calcular la fecha del horario seleccionado.");
        return;
      }
      const payload = {
        barberId: selectedBarber.id,
        barberName: selectedBarber.name,
        barberAddress: selectedBarber.address || barberWithAddress.location?.address || "",
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: parseServicePrice(selectedService.price),
        slotId: selectedSlot.id,
        day: selectedSlot.day ?? "",
        startTime,
        endTime,
        startAt: dateRange.startAt,
        endAt: dateRange.endAt,
        clientId: currentUserId,
        clientName,
        clientEmail,
        paymentMethod: selectedPaymentMethod === "transfer" ? ("mp" as const) : selectedPaymentMethod,
      };
      const missingPayloadFields = Object.entries(payload)
        .filter(([, value]) => !isPresentBookingField(value))
        .map(([field]) => field);

      if (missingPayloadFields.length > 0) {
        setBookingError(`No se puede crear la reserva: faltan campos requeridos (${missingPayloadFields.join(", ")}).`);
        return;
      }

      const { bookingId } = await createBookingFromWeb(payload);

      if (selectedPaymentMethod === "cash") {
        await refreshClientBookings();
        setConfirmed(true);
        resetBookingModalState();
        return;
      }

      const preference = await createMercadoPagoPreference({
        barberId: selectedBarber.id,
        bookingId,
        title: selectedService.name,
        paymentType: selectedPaymentMethod === "deposit" ? "deposit" : "mp",
        ...getPaymentReturnUrls(),
      });
      const checkoutUrl = preference.init_point ?? preference.sandbox_init_point;

      if (!checkoutUrl) {
        throw new Error("Mercado Pago no devolvió un link de pago.");
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("create booking from web error", {
        code: error instanceof Error && "code" in error ? (error as { code?: unknown }).code : undefined,
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : undefined,
        stack: error instanceof Error ? error.stack : undefined,
        raw: error,
      });
      setBookingError(error instanceof Error ? error.message : "No se pudo crear la reserva. Intentá nuevamente.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const renderReservationFlow = () => (
    <PublicBarberProfile
      barber={selectedBarber ?? mockBarber}
      onBackToSearch={handlePublicBarberBack}
      onReserve={() => setModalOpen(true)}
      onSelectSlot={setSelectedSlot}
      selectedSlot={selectedSlot}
      loading={profileLoading}
      slots={profileSlots}
      clientId={currentUserId}
      onRequireAuthentication={requireAuthentication}
    />
  );

  let content = null;

  if (confirmed) {
    content = (
      <section className="flex min-h-[calc(100dvh-13rem)] flex-col justify-center">
        <LogoHeader subtitle="Solicitud enviada" />
        <div className="rounded-[2.25rem] bg-white p-6 text-center shadow-2xl shadow-green-950/10 ring-1 ring-zinc-200/70">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-green-100 text-5xl">
            ✓
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-green-600">
            Solicitud enviada
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">El peluquero debe aceptar tu solicitud para confirmar el turno.</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Cuando el peluquero confirme la reserva, te vamos a avisar con una notificación.
          </p>
          <div className="mt-6 rounded-3xl bg-zinc-50 p-4 text-left">
            <p className="text-sm font-black text-zinc-950">{(selectedBarber ?? mockBarber).name}</p>
            <p className="mt-1 text-sm text-zinc-500">{(selectedBarber ?? mockBarber).address}</p>
          </div>
          <button
            className="mt-6 h-14 w-full rounded-2xl bg-green-600 font-black text-white shadow-xl shadow-green-600/25 transition active:scale-[0.98]"
            onClick={() => {
              setConfirmed(false);
              setActiveTab("home");
            }}
            type="button"
          >
            Volver al inicio
          </button>
        </div>
      </section>
    );
  } else if (activeTab === "home") {
    content = (
      <HomeScreen
        barbers={visibleBarbers}
        bookingBarbers={firebaseFailed ? nearbyBarbers : firebaseBarbers}
        loading={barbersLoading}
        onSearchBarbers={() => {
          setSelectedBarber(undefined);
          setActiveTab("search");
        }}
        onSelectBarber={openBarberProfile}
        activeBooking={upcomingBooking}
        paymentReturnMessage={paymentReturnMessage}
        reviewableBarbers={reviewableBarbers}
        ratedBarberIds={ratedBarberIds}
        ratingErrors={ratingErrors}
        ratingSubmittingBarberId={ratingSubmittingBarberId}
        onRateBarber={handleRateBarber}
        onViewBarberProfile={openRatedBarberProfile}
        onRequestLocation={requestBrowserLocation}
        showLocationHint={!browserLocation}
      />
    );
  } else if (activeTab === "search") {
    content = selectedBarber ? (
      renderReservationFlow()
    ) : publicBarberId ? (
      <section className="flex min-h-[calc(100dvh-10rem)] items-center justify-center">
        <p className="text-sm font-black text-zinc-500">Cargando perfil y horarios...</p>
      </section>
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
    content = <BookingsScreen barbers={firebaseFailed ? nearbyBarbers : firebaseBarbers} bookings={clientBookings} loading={bookingsLoading} now={now} />;
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
    <main className={`min-h-dvh bg-zinc-50 px-4 text-zinc-950 ${activeTab === "home" && !confirmed ? "overflow-hidden py-3" : "py-5"}`}>
      <div className={`mx-auto w-full max-w-md ${activeTab === "home" && !confirmed ? "pb-24" : "pb-32"}`}>{content}</div>
      {!isPublicProfile || currentUserId ? (
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
      ) : null}
      <AccessRequiredModal onClose={() => setAccessModalOpen(false)} onContinueOnWeb={continueOnWeb} open={accessModalOpen} />
      <BookingModal
        onClose={resetBookingModalState}
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
