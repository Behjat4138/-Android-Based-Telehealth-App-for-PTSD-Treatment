import { useState, useEffect, useRef } from "react";

const LANG = {
  en: {
    title: "Find a Clinic",
    back: "← Dashboard",
    subtitle: "Mental health clinics & support centres near KwaZulu-Natal",
    disclaimer: "This map shows known mental health resources in KwaZulu-Natal. Always call ahead to confirm hours and availability.",
    searchPlaceholder: "Search by city or clinic name…",
    callBtn: "Call",
    moreInfo: "More info",
    categoryAll: "All",
    categories: ["All", "Hospital", "NGO / Community", "Crisis Line", "University"],
    noResults: "No clinics match your search.",
    loading: "Loading map…",
  },
  zu: {
    title: "Thola Ikhliniki",
    back: "← Ibhodi",
    subtitle: "Amakhliniki ezempilo yengqondo nezinkiko zesekelo eduze ne-KwaZulu-Natal",
    disclaimer: "Leli mapu likhombisa izinsiza ezaziwa ezempilo yengqondo e-KwaZulu-Natal. Shayela ngapha ukuqinisekisa amahora nokutholakala.",
    searchPlaceholder: "Sesha ngedolobha noma igama lekhliniki…",
    callBtn: "Shayela",
    moreInfo: "Ulwazi Oluningi",
    categoryAll: "Konke",
    categories: ["Konke", "Isibhedlela", "INhlangano / Umphakathi", "Umugqa Wesimo Esikhulukazi", "Yunivesithi"],
    noResults: "Awekho amakhliniki afanele ukusesha kwakho.",
    loading: "Ilowunda imapu…",
  },
};

// Real mental health clinics in KwaZulu-Natal
const CLINICS = [
  { id:1, name:"King Edward VIII Hospital – Psychiatry", city:"Durban", lat:-29.8695, lng:30.9875, type:"Hospital", phone:"+27 31 360 3111", desc:"Major public hospital with full psychiatric unit and outpatient mental health services." },
  { id:2, name:"Addington Hospital – Mental Health", city:"Durban", lat:-29.8614, lng:31.0417, type:"Hospital", phone:"+27 31 327 2000", desc:"Public hospital offering inpatient and outpatient psychiatric care in central Durban." },
  { id:3, name:"Townhill Hospital", city:"Pietermaritzburg", lat:-29.6153, lng:30.3770, type:"Hospital", phone:"+27 33 897 1000", desc:"Specialist psychiatric hospital providing mental health services across KZN." },
  { id:4, name:"Stanger Hospital – Mental Health", city:"KwaDukuza", lat:-29.3348, lng:31.2914, type:"Hospital", phone:"+27 32 437 6000", desc:"Public hospital with mental health outpatient clinic for the north coast area." },
  { id:5, name:"SADAG – KZN Support Groups", city:"Durban", lat:-29.8587, lng:31.0218, type:"NGO / Community", phone:"0800 456 789", desc:"SA Depression & Anxiety Group. Free helpline and community support groups across KZN." },
  { id:6, name:"FAMSA KwaZulu-Natal", city:"Durban", lat:-29.8539, lng:31.0094, type:"NGO / Community", phone:"+27 31 312 9700", desc:"Family and Marriage Society of SA — counselling, trauma support, and family therapy." },
  { id:7, name:"Lifeline KZN", city:"Durban", lat:-29.8570, lng:31.0296, type:"Crisis Line", phone:"+27 31 312 2323", desc:"24-hour crisis counselling, suicide prevention, and trauma debriefing services." },
  { id:8, name:"Child Welfare SA – Durban", city:"Durban", lat:-29.8644, lng:31.0225, type:"NGO / Community", phone:"+27 31 303 6300", desc:"Trauma counselling and mental health support for children and young people." },
  { id:9, name:"UKZN Student Counselling", city:"Durban", lat:-29.8684, lng:30.9784, type:"University", phone:"+27 31 260 2000", desc:"Free counselling services for UKZN students including trauma and PTSD support." },
  { id:10, name:"DUT Student Wellness", city:"Durban", lat:-29.8555, lng:31.0072, type:"University", phone:"+27 31 373 2000", desc:"Durban University of Technology student mental health and wellness centre." },
  { id:11, name:"Edendale Hospital – Psychiatry", city:"Pietermaritzburg", lat:-29.6430, lng:30.3531, type:"Hospital", phone:"+27 33 395 4000", desc:"Public hospital providing psychiatric outpatient and inpatient care for the Midlands." },
  { id:12, name:"SANCA – KZN (Substance & Mental Health)", city:"Durban", lat:-29.8531, lng:31.0052, type:"NGO / Community", phone:"+27 31 303 0544", desc:"Substance abuse and co-occurring mental health treatment, including trauma support." },
];

