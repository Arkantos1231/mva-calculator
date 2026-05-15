/**
 * MVA Settlement Calculator — Vanilla JS (WordPress-compatible)
 * 9-step multi-step form with lead gate and AI analysis
 */
(function () {
  'use strict';

  /* ========== DATA ========== */

  var US_STATES = [
    'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
    'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
    'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
    'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
    'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
    'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
    'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
    'Wisconsin','Wyoming','Washington D.C.'
  ];

  var TORT_RULES = {
    'Alabama':         { system: 'Contributory Negligence',        bar: 'contributory' },
    'Alaska':          { system: 'Pure Comparative Fault',          bar: 'none' },
    'Arizona':         { system: 'Pure Comparative Fault',          bar: 'none' },
    'Arkansas':        { system: 'Modified Comparative (51%)',      bar: 51 },
    'California':      { system: 'Pure Comparative Fault',          bar: 'none' },
    'Colorado':        { system: 'Modified Comparative (51%)',      bar: 51 },
    'Connecticut':     { system: 'Modified Comparative (51%)',      bar: 51 },
    'Delaware':        { system: 'Modified Comparative (51%)',      bar: 51 },
    'Florida':         { system: 'Pure Comparative Fault',          bar: 'none' },
    'Georgia':         { system: 'Modified Comparative (50%)',      bar: 50 },
    'Hawaii':          { system: 'Modified Comparative (51%)',      bar: 51 },
    'Idaho':           { system: 'Modified Comparative (50%)',      bar: 50 },
    'Illinois':        { system: 'Modified Comparative (51%)',      bar: 51 },
    'Indiana':         { system: 'Modified Comparative (51%)',      bar: 51 },
    'Iowa':            { system: 'Modified Comparative (51%)',      bar: 51 },
    'Kansas':          { system: 'Modified Comparative (51%)',      bar: 51 },
    'Kentucky':        { system: 'No-Fault / PIP',                  bar: 'none' },
    'Louisiana':       { system: 'Pure Comparative Fault',          bar: 'none' },
    'Maine':           { system: 'Modified Comparative (50%)',      bar: 50 },
    'Maryland':        { system: 'Contributory Negligence',         bar: 'contributory' },
    'Massachusetts':   { system: 'Modified Comparative (51%)',      bar: 51 },
    'Michigan':        { system: 'No-Fault / Modified Comparative', bar: 51 },
    'Minnesota':       { system: 'No-Fault / Modified Comparative', bar: 51 },
    'Mississippi':     { system: 'Pure Comparative Fault',          bar: 'none' },
    'Missouri':        { system: 'Pure Comparative Fault',          bar: 'none' },
    'Montana':         { system: 'Modified Comparative (51%)',      bar: 51 },
    'Nebraska':        { system: 'Modified Comparative (50%)',      bar: 50 },
    'Nevada':          { system: 'Modified Comparative (51%)',      bar: 51 },
    'New Hampshire':   { system: 'Modified Comparative (51%)',      bar: 51 },
    'New Jersey':      { system: 'No-Fault / Modified Comparative', bar: 51 },
    'New Mexico':      { system: 'Pure Comparative Fault',          bar: 'none' },
    'New York':        { system: 'No-Fault / Pure Comparative',     bar: 'none' },
    'North Carolina':  { system: 'Contributory Negligence',         bar: 'contributory' },
    'North Dakota':    { system: 'No-Fault / Modified Comparative', bar: 50 },
    'Ohio':            { system: 'Modified Comparative (51%)',      bar: 51 },
    'Oklahoma':        { system: 'Modified Comparative (51%)',      bar: 51 },
    'Oregon':          { system: 'Modified Comparative (51%)',      bar: 51 },
    'Pennsylvania':    { system: 'No-Fault / Modified Comparative', bar: 51 },
    'Rhode Island':    { system: 'Pure Comparative Fault',          bar: 'none' },
    'South Carolina':  { system: 'Modified Comparative (51%)',      bar: 51 },
    'South Dakota':    { system: 'Pure Comparative Fault',          bar: 'none' },
    'Tennessee':       { system: 'Modified Comparative (50%)',      bar: 50 },
    'Texas':           { system: 'Modified Comparative (51%)',      bar: 51 },
    'Utah':            { system: 'No-Fault / Modified Comparative', bar: 50 },
    'Vermont':         { system: 'Modified Comparative (51%)',      bar: 51 },
    'Virginia':        { system: 'Contributory Negligence',         bar: 'contributory' },
    'Washington':      { system: 'Pure Comparative Fault',          bar: 'none' },
    'Washington D.C.': { system: 'Contributory Negligence',         bar: 'contributory' },
    'West Virginia':   { system: 'Modified Comparative (51%)',      bar: 51 },
    'Wisconsin':       { system: 'Modified Comparative (51%)',      bar: 51 },
    'Wyoming':         { system: 'Modified Comparative (51%)',      bar: 51 },
  };

  var TRANSLATIONS = {
    en: {
      steps: [
        { id: 1, label: 'Jurisdiction', icon: '⚖️' },
        { id: 2, label: 'Accident',     icon: '🚗' },
        { id: 3, label: 'Property',     icon: '🔧' },
        { id: 4, label: 'Injuries',     icon: '🏥' },
        { id: 5, label: 'MMI Status',   icon: '📋' },
        { id: 6, label: 'Medical $',    icon: '💊' },
        { id: 7, label: 'Lost Wages',   icon: '💼' },
        { id: 8, label: 'Impact',       icon: '🧠' },
        { id: 9, label: 'History',      icon: '📁' },
      ],
      question_of: 'QUESTION {n} OF {total}',
      back: '← Back', continue: 'Continue →', calculate: 'Calculate Value ⚖️',
      see_results: 'See My Results ⚖️', edit: '← Edit', contact_info: 'CONTACT INFO',
      lead_title: 'Almost There!',
      lead_desc: 'Enter your contact info to receive your personalized settlement estimate and AI case analysis.',
      full_name: 'Full Name', email_label: 'Email Address', phone_label: 'Phone Number',
      consent: 'By submitting this form, I agree to the Terms, Contact & Notification Policy and Privacy Policy and provide my express written consent to be contacted by Pinder Plotkin LLC, its affiliated brands (such as Abogado Attorney), companies, attorneys, staff, agents, co-counsel, and approved third parties via automated/AI-generated text and voice (including artificial voices). I consent to receive an immediate response even if I am on a Do Not Call list or if it is currently outside of standard quiet hours. Consent not required for service. Msg & data rates may apply. Reply STOP to cancel.',
      step1_title: 'Jurisdiction & Date', step1_desc: 'This determines which legal rules apply to your claim.',
      step2_title: 'Accident Details', step2_desc: 'Describe what happened and who was responsible.',
      step3_title: 'Property Damage', step3_desc: 'Vehicle damage is a key indicator of impact severity and injury credibility.',
      step4_title: 'Injuries', step4_desc: 'List all diagnosed injuries and surgical history.',
      step5_title: 'MMI Status', step5_desc: 'Maximum Medical Improvement determines whether damages are fixed or ongoing.',
      step6_title: 'Medical Bills & Future Care', step6_desc: 'Use gross (pre-adjustment) amounts — what was billed, not what insurance paid.',
      step7_title: 'Lost Wages & Earning Capacity', step7_desc: 'Document all economic impact from lost employment.',
      step8_title: 'Life Impact & Pain and Suffering', step8_desc: 'Non-economic damages are often the largest component of settlement value.',
      step9_title: 'Prior History & Risk Factors', step9_desc: 'These factors can significantly impact valuation and legal exposure.',
      state_label: 'State where accident occurred', accident_date: 'Date of Accident',
      collision_desc: 'Describe the collision (type, how it happened)',
      collision_ph: 'e.g. Rear-ended at a red light. At-fault driver was texting.',
      fault_disputed: 'Is fault disputed?', police_report: 'Was a police report filed?',
      yes: 'Yes', no: 'No', unknown: 'Unknown',
      prop_damage_desc: 'Describe the property damage',
      prop_damage_ph: 'e.g. Rear bumper crushed, frame bent. Airbags deployed.',
      damage_severity: 'Damage severity', minor: 'Minor', moderate: 'Moderate', severe: 'Severe',
      outcome: 'Outcome', repaired: 'Repaired', totaled: 'Total Loss',
      repair_amount: 'Repair bill or total loss value ($)',
      injuries_label: 'Injuries diagnosed (list all)',
      injuries_ph: 'e.g. L4-L5 herniated disc, cervical strain, concussion, fractured right wrist',
      surgeries_performed: 'Any surgeries performed?',
      surgeries_recommended: 'Any surgeries recommended but not yet done?',
      at_mmi: 'Has claimant reached MMI?', still_treating: 'No — still treating',
      mmi_date: 'Date MMI was Reached',
      permanent_rating: 'Is there a permanent impairment rating?',
      ongoing_treatment: 'Describe ongoing treatment',
      ongoing_ph: 'e.g. Monthly pain management, PT twice weekly, awaiting surgery consult',
      med_bills: 'Total medical bills to date — GROSS ($)',
      future_med: 'Are future medical expenses anticipated?',
      future_med_cost: 'Estimated future medical costs ($)',
      missed_work: 'Did claimant miss work due to injuries?',
      occupation: 'Occupation', lost_income: 'Total lost income ($)',
      loss_capacity: "Any loss of earning capacity (can't do same job long-term)?",
      life_impact: 'How has this injury impacted daily life?',
      life_impact_ph: "e.g. Can't lift my kids, stopped playing golf, sleep disrupted nightly",
      psych_effects: 'Any psychological effects? (anxiety, PTSD, depression)',
      psych_ph: 'e.g. Diagnosed with PTSD, anxiety driving, seeing therapist weekly',
      perm_limits: 'Permanent limitations (if any)',
      perm_ph: 'e.g. Physician states patient will have chronic lower back pain, 10% whole-person impairment',
      pre_existing: 'Any pre-existing conditions in the same body areas?',
      pre_ph: 'e.g. Prior L4-L5 disc bulge treated in 2019, no symptoms for 3 years before accident',
      prior_claims: 'Any prior accident claims or lawsuits?',
      prior_ph: 'e.g. 2018 slip and fall settled for $12,000 — different body part (knee)',
      liens_label: "Known liens? (health insurance, Medicare/Medicaid, workers' comp)",
      liens_ph: "e.g. BCBS paid $28,000 — lien asserted. No Medicare/Medicaid.",
      claimant_fault: 'Estimated claimant % of fault (if any)',
      settlement_analysis: 'Settlement Analysis', range_to: 'to',
      range_label: 'Estimated Settlement Range',
      ai_calculating: 'Calculating your settlement range...',
      damage_breakdown: 'Damage Breakdown', med_bills_gross: 'Medical Bills (Gross)',
      future_medical: 'Future Medical', lost_wages_label: 'Lost Wages', prop_damage_label: 'Property Damage',
      ps_multiplier: 'Pain & Suffering Multiplier', fault_reduction: 'Comparative Fault Reduction',
      total_economic: 'Total Economic Damages', recovery_barred: 'Recovery Likely Barred',
      barred_desc: "Based on the selected state's contributory negligence rule, any fault assigned to the claimant may bar all recovery. Please consult a licensed attorney.",
      ai_analysis: '🤖 AI Case Analysis', ai_generating: 'Generating AI analysis...',
      flags_title: '⚠️ Key Flags to Review', no_flags: '✅ No major risk flags identified.',
      disclaimer_label: 'Disclaimer',
      flag_disputed: '⚠️ Fault is disputed — liability must be established before demand.',
      flag_surgery: '🔪 Surgery recommended but not yet performed — case value increases significantly if done.',
      flag_preexisting: '📋 Pre-existing conditions present — defense will argue aggravation vs. new injury.',
      flag_liens: '💰 Liens identified — lien resolution critical before finalizing any settlement.',
      flag_capacity: '📉 Loss of earning capacity noted — vocational expert may be needed to quantify.',
      flag_police: '📄 No police report — liability documentation may be challenging.',
      header_title: 'MVA Settlement Calculator',
      header_sub: 'Motor Vehicle Accident · Personal Injury Valuation Tool',
      disclaimer_short: 'DISCLAIMER', disclaimer_sub: 'Educational use only. Not legal advice.',
    },
    es: {
      steps: [
        { id: 1, label: 'Jurisdicción', icon: '⚖️' },
        { id: 2, label: 'Accidente',    icon: '🚗' },
        { id: 3, label: 'Propiedad',    icon: '🔧' },
        { id: 4, label: 'Lesiones',     icon: '🏥' },
        { id: 5, label: 'Estado MMI',   icon: '📋' },
        { id: 6, label: 'Médico $',     icon: '💊' },
        { id: 7, label: 'Salario',      icon: '💼' },
        { id: 8, label: 'Impacto',      icon: '🧠' },
        { id: 9, label: 'Historial',    icon: '📁' },
      ],
      question_of: 'PREGUNTA {n} DE {total}',
      back: '← Atrás', continue: 'Continuar →', calculate: 'Calcular Valor ⚖️',
      see_results: 'Ver Mis Resultados ⚖️', edit: '← Editar', contact_info: 'DATOS DE CONTACTO',
      lead_title: '¡Casi Listo!',
      lead_desc: 'Ingresa tu información de contacto para recibir tu estimado personalizado y análisis de caso con IA.',
      full_name: 'Nombre Completo', email_label: 'Correo Electrónico', phone_label: 'Número de Teléfono',
      consent: 'Al enviar este formulario, acepto los Términos, la Política de Contacto y Notificación y la Política de Privacidad, y doy mi consentimiento expreso por escrito para ser contactado por Pinder Plotkin LLC, sus marcas afiliadas (como Abogado Attorney), empresas, abogados, personal, agentes, co-consejeros y terceros aprobados mediante texto y voz automatizados/generados por IA (incluidas voces artificiales). Consiento recibir una respuesta inmediata aunque esté en una lista de No Llamar o fuera del horario estándar. El consentimiento no es requerido para el servicio. Pueden aplicar tarifas de mensajes y datos. Responde STOP para cancelar.',
      step1_title: 'Jurisdicción y Fecha', step1_desc: 'Esto determina qué reglas legales aplican a tu reclamación.',
      step2_title: 'Detalles del Accidente', step2_desc: 'Describe lo que sucedió y quién fue responsable.',
      step3_title: 'Daños a la Propiedad', step3_desc: 'El daño al vehículo es un indicador clave de la severidad del impacto y credibilidad de lesiones.',
      step4_title: 'Lesiones', step4_desc: 'Lista todas las lesiones diagnosticadas e historial quirúrgico.',
      step5_title: 'Estado MMI', step5_desc: 'La Mejoría Médica Máxima determina si los daños son fijos o continuos.',
      step6_title: 'Facturas Médicas y Cuidado Futuro', step6_desc: 'Usa montos brutos (antes de ajustes) — lo que se facturó, no lo que pagó el seguro.',
      step7_title: 'Salarios Perdidos y Capacidad de Ganancias', step7_desc: 'Documenta todo el impacto económico por pérdida de empleo.',
      step8_title: 'Impacto en la Vida y Dolor y Sufrimiento', step8_desc: 'Los daños no económicos son frecuentemente el componente más grande del valor del acuerdo.',
      step9_title: 'Historial Previo y Factores de Riesgo', step9_desc: 'Estos factores pueden impactar significativamente la valuación y la exposición legal.',
      state_label: 'Estado donde ocurrió el accidente', accident_date: 'Fecha del Accidente',
      collision_desc: 'Describe la colisión (tipo, cómo ocurrió)',
      collision_ph: 'Ej: Choque trasero en semáforo. El conductor culpable enviaba mensajes.',
      fault_disputed: '¿La culpa está en disputa?', police_report: '¿Se presentó un reporte policial?',
      yes: 'Sí', no: 'No', unknown: 'Desconocido',
      prop_damage_desc: 'Describe los daños a la propiedad',
      prop_damage_ph: 'Ej: Defensa trasera aplastada, chasis doblado. Bolsas de aire activadas.',
      damage_severity: 'Severidad del daño', minor: 'Menor', moderate: 'Moderado', severe: 'Severo',
      outcome: 'Resultado', repaired: 'Reparado', totaled: 'Pérdida Total',
      repair_amount: 'Factura de reparación o valor de pérdida total ($)',
      injuries_label: 'Lesiones diagnosticadas (listar todas)',
      injuries_ph: 'Ej: Hernia discal L4-L5, tensión cervical, conmoción, fractura de muñeca derecha',
      surgeries_performed: '¿Se realizaron cirugías?',
      surgeries_recommended: '¿Hay cirugías recomendadas pero aún no realizadas?',
      at_mmi: '¿El demandante alcanzó la MMI?', still_treating: 'No — aún en tratamiento',
      mmi_date: 'Fecha en que se alcanzó la MMI',
      permanent_rating: '¿Existe una calificación de discapacidad permanente?',
      ongoing_treatment: 'Describe el tratamiento en curso',
      ongoing_ph: 'Ej: Manejo del dolor mensual, fisioterapia dos veces por semana, en espera de consulta quirúrgica',
      med_bills: 'Total de facturas médicas hasta la fecha — BRUTO ($)',
      future_med: '¿Se anticipan gastos médicos futuros?',
      future_med_cost: 'Costos médicos futuros estimados ($)',
      missed_work: '¿El demandante faltó al trabajo debido a las lesiones?',
      occupation: 'Ocupación', lost_income: 'Total de ingresos perdidos ($)',
      loss_capacity: '¿Hay pérdida de capacidad de ganancias (no puede hacer el mismo trabajo a largo plazo)?',
      life_impact: '¿Cómo ha impactado esta lesión en la vida diaria?',
      life_impact_ph: 'Ej: No puedo cargar a mis hijos, dejé de jugar golf, sueño interrumpido, dependo de mi pareja',
      psych_effects: '¿Algún efecto psicológico? (ansiedad, PTSD, depresión)',
      psych_ph: 'Ej: Diagnosticado con PTSD, ansiedad al manejar, viendo terapeuta semanalmente',
      perm_limits: 'Limitaciones permanentes (si aplica)',
      perm_ph: 'Ej: El médico indica dolor lumbar crónico, 10% de discapacidad corporal total',
      pre_existing: '¿Alguna condición preexistente en las mismas áreas del cuerpo?',
      pre_ph: 'Ej: Hernia discal L4-L5 previa tratada en 2019, sin síntomas por 3 años antes del accidente',
      prior_claims: '¿Alguna reclamación o demanda previa por accidente?',
      prior_ph: 'Ej: Resbalón en 2018 resuelto por $12,000 — parte diferente del cuerpo (rodilla)',
      liens_label: '¿Gravámenes conocidos? (seguro médico, Medicare/Medicaid, compensación laboral)',
      liens_ph: 'Ej: BCBS pagó $28,000 — gravamen presentado. Sin Medicare/Medicaid.',
      claimant_fault: '% estimado de culpa del demandante (si aplica)',
      settlement_analysis: 'Análisis del Acuerdo', range_to: 'a',
      range_label: 'Rango Estimado de Acuerdo',
      ai_calculating: 'Calculando tu rango de acuerdo...',
      damage_breakdown: 'Desglose de Daños', med_bills_gross: 'Facturas Médicas (Bruto)',
      future_medical: 'Médico Futuro', lost_wages_label: 'Salarios Perdidos', prop_damage_label: 'Daños a la Propiedad',
      ps_multiplier: 'Multiplicador de Dolor y Sufrimiento', fault_reduction: 'Reducción por Culpa Comparativa',
      total_economic: 'Total de Daños Económicos', recovery_barred: 'Recuperación Probablemente Impedida',
      barred_desc: 'Según la regla de negligencia contributiva del estado seleccionado, cualquier culpa asignada al demandante puede impedir toda recuperación. Por favor consulte a un abogado.',
      ai_analysis: '🤖 Análisis de Caso con IA', ai_generating: 'Generando análisis con IA...',
      flags_title: '⚠️ Factores Clave a Revisar', no_flags: '✅ No se identificaron factores de riesgo mayores.',
      disclaimer_label: 'Aviso Legal',
      flag_disputed: '⚠️ La culpa está en disputa — la responsabilidad debe establecerse antes de la demanda.',
      flag_surgery: '🔪 Cirugía recomendada pero aún no realizada — el valor del caso aumenta significativamente si se realiza.',
      flag_preexisting: '📋 Condiciones preexistentes — la defensa argumentará agravación vs. lesión nueva.',
      flag_liens: '💰 Gravámenes identificados — resolución de gravámenes crítica antes de finalizar el acuerdo.',
      flag_capacity: '📉 Pérdida de capacidad de ganancias — puede necesitarse un experto vocacional para cuantificarla.',
      flag_police: '📄 Sin reporte policial — la documentación de responsabilidad puede ser un desafío.',
      header_title: 'Calculadora de Acuerdo MVA',
      header_sub: 'Accidente de Tráfico · Herramienta de Valuación de Lesiones Personales',
      disclaimer_short: 'AVISO', disclaimer_sub: 'Solo uso educativo. No es asesoría legal.',
    }
  };

  var lang = (typeof window !== 'undefined' && window.mvaAjax && window.mvaAjax.lang) ? window.mvaAjax.lang : 'en';
  var T = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  var STEPS = T.steps;

  /* ========== GA4 TRACKING ========== */

  var calculatorInteracted = false;

  function trackCalculatorStart(stateValue) {
    if (!calculatorInteracted) {
      if (typeof gtag === 'function') {
        gtag('event', 'calculator_start', {
          'page_title': document.title,
          'page_location': window.location.href,
          'state_calculator': stateValue || ''
        });
      }
      calculatorInteracted = true;
    }
  }

  document.addEventListener('focus', function (e) {
    if (e.target.matches('.mva-input, .mva-select, .mva-radio-btn')) {
      trackCalculatorStart(state.data.state);
    }
  }, true);

  document.addEventListener('change', function (e) {
    if (e.target.matches('.mva-input, .mva-select')) {
      trackCalculatorStart(state.data.state);
    }
  });

  /* ========== STATE ========== */

  var state = {
    step: 1,
    windowStart: 0,
    windowDir: '',
    showLead: false,
    showResults: false,
    aiLoading: false,
    aiAnalysis: '',
    aiError: '',
    disclaimer: '',
    aiPrompt: '',
    aiExplanation: '',
    data: {
      state: '', accidentDate: '',
      faultDesc: '', faultDisputed: '', policeReport: '',
      propDamageDesc: '', propDamageLevel: '', repairOrTotal: '', propDamageAmount: '',
      injuries: '', surgeriesPerformed: '', surgeriesRecommended: '',
      atMMI: '', mmiDate: '', permanentRating: '', ongoingTreatment: '',
      totalMedBills: '', futureMedExpected: '', futureMedDesc: '',
      missedWork: '', occupation: '', lostIncome: '', lossOfEarningCapacity: '',
      lifeImpact: '', psychologicalEffects: '', permanentLimitations: '',
      preExisting: '', priorClaims: '',
    },
    lead: { name: '', email: '', phone: '' },
    mathResult: null,
  };

  /* ========== MATH ========== */

  function calculateSettlement(d) {
    var medBills    = parseFloat(d.totalMedBills)  || 0;
    var futureMed   = d.futureMedExpected === 'yes' ? (parseFloat(d.futureMedDesc) || 0) : 0;
    var lostWages   = parseFloat(d.lostIncome)     || 0;
    var propDamage  = parseFloat(d.propDamageAmount) || 0;
    var totalEcon   = medBills + futureMed + lostWages + propDamage;

    // Multiplier
    var mult = 2.5;
    if (d.surgeriesPerformed === 'yes')      mult += 1.0;
    if (d.surgeriesRecommended === 'yes')    mult += 0.5;
    if (d.permanentRating === 'yes')         mult += 0.75;
    if (d.permanentLimitations && d.permanentLimitations.trim().length > 10) mult += 0.5;
    if (d.psychologicalEffects && d.psychologicalEffects.trim().length > 10) mult += 0.5;
    if (d.propDamageLevel === 'severe')      mult += 0.5;
    if (d.propDamageLevel === 'minor')       mult -= 0.5;
    if (d.preExisting && d.preExisting.trim().length > 5) mult -= 0.5;
    if (d.lossOfEarningCapacity === 'yes')   mult += 0.5;
    mult = Math.max(1.0, mult);

    var painAndSuffering = medBills * mult;
    var gross = totalEcon + painAndSuffering;

    var mid  = Math.round(gross / 500) * 500;
    var low  = Math.round(mid * 0.80 / 500) * 500;
    var high = Math.round(mid * 1.20 / 500) * 500;

    return { low: low, mid: mid, high: high, barred: false, totalEcon: totalEcon, mult: mult };
  }

  function fmt(n) {
    return '$' + n.toLocaleString('en-US');
  }

  function getVisibleCount() {
    var w = window.innerWidth;
    if (w < 480) return 3;
    if (w < 768) return 5;
    return 7;
  }

  /* ========== RENDER HELPERS ========== */

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html) e.innerHTML = html;
    return e;
  }

  function input(field, type, placeholder, label) {
    var wrap = el('div', 'mva-field');
    var lbl  = el('label', 'mva-label');
    lbl.textContent = label;
    var inp = el('input');
    inp.className   = 'mva-input';
    inp.type        = type || 'text';
    inp.placeholder = placeholder || '';
    inp.value       = state.data[field] || '';
    inp.addEventListener('input', function () { state.data[field] = this.value; });
    wrap.appendChild(lbl);
    wrap.appendChild(inp);
    return wrap;
  }

  function textarea(field, placeholder, label) {
    var wrap = el('div', 'mva-field');
    var lbl  = el('label', 'mva-label');
    lbl.textContent = label;
    var ta = el('textarea', 'mva-textarea');
    ta.placeholder   = placeholder || '';
    ta.textContent   = state.data[field] || '';
    ta.addEventListener('input', function () { state.data[field] = this.value; });
    wrap.appendChild(lbl);
    wrap.appendChild(ta);
    return wrap;
  }

  function radio(field, options, label) {
    var wrap = el('div', 'mva-field');
    var lbl  = el('label', 'mva-label');
    lbl.textContent = label;
    var group = el('div', 'mva-radio-group');
    options.forEach(function (opt) {
      var btn = el('button', 'mva-radio-btn' + (state.data[field] === opt.value ? ' selected' : ''));
      btn.type = 'button';
      btn.textContent = opt.label;
      btn.addEventListener('click', function () {
        state.data[field] = opt.value;
        render();
      });
      group.appendChild(btn);
    });
    wrap.appendChild(lbl);
    wrap.appendChild(group);
    return wrap;
  }

  function select(field, options, label) {
    var wrap = el('div', 'mva-field');
    var lbl  = el('label', 'mva-label');
    lbl.textContent = label;
    var sel = el('select', 'mva-select');
    var defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Select...';
    sel.appendChild(defaultOpt);
    options.forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o;
      if (state.data[field] === o) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', function () {
      state.data[field] = this.value;
      render();
    });
    wrap.appendChild(lbl);
    wrap.appendChild(sel);
    return wrap;
  }

  /* ========== STEP CONTENT ========== */

  function renderStepContent(frag) {
    var d = state.data;
    var s = state.step;

    var title = el('h2', 'mva-step-title');
    var desc  = el('p',  'mva-step-desc');

    switch (s) {
      case 1:
        title.textContent = T.step1_title;
        desc.textContent = T.step1_desc;
        frag.appendChild(title);
        frag.appendChild(desc);
        frag.appendChild(select('state', US_STATES, T.state_label));
        frag.appendChild(input('accidentDate', 'date', '', T.accident_date));
        break;

      case 2:
        title.textContent = T.step2_title;
        desc.textContent = T.step2_desc;
        frag.appendChild(title);
        frag.appendChild(desc);
        frag.appendChild(textarea('faultDesc', T.collision_ph, T.collision_desc));
        frag.appendChild(radio('faultDisputed', [{ value: 'yes', label: T.yes }, { value: 'no', label: T.no }, { value: 'unknown', label: T.unknown }], T.fault_disputed));
        frag.appendChild(radio('policeReport', [{ value: 'yes', label: T.yes }, { value: 'no', label: T.no }], T.police_report));
        break;

      case 3:
        title.textContent = T.step3_title;
        desc.textContent = T.step3_desc;
        frag.appendChild(title);
        frag.appendChild(desc);
        frag.appendChild(textarea('propDamageDesc', T.prop_damage_ph, T.prop_damage_desc));
        frag.appendChild(radio('propDamageLevel', [{ value: 'minor', label: T.minor }, { value: 'moderate', label: T.moderate }, { value: 'severe', label: T.severe }], T.damage_severity));
        frag.appendChild(radio('repairOrTotal', [{ value: 'repaired', label: T.repaired }, { value: 'totaled', label: T.totaled }], T.outcome));
        frag.appendChild(input('propDamageAmount', 'number', 'e.g. 8500', T.repair_amount));
        break;

      case 4:
        title.textContent = T.step4_title;
        desc.textContent = T.step4_desc;
        frag.appendChild(title);
        frag.appendChild(desc);
        frag.appendChild(textarea('injuries', T.injuries_ph, T.injuries_label));
        frag.appendChild(radio('surgeriesPerformed', [{ value: 'yes', label: T.yes }, { value: 'no', label: T.no }], T.surgeries_performed));
        frag.appendChild(radio('surgeriesRecommended', [{ value: 'yes', label: T.yes }, { value: 'no', label: T.no }], T.surgeries_recommended));
        break;

      case 5:
        title.textContent = T.step5_title;
        desc.textContent = T.step5_desc;
        frag.appendChild(title);
        frag.appendChild(desc);
        frag.appendChild(radio('atMMI', [{ value: 'yes', label: T.yes }, { value: 'no', label: T.still_treating }], T.at_mmi));
        if (d.atMMI === 'yes') {
          frag.appendChild(input('mmiDate', 'date', '', T.mmi_date));
          frag.appendChild(radio('permanentRating', [{ value: 'yes', label: T.yes }, { value: 'no', label: T.no }], T.permanent_rating));
        }
        if (d.atMMI === 'no') {
          frag.appendChild(textarea('ongoingTreatment', T.ongoing_ph, T.ongoing_treatment));
        }
        break;

      case 6:
        title.textContent = T.step6_title;
        desc.textContent = T.step6_desc;
        frag.appendChild(title);
        frag.appendChild(desc);
        frag.appendChild(input('totalMedBills', 'number', 'e.g. 75000', T.med_bills));
        frag.appendChild(radio('futureMedExpected', [{ value: 'yes', label: T.yes }, { value: 'no', label: T.no }], T.future_med));
        if (d.futureMedExpected === 'yes') {
          frag.appendChild(input('futureMedDesc', 'number', 'e.g. 30000', T.future_med_cost));
        }
        break;

      case 7:
        title.textContent = T.step7_title;
        desc.textContent = T.step7_desc;
        frag.appendChild(title);
        frag.appendChild(desc);
        frag.appendChild(radio('missedWork', [{ value: 'yes', label: T.yes }, { value: 'no', label: T.no }], T.missed_work));
        if (d.missedWork === 'yes') {
          frag.appendChild(input('occupation', 'text', 'e.g. Registered Nurse', T.occupation));
          frag.appendChild(input('lostIncome', 'number', 'e.g. 18000', T.lost_income));
        }
        frag.appendChild(radio('lossOfEarningCapacity', [{ value: 'yes', label: T.yes }, { value: 'no', label: T.no }], T.loss_capacity));
        break;

      case 8:
        title.textContent = T.step8_title;
        desc.textContent = T.step8_desc;
        frag.appendChild(title);
        frag.appendChild(desc);
        frag.appendChild(textarea('lifeImpact', T.life_impact_ph, T.life_impact));
        frag.appendChild(textarea('psychologicalEffects', T.psych_ph, T.psych_effects));
        frag.appendChild(textarea('permanentLimitations', T.perm_ph, T.perm_limits));
        break;

      case 9:
        title.textContent = T.step9_title;
        desc.textContent = T.step9_desc;
        frag.appendChild(title);
        frag.appendChild(desc);
        frag.appendChild(textarea('preExisting', T.pre_ph, T.pre_existing));
        frag.appendChild(textarea('priorClaims', T.prior_ph, T.prior_claims));
        break;
    }
  }

  /* ========== LEAD GATE ========== */

  function renderLeadGate(root) {
    var card = el('div', 'mva-card');

    // Progress bar (100%)
    var prog = el('div', 'mva-progress-bar-wrap');
    prog.innerHTML = '<div class="mva-progress-label">' + T.contact_info + '</div>' +
      '<div class="mva-progress-track"><div class="mva-progress-fill" style="width:100%"></div></div>' +
      '<div class="mva-progress-pct">100%</div>';
    card.appendChild(prog);

    var title = el('h2', 'mva-step-title');
    title.textContent = T.lead_title;
    card.appendChild(title);

    var desc = el('p', 'mva-step-desc');
    desc.textContent = T.lead_desc;
    card.appendChild(desc);

    var form = el('form', 'mva-lead-form');
    var fields = [
      { key: 'name',  label: T.full_name,    type: 'text',  ph: 'e.g. Jane Smith' },
      { key: 'email', label: T.email_label,  type: 'email', ph: 'e.g. jane@email.com' },
      { key: 'phone', label: T.phone_label,  type: 'tel',   ph: 'e.g. (555) 555-0100' },
    ];
    fields.forEach(function (f) {
      var lbl = el('label', 'mva-label');
      lbl.textContent = f.label;
      var inp = el('input');
      inp.type        = f.type;
      inp.placeholder = f.ph;
      inp.required    = true;
      inp.value       = state.lead[f.key] || '';
      inp.addEventListener('input', function () { state.lead[f.key] = this.value; });
      inp.addEventListener('focus', function () { this.style.borderColor = '#c9a84c'; });
      inp.addEventListener('blur',  function () { this.style.borderColor = '#334155'; });
      form.appendChild(lbl);
      form.appendChild(inp);
    });

    var consent = el('p', 'mva-consent-text');
    consent.textContent = T.consent;
    form.appendChild(consent);

    var nav = el('div', 'mva-nav');
    var backBtn = el('button', 'mva-btn-back');
    backBtn.type = 'button';
    backBtn.textContent = T.back;
    backBtn.addEventListener('click', function () {
      state.showLead = false;
      render();
    });

    var submitBtn = el('button', 'mva-btn-next');
    submitBtn.type = 'submit';
    submitBtn.textContent = T.see_results;

    nav.appendChild(backBtn);
    nav.appendChild(submitBtn);
    form.appendChild(nav);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleLeadSubmit();
    });

    card.appendChild(form);
    root.appendChild(card);
  }

  /* ========== AJAX SUBMIT ========== */

  function handleLeadSubmit() {
    var fallbackMath  = calculateSettlement(state.data);
    state.mathResult  = null;  // will be set from AI response
    state.showLead    = false;
    state.showResults = true;
    state.aiLoading   = true;

    if (typeof gtag === 'function') {
      gtag('event', 'calculator_complete', {
        'page_title': document.title,
        'page_location': window.location.href,
        'state_calculator': state.data.state || ''
      });
    }

    render();

    var WP_AJAX = (typeof window !== 'undefined' && window.mvaAjax) ? window.mvaAjax : null;

    if (!WP_AJAX) {
      // Dev / non-WP mode — use local math as fallback
      state.aiLoading  = false;
      state.mathResult = fallbackMath;
      render();
      return;
    }

    var body = new FormData();
    body.append('action',     'mva_calculate');
    body.append('nonce',      WP_AJAX.nonce);
    body.append('formData',   JSON.stringify(state.data));
    body.append('mathResult', JSON.stringify(fallbackMath));
    body.append('name',       state.lead.name);
    body.append('email',      state.lead.email);
    body.append('phone',      state.lead.phone);

    fetch(WP_AJAX.ajaxurl, { method: 'POST', body: body })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        state.aiLoading = false;
        if (json.success && json.data && json.data.range) {
          state.mathResult    = json.data.range;
          state.aiPrompt      = json.data.prompt      || '';
          state.aiExplanation = json.data.explanation || '';
          state.disclaimer    = json.data.disclaimer  || '';
        } else {
          state.mathResult    = fallbackMath;
          state.aiPrompt      = '';
          state.aiExplanation = '';
          state.disclaimer    = '';
        }
        render();
      })
      .catch(function () {
        state.aiLoading  = false;
        state.mathResult = fallbackMath;
        render();
      });
  }

  /* ========== RESULTS PANEL ========== */

  function renderResults(root) {
    // Main result card
    var card = el('div', 'mva-card');

    var header = el('div', 'mva-result-header');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px;';
    var titleWrap = el('div');
    var h2 = el('h2');
    h2.style.cssText = 'margin:0;font-family:\'Plus Jakarta Sans\',sans-serif;font-size:23px;color:#e2e8f0;';
    h2.textContent = T.settlement_analysis;
    var stateLine = el('div', 'mva-result-state');
    stateLine.textContent = state.data.state || 'All States';
    titleWrap.appendChild(h2);
    titleWrap.appendChild(stateLine);

    var editBtn = el('button', 'mva-edit-btn');
    editBtn.type = 'button';
    editBtn.textContent = T.edit;
    editBtn.addEventListener('click', function () {
      state.showResults = false;
      state.showLead    = false;
      state.aiLoading   = false;
      state.mathResult  = null;
      render();
    });

    header.appendChild(titleWrap);
    header.appendChild(editBtn);
    card.appendChild(header);

    if (state.aiLoading) {
      // AI is calculating — show spinner
      var loadingDiv = el('div', 'mva-range-loading');
      loadingDiv.innerHTML =
        '<div class="mva-spinner"></div>' +
        '<div class="mva-range-loading-text">' + T.ai_calculating + '</div>';
      card.appendChild(loadingDiv);
    } else {
      var math = state.mathResult;
      // Range display
      var rangeWrap = el('div', 'mva-range-display');
      rangeWrap.innerHTML =
        '<div class="mva-range-label">' + T.range_label + '</div>' +
        '<div class="mva-range-value">' + fmt(math.low) + ' <span class="mva-range-to">' + T.range_to + '</span> ' + fmt(math.high) + '</div>';
      card.appendChild(rangeWrap);

      // Disclaimer below range
      if (state.disclaimer) {
        var disclaimerBox = el('div', 'mva-disclaimer-box');
        disclaimerBox.innerHTML = '<strong class="mva-disclaimer-label">' + T.disclaimer_label + ':</strong> ' + state.disclaimer;
        card.appendChild(disclaimerBox);
      }
    }

    root.appendChild(card);
  }

  /* ========== MAIN RENDER ========== */

  function render() {
    var root = document.getElementById('mva-calculator-root');
    if (!root) return;
    root.innerHTML = '';

    // Header
    var header = el('div', 'mva-header');
    header.innerHTML =
      '<div class="mva-header-inner">' +
        '<div class="mva-header-icon">⚖️</div>' +
        '<div>' +
          '<div class="mva-header-title">' + T.header_title + '</div>' +
          '<div class="mva-header-sub">' + T.header_sub + '</div>' +
        '</div>' +
        '<div class="mva-header-disclaimer"><strong>' + T.disclaimer_short + '</strong>' + T.disclaimer_sub + '</div>' +
      '</div>';
    root.appendChild(header);

    var body = el('div', 'mva-body');
    root.appendChild(body);

    // LEAD GATE
    if (state.showLead) {
      renderLeadGate(body);
      return;
    }

    // RESULTS
    if (state.showResults) {
      renderResults(body);
      return;
    }

    // STEP INDICATORS — responsive sliding window
    var VISIBLE = getVisibleCount();
    state.windowStart = Math.min(state.windowStart, Math.max(0, STEPS.length - VISIBLE));
    var animClass = state.windowDir ? ' mva-steps-anim-' + state.windowDir : '';
    state.windowDir = '';

    var stepsWrapper = el('div', 'mva-steps-wrapper');

    var leftArrow = el('button', 'mva-steps-arrow');
    leftArrow.type = 'button';
    leftArrow.innerHTML = '&#8249;';
    leftArrow.disabled = (state.windowStart === 0);
    leftArrow.addEventListener('click', function () {
      state.windowStart = Math.max(0, state.windowStart - 1);
      state.windowDir = 'right';
      render();
    });

    var stepsBar = el('div', 'mva-steps' + animClass);
    STEPS.slice(state.windowStart, state.windowStart + VISIBLE).forEach(function (s) {
      var btn = el('button', 'mva-step-btn' + (s.id === state.step ? ' active' : s.id < state.step ? ' done' : ''));
      btn.type = 'button';
      btn.innerHTML = '<span class="mva-step-icon">' + s.icon + '</span><span class="mva-step-label">' + s.label + '</span>';
      btn.addEventListener('click', function () { state.step = s.id; render(); });
      stepsBar.appendChild(btn);
    });

    var rightArrow = el('button', 'mva-steps-arrow');
    rightArrow.type = 'button';
    rightArrow.innerHTML = '&#8250;';
    rightArrow.disabled = (state.windowStart + VISIBLE >= STEPS.length);
    rightArrow.addEventListener('click', function () {
      state.windowStart = Math.min(STEPS.length - VISIBLE, state.windowStart + 1);
      state.windowDir = 'left';
      render();
    });

    stepsWrapper.appendChild(leftArrow);
    stepsWrapper.appendChild(stepsBar);
    stepsWrapper.appendChild(rightArrow);
    body.appendChild(stepsWrapper);

    // CARD
    var card = el('div', 'mva-card');

    // Progress bar
    var pct = Math.round((state.step / STEPS.length) * 100);
    var prog = el('div', 'mva-progress-bar-wrap');
    prog.innerHTML =
      '<div class="mva-progress-label">' + T.question_of.replace('{n}', state.step).replace('{total}', STEPS.length) + '</div>' +
      '<div class="mva-progress-track"><div class="mva-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="mva-progress-pct">' + pct + '%</div>';
    card.appendChild(prog);

    // Step content
    var frag = document.createDocumentFragment();
    renderStepContent(frag);
    card.appendChild(frag);

    // Nav buttons
    var nav = el('div', 'mva-nav');

    var backBtn = el('button', 'mva-btn-back');
    backBtn.type = 'button';
    backBtn.textContent = T.back;
    backBtn.disabled = (state.step === 1);
    backBtn.addEventListener('click', function () {
      if (state.step > 1) {
        state.step--;
        if (state.step < state.windowStart + 1) {
          state.windowStart = Math.max(0, state.windowStart - 1);
          state.windowDir = 'right';
        }
        render();
      }
    });

    var nextBtn = el('button', 'mva-btn-next');
    nextBtn.type = 'button';
    if (state.step < STEPS.length) {
      nextBtn.textContent = T.continue;
      nextBtn.addEventListener('click', function () {
        state.step++;
        var vis = getVisibleCount();
        if (state.step > state.windowStart + vis) {
          state.windowStart = Math.min(STEPS.length - vis, state.windowStart + 1);
          state.windowDir = 'left';
        }
        render();
      });
    } else {
      nextBtn.textContent = T.calculate;
      nextBtn.addEventListener('click', function () {
        state.showLead = true;
        render();
      });
    }

    nav.appendChild(backBtn);
    nav.appendChild(nextBtn);
    card.appendChild(nav);

    body.appendChild(card);
  }

  /* ========== INIT ========== */

  function init() {
    var root = document.getElementById('mva-calculator-root');
    if (!root) return;
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
