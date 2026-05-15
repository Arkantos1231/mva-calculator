import { useState, useEffect } from "react";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming","Washington D.C."
];

const TORT_RULES = {
  "Alabama": { system: "Contributory Negligence", note: "ANY fault by claimant bars recovery entirely." },
  "Alaska": { system: "Pure Comparative Fault", note: "Recovery reduced by claimant's % of fault, no bar." },
  "Arizona": { system: "Pure Comparative Fault", note: "Recovery reduced by claimant's % of fault, no bar." },
  "Arkansas": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "California": { system: "Pure Comparative Fault", note: "Recovery reduced by claimant's % of fault, no bar." },
  "Colorado": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "Connecticut": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "Delaware": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "Florida": { system: "Pure Comparative Fault", note: "Recovery reduced by claimant's % of fault, no bar." },
  "Georgia": { system: "Modified Comparative (50%)", note: "Barred if claimant ≥ 50% at fault." },
  "Hawaii": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "Idaho": { system: "Modified Comparative (50%)", note: "Barred if claimant ≥ 50% at fault." },
  "Illinois": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "Indiana": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "Iowa": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "Kansas": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault. No-fault PIP state." },
  "Kentucky": { system: "No-Fault / PIP", note: "Must meet tort threshold to sue. $1,000 medical threshold." },
  "Louisiana": { system: "Pure Comparative Fault", note: "Recovery reduced by claimant's % of fault, no bar." },
  "Maine": { system: "Modified Comparative (50%)", note: "Barred if claimant ≥ 50% at fault." },
  "Maryland": { system: "Contributory Negligence", note: "ANY fault by claimant bars recovery entirely." },
  "Massachusetts": { system: "No-Fault / Modified Comparative (51%)", note: "$2,000 medical threshold to exit no-fault." },
  "Michigan": { system: "No-Fault / Modified Comparative (51%)", note: "Strong PIP system. Must meet serious impairment threshold." },
  "Minnesota": { system: "No-Fault / Modified Comparative (51%)", note: "$4,000 medical threshold or 60-day disability threshold." },
  "Mississippi": { system: "Pure Comparative Fault", note: "Recovery reduced by claimant's % of fault, no bar." },
  "Missouri": { system: "Pure Comparative Fault", note: "Recovery reduced by claimant's % of fault, no bar." },
  "Montana": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "Nebraska": { system: "Modified Comparative (50%)", note: "Barred if claimant ≥ 50% at fault." },
  "Nevada": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "New Hampshire": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "New Jersey": { system: "No-Fault / Modified Comparative (51%)", note: "Verbal threshold or $3,600 medical threshold." },
  "New Mexico": { system: "Pure Comparative Fault", note: "Recovery reduced by claimant's % of fault, no bar." },
  "New York": { system: "No-Fault / Pure Comparative", note: "Must meet serious injury threshold (Insurance Law §5102)." },
  "North Carolina": { system: "Contributory Negligence", note: "ANY fault by claimant bars recovery entirely." },
  "North Dakota": { system: "No-Fault / Modified Comparative (50%)", note: "Must meet $2,500 medical threshold." },
  "Ohio": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "Oklahoma": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "Oregon": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "Pennsylvania": { system: "No-Fault / Modified Comparative (51%)", note: "Limited or full tort election. Full tort removes threshold." },
  "Rhode Island": { system: "Pure Comparative Fault", note: "Recovery reduced by claimant's % of fault, no bar." },
  "South Carolina": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "South Dakota": { system: "Pure Comparative Fault", note: "Recovery reduced by claimant's % of fault, no bar." },
  "Tennessee": { system: "Modified Comparative (50%)", note: "Barred if claimant ≥ 50% at fault." },
  "Texas": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "Utah": { system: "No-Fault / Modified Comparative (50%)", note: "$3,000 medical threshold to exit no-fault." },
  "Vermont": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "Virginia": { system: "Contributory Negligence", note: "ANY fault by claimant bars recovery entirely." },
  "Washington": { system: "Pure Comparative Fault", note: "Recovery reduced by claimant's % of fault, no bar." },
  "Washington D.C.": { system: "Contributory Negligence", note: "ANY fault by claimant bars recovery entirely." },
  "West Virginia": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "Wisconsin": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
  "Wyoming": { system: "Modified Comparative (51%)", note: "Barred if claimant ≥ 51% at fault." },
};

