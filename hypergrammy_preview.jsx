import React, { useMemo, useState, useEffect } from "react";

// Hypergrammy™ — Everyday Edition (Final Combined Version)
// Single-file React + Tailwind. Sleek, modern, and print/export ready.

// ---------- Utils ----------
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const norm = (x, min, max) => (max === min ? 0 : clamp((x - min) / (max - min), 0, 1));

function ageFactor(age){ if(age<=18) return .55; if(age<=28) return .55+(age-18)*(.35/10); if(age<=36) return .9+(age-28)*(.1/8); if(age<=45) return 1-(age-36)*(.12/9); if(age<=55) return .88-(age-45)*(.18/10); return .65 }
function heightScore(cm){ const base=.4+norm(cm,160,200)*.6; return clamp(cm>200?base+.02:base,0,1) }
function incomeScoreGBP(annualGBP){ const min=15000,max=200000,val=Math.max(annualGBP,1); const s=(Math.log(val)-Math.log(min))/(Math.log(max)-Math.log(min)); return clamp(s,0,1) }
function mapEducation(level){switch(level){case"None":return .2;case"College / A-levels":return .45;case"Undergraduate":return .7;case"Postgraduate":return .85;case"PhD / Professional":return 1;default:return .6}}
function mapCareer(level){const m={1:.25,2:.45,3:.65,4:.82,5:1};return m[level]||.65}

// Accent themes (enumerated to keep Tailwind happy)
const ACCENTS = {
  emerald: { grad3: "from-emerald-400 via-cyan-400 to-indigo-500", grad2: "from-emerald-400 to-indigo-500", chip: "from-emerald-500 to-cyan-500", accent: "accent-cyan-500" },
  violet: { grad3: "from-violet-400 via-fuchsia-400 to-rose-500", grad2: "from-violet-400 to-rose-500", chip: "from-violet-500 to-fuchsia-500", accent: "accent-fuchsia-500" },
  amber: { grad3: "from-amber-400 via-orange-400 to-pink-500", grad2: "from-amber-400 to-pink-500", chip: "from-amber-500 to-orange-500", accent: "accent-orange-500" },
  teal: { grad3: "from-teal-400 via-sky-400 to-blue-500", grad2: "from-teal-400 to-blue-500", chip: "from-teal-500 to-sky-500", accent: "accent-sky-500" }
};

// ---------- Progress Bar ----------
function Progress({percent,label,grad3}){
  const pct = clamp(percent,0,100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs sm:text-sm text-zinc-500 dark:text-zinc-400"><span>{label}</span><span>{pct.toFixed(0)}%</span></div>
      <div className="h-2.5 w-full rounded-full bg-zinc-200/70 dark:bg-zinc-800 overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${grad3} transition-all duration-500`} style={{width:`${pct}%`}}/>
      </div>
    </div>
  );
}

// ---------- Accent Dot ----------
function AccentDot({color,active,onClick}){
  const map={
    emerald:"bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500",
    violet:"bg-gradient-to-r from-violet-400 via-fuchsia-400 to-rose-500",
    amber:"bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500",
    teal:"bg-gradient-to-r from-teal-400 via-sky-400 to-blue-500",
  };
  return (
    <button
      onClick={onClick}
      title={`${color} accent`}
      className={`h-5 w-5 rounded-full ${map[color]} ${active ? "ring-2 ring-offset-2 ring-cyan-300" : ""}`}
    />
  );
}

