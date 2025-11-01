// i18n.js — translations (EN + HI). Add kn as needed.
const I18N = {
  en: {
    appTitle: "MGNREGA Tracker — Karnataka",
    appSubtitle: "Employment Guarantee Scheme — District View",
    welcome: "Track MGNREGA performance in your district",
    autoDetect: "Auto-detect my district",
    selectDistrict: "Select district",
    viewDashboard: "View Dashboard",
    changeDistrict: "Change district",
    totalWorkers: "Total Workers",
    jobCards: "Job Cards",
    personDays: "Person-Days",
    totalExpenditure: "Total Expenditure",
    employmentTrend: "Employment Trend (6 months)",
    expenditureTrend: "Expenditure (Crores)",
    detailedStats: "Detailed Statistics",
    footer: "Made with ❤️ for Rural Karnataka — Build For Bharat Fellowship 2026",
    months: ["Jan","Feb","Mar","Apr","May","Jun"],
    pleaseSelect: "Please select a district",
    offlineNotice: "Data offline — showing cached values"
  },
  hi: {
    appTitle: "मनरेगा ट्रैकर — कर्नाटक",
    appSubtitle: "रोज़गार गारंटी योजना — जिला दृश्य",
    welcome: "अपने जिले में मनरेगा प्रदर्शन ट्रैक करें",
    autoDetect: "मेरा जिला स्वतः पता करें",
    selectDistrict: "जिला चुनें",
    viewDashboard: "डैशबोर्ड देखें",
    changeDistrict: "जिला बदलें",
    totalWorkers: "कुल मजदूर",
    jobCards: "जॉब कार्ड",
    personDays: "व्यक्ति-दिन",
    totalExpenditure: "कुल व्यय",
    employmentTrend: "रोज़गार प्रवृत्ति (6 महीने)",
    expenditureTrend: "व्यय (कोटोड़ में)",
    detailedStats: "विस्तृत आँकड़े",
    footer: "ग्रामीण कर्नाटक के लिए ❤️ — Build For Bharat Fellowship 2026",
    months: ["जन","फर","मार्च","अप्रै","मई","जून"],
    pleaseSelect: "कृपया जिला चुनें",
    offlineNotice: "डेटा ऑफ़लाइन — कैश्ड मान दिखा रहे हैं"
  }
};

let currentLang = localStorage.getItem('lang') || 'en';
function t(key) { return (I18N[currentLang] && I18N[currentLang][key]) || key; }
function setLang(lang) { currentLang = lang; localStorage.setItem('lang', lang); }