const initialData = {
  state: "", accidentDate: "",
  faultDesc: "", faultDisputed: "", policeReport: "",
  propDamageDesc: "", propDamageLevel: "", repairOrTotal: "", propDamageAmount: "",
  liabilityLimit: "", hasUMUIM: "", umUimLimit: "", hasPIPMedPay: "", pipMedPayLimit: "",
  injuries: "", surgeriesPerformed: "", surgeriesRecommended: "",
  atMMI: "", permanentRating: "", ongoingTreatment: "",
  totalMedBills: "", futureMedExpected: "", futureMedDesc: "",
  missedWork: "", occupation: "", lostIncome: "", lossOfEarningCapacity: "",
  lifeImpact: "", psychologicalEffects: "", permanentLimitations: "",
  preExisting: "", priorClaims: "", liens: "", claimantFaultPct: "",
};

const STEPS = [
  { id: 1, label: "Jurisdiction", icon: "⚖️" },
  { id: 2, label: "Accident", icon: "🚗" },
  { id: 3, label: "Property", icon: "🔧" },
  { id: 4, label: "Insurance", icon: "🛡️" },
  { id: 5, label: "Injuries", icon: "🏥" },
  { id: 6, label: "MMI Status", icon: "📋" },
  { id: 7, label: "Medical $", icon: "💊" },
  { id: 8, label: "Lost Wages", icon: "💼" },
  { id: 9, label: "Impact", icon: "🧠" },
  { id: 10, label: "History", icon: "📁" },
];

function calculateSettlement(d) {
  const medBills = parseFloat(d.totalMedBills) || 0;
  const futureMed = d.futureMedExpected === "yes" ? (parseFloat(d.futureMedDesc) || 0) : 0;
  const lostWages = parseFloat(d.lostIncome) || 0;
  const propDamage = parseFloat(d.propDamageAmount) || 0;

  const totalEconomic = medBills + futureMed + lostWages + propDamage;

  // Multiplier based on injury severity
  let multiplierLow = 1.5, multiplierMid = 2.5, multiplierHigh = 4.0;

  const hasSurgery = d.surgeriesPerformed === "yes";
  const hasPermanent = d.permanentRating === "yes" || (d.permanentLimitations && d.permanentLimitations.trim().length > 10);
  const hasPsych = d.psychologicalEffects && d.psychologicalEffects.trim().length > 10;
  const propLevel = d.propDamageLevel;

  if (hasSurgery) { multiplierLow += 0.5; multiplierMid += 1; multiplierHigh += 1.5; }
  if (hasPermanent) { multiplierLow += 0.5; multiplierMid += 0.75; multiplierHigh += 1.0; }
  if (hasPsych) { multiplierLow += 0.25; multiplierMid += 0.5; multiplierHigh += 0.75; }
  if (propLevel === "severe") { multiplierLow += 0.25; multiplierMid += 0.5; multiplierHigh += 0.75; }
  if (propLevel === "minor") { multiplierLow -= 0.25; multiplierMid -= 0.25; multiplierHigh -= 0.5; }

  const painSufferingLow = medBills * multiplierLow;
  const painSufferingMid = medBills * multiplierMid;
  const painSufferingHigh = medBills * multiplierHigh;

  let rawLow = totalEconomic + painSufferingLow;
  let rawMid = totalEconomic + painSufferingMid;
  let rawHigh = totalEconomic + painSufferingHigh;

  // Apply comparative fault reduction
  const faultPct = parseFloat(d.claimantFaultPct) || 0;
  const faultMultiplier = 1 - (faultPct / 100);

  const tort = TORT_RULES[d.state];
  let faultBarred = false;
  if (tort) {
    if (tort.system.includes("Contributory") && faultPct > 0) faultBarred = true;
    if (tort.system.includes("50%") && faultPct >= 50) faultBarred = true;
    if (tort.system.includes("51%") && faultPct >= 51) faultBarred = true;
  }

  if (faultBarred) {
    return { low: 0, mid: 0, high: 0, faultBarred: true, multiplierMid, totalEconomic, tort };
  }

  const low = Math.round((rawLow * faultMultiplier) / 1000) * 1000;
  const mid = Math.round((rawMid * faultMultiplier) / 1000) * 1000;
  const high = Math.round((rawHigh * faultMultiplier) / 1000) * 1000;

  return { low, mid, high, faultBarred: false, multiplierMid, totalEconomic, tort };
}

