import { useState, useEffect, useCallback, useRef } from "react";
import api from "../api/client";
import { Pill, Store, MapPin, Mail, ClipboardList, Map, CheckCircle2, X, AlertTriangle, Search, Star } from "lucide-react";

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";

// ── Load Google Maps JS API once ─────────────────────────────────────────────
let _mapsState = "idle";
function loadGoogleMaps(key) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(); return; }
    if (_mapsState === "ready") { resolve(); return; }
    if (_mapsState === "loading") {
      const poll = setInterval(() => { if (window.google?.maps) { clearInterval(poll); resolve(); } }, 80);
      return;
    }
    _mapsState = "loading";
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
    s.async = true;
    s.onload = () => { _mapsState = "ready"; resolve(); };
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
}

// ── Google Map with markers ───────────────────────────────────────────────────
function GoogleMap({ userLocation, pharmacies, selectedId, onSelect }) {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!userLocation || !MAPS_KEY) return;
    loadGoogleMaps(MAPS_KEY).then(() => {
      if (!divRef.current) return;

      if (!mapRef.current) {
        mapRef.current = new window.google.maps.Map(divRef.current, {
          center: { lat: userLocation.lat, lng: userLocation.lng },
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
      } else {
        mapRef.current.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
      }

      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      markersRef.current.push(
        new window.google.maps.Marker({
          position: { lat: userLocation.lat, lng: userLocation.lng },
          map: mapRef.current,
          title: "Your Location",
          icon: { url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", scaledSize: new window.google.maps.Size(42, 42) },
          zIndex: 999,
        })
      );

      pharmacies.forEach((p) => {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="font-family:sans-serif;padding:4px;max-width:180px">
              <b style="font-size:13px">${p.name}</b>
              <p style="margin:4px 0;font-size:12px;color:#555">${p.address || ""}</p>
              ${p.isOpen === true ? '<span style="color:#16a34a;font-size:12px">● Open now</span>' : p.isOpen === false ? '<span style="color:#dc2626;font-size:12px">● Closed</span>' : ""}
              ${p.distance != null ? `<p style="margin:4px 0;font-size:12px;color:#2563eb"><b>${p.distance < 1 ? Math.round(p.distance * 1000) + " m" : p.distance.toFixed(1) + " km"}</b> away</p>` : ""}
            </div>`,
        });
        const marker = new window.google.maps.Marker({
          position: { lat: p.location.lat, lng: p.location.lng },
          map: mapRef.current,
          title: p.name,
          icon: { url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", scaledSize: new window.google.maps.Size(38, 38) },
        });
        marker.addListener("click", () => {
          infoWindow.open(mapRef.current, marker);
          onSelect?.(p.placeId);
        });
        markersRef.current.push(marker);
      });

      if (pharmacies.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
        pharmacies.forEach((p) => bounds.extend({ lat: p.location.lat, lng: p.location.lng }));
        mapRef.current.fitBounds(bounds, 50);
      }
    }).catch(console.error);
  }, [userLocation, pharmacies]);

  if (!MAPS_KEY) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-center text-sm text-yellow-700 dark:text-yellow-400 flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" /> Add VITE_GOOGLE_MAPS_KEY to Client/.env to enable the map.
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
      <div ref={divRef} style={{ width: "100%", height: "380px" }} />
    </div>
  );
}

// ── Order confirmation modal ──────────────────────────────────────────────────
function OrderModal({ pharmacy, medicine, userLocation, onConfirm, onCancel, loading }) {
  if (!pharmacy) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg">Confirm Order</p>
              <p className="text-blue-100 text-sm">An email will be sent to this pharmacy</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1">Medicine</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{medicine}</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Sending order to</p>
            <div className="flex items-start gap-3">
              <Store className="w-6 h-6 text-gray-500 dark:text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{pharmacy.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{pharmacy.address}</p>
                {pharmacy.distance != null && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {pharmacy.distance < 1
                      ? `${Math.round(pharmacy.distance * 1000)} m`
                      : `${pharmacy.distance.toFixed(1)} km`} away
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-600 bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-100 dark:border-green-800">
            <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide mb-0.5">Your location (shared with pharmacy)</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">{userLocation?.address || `${userLocation?.lat?.toFixed(5)}, ${userLocation?.lng?.toFixed(5)}`}</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            The pharmacy will receive your name, medicine name, and address via email.
          </p>
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button onClick={onCancel} className="btn-secondary flex-1 py-3">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
            ) : <><Mail className="w-4 h-4" /> Place Order</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Success toast ─────────────────────────────────────────────────────────────
function SuccessToast({ order, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  if (!order) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-[fadeInUp_0.3s_ease-out]">
      <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-2xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Order Sent!</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Email sent to <strong>{order.pharmacyContact?.name}</strong>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Order ID: {order.orderId}</p>
            {order.emailStatus?.error && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Email not delivered — check EMAIL_USER/EMAIL_PASS in .env
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pharmacy card ─────────────────────────────────────────────────────────────
function PharmacyCard({ pharmacy, isSelected, onOrder, onSelect }) {
  return (
    <div
      onClick={() => onSelect(pharmacy.placeId)}
      className={`card cursor-pointer transition-all duration-200 ${
        isSelected ? "ring-2 ring-blue-500 shadow-md" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center shrink-0">
          <Pill className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{pharmacy.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{pharmacy.address}</p>
        </div>
        <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
          pharmacy.isOpen === true
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            : pharmacy.isOpen === false
            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
        }`}>
          {pharmacy.isOpen === true ? "Open" : pharmacy.isOpen === false ? "Closed" : "—"}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3 text-xs">
        {pharmacy.rating ? (
          <span className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(pharmacy.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
              />
            ))}
            <span className="text-gray-500 dark:text-gray-400 ml-1">{pharmacy.rating.toFixed(1)}</span>
          </span>
        ) : <span className="text-gray-400 dark:text-gray-500">No rating</span>}
        {pharmacy.distance != null && (
          <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {pharmacy.distance < 1 ? `${Math.round(pharmacy.distance * 1000)} m` : `${pharmacy.distance.toFixed(1)} km`}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
        >
          <Map className="w-3.5 h-3.5" /> Directions
        </a>
        <button
          className="btn-primary text-xs flex-1 py-2 flex items-center justify-center gap-1.5"
          onClick={(e) => { e.stopPropagation(); onOrder(pharmacy); }}
        >
          <Mail className="w-3.5 h-3.5" /> Order Medicine
        </button>
      </div>
    </div>
  );
}

// ── History card ──────────────────────────────────────────────────────────────
function HistoryCard({ req, onDelete }) {
  const [exp, setExp] = useState(false);
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
            <Pill className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{req.medicineName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">→ {req.pharmacy.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {new Date(req.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="badge-green">{req.status}</span>
          <div className="flex gap-2">
            <button onClick={() => setExp((x) => !x)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              {exp ? "Less" : "Details"}
            </button>
            <button onClick={() => onDelete(req._id)} className="text-xs text-red-500 dark:text-red-400 hover:underline">Delete</button>
          </div>
        </div>
      </div>

      {exp && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <p className="text-gray-400 dark:text-gray-500 mb-0.5">Pharmacy</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{req.pharmacy.name}</p>
              <p className="text-gray-500 dark:text-gray-400">{req.pharmacy.address}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <p className="text-gray-400 dark:text-gray-500 mb-0.5">Your Location</p>
              <p className="text-gray-700 dark:text-gray-300">{req.userLocation.address || `${req.userLocation.lat?.toFixed(4)}, ${req.userLocation.lng?.toFixed(4)}`}</p>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
              <Mail className="w-3 h-3" /> Email sent to pharmacy:
            </p>
            <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{req.notificationMessage}</pre>
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${req.pharmacy.location?.lat},${req.pharmacy.location?.lng}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary text-xs inline-flex items-center gap-1.5"
          >
            <Map className="w-3.5 h-3.5" /> Get Directions
          </a>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Pharmacy() {
  const [medicine, setMedicine] = useState("");
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [pharmacies, setPharmacies] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [orderTarget, setOrderTarget] = useState(null);
  const [ordering, setOrdering] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("search");
  const inputRef = useRef(null);

  const fetchHistory = useCallback(() => {
    api.get("/pharmacy/requests").then(({ data }) => setHistory(data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchHistory();
    getLocation();
    inputRef.current?.focus();
  }, []);

  function getLocation() {
    setLocating(true);
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by this browser.");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ lat: coords.latitude, lng: coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? "Location access denied. Please enable location permission."
            : "Could not detect location. Try again."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const search = async () => {
    if (!medicine.trim()) {
      setSearchError("Please enter a medicine name.");
      inputRef.current?.focus();
      return;
    }
    if (!location) {
      setLocationError("Location is required. Please allow location access.");
      getLocation();
      return;
    }
    setSearchError("");
    setSearchDone(false);
    setSearching(true);
    setPharmacies([]);
    setSelectedId(null);
    try {
      const { data } = await api.get("/pharmacy/nearby", {
        params: { lat: location.lat, lng: location.lng, radius: 5000, medicine: medicine.trim() },
      });
      setPharmacies(data.pharmacies || []);
      setSearchDone(true);
      if (!data.pharmacies?.length) {
        setSearchError("No pharmacies found within 5 km. Try a different area.");
      }
    } catch (err) {
      setSearchError(err.response?.data?.message || "Failed to search pharmacies.");
    } finally {
      setSearching(false);
    }
  };

  const placeOrder = async () => {
    if (!orderTarget) return;
    setOrdering(true);
    try {
      const { data } = await api.post("/pharmacy/request", {
        medicineName: medicine.trim(),
        userLocation: location,
        pharmacy: orderTarget,
      });
      setSuccessOrder(data);
      setOrderTarget(null);
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setOrdering(false);
    }
  };

  const deleteHistory = async (id) => {
    if (!confirm("Remove this order from history?")) return;
    await api.delete(`/pharmacy/requests/${id}`);
    fetchHistory();
  };

  return (
    <div className="space-y-5">
      <OrderModal
        pharmacy={orderTarget}
        medicine={medicine}
        userLocation={location}
        onConfirm={placeOrder}
        onCancel={() => setOrderTarget(null)}
        loading={ordering}
      />
      {successOrder && <SuccessToast order={successOrder} onClose={() => setSuccessOrder(null)} />}

      {/* Tabs */}
      <div className="flex gap-2">
        {["search", "history"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors flex items-center gap-2 ${
              tab === t
                ? "bg-blue-600 text-white border-blue-600"
                : "text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
            }`}
          >
            {t === "search" ? <><Search className="w-3.5 h-3.5" /> Find Medicine</> : <><ClipboardList className="w-3.5 h-3.5" /> My Orders ({history.length})</>}
          </button>
        ))}
      </div>

      {/* ── SEARCH TAB ── */}
      {tab === "search" && (
        <>
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Find Medicine Near You</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Type a medicine name and we&apos;ll find the nearest open pharmacies on the map.
              Hit <strong>Order</strong> to send an email request with your address.
            </p>

            <div className="flex gap-2 mb-3">
              <input
                ref={inputRef}
                className="input-field flex-1 text-base"
                placeholder="Search medicine — e.g. Paracetamol 500mg, Metformin"
                value={medicine}
                onChange={(e) => { setMedicine(e.target.value); setSearchError(""); }}
                onKeyDown={(e) => e.key === "Enter" && search()}
              />
              <button
                className="btn-primary px-6 flex items-center gap-2 shrink-0"
                onClick={search}
                disabled={searching}
              >
                {searching ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : "Search"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {locating ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  Detecting your location...
                </div>
              ) : location ? (
                <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Location detected — {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                  <button onClick={getLocation} className="text-blue-600 dark:text-blue-400 hover:underline ml-1">Refresh</button>
                </div>
              ) : (
                <button onClick={getLocation} className="btn-secondary text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Detect My Location
                </button>
              )}
            </div>

            {locationError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 border border-red-200 dark:border-red-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {locationError}
              </p>
            )}
            {searchError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 border border-red-200 dark:border-red-800">
                {searchError}
              </p>
            )}
          </div>

          {location && (
            <GoogleMap
              userLocation={location}
              pharmacies={pharmacies}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}

          {searching && (
            <div className="flex items-center justify-center gap-3 py-10">
              <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Finding pharmacies near you...</p>
            </div>
          )}

          {searchDone && pharmacies.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {pharmacies.length} Pharmacies Near You
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">Sorted by distance · click a card or map pin</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pharmacies.map((p) => (
                  <PharmacyCard
                    key={p.placeId}
                    pharmacy={p}
                    isSelected={selectedId === p.placeId}
                    onSelect={setSelectedId}
                    onOrder={setOrderTarget}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
                Clicking <strong>Order Medicine</strong> sends an email to the pharmacy with your name, medicine, and location.
              </p>
            </div>
          )}
        </>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="card text-center py-12">
              <div className="flex justify-center mb-3">
                <ClipboardList className="w-10 h-10 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-gray-400 dark:text-gray-500">No orders placed yet.</p>
              <button className="btn-primary mt-4" onClick={() => setTab("search")}>
                Find a pharmacy
              </button>
            </div>
          ) : (
            history.map((r) => <HistoryCard key={r._id} req={r} onDelete={deleteHistory} />)
          )}
        </div>
      )}
    </div>
  );
}