const TYPE_COLORS = {
  "Hospital":         "#D4A5A0",
  "NGO / Community":  "#9BAF9B",
  "Crisis Line":      "#C4956A",
  "University":       "#A0B4C8",
};

function ClinicMap({ user, setPage, lang = "en" }) {
  const tx = LANG[lang] || LANG.en;
  const mapRef    = useRef(null);
  const leafletRef= useRef(null);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // Filter clinics
  const filtered = CLINICS.filter(c => {
    const catKey = lang === "zu" ? { "Konke":"All","Isibhedlela":"Hospital","INhlangano / Umphakathi":"NGO / Community","Umugqa Wesimo Esikhulukazi":"Crisis Line","Yunivesithi":"University" }[category] || category : category;
    const catOk = catKey === "All" || c.type === catKey;
    const q = search.toLowerCase();
    const searchOk = !q || c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
    return catOk && searchOk;
  });

  // Load Leaflet via CDN
  useEffect(() => {
    if (window.L) { initMap(); return; }

    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = initMap;
    document.head.appendChild(script);
  }, []); // eslint-disable-line

  function initMap() {
    if (mapRef.current && !leafletRef.current) {
      const L = window.L;
      const map = L.map(mapRef.current, { zoomControl: true }).setView([-29.6, 30.9], 9);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      leafletRef.current = map;
      setMapReady(true);
    }
  }

  // Update markers when filter/map changes
  useEffect(() => {
    if (!leafletRef.current || !mapReady) return;
    const L = window.L;
    const map = leafletRef.current;

    // Clear existing markers
    map.eachLayer(l => { if (l instanceof L.Marker) map.removeLayer(l); });

    filtered.forEach(clinic => {
      const color = TYPE_COLORS[clinic.type] || "#C4B5A5";
      const markerHtml = `<div style="
        width:28px;height:28px;border-radius:50%;
        background:${color};border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.2);
        display:flex;align-items:center;justify-content:center;
        font-size:12px;cursor:pointer;
      "></div>`;
      const icon = L.divIcon({ html: markerHtml, className:"", iconSize:[28,28], iconAnchor:[14,14] });
      const marker = L.marker([clinic.lat, clinic.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:'DM Sans',sans-serif;min-width:200px">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${color};margin-bottom:4px">${clinic.type}</div>
          <div style="font-size:15px;font-weight:500;color:#3A2E28;margin-bottom:4px">${clinic.name}</div>
          <div style="font-size:12px;color:#9E8579;margin-bottom:6px">📍 ${clinic.city}</div>
          <div style="font-size:12px;color:#6B5649;line-height:1.5;margin-bottom:8px">${clinic.desc}</div>
          <a href="tel:${clinic.phone}" style="font-size:13px;font-weight:600;color:${color}">📞 ${clinic.phone}</a>
        </div>
      `);
      marker.on("click", () => setSelected(clinic));
    });
  }, [filtered, mapReady]); // eslint-disable-line

  const catList = lang === "zu" ? tx.categories : ["All", "Hospital", "NGO / Community", "Crisis Line", "University"];

  return (
    <div className="dashboard">
      <div className="top-bar">
        <h1 className="page-title">{tx.title}</h1>
        <button onClick={() => setPage("dashboard")}>{tx.back}</button>
      </div>

      <div className="clinic-disclaimer">{tx.disclaimer}</div>

      {/* Controls */}
      <div className="clinic-controls">
        <input
          type="text"
          className="clinic-search"
          placeholder={tx.searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="clinic-cat-tabs">
          {catList.map(c => (
            <button
              key={c}
              className={`clinic-cat-btn${category === c ? " active" : ""}`}
              onClick={() => setCategory(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      <div className="clinic-layout">
        {/* Map */}
        <div className="clinic-map-wrap">
          <div ref={mapRef} className="clinic-map" />
          {!mapReady && <div className="clinic-map-loading">{tx.loading}</div>}
        </div>

        {/* Sidebar list */}
        <div className="clinic-sidebar">
          {filtered.length === 0 ? (
            <div className="clinic-no-results">{tx.noResults}</div>
          ) : (
            filtered.map(c => (
              <div
                key={c.id}
                className={`clinic-card${selected?.id === c.id ? " selected" : ""}`}
                style={{ borderLeftColor: TYPE_COLORS[c.type] || "#C4B5A5" }}
                onClick={() => {
                  setSelected(c);
                  if (leafletRef.current) {
                    leafletRef.current.setView([c.lat, c.lng], 13);
                  }
                }}
              >
                <div className="clinic-type-label" style={{ color: TYPE_COLORS[c.type] }}>{c.type}</div>
                <div className="clinic-name">{c.name}</div>
                <div className="clinic-city">📍 {c.city}</div>
                <p className="clinic-desc">{c.desc}</p>
                <a href={`tel:${c.phone}`} className="clinic-call-btn">
                  📞 {tx.callBtn}: {c.phone}
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ClinicMap;