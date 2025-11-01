const I18N = {
  en: {
    appTitle: "MGNREGA — Maharashtra",
    appSubtitle: "Simple district-level view of work & wages",
    welcome: "See how MGNREGA is performing in your district",
    autoDetect: "Find my district automatically",
    selectDistrict: "Choose your district",
    viewDashboard: "Open Dashboard",
    changeDistrict: "Pick another district",
    totalWorkers: "Workers (Total)",
    jobCards: "Active Job Cards",
    personDays: "Person-Days Generated",
    totalExpenditure: "Total Spend (₹ Crore)",
    employmentTrend: "Last 6 months — Employment",
    expenditureTrend: "Monthly Spend (in Crores)",
    detailedStats: "More details",
    scPersonDays: "SC person-days",
    stPersonDays: "ST person-days",
    womenPersonDays: "Women person-days",
    worksCompleted: "Works completed",
    activeJobSeekers: "Active job seekers",
    avgDaysPerHH: "Avg days / household",
    footer: "Made for Maharashtra — Build For Bharat Fellowship",
    months: ["Jan","Feb","Mar","Apr","May","Jun"],
    pleaseSelect: "Please select a district from the list",
    offlineNotice: "You are offline — showing saved data",
    loading: "Loading data…",
    lastUpdated: "Last updated",
    sourceSeed: "Sample data (demo)",
    sourceLive: "Live data (data.gov.in)"
  },

  hi: {
    appTitle: "मनरेगा — महाराष्ट्र डैशबोर्ड",
    appSubtitle: "जिला स्तर पर सरल दृश्य: काम और वेतन",
    welcome: "अपने जिले में मनरेगा का हाल देखें",
    autoDetect: "मेरा जिला अपने आप पता करें",
    selectDistrict: "अपना जिला चुनें",
    viewDashboard: "डैशबोर्ड खोलें",
    changeDistrict: "दूसरा जिला चुनें",
    totalWorkers: "कुल श्रमिक",
    jobCards: "सक्रिय जॉब कार्ड",
    personDays: "उत्पन्न व्यक्ति-दिन",
    totalExpenditure: "कुल व्यय (₹ करोड़)",
    employmentTrend: "पिछले 6 महीने — रोजगार",
    expenditureTrend: "मासिक व्यय (कॉट में)",
    detailedStats: "विस्तृत जानकारी",
    scPersonDays: "एससी व्यक्ति-दिन",
    stPersonDays: "एसटी व्यक्ति-दिन",
    womenPersonDays: "महिलाएँ — व्यक्ति-दिन",
    worksCompleted: "पूरा हुआ काम",
    activeJobSeekers: "सक्रिय नौकरी खोजने वाले",
    avgDaysPerHH: "प्रति घर औसत दिन",
    footer: "महाराष्ट्र के लिए बनाया — Build For Bharat Fellowship",
    months: ["जन","फर","मार्च","अप्रै","मई","जून"],
    pleaseSelect: "कृपया सूची से जिला चुनें",
    offlineNotice: "आप ऑफ़लाइन हैं — सहेजा हुआ डेटा दिखा रहे हैं",
    loading: "डेटा लोड हो रहा है…",
    lastUpdated: "अंतिम अपडेट",
    sourceSeed: "नमूना डेटा (डेमो)",
    sourceLive: "सीधा डेटा (data.gov.in)"
  }
};

let currentLang = localStorage.getItem('lang') || 'en';

function t(key) {
  const s = I18N[currentLang] && I18N[currentLang][key];
  if (typeof s === 'undefined') {
    return (I18N.en && I18N.en[key]) || key;
  }
  return s;
}

function setLang(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  localStorage.setItem('lang', lang);
}