const fmt = (n) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// Detect if running inside WordPress (wp_localize_script injects mvaAjax)
const WP_AJAX = typeof window !== 'undefined' && window.mvaAjax;

export default function MVACalculator() {
  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 7;
    if (window.innerWidth < 480) return 3;
    if (window.innerWidth < 768) return 5;
    return 7;
  };
  const [step, setStep] = useState(1);
  const [windowStart, setWindowStart] = useState(0);
  const [windowDir, setWindowDir] = useState('');
  const [visibleCount, setVisibleCount] = useState(getVisibleCount);

  useEffect(() => {
    const onResize = () => {
      const c = getVisibleCount();
      setVisibleCount(c);
      setWindowStart(w => Math.min(w, Math.max(0, STEPS.length - c)));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const [data, setData] = useState(initialData);
  const [showLead, setShowLead] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [lead, setLead] = useState({ name: '', email: '', phone: '' });
  const [aiState, setAiState] = useState({ loading: false, analysis: '', disclaimer: '', error: '' });

  const set = (key, val) => setData(prev => ({ ...prev, [key]: val }));
  const setLeadField = (key, val) => setLead(prev => ({ ...prev, [key]: val }));

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    const mathResult = calculateSettlement(data);
    setShowLead(false);
    setShowResults(true);
    setAiState({ loading: true, analysis: '', disclaimer: '', error: '' });

    if (!WP_AJAX) {
      // Dev mode: skip AJAX, just show math results
      setAiState({ loading: false, analysis: '', disclaimer: 'Educational use only. Not legal advice.', error: '' });
      return;
    }

    try {
      const body = new FormData();
      body.append('action',     'mva_calculate');
      body.append('nonce',      WP_AJAX.nonce);
      body.append('formData',   JSON.stringify(data));
      body.append('mathResult', JSON.stringify(mathResult));
      body.append('name',       lead.name);
      body.append('email',      lead.email);
      body.append('phone',      lead.phone);

      const resp = await fetch(WP_AJAX.ajaxurl, { method: 'POST', body });
      const json = await resp.json();

      if (json.success) {
        setAiState({ loading: false, analysis: json.data.ai_analysis, disclaimer: json.data.disclaimer, error: '' });
      } else {
        setAiState({ loading: false, analysis: '', disclaimer: '', error: 'Could not fetch AI analysis.' });
      }
    } catch (_) {
      setAiState({ loading: false, analysis: '', disclaimer: '', error: 'Network error. Math results are still shown above.' });
    }
  };

  const Input = ({ label, field, type = "text", placeholder = "" }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>
      <input
        type={type}
        value={data[field]}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", boxSizing: "border-box", padding: "12px 14px",
          background: "#0f172a", border: "1px solid #334155",
          borderRadius: 8, color: "#e2e8f0", fontSize: 15,
          outline: "none", transition: "border 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = "#c9a84c"}
        onBlur={e => e.target.style.borderColor = "#334155"}
      />
    </div>
  );

  const Textarea = ({ label, field, placeholder = "" }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>
      <textarea
        value={data[field]}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{
          width: "100%", boxSizing: "border-box", padding: "12px 14px",
          background: "#0f172a", border: "1px solid #334155",
          borderRadius: 8, color: "#e2e8f0", fontSize: 15,
          outline: "none", resize: "vertical", fontFamily: "inherit",
        }}
        onFocus={e => e.target.style.borderColor = "#c9a84c"}
        onBlur={e => e.target.style.borderColor = "#334155"}
      />
    </div>
  );

  const Radio = ({ label, field, options }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {options.map(opt => (
          <button key={opt.value}
            onClick={() => set(field, opt.value)}
            style={{
              padding: "9px 18px", borderRadius: 8, border: "1px solid",
              borderColor: data[field] === opt.value ? "#c9a84c" : "#334155",
              background: data[field] === opt.value ? "rgba(201,168,76,0.15)" : "#0f172a",
              color: data[field] === opt.value ? "#d4a843" : "#cbd5e1",
              fontSize: 14, cursor: "pointer", fontWeight: data[field] === opt.value ? 700 : 500,
              transition: "all 0.15s",
            }}>{opt.label}</button>
        ))}
      </div>
    </div>
  );

  const Select = ({ label, field, options }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>
      <select value={data[field]} onChange={e => set(field, e.target.value)}
        style={{
          width: "100%", padding: "12px 14px", background: "#0f172a",
          border: "1px solid #334155", borderRadius: 8, color: data[field] ? "#e2e8f0" : "#64748b",
          fontSize: 15, outline: "none",
        }}>
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const stepContent = () => {
    switch (step) {
      case 1: return (
        <>
          <h2 style={sh}>Jurisdiction & Date</h2>
          <p style={sp}>This determines which tort rules apply to your claim.</p>
          <Select label="State where accident occurred" field="state" options={US_STATES} />
          {data.state && TORT_RULES[data.state] && (
            <div style={{ padding: "12px 16px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#c9a84c", fontWeight: 700 }}>⚖️ {TORT_RULES[data.state].system}</div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>{TORT_RULES[data.state].note}</div>
            </div>
          )}
          <Input label="Date of Accident" field="accidentDate" type="date" />
        </>
      );
      case 2: return (
        <>
          <h2 style={sh}>Accident Details</h2>
          <p style={sp}>Describe what happened and who was responsible.</p>
          <Textarea label="Describe the collision (type, how it happened)" field="faultDesc" placeholder="e.g. Rear-ended at a red light. At-fault driver was texting." />
          <Radio label="Is fault disputed?" field="faultDisputed" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unknown", label: "Unknown" }]} />
          <Radio label="Was a police report filed?" field="policeReport" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
        </>
      );
      case 3: return (
        <>
          <h2 style={sh}>Property Damage</h2>
          <p style={sp}>Vehicle damage is a key indicator of impact severity and injury credibility.</p>
          <Textarea label="Describe the property damage" field="propDamageDesc" placeholder="e.g. Rear bumper crushed, trunk damaged, frame bent. Airbags deployed." />
          <Radio label="Damage severity" field="propDamageLevel" options={[{ value: "minor", label: "Minor" }, { value: "moderate", label: "Moderate" }, { value: "severe", label: "Severe" }]} />
          <Radio label="Outcome" field="repairOrTotal" options={[{ value: "repaired", label: "Repaired" }, { value: "totaled", label: "Total Loss" }]} />
          <Input label="Repair bill or total loss value ($)" field="propDamageAmount" type="number" placeholder="e.g. 8500" />
        </>
      );
      case 4: return (
        <>
          <h2 style={sh}>Insurance Coverage</h2>
          <p style={sp}>Policy limits determine the ceiling on potential recovery.</p>
          <Input label="At-fault driver's liability limit ($)" field="liabilityLimit" type="number" placeholder="e.g. 100000" />
          <Radio label="Does claimant have UM/UIM coverage?" field="hasUMUIM" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unknown", label: "Unknown" }]} />
          {data.hasUMUIM === "yes" && <Input label="UM/UIM limit ($)" field="umUimLimit" type="number" placeholder="e.g. 100000" />}
          <Radio label="Does claimant have MedPay / PIP?" field="hasPIPMedPay" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unknown", label: "Unknown" }]} />
          {data.hasPIPMedPay === "yes" && <Input label="MedPay / PIP limit ($)" field="pipMedPayLimit" type="number" placeholder="e.g. 10000" />}
        </>
      );
      case 5: return (
        <>
          <h2 style={sh}>Injuries</h2>
          <p style={sp}>List all diagnosed injuries and surgical history.</p>
          <Textarea label="Injuries diagnosed (list all)" field="injuries" placeholder="e.g. L4-L5 herniated disc, cervical strain, concussion, fractured right wrist" />
          <Radio label="Any surgeries performed?" field="surgeriesPerformed" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
          <Radio label="Any surgeries recommended but not yet done?" field="surgeriesRecommended" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
        </>
      );
      case 6: return (
        <>
          <h2 style={sh}>MMI Status</h2>
          <p style={sp}>Maximum Medical Improvement determines whether damages are fixed or ongoing.</p>
          <Radio label="Has claimant reached MMI?" field="atMMI" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No — still treating (2+ years)" }]} />
          {data.atMMI === "yes" && <Radio label="Is there a permanent impairment rating?" field="permanentRating" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />}
          {data.atMMI === "no" && <Textarea label="Describe ongoing treatment" field="ongoingTreatment" placeholder="e.g. Monthly pain management, PT twice weekly, awaiting surgery consult" />}
        </>
      );
      case 7: return (
        <>
          <h2 style={sh}>Medical Bills & Future Care</h2>
          <p style={sp}>Use gross (pre-adjustment) amounts — what was billed, not what insurance paid.</p>
          <Input label="Total medical bills to date — GROSS ($)" field="totalMedBills" type="number" placeholder="e.g. 75000" />
          <Radio label="Are future medical expenses anticipated?" field="futureMedExpected" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
          {data.futureMedExpected === "yes" && <Input label="Estimated future medical costs ($)" field="futureMedDesc" type="number" placeholder="e.g. 30000" />}
        </>
      );
      case 8: return (
        <>
          <h2 style={sh}>Lost Wages & Earning Capacity</h2>
          <p style={sp}>Document all economic impact from lost employment.</p>
          <Radio label="Did claimant miss work due to injuries?" field="missedWork" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
          {data.missedWork === "yes" && (
            <>
              <Input label="Occupation" field="occupation" placeholder="e.g. Registered Nurse" />
              <Input label="Total lost income ($)" field="lostIncome" type="number" placeholder="e.g. 18000" />
            </>
          )}
          <Radio label="Any loss of earning capacity (can't do same job long-term)?" field="lossOfEarningCapacity" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
        </>
      );
      case 9: return (
        <>
          <h2 style={sh}>Life Impact & Pain & Suffering</h2>
          <p style={sp}>Non-economic damages are often the largest component of settlement value.</p>
          <Textarea label="How has this injury impacted daily life?" field="lifeImpact" placeholder="e.g. Can't lift my kids, stopped playing golf, sleep disrupted nightly, relying on spouse for household tasks" />
          <Textarea label="Any psychological effects? (anxiety, PTSD, depression)" field="psychologicalEffects" placeholder="e.g. Diagnosed with PTSD, anxiety driving, seeing therapist weekly" />
          <Textarea label="Permanent limitations (if any)" field="permanentLimitations" placeholder="e.g. Physician states patient will have chronic lower back pain, 10% whole-person impairment" />
        </>
      );
      case 10: return (
        <>
          <h2 style={sh}>Prior History & Risk Factors</h2>
          <p style={sp}>These factors can significantly impact valuation and legal exposure.</p>
          <Textarea label="Any pre-existing conditions in the same body areas?" field="preExisting" placeholder="e.g. Prior L4-L5 disc bulge treated in 2019, no symptoms for 3 years before accident" />
          <Textarea label="Any prior accident claims or lawsuits?" field="priorClaims" placeholder="e.g. 2018 slip and fall settled for $12,000 — different body part (knee)" />
          <Textarea label="Known liens? (health insurance, Medicare/Medicaid, workers' comp)" field="liens" placeholder="e.g. BCBS paid $28,000 — lien asserted. No Medicare/Medicaid." />
          <Input label="Estimated claimant % of fault (if any)" field="claimantFaultPct" type="number" placeholder="e.g. 0 (enter 0 if none)" />
        </>
      );
      default: return null;
    }
  };

  const sh = { margin: "0 0 6px 0", fontSize: 22, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const sp = { margin: "0 0 24px 0", fontSize: 14, color: "#94a3b8" };

  const result = (showResults || showLead) ? calculateSettlement(data) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#020818", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.5; }
        select option { background: #0f172a; }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", borderBottom: "1px solid rgba(201,168,76,0.2)", padding: "24px 32px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #c9a84c, #a07830)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⚖️</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#e2e8f0" }}>MVA Settlement Calculator</div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>Motor Vehicle Accident · Personal Injury Valuation Tool</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 13, color: "#94a3b8", textAlign: "right" }}>
            <div style={{ color: "#c9a84c", fontWeight: 700 }}>DISCLAIMER</div>
            <div>Educational use only. Not legal advice.</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 20px" }}>

        {/* Step indicators — sliding window of 7 with arrows */}
        {!showResults && (() => {
          const VISIBLE = visibleCount;
          const animClass = windowDir ? `mva-steps-anim-${windowDir}` : '';
          const visible = STEPS.slice(windowStart, windowStart + VISIBLE);
          const canLeft = windowStart > 0;
          const canRight = windowStart + VISIBLE < STEPS.length;
          const arrowStyle = (enabled) => ({
            width: 30, height: 54, flexShrink: 0, borderRadius: 8,
            border: "1px solid #334155", background: "#0f172a",
            color: enabled ? "#94a3b8" : "#334155",
            cursor: enabled ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, padding: 0, transition: "all 0.15s",
            opacity: enabled ? 1 : 0.2,
          });
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 32 }}>
              <button style={arrowStyle(canLeft)} disabled={!canLeft}
                onClick={() => { setWindowDir('right'); setWindowStart(w => Math.max(0, w - 1)); }}>
                ‹
              </button>
              <div className={animClass} style={{ flex: 1, display: "flex", gap: 6, overflow: "hidden" }}>
                {visible.map(s => (
                  <button key={s.id} onClick={() => setStep(s.id)}
                    style={{
                      flex: 1, padding: "10px 6px", borderRadius: 8,
                      border: "1px solid", cursor: "pointer",
                      borderColor: step === s.id ? "#c9a84c" : s.id < step ? "rgba(201,168,76,0.3)" : "#1e293b",
                      background: step === s.id ? "rgba(201,168,76,0.12)" : s.id < step ? "rgba(201,168,76,0.05)" : "#0f172a",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      overflow: "hidden", transition: "all 0.2s",
                    }}>
                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                    <span style={{
                      fontSize: 11,
                      color: step === s.id ? "#c9a84c" : s.id < step ? "#94a3b8" : "#64748b",
                      fontWeight: step === s.id ? 700 : 400,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      maxWidth: "100%", padding: "0 2px",
                    }}>{s.label}</span>
                  </button>
                ))}
              </div>
              <button style={arrowStyle(canRight)} disabled={!canRight}
                onClick={() => { setWindowDir('left'); setWindowStart(w => Math.min(STEPS.length - VISIBLE, w + 1)); }}>
                ›
              </button>
            </div>
          );
        })()}

        {/* Lead Capture Gate */}
        {showLead && (
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "32px 36px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
            {/* Progress header — same as step cards */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 12, color: "#475569", fontWeight: 600, letterSpacing: "0.1em" }}>CONTACT INFO</div>
              <div style={{ height: 4, flex: 1, margin: "0 16px", background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "100%", background: "linear-gradient(90deg, #c9a84c, #a07830)", borderRadius: 2, transition: "width 0.3s" }} />
              </div>
              <div style={{ fontSize: 12, color: "#c9a84c", fontWeight: 700 }}>100%</div>
            </div>
            <h2 style={sh}>Almost There!</h2>
            <p style={sp}>Enter your contact info to see your personalized settlement estimate and AI case analysis.</p>
            <form onSubmit={handleLeadSubmit}>
              {[['name','Full Name','text','e.g. Jane Smith'],['email','Email Address','email','e.g. jane@email.com'],['phone','Phone Number','tel','e.g. (555) 555-0100']].map(([field, label, type, ph]) => (
                <div key={field} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>
                  <input required type={type} value={lead[field]} onChange={e => setLeadField(field, e.target.value)} placeholder={ph}
                    style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: 15, outline: "none", transition: "border 0.2s" }}
                    onFocus={e => e.target.style.borderColor = "#c9a84c"}
                    onBlur={e => e.target.style.borderColor = "#334155"}
                  />
                </div>
              ))}
              <p style={{ fontSize: 12, color: "#475569", marginBottom: 28, lineHeight: 1.6 }}>By submitting, you consent to being contacted about your case. We do not sell your information.</p>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <button type="button" onClick={() => setShowLead(false)}
                  style={{ padding: "12px 28px", borderRadius: 10, border: "1px solid #475569", background: "transparent", color: "#cbd5e1", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>← Back</button>
                <button type="submit"
                  style={{ padding: "12px 32px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #d4a843 0%, #a07830 100%)", color: "#1a0f00", cursor: "pointer", fontSize: 14, fontWeight: 800, letterSpacing: "0.02em", boxShadow: "0 4px 14px rgba(201,168,76,0.35)" }}>See My Results ⚖️</button>
              </div>
            </form>
          </div>
        )}

        {/* Main Card */}
        {!showResults && !showLead ? (
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "32px 36px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 12, color: "#475569", fontWeight: 600, letterSpacing: "0.1em" }}>QUESTION {step} OF {STEPS.length}</div>
              <div style={{ height: 4, flex: 1, margin: "0 16px", background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(step / STEPS.length) * 100}%`, background: "linear-gradient(90deg, #c9a84c, #a07830)", borderRadius: 2, transition: "width 0.3s" }} />
              </div>
              <div style={{ fontSize: 12, color: "#c9a84c", fontWeight: 700 }}>{Math.round((step / STEPS.length) * 100)}%</div>
            </div>

            {stepContent()}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, gap: 12 }}>
              <button disabled={step === 1}
                onClick={() => {
                  const next = Math.max(1, step - 1);
                  setStep(next);
                  if (next < windowStart + 1) { setWindowDir('right'); setWindowStart(w => Math.max(0, w - 1)); }

                }}
                style={{ padding: "12px 28px", borderRadius: 10, border: "1px solid #475569", background: "transparent", color: step === 1 ? "#334155" : "#cbd5e1", cursor: step === 1 ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600, opacity: step === 1 ? 0.4 : 1 }}>
                ← Back
              </button>
              {step < STEPS.length ? (
                <button
                  onClick={() => {
                    const next = Math.min(STEPS.length, step + 1);
                    setStep(next);
                    if (next > windowStart + visibleCount) { setWindowDir('left'); setWindowStart(w => Math.min(STEPS.length - visibleCount, w + 1)); }
                  }}
                  style={{ padding: "12px 32px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #d4a843 0%, #a07830 100%)", color: "#1a0f00", cursor: "pointer", fontSize: 14, fontWeight: 800, letterSpacing: "0.02em", boxShadow: "0 4px 14px rgba(201,168,76,0.35)" }}>
                  Continue →
                </button>
              ) : (
                <button onClick={() => setShowLead(true)}
                  style={{ padding: "12px 32px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #d4a843 0%, #a07830 100%)", color: "#1a0f00", cursor: "pointer", fontSize: 14, fontWeight: 800, letterSpacing: "0.02em", boxShadow: "0 4px 14px rgba(201,168,76,0.35)" }}>
                  Calculate Value ⚖️
                </button>
              )}
            </div>
          </div>
        ) : !showLead ? (
          /* Results Panel */
          <div>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "32px 36px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 26, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#e2e8f0" }}>Settlement Analysis</h2>
                  <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>{data.state} · {TORT_RULES[data.state]?.system}</div>
                </div>
                <button onClick={() => { setShowResults(false); setShowLead(false); setAiState({ loading: false, analysis: '', disclaimer: '', error: '' }); }}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 13 }}>← Edit</button>
              </div>

              {result.faultBarred ? (
                <div style={{ padding: 24, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🚫</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#ef4444", marginBottom: 8 }}>Recovery Likely Barred</div>
                  <div style={{ fontSize: 14, color: "#94a3b8" }}>{TORT_RULES[data.state]?.note} With {data.claimantFaultPct}% fault assigned to claimant, recovery may be entirely barred under {data.state} law. Consult an attorney.</div>
                </div>
              ) : (
                <>
                  {/* Settlement Range */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
                    {[
                      { label: "Conservative", val: result.low, color: "#64748b", sub: "Low demand / adjuster offer" },
                      { label: "Probable Range", val: result.mid, color: "#c9a84c", sub: "Likely settlement zone", highlight: true },
                      { label: "Strong Case", val: result.high, color: "#22c55e", sub: "Trial / max demand" },
                    ].map(r => (
                      <div key={r.label} style={{
                        padding: 20, borderRadius: 12, border: "1px solid",
                        borderColor: r.highlight ? "rgba(201,168,76,0.4)" : "#1e293b",
                        background: r.highlight ? "rgba(201,168,76,0.07)" : "#0a0f1e",
                        textAlign: "center",
                      }}>
                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{r.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: r.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{fmt(r.val)}</div>
                        <div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>{r.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Disclaimer */}
                  {aiState.disclaimer && (
                    <div style={{ marginBottom: 20, padding: "14px 16px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 10, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                      <strong style={{ color: "#c9a84c" }}>Disclaimer:</strong> {aiState.disclaimer}
                    </div>
                  )}

                  {/* Breakdown */}
                  <div style={{ borderTop: "1px solid #1e293b", paddingTop: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Damage Breakdown</div>
                    {[
                      ["Medical Bills (Gross)", parseFloat(data.totalMedBills) || 0],
                      ["Future Medical", data.futureMedExpected === "yes" ? parseFloat(data.futureMedDesc) || 0 : 0],
                      ["Lost Wages", parseFloat(data.lostIncome) || 0],
                      ["Property Damage", parseFloat(data.propDamageAmount) || 0],
                    ].map(([label, val]) => val > 0 ? (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e293b" }}>
                        <span style={{ fontSize: 14, color: "#94a3b8" }}>{label}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{fmt(val)}</span>
                      </div>
                    ) : null)}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e293b" }}>
                      <span style={{ fontSize: 14, color: "#94a3b8" }}>Pain & Suffering Multiplier</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#c9a84c" }}>{result.multiplierMid.toFixed(1)}x medicals</span>
                    </div>
                    {parseFloat(data.claimantFaultPct) > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e293b" }}>
                        <span style={{ fontSize: 14, color: "#ef4444" }}>Comparative Fault Reduction</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#ef4444" }}>-{data.claimantFaultPct}%</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", marginTop: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>Total Economic Damages</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{fmt(result.totalEconomic)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* AI Analysis Card */}
            {(aiState.loading || aiState.analysis || aiState.error) && (
              <div style={{ background: "#0f172a", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 16, padding: "24px 36px", marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#c9a84c", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>🤖 AI Case Analysis</div>
                {aiState.loading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#64748b", fontSize: 14 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Generating AI analysis...
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                  </div>
                )}
                {aiState.analysis && (
                  <p style={{ margin: 0, fontSize: 15, color: "#cbd5e1", lineHeight: 1.75, fontStyle: "italic" }}>"{aiState.analysis}"</p>
                )}
                {aiState.error && (
                  <p style={{ margin: 0, fontSize: 13, color: "#f87171" }}>{aiState.error}</p>
                )}
              </div>
            )}

            {/* Flags */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "24px 36px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>⚠️ Key Flags to Review</div>
              {[
                data.faultDisputed === "yes" && "⚠️ Fault is disputed — liability must be established before demand.",
                data.surgeriesRecommended === "yes" && "🔪 Surgery recommended but not yet performed — case value increases significantly if done.",
                data.preExisting && data.preExisting.trim().length > 5 && "📋 Pre-existing conditions present — defense will argue aggravation vs. new injury.",
                data.liens && data.liens.trim().length > 5 && "💰 Liens identified — lien resolution critical before finalizing any settlement.",
                data.liabilityLimit && parseFloat(data.liabilityLimit) < result?.mid && "🚨 Policy limits may be insufficient — evaluate UIM claim or excess demand.",
                data.lossOfEarningCapacity === "yes" && "📉 Loss of earning capacity noted — vocational expert may be needed to quantify.",
                !data.policeReport || data.policeReport === "no" && "📄 No police report — liability documentation may be challenging.",
              ].filter(Boolean).map((flag, i) => (
                <div key={i} style={{ padding: "10px 14px", background: "#0a0f1e", borderRadius: 8, marginBottom: 8, fontSize: 14, color: "#94a3b8", border: "1px solid #1e293b" }}>{flag}</div>
              ))}
              <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 10, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                <strong style={{ color: "#c9a84c" }}>Disclaimer:</strong> {aiState.disclaimer || 'This tool provides an educational estimate only. Values are based on general multiplier methodology and do not constitute legal advice. Actual settlement value depends on many additional factors. Consult a licensed personal injury attorney.'}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