// ---------- Reusable UI ----------
function Card({title,subtitle,children,className=""}){
  return (
    <section className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur p-5 ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
function Panel({title,subtitle,children}){
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
      <div className="flex items-baseline justify-between mb-2">
        <h4 className="font-medium">{title}</h4>
        {subtitle && <span className="text-xs text-zinc-500">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}
function Mini({title,value}){
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 text-center">
      <div className="text-[11px] text-zinc-500">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
function NumberInput({label,value,setValue,min,max,step=1,suffix="",accent}){
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-zinc-700 dark:text-zinc-200">{label}</span>
      <div className="flex items-center gap-2">
        <input type="number" className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/70 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-600" value={value} min={min} max={max} step={step} onChange={e=>setValue(Number(e.target.value))}/>
        {suffix && <span className="text-xs text-zinc-500 w-10">{suffix}</span>}
      </div>
      <input className={accent} type="range" min={min} max={max} step={step} value={value} onChange={e=>setValue(Number(e.target.value))}/>
    </label>
  );
}
function MoneyInput({label,value,setValue,min=0,max=250000,accent}){
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-zinc-700 dark:text-zinc-200">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm">£</span>
        <input type="number" className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/70 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-600" value={value} min={min} max={max} step={1000} onChange={e=>setValue(Number(e.target.value))}/>
      </div>
      <input className={accent} type="range" min={min} max={max} step={1000} value={value} onChange={e=>setValue(Number(e.target.value))}/>
    </label>
  );
}
function RangeInput({label,value,setValue,min=1,max=10,accent}){
  return (
    <label className="flex flex-col gap-1">
      <div className="flex justify-between text-sm"><span className="text-zinc-700 dark:text-zinc-200">{label}</span><span className="text-zinc-500">{value}</span></div>
      <input className={accent} type="range" min={min} max={max} value={value} onChange={e=>setValue(Number(e.target.value))}/>
    </label>
  );
}
function SelectInput({label,value,setValue,options}){
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-zinc-700 dark:text-zinc-200">{label}</span>
      <select className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/70 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-600" value={value} onChange={e=>setValue(isNaN(Number(e.target.value))?e.target.value:Number(e.target.value))}>
        {options.map(o=>(<option value={o.value} key={o.label}>{o.label}</option>))}
      </select>
    </label>
  );
}
function SwitchRow({label,checked,onChange,accent}){
  return (
    <label className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-sm">{label}</span>
      <input type="checkbox" className={`w-5 h-5 ${accent}`} checked={checked} onChange={e=>onChange(e.target.checked)}/>
    </label>
  );
}
function Chip({label,checked,onChange,chip}){
  return (
    <button onClick={()=>onChange(!checked)} className={`text-xs px-3 py-1 rounded-full border transition ${checked?`bg-gradient-to-r ${chip} text-white border-transparent`:"bg-white/80 dark:bg-zinc-900/70 text-zinc-700 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400"}`}>
      {checked?"✓ ":"+ "}{label}
    </button>
  );
}
function Hint({text}){return (<p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{text}</p>);} 
function Targets({items,grad2}){
  return (
    <div className="space-y-3">
      {items.map((it,i)=>{
        const pct = it.current && it.target ? clamp((it.current/it.target)*100,0,100) : 0;
        return (
          <div className="space-y-1" key={i}>
            <div className="flex justify-between text-xs text-zinc-500"><span>{it.label}</span><span>{it.prefix||""}{it.current}{it.suffix||""} → <span className="font-medium text-zinc-700 dark:text-zinc-200">{it.prefix||""}{it.target}{it.suffix||""}</span></span></div>
            <div className="h-2.5 bg-zinc-200/70 dark:bg-zinc-800 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${grad2}`} style={{width:`${pct}%`}}/></div>
          </div>
        );
      })}
    </div>
  );
}
function BoostersList({scores}){
  const areas=[
    { key:"Physique", score:scores.physiqueS, weight:.2, tip:"3–6 sessions/wk; progressive overload; 1.6–2.2g/kg protein."},
    { key:"Face / Grooming", score:scores.faceS, weight:.3, tip:"SPF daily; barber lineup; dentist clean/whiten."},
    { key:"Style", score:scores.styleS, weight:.1, tip:"Uniform: dark denim/chinos, clean sneakers, tailored jacket."},
    { key:"Charisma", score:scores.charismaS, weight:.2, tip:"Toastmasters/improv weekly; slow pace; open posture."},
    { key:"Income", score:scores.incomeS, weight:.28, tip:"Ship quantified wins; negotiate; add cert + case study."},
    { key:"Career", score:scores.careerS, weight:.18, tip:"Own a small project; publish metrics; ask for scope growth."},
    { key:"Financial Health", score:scores.moneyS, weight:.4, tip:"Kill high‑interest debt; 3–6 mo buffer; auto‑save 15–20%."},
    { key:"Social Proof", score:scores.socialS, weight:.1, tip:"Team sport; host monthly; quarterly photo set."},
  ];
  const top = areas.map(a=>({...a,potential:a.weight*(1-a.score)})).sort((a,b)=>b.potential-a.potential).slice(0,3);
  return (
    <ul className="text-sm text-zinc-700 dark:text-zinc-300 space-y-2 list-disc pl-5">
      {top.map(b=> (<li key={b.key}><span className="font-medium">{b.key}:</span> {b.tip}</li>))}
    </ul>
  );
}

// ---------- Main ----------
export default function HypergrammyCalculator(){
  // Theme (class strategy)
  const [dark,setDark]=useState(false);
  useEffect(()=>{ const s=localStorage.getItem("hg-theme"); if(s!==null) setDark(s==="dark"); },[]);
  useEffect(()=>{ localStorage.setItem("hg-theme", dark?"dark":"light") },[dark]);

  // Accent theme
  const [accent,setAccent]=useState("emerald");
  useEffect(()=>{ const a=localStorage.getItem("hg-accent"); if(a && ACCENTS[a]) setAccent(a); },[]);
  useEffect(()=>{ localStorage.setItem("hg-accent", accent); },[accent]);
  const styles = ACCENTS[accent] || ACCENTS.emerald;

  // Neutral defaults
  const [age,setAge]=useState(28);
  const [heightCm,setHeightCm]=useState(178);
  const [physique,setPhysique]=useState(5);
  const [face,setFace]=useState(5);
  const [style,setStyle]=useState(5);
  const [charisma,setCharisma]=useState(5);
  const [income,setIncome]=useState(30000);
  const [careerLevel,setCareerLevel]=useState(2);
  const [education,setEducation]=useState("College / A-levels");
  const [socialProof,setSocialProof]=useState(5);
  const [financialHealth,setFinancialHealth]=useState(5);
  const [region,setRegion]=useState("City / Large Town");

  // Plans
  const [whatIf,setWhatIf]=useState({physique:false,face:false,style:false,charisma:false,income:false,career:false,money:false,social:false});
  const [workoutPlan,setWorkoutPlan]=useState("None");
  const [fashionBudget,setFashionBudget]=useState("£100–£200");
  const [wardrobePreset,setWardrobePreset]=useState("None");
  const [socialPlans,setSocialPlans]=useState({host:false,team:false,meetups:false});
  const [incomePlans,setIncomePlans]=useState({raise:false,certSprint:false,sideGig:false,contracting:false,interviewPrep:false,networking:false});
  const [easyWins,setEasyWins]=useState({cv:false,linkedin:false,referrals:false,portfolio:false});
  const [raisePlanApplied,setRaisePlanApplied]=useState(false);

  // === Load from URL hash (share link) or localStorage ===
  useEffect(()=>{
    const hash=window.location.hash||"";
    if(hash.includes("#hg=")){
      try{
        const raw = hash.split("#hg=")[1];
        const data = JSON.parse(decodeURIComponent(atob(raw)));
        if(data?.inputs){
          const i=data.inputs;
          setAge(i.age??28); setHeightCm(i.heightCm??178); setPhysique(i.physique??5); setFace(i.face??5); setStyle(i.style??5);
          setCharisma(i.charisma??5); setIncome(i.income??30000); setCareerLevel(i.careerLevel??2); setEducation(i.education??"College / A-levels");
          setSocialProof(i.socialProof??5); setFinancialHealth(i.financialHealth??5); setRegion(i.location??"City / Large Town");
        }
        if(data?.whatIf) setWhatIf(data.whatIf);
        if(data?.workoutPlan) setWorkoutPlan(data.workoutPlan);
        if(data?.fashionBudget) setFashionBudget(data.fashionBudget);
        if(data?.wardrobePreset) setWardrobePreset(data.wardrobePreset);
        if(data?.socialPlans) setSocialPlans(data.socialPlans);
        if(data?.incomePlans) setIncomePlans(data.incomePlans);
        if(data?.easyWins) setEasyWins(data.easyWins);
        if(typeof data?.raisePlanApplied === 'boolean') setRaisePlanApplied(data.raisePlanApplied);
        if(data?.accent && ACCENTS[data.accent]) setAccent(data.accent);
        if(typeof data?.dark === 'boolean') setDark(data.dark);
        return; // Skip localStorage load if URL present
      }catch{/* ignore */}
    }
    const saved=localStorage.getItem("hypergrammy-final");
    if(saved){
      try{
        const s=JSON.parse(saved); const i=s.inputs||{};
        setAge(i.age??28); setHeightCm(i.heightCm??178); setPhysique(i.physique??5); setFace(i.face??5); setStyle(i.style??5);
        setCharisma(i.charisma??5); setIncome(i.income??30000); setCareerLevel(i.careerLevel??2); setEducation(i.education??"College / A-levels");
        setSocialProof(i.socialProof??5); setFinancialHealth(i.financialHealth??5); setRegion(i.location??"City / Large Town");
        setWhatIf(s.whatIf??whatIf); setWorkoutPlan(s.workoutPlan??workoutPlan); setFashionBudget(s.fashionBudget??fashionBudget);
        setWardrobePreset(s.wardrobePreset??wardrobePreset); setSocialPlans(s.socialPlans??socialPlans); setIncomePlans(s.incomePlans??incomePlans);
        setEasyWins(s.easyWins??easyWins); setRaisePlanApplied(s.raisePlanApplied??raisePlanApplied);
      }catch{ /* ignore */ }
    }
    // eslint-disable-next-line
  },[]);

  // Persist to localStorage
  useEffect(()=>{
    const inputs={age,heightCm,physique,face,style,charisma,income,careerLevel,education,socialProof,financialHealth,location: region};
    localStorage.setItem("hypergrammy-final",JSON.stringify({inputs,whatIf,workoutPlan,fashionBudget,wardrobePreset,socialPlans,incomePlans,easyWins,raisePlanApplied}));
  },[age,heightCm,physique,face,style,charisma,income,careerLevel,education,socialProof,financialHealth,region,whatIf,workoutPlan,fashionBudget,wardrobePreset,socialPlans,incomePlans,easyWins,raisePlanApplied]);

  // Share link
  const [copied,setCopied]=useState(false);
  function copyShare(){
    const inputs={age,heightCm,physique,face,style,charisma,income,careerLevel,education,socialProof,financialHealth,location: region};
    const payload={inputs,whatIf,workoutPlan,fashionBudget,wardrobePreset,socialPlans,incomePlans,easyWins,raisePlanApplied,accent,dark};
    const encoded=btoa(encodeURIComponent(JSON.stringify(payload)));
    const url=`${window.location.origin}${window.location.pathname}#hg=${encoded}`;
    navigator.clipboard?.writeText(url).then(()=>{setCopied(true); setTimeout(()=>setCopied(false),1500);});
  }

  // Scoring
  const baseInputs={age,heightCm,physique,face,style,charisma,income,careerLevel,education,socialProof,financialHealth,location: region};
  function compute(inputs){
    const ageS=ageFactor(inputs.age), heightS=heightScore(inputs.heightCm), physiqueS=norm(inputs.physique,1,10), faceS=norm(inputs.face,1,10), styleS=norm(inputs.style,1,10), charismaS=norm(inputs.charisma,1,10), incomeS=incomeScoreGBP(inputs.income), careerS=mapCareer(inputs.careerLevel), eduS=mapEducation(inputs.education), socialS=norm(inputs.socialProof,1,10), moneyS=norm(inputs.financialHealth,1,10);
    const locBonus=inputs.location==="London / Major City"?.02:inputs.location==="City / Large Town"?.01:0;
    const attractiveness=.3*faceS+.2*physiqueS+.15*heightS+.1*styleS+.1*ageS+.15*charismaS;
    const status=.28*incomeS+.18*careerS+.08*eduS+.1*socialS+.2*charismaS+.14*moneyS+locBonus;
    const stability=.4*moneyS+.25*careerS+.2*incomeS+.15*ageS;
    const overall=.35*attractiveness+.4*status+.25*stability;
    const hyperBoost=1+.2*(charismaS-.5)+.1*(socialS-.5)+.05*(styleS-.5);
    const hyperLevel=clamp(overall*hyperBoost*100,0,100);
    const percentile=hyperLevel, reach=clamp(percentile+(charismaS*10+socialS*6+styleS*4),0,100);
    return {attractiveness,status,stability,hyperLevel,percentile,reach,ageS,physiqueS,faceS,styleS,charismaS,incomeS,careerS,eduS,socialS,moneyS};
  }
  function applyWhatIf(inputs){
    const x={...inputs};
    if(whatIf.physique) x.physique=Math.min(x.physique+2,10);
    if(whatIf.face) x.face=Math.min(x.face+1,10);
    if(whatIf.style) x.style=Math.min(x.style+2,10);
    if(whatIf.charisma) x.charisma=Math.min(x.charisma+2,10);
    if(whatIf.income) x.income+=10000;
    if(whatIf.career) x.careerLevel=Math.min(x.careerLevel+1,5);
    if(whatIf.money) x.financialHealth=Math.min(x.financialHealth+2,10);
    if(whatIf.social) x.socialProof=Math.min(x.socialProof+2,10);
    const wDelta=( {"None":0,"Beginner 3x":1,"Upper/Lower 4x":1.5,"PPL 5–6x":2} )[workoutPlan]||0; x.physique=Math.min(x.physique+wDelta,10); if(wDelta>0) x.charisma=Math.min(x.charisma+.3,10);
    const bMap={"None":{s:0,sp:0},"£100–£200":{s:.5,sp:.2},"£300–£500":{s:1.5,sp:.5},"£500+":{s:2.5,sp:.8}}; const f=bMap[fashionBudget]||{s:0,sp:0}; x.style=Math.min(x.style+f.s,10); x.socialProof=Math.min(x.socialProof+f.sp,10);
    if(wardrobePreset!=="None"){ x.style=Math.min(x.style+.5,10); x.socialProof=Math.min(x.socialProof+.2,10); }
    if(socialPlans.host){ x.socialProof=Math.min(x.socialProof+1,10); x.charisma=Math.min(x.charisma+.3,10) }
    if(socialPlans.team){ x.socialProof=Math.min(x.socialProof+1.5,10) }
    if(socialPlans.meetups){ x.socialProof=Math.min(x.socialProof+1,10) }
    if(incomePlans.raise){ x.income+=5000 }
    if(incomePlans.certSprint){ x.income+=3000; x.careerLevel=Math.min(x.careerLevel+1,5) }
    if(incomePlans.sideGig){ x.income+=4000 }
    if(incomePlans.contracting){ x.income+=12000; x.careerLevel=Math.min(x.careerLevel+1,5) }
    if(incomePlans.interviewPrep){ x.income+=4000 }
    if(incomePlans.networking){ x.income+=2000 }
    if(raisePlanApplied){ x.income+=10000 }
    return x;
  }
  const scores = useMemo(()=>compute(baseInputs),[age,heightCm,physique,face,style,charisma,income,careerLevel,education,socialProof,financialHealth,region]);
  const simulated = useMemo(()=>compute(applyWhatIf(baseInputs)),[whatIf,workoutPlan,fashionBudget,wardrobePreset,socialPlans,incomePlans,raisePlanApplied,age,heightCm,physique,face,style,charisma,income,careerLevel,education,socialProof,financialHealth,region]);
  const improvedIncome = useMemo(()=>applyWhatIf(baseInputs).income,[whatIf,workoutPlan,fashionBudget,wardrobePreset,socialPlans,incomePlans,raisePlanApplied,age,heightCm,physique,face,style,charisma,income,careerLevel,education,socialProof,financialHealth,region]);
  const delta = (simulated.hyperLevel - scores.hyperLevel).toFixed(1);

  const reset=()=>{
    setAge(28);setHeightCm(178);setPhysique(5);setFace(5);setStyle(5);setCharisma(5);setIncome(30000);setCareerLevel(2);setEducation("College / A-levels");setSocialProof(5);setFinancialHealth(5);setRegion("City / Large Town");
    setWhatIf({physique:false,face:false,style:false,charisma:false,income:false,career:false,money:false,social:false});
    setWorkoutPlan("None");setFashionBudget("£100–£200");setWardrobePreset("None");setSocialPlans({host:false,team:false,meetups:false});
    setIncomePlans({raise:false,certSprint:false,sideGig:false,contracting:false,interviewPrep:false,networking:false});
    setEasyWins({cv:false,linkedin:false,referrals:false,portfolio:false});
    setRaisePlanApplied(false);
  };

  // === Export & Print helpers ===
  const buildChecklist = () => `# 90-Day Game Plan — Checklist\n\n- [ ] Weeks 1–2 — Lock Foundations\n  - [ ] Baseline photos & lifts\n  - [ ] Wardrobe audit\n  - [ ] Barber + dentist\n  - [ ] Sleep 7–8h\n  - [ ] Protein 1.6–2.2g/kg\n\n- [ ] Weeks 3–6 — Build Capacity\n  - [ ] Follow workout plan\n  - [ ] Add 3 go-to uniform fits\n  - [ ] 1 weekly speaking/meetup rep\n  - [ ] Capture 1 work win with metrics\n\n- [ ] Weeks 7–10 — Go Visible\n  - [ ] Publish 1-page case study\n  - [ ] Refresh LinkedIn/photos\n  - [ ] Host one small event\n  - [ ] Line up 3 recruiter calls\n\n- [ ] Weeks 11–12 — Convert\n  - [ ] Negotiate with comps\n  - [ ] Automate savings (15–20%)\n  - [ ] Review progress\n  - [ ] Set next 90-day target stack\n`;

  const exportRoadmap = () => {
    const blob = new Blob([buildChecklist()], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hypergrammy-roadmap.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const saveAsPDF = () => { window.print(); };

  return (
    <div className={dark?"dark":""}>
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-100">
        {/* Top bar */}
        <div className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-zinc-900/60 border-b border-zinc-200/60 dark:border-zinc-800 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${styles.grad3}`}></span>
              <span className="font-semibold tracking-tight">Hypergrammy<span className="text-emerald-500">™</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 mr-2">
                <AccentDot color="emerald" active={accent==="emerald"} onClick={()=>setAccent("emerald")} />
                <AccentDot color="violet" active={accent==="violet"} onClick={()=>setAccent("violet")} />
                <AccentDot color="amber" active={accent==="amber"} onClick={()=>setAccent("amber")} />
                <AccentDot color="teal" active={accent==="teal"} onClick={()=>setAccent("teal")} />
              </div>
              <button onClick={copyShare} className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800">{copied?"✓ Copied":"Share"}</button>
              <button onClick={()=>setDark(v=>!v)} className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800">{dark?"☀️ Light":"🌙 Dark"}</button>
              <button onClick={reset} className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800">Reset</button>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto p-4 sm:p-6">
          <style>{`
            @page { margin: 12mm; }
            @media print {
              html, body { background: #fff !important; }
              * { box-shadow: none !important; text-shadow: none !important; }
              .print\\:hidden { display: none !important; }
              .print\\:block { display: block !important; }
            }
          `}</style>

          {/* Hero */}
          <div className="mb-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hypergrammy™ — Unlock Your Best Self</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Dial in your inputs, simulate upgrades in real time, and leave with a focused 90-day action plan.</p>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0 print:hidden">
                <button onClick={exportRoadmap} className="px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Create Progress Roadmap</button>
                <button onClick={saveAsPDF} className="px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Save as PDF</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
            {/* Inputs */}
            <Card title="Your Inputs" subtitle="Adjust to match you. Stored locally.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberInput label="Age" value={age} setValue={setAge} min={18} max={70} step={1} suffix="yrs" accent={styles.accent}/>
                <NumberInput label="Height" value={heightCm} setValue={setHeightCm} min={155} max={210} step={1} suffix="cm" accent={styles.accent}/>
                <RangeInput label="Physique (1–10)" value={physique} setValue={setPhysique} accent={styles.accent}/>
                <RangeInput label="Face (1–10)" value={face} setValue={setFace} accent={styles.accent}/>
                <RangeInput label="Style/Grooming (1–10)" value={style} setValue={setStyle} accent={styles.accent}/>
                <RangeInput label="Charisma/Confidence (1–10)" value={charisma} setValue={setCharisma} accent={styles.accent}/>
                <MoneyInput label="Income (annual)" value={income} setValue={setIncome} accent={styles.accent}/>
                <SelectInput label="Career Level" value={careerLevel} setValue={setCareerLevel} options={[{label:"1 — Entry",value:1},{label:"2 — Junior",value:2},{label:"3 — Mid",value:3},{label:"4 — Senior/Lead",value:4},{label:"5 — Exec/Founder",value:5}]}/>
                <SelectInput label="Education" value={education} setValue={setEducation} options={[{label:"None",value:"None"},{label:"College / A-levels",value:"College / A-levels"},{label:"Undergraduate",value:"Undergraduate"},{label:"Postgraduate",value:"Postgraduate"},{label:"PhD / Professional",value:"PhD / Professional"}]}/>
                <RangeInput label="Social Proof (1–10)" value={socialProof} setValue={setSocialProof} accent={styles.accent}/>
                <RangeInput label="Financial Health (1–10)" value={financialHealth} setValue={setFinancialHealth} accent={styles.accent}/>
                <SelectInput label="Location" value={region} setValue={setRegion} options={[{label:"London / Major City",value:"London / Major City"},{label:"City / Large Town",value:"City / Large Town"},{label:"Small Town / Rural",value:"Small Town / Rural"}]}/>
              </div>
            </Card>

            {/* Results */}
            <Card title="Your Results" subtitle="Live score & breakdown">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="text-xs text-zinc-500">Hypergrammy Level</div>
                    <div className="text-4xl font-bold flex items-center gap-2">
                      {scores.hyperLevel.toFixed(1)}<span className="text-base">/100</span>
                      {Number(delta)!==0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700`}>{Number(delta)>0?"+":""}{delta}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">Estimated Percentile</div>
                    <div className="text-xl font-semibold">{scores.percentile.toFixed(0)}<span className="text-sm">th</span></div>
                  </div>
                </div>
                <div className="mt-3"><Progress percent={scores.hyperLevel} label="Overall" grad3={styles.grad3}/></div>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-4">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                  <h3 className="font-medium mb-2">Subscores</h3>
                  <div className="space-y-3">
                    <Progress percent={scores.attractiveness*100} label="Attractiveness" grad3={styles.grad3}/>
                    <Progress percent={scores.status*100} label="Status" grad3={styles.grad3}/>
                    <Progress percent={scores.stability*100} label="Stability" grad3={styles.grad3}/>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Improve */}
          <Card title="Upgrade Lab" subtitle="Flip what‑ifs and plans; watch projections update" className="mt-6 print:hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
                <div className="flex items-baseline justify-between mb-2"><h4 className="font-medium">Quick What‑Ifs</h4><span className="text-xs text-zinc-500">Simulate upgrades</span></div>
                <SwitchRow label="Physique +2" checked={whatIf.physique} onChange={()=>setWhatIf(v=>({...v,physique:!v.physique}))} accent={styles.accent}/>
                <SwitchRow label="Face/Grooming +1" checked={whatIf.face} onChange={()=>setWhatIf(v=>({...v,face:!v.face}))} accent={styles.accent}/>
                <SwitchRow label="Style +2" checked={whatIf.style} onChange={()=>setWhatIf(v=>({...v,style:!v.style}))} accent={styles.accent}/>
                <SwitchRow label="Charisma +2" checked={whatIf.charisma} onChange={()=>setWhatIf(v=>({...v,charisma:!v.charisma}))} accent={styles.accent}/>
                <SwitchRow label="Income +£10k" checked={whatIf.income} onChange={()=>setWhatIf(v=>({...v,income:!v.income}))} accent={styles.accent}/>
                <SwitchRow label="Career Level +1" checked={whatIf.career} onChange={()=>setWhatIf(v=>({...v,career:!v.career}))} accent={styles.accent}/>
                <SwitchRow label="Financial Health +2" checked={whatIf.money} onChange={()=>setWhatIf(v=>({...v,money:!v.money}))} accent={styles.accent}/>
                <SwitchRow label="Social Proof +2" checked={whatIf.social} onChange={()=>setWhatIf(v=>({...v,social:!v.social}))} accent={styles.accent}/>

                <div className="mt-3 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 bg-white/70 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between text-sm"><span>Simulated Level</span><span className="font-semibold">{simulated.hyperLevel.toFixed(1)} / 100</span></div>
                  <div className="mt-2"><Progress percent={simulated.hyperLevel} label="Simulated Overall" grad3={styles.grad3}/></div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Workout */}
                <Panel title="Workout Plan" subtitle="Affects Physique/Charisma">
                  <SelectInput label="Select" value={workoutPlan} setValue={setWorkoutPlan} options={[{label:"None",value:"None"},{label:"Beginner 3x (Full Body)",value:"Beginner 3x"},{label:"Upper/Lower 4x",value:"Upper/Lower 4x"},{label:"PPL 5–6x",value:"PPL 5–6x"}]}/>
                  <Hint text="12 weeks. Track lifts. Protein 1.6–2.2g/kg. Sleep 7–8h."/>
                </Panel>
                {/* Wardrobe */}
                <Panel title="Wardrobe Preset" subtitle="Synergy Bonus">
                  <SelectInput label="Preset" value={wardrobePreset} setValue={setWardrobePreset} options={[{label:"Smart‑Casual Uniform",value:"Smart‑Casual Uniform"},{label:"Luxury Streetwear",value:"Luxury Streetwear"},{label:"Business‑Polished",value:"Business‑Polished"},{label:"None",value:"None"}]}/>
                </Panel>
                {/* Fashion budget */}
                <Panel title="Fashion Budget" subtitle="Affects Style/Social Proof">
                  <SelectInput label="Budget" value={fashionBudget} setValue={setFashionBudget} options={[{label:"£100–£200 (essentials)",value:"£100–£200"},{label:"£300–£500 (smart core)",value:"£300–£500"},{label:"£500+ (tailored/lux)",value:"£500+"},{label:"None",value:"None"}]}/>
                </Panel>
                {/* Social program */}
                <Panel title="Social Program" subtitle="Boost Social Proof">
                  <SwitchRow label="Host a monthly thing" checked={socialPlans.host} onChange={v=>setSocialPlans(p=>({...p,host:v}))} accent={styles.accent}/>
                  <SwitchRow label="Join a team sport" checked={socialPlans.team} onChange={v=>setSocialPlans(p=>({...p,team:v}))} accent={styles.accent}/>
                  <SwitchRow label="Weekly meetups (1x)" checked={socialPlans.meetups} onChange={v=>setSocialPlans(p=>({...p,meetups:v}))} accent={styles.accent}/>
                </Panel>
                {/* Income Boost Lab */}
                <Panel title="💷 Income Boost Lab" subtitle="Feeds the simulation">
                  <SwitchRow label="Ask for a raise (+£5k)" checked={incomePlans.raise} onChange={v=>setIncomePlans(p=>({...p,raise:v}))} accent={styles.accent}/>
                  <SwitchRow label="Cert sprint (+£3k & Career +1)" checked={incomePlans.certSprint} onChange={v=>setIncomePlans(p=>({...p,certSprint:v}))} accent={styles.accent}/>
                  <SwitchRow label="Side gig (+£4k)" checked={incomePlans.sideGig} onChange={v=>setIncomePlans(p=>({...p,sideGig:v}))} accent={styles.accent}/>
                  <SwitchRow label="Switch to contracting (+£12k) & Career +1" checked={incomePlans.contracting} onChange={v=>setIncomePlans(p=>({...p,contracting:v}))} accent={styles.accent}/>
                  <SwitchRow label="Interview prep blitz (+£4k)" checked={incomePlans.interviewPrep} onChange={v=>setIncomePlans(p=>({...p,interviewPrep:v}))} accent={styles.accent}/>
                  <SwitchRow label="Networking push (+£2k)" checked={incomePlans.networking} onChange={v=>setIncomePlans(p=>({...p,networking:v}))} accent={styles.accent}/>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    <Mini title="Current" value={`£${income.toLocaleString()}`}/>
                    <Mini title="Projected" value={`£${improvedIncome.toLocaleString()}`}/>
                    <Mini title="Delta" value={`+£${(improvedIncome-income).toLocaleString()}`}/>
                  </div>
                  <div className="mt-3">
                    <h5 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">Easy Wins (15–30 min)</h5>
                    <div className="flex flex-wrap gap-2">
                      <Chip checked={easyWins.cv} onChange={v=>setEasyWins(p=>({...p,cv:v}))} label="CV: 3 quantified wins" chip={styles.chip}/>
                      <Chip checked={easyWins.linkedin} onChange={v=>setEasyWins(p=>({...p,linkedin:v}))} label="LinkedIn refresh" chip={styles.chip}/>
                      <Chip checked={easyWins.referrals} onChange={v=>setEasyWins(p=>({...p,referrals:v}))} label="Ask 2 referrals" chip={styles.chip}/>
                      <Chip checked={easyWins.portfolio} onChange={v=>setEasyWins(p=>({...p,portfolio:v}))} label="1‑page case study" chip={styles.chip}/>
                    </div>
                  </div>
                </Panel>
                {/* Raise path */}
                <Panel title="Modern Workplace: +£10k Raise Path" subtitle="Applies to simulation">
                  <SwitchRow label="Apply raise path (+£10k & potential level +1)" checked={raisePlanApplied} onChange={setRaisePlanApplied} accent={styles.accent}/>
                  <ul className="list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-400 mt-2 space-y-1">
                    <li>Ship one measurable win (automation, SLA, or cost‑cut).</li>
                    <li>Pick one cert + publish a case study.</li>
                    <li>Negotiate with metrics & market comps.</li>
                    <li>Refresh CV/LinkedIn; book 3 recruiter calls.</li>
                  </ul>
                </Panel>
              </div>
            </div>

            {/* Targets & Sprint */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
              <Panel title="Top 3 High‑ROI Boosters" subtitle="Where effort pays most">
                <BoostersList scores={scores}/>
              </Panel>
              <Panel title="90‑Day Game Plan" subtitle="Simple rhythm, real momentum">
                <ul className="text-sm text-zinc-700 dark:text-zinc-300 space-y-2 list-disc pl-5">
                  <li><span className="font-medium">Weeks 1–2 — Lock Foundations:</span> baseline photos & lifts, wardrobe audit, barber + dentist, sleep 7–8h, hit protein 1.6–2.2g/kg.</li>
                  <li><span className="font-medium">Weeks 3–6 — Build Capacity:</span> follow your workout plan, add 3 go-to uniform fits, one weekly speaking/meetup rep, capture one work win with metrics.</li>
                  <li><span className="font-medium">Weeks 7–10 — Go Visible:</span> publish a 1-page case study, refresh LinkedIn/photos, host one small event, line up 3 recruiter calls.</li>
                  <li><span className="font-medium">Weeks 11–12 — Convert:</span> negotiate with comps, automate savings (15–20%), review progress, set the next 90-day target stack.</li>
                </ul>
              </Panel>
              <div className="print:block hidden">
                <h1 className="text-2xl font-bold mb-2">Hypergrammy — 90-Day Game Plan</h1>
                <p className="text-sm text-zinc-600 mb-4">Auto-generated on {new Date().toLocaleDateString()}</p>
              </div>
              <Panel title="Targets (Next 90 Days)">
                <Targets items={[{label:"Style",current:style,target:Math.min(style+2,10),suffix:"/10"},{label:"Charisma",current:charisma,target:Math.min(charisma+2,10),suffix:"/10"},{label:"Physique",current:physique,target:Math.min(physique+2,10),suffix:"/10"},{label:"Social Proof",current:socialProof,target:Math.min(socialProof+2,10),suffix:"/10"}]} grad2={styles.grad2}/>
              </Panel>
              <Panel title="Targets (6–12 Months)">
                <Targets items={[{label:"Income",current:Math.round(income),target:income+10000,prefix:"£"},{label:"Career Level",current:careerLevel,target:Math.min(careerLevel+1,5),suffix:"/5"},{label:"Financial Health",current:financialHealth,target:Math.min(financialHealth+2,10),suffix:"/10"}]} grad2={styles.grad2}/>
              </Panel>
            </div>
          </Card>
        </main>

        <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-xs text-zinc-500 dark:text-zinc-400">
          Friendly note: this is a heuristic model to surface practical upgrades you control — not a judgment.
        </footer>
      </div>

      {/* Tailwind safelist helper (ensures classes are included) */}
      <div className="hidden">
        <div className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 from-violet-400 via-fuchsia-400 to-rose-500 from-amber-400 via-orange-400 to-pink-500 from-teal-400 via-sky-400 to-blue-500 from-emerald-400 to-indigo-500 from-violet-400 to-rose-500 from-amber-400 to-pink-500 from-teal-400 to-blue-500 accent-cyan-500 accent-fuchsia-500 accent-orange-500 accent-sky-500"/>
      </div>
    </div>
  );
}
