import React, { useState, useRef, useEffect } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from "recharts";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const ct = {
  purple:"#6476FF", purpleMid:"#715BED", purpleLight:"#B05DE3",
  purpleBright:"#C355E8", purpleBg:"#F0F2FF", purpleBorder:"#6476FF",
  gradBtn:"linear-gradient(135deg, #4559F4, #B05DE3)",
  text:"#252F3B", textMid:"#454E57", textLight:"#B0B9C3",
  textFaint:"#D3DAE0", secStroke:"#000E08", labelMuted:"#737685",
  border:"#E5E1DB", borderLight:"#F1EFEC",
  bg:"#EBEFF4", bgCard:"#FFFFFF", bgHover:"#F1EFEC",
  bgWarm:"#F9F7F4", bgCool:"#F8FCFF", bgMuted:"#ECF1F6",
  bgInput:"#F7F9FB", bgFocus:"#F7F9FF",
  green:"#48CC84", greenBg:"#EDFAF3", greenBorder:"#B8E8D0",
  red:"#F65777", redBg:"#FFF7F8", redBorder:"#F65777",
  orange:"#FF7F5C", orangeBg:"#FFF3EF", orangeBorder:"#FFD0C2",
  yellow:"#FFD600",
  link:"#6476FF", sfNavBg:"#1B2B3B", darkNav:"#18222C",
  darkDeep:"#011627", darkest:"#111925", teal:"#2dd4bf",
};
const font = "'Sofia Pro','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const fmt$ = (v,d=2) => "$"+Number(v).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtK = v => v>=1000?`$${(v/1000).toFixed(0)}k`:`$${v}`;

// ── Account Data ──────────────────────────────────────────────────────────────
const ACCOUNTS = {
  "pets": {
    id:"pets", name:"Pets.com", industry:"Retail", owner:"Sarah Chen",
    health:"upsell", healthScore:72,
    arr:96000, openARR:0, renewalDays:557, renewalDate:"Sep 14, 2027",
    phone:"415-555-1212", website:"www.pets.com",
    summary:"2-year subscription bundle with recurring usage overages on compute. Strong upsell signal — 3 consecutive months hitting overage tier.",
    openOpps:[
      {name:"Pets.com – Compute Tier Upgrade", stage:"Proposal", amount:24000, closeDate:"Apr 15, '26"},
    ],
    recentActivity:[
      {type:"Call",   desc:"Quarterly business review call", date:"Mar 1, '26", rep:"Sarah Chen"},
      {type:"Email",  desc:"Sent overage analysis deck",     date:"Feb 22, '26", rep:"Sarah Chen"},
      {type:"Meeting",desc:"Contract review – legal",        date:"Jan 28, '26", rep:"Tom Reyes"},
    ],
    contacts:[
      {name:"Jamie Park",  title:"VP Engineering",      role:"Champion",       email:"j.park@pets.com"},
      {name:"Lisa Ortega", title:"CFO",                  role:"Economic Buyer", email:"l.ortega@pets.com"},
      {name:"Dev Sharma",  title:"Infra Lead",           role:"End User",       email:"d.sharma@pets.com"},
    ],
    monetizationModel:"subscription-usage",
    products:[
      {
        id:"p1", name:"Gold Cloud Compute", type:"Subscription + Usage",
        status:"Active", tcv:180000, billed:47497.50, mrr:7657.50,
        term:"Sep 15, '25 – Sep 14, '27", renewalDays:557,
        charges:[
          {id:"hrs",  name:"Server Hours (m1.small)", model:"Overage", uom:"CPU-hrs", included:2000, currentQty:2450, rate:"$0.35/hr over 2,000",  currentAmt:157.50, trend:"up",  hasChart:true},
          {id:"gb",   name:"Data Transfer",           model:"Overage", uom:"GB",      included:1000, currentQty:1150, rate:"$0.10/GB over 1,000",   currentAmt:15.00,  trend:"up",  hasChart:true},
          {id:"flat", name:"Monthly Platform Fee",    model:"Flat",    uom:"—",       included:null, currentQty:null, rate:"$7,500/mo flat",         currentAmt:7500,   trend:null,  hasChart:false},
        ],
        usageHistory:{
          "hrs": [{m:"Sep '25",qty:1455,amt:0},{m:"Oct '25",qty:1980,amt:0},{m:"Nov '25",qty:2200,amt:70},{m:"Dec '25",qty:2450,amt:157.5},{m:"Jan '26",qty:1870,amt:0},{m:"Feb '26",qty:2450,amt:157.5}],
          "gb":  [{m:"Sep '25",qty:844,amt:0},{m:"Oct '25",qty:910,amt:0},{m:"Nov '25",qty:1100,amt:10},{m:"Dec '25",qty:1150,amt:15},{m:"Jan '26",qty:990,amt:0},{m:"Feb '26",qty:1150,amt:15}],
        }
      },
      {
        id:"p2", name:"Premier 24/7 Support", type:"Subscription",
        status:"Active", tcv:12000, billed:3000, mrr:500,
        term:"Sep 15, '25 – Sep 14, '27", renewalDays:557,
        parentProduct:"Gold Cloud Compute",
        charges:[
          {id:"supp", name:"Premier Support", model:"Flat", uom:"—", included:null, currentQty:null, rate:"$500/mo flat", currentAmt:500, trend:null, hasChart:false},
        ],
      }
    ],
    invoices:[
      {id:"INV-2026-006",period:"Feb 15–Mar 14,'26",amt:8172.50,status:"Open",  due:"Mar 21,'26",daysOut:15,paid:null},
      {id:"INV-2026-005",period:"Jan 15–Feb 14,'26",amt:8172.50,status:"Paid",  due:"Feb 21,'26",daysOut:0, paid:"Feb 18,'26"},
      {id:"INV-2025-004",period:"Dec 15–Jan 14,'26",amt:8172.50,status:"Paid",  due:"Jan 21,'26",daysOut:0, paid:"Jan 17,'26"},
      {id:"INV-2025-003",period:"Nov 15–Dec 14,'25",amt:8000,   status:"Paid",  due:"Dec 21,'25",daysOut:0, paid:"Dec 20,'25"},
      {id:"INV-2025-002",period:"Oct 15–Nov 14,'25",amt:8000,   status:"Paid",  due:"Nov 21,'25",daysOut:0, paid:"Nov 20,'25"},
    ],
    actions:[
      {label:"Create Upsell Opportunity", icon:"⚡", variant:"primary",  reason:"3 months of compute overages — upsell to higher commit tier"},
      {label:"Start Renewal Quote",       icon:"🔄", variant:"secondary", reason:"Renewal in 557 days — get ahead of it"},
    ],
    forecast:[
      {m:"Mar '26",est:8000,hasOv:false},{m:"Apr '26",est:8000,hasOv:false},{m:"May '26",est:8250,hasOv:true},
      {m:"Jun '26",est:8350,hasOv:true},{m:"Jul '26",est:8250,hasOv:true},{m:"Aug '26",est:8000,hasOv:false},
    ],
  },

  "acme": {
    id:"acme", name:"Acme Logistics", industry:"Logistics / Tech", owner:"Marcus Lee",
    health:"growth", healthScore:91,
    arr:0, openARR:48000, renewalDays:null, renewalDate:null,
    phone:"628-555-4400", website:"www.acmelogistics.io",
    summary:"Pure pay-as-you-go on AI tokens — no committed contract. Usage growing 340% in 6 months. Strong candidate for first committed deal to lock in a lower per-unit rate.",
    openOpps:[
      {name:"Acme Logistics – First Commit Deal",  stage:"Discovery",  amount:48000, closeDate:"May 30, '26"},
    ],
    recentActivity:[
      {type:"Call",  desc:"Intro to commit pricing model",   date:"Mar 5, '26", rep:"Marcus Lee"},
      {type:"Email", desc:"Sent PAYG vs commit comparison",  date:"Feb 28, '26", rep:"Marcus Lee"},
    ],
    contacts:[
      {name:"Raj Mehta",    title:"CTO",              role:"Economic Buyer", email:"r.mehta@acmelogistics.io"},
      {name:"Priya Nair",   title:"AI Platform Lead", role:"Champion",       email:"p.nair@acmelogistics.io"},
    ],
    monetizationModel:"paygo",
    products:[
      {
        id:"p1", name:"AI Token Processing (PAYG)", type:"Pay-As-You-Go",
        status:"Active", tcv:null, billed:18420, mrr:null,
        term:"Ongoing — no term commitment", renewalDays:null,
        charges:[
          {id:"tok", name:"AI Tokens Consumed", model:"PAYG", uom:"1K tokens", included:0, currentQty:4820, rate:"$0.80/1K tokens", currentAmt:3856, trend:"up", hasChart:true},
        ],
        usageHistory:{
          "tok":[{m:"Sep '25",qty:420,amt:336},{m:"Oct '25",qty:680,amt:544},{m:"Nov '25",qty:950,amt:760},{m:"Dec '25",qty:1420,amt:1136},{m:"Jan '26",qty:2680,amt:2144},{m:"Feb '26",qty:4820,amt:3856}],
        }
      }
    ],
    invoices:[
      {id:"INV-2026-006",period:"Feb 1–28,'26",  amt:3856, status:"Paid", due:"Mar 7,'26",  daysOut:0, paid:"Mar 4,'26"},
      {id:"INV-2026-005",period:"Jan 1–31,'26",  amt:2144, status:"Paid", due:"Feb 7,'26",  daysOut:0, paid:"Feb 5,'26"},
      {id:"INV-2025-004",period:"Dec 1–31,'25",  amt:1136, status:"Paid", due:"Jan 7,'26",  daysOut:0, paid:"Jan 6,'26"},
      {id:"INV-2025-003",period:"Nov 1–30,'25",  amt:760,  status:"Paid", due:"Dec 7,'25",  daysOut:0, paid:"Dec 5,'25"},
      {id:"INV-2025-002",period:"Oct 1–31,'25",  amt:544,  status:"Paid", due:"Nov 7,'25",  daysOut:0, paid:"Nov 4,'25"},
    ],
    actions:[
      {label:"Create Commit Deal Opportunity", icon:"🎯", variant:"primary",  reason:"Usage up 340% — perfect time to offer committed pricing with lower per-unit rate"},
      {label:"Send Commit Pricing Comparison", icon:"📊", variant:"secondary", reason:"Show cost savings vs. current PAYG rate"},
    ],
    forecast:[
      {m:"Mar '26",est:5000,hasOv:false},{m:"Apr '26",est:6200,hasOv:false},{m:"May '26",est:7800,hasOv:false},
      {m:"Jun '26",est:9500,hasOv:false},{m:"Jul '26",est:11000,hasOv:false},{m:"Aug '26",est:13000,hasOv:false},
    ],
  },

  "retailco": {
    id:"retailco", name:"RetailCo", industry:"Retail", owner:"Dana Willis",
    health:"churn-risk", healthScore:28,
    arr:120000, openARR:0, renewalDays:87, renewalDate:"Jun 25, '26",
    phone:"503-555-2200", website:"www.retailco.com",
    summary:"Seat license + flat platform fee. Seat count has declined 38% over last 4 months. Renewal in 87 days with no renewal activity yet. High churn risk.",
    openOpps:[],
    recentActivity:[
      {type:"Email", desc:"Automated renewal notice sent", date:"Mar 1, '26",  rep:"System"},
      {type:"Call",  desc:"Missed — no answer",           date:"Feb 10, '26", rep:"Dana Willis"},
    ],
    contacts:[
      {name:"Brett Carson",  title:"COO",              role:"Economic Buyer", email:"b.carson@retailco.com"},
      {name:"Amber Liu",     title:"Ops Director",     role:"Champion",       email:"a.liu@retailco.com"},
    ],
    monetizationModel:"seat-flat",
    products:[
      {
        id:"p1", name:"Professional Platform – Seat Licenses", type:"Subscription",
        status:"Active", tcv:108000, billed:81000, mrr:9000,
        term:"Jun 25, '24 – Jun 24, '26", renewalDays:87,
        charges:[
          {id:"seats", name:"Active Seat Licenses", model:"Per-Unit", uom:"Seats", included:null, currentQty:26, rate:"$150/seat/mo", currentAmt:3900, trend:"down", hasChart:true},
          {id:"pfee",  name:"Platform Base Fee",    model:"Flat",     uom:"—",     included:null, currentQty:null, rate:"$5,100/mo flat", currentAmt:5100, trend:null, hasChart:false},
        ],
        usageHistory:{
          "seats":[{m:"Oct '25",qty:42,amt:6300},{m:"Nov '25",qty:40,amt:6000},{m:"Dec '25",qty:36,amt:5400},{m:"Jan '26",qty:31,amt:4650},{m:"Feb '26",qty:28,amt:4200},{m:"Mar '26",qty:26,amt:3900}],
        }
      },
    ],
    invoices:[
      {id:"INV-2026-003",period:"Mar 1–31,'26",  amt:9000,  status:"Open",    due:"Apr 1,'26",  daysOut:2, paid:null},
      {id:"INV-2026-002",period:"Feb 1–28,'26",  amt:9300,  status:"Paid",    due:"Mar 1,'26",  daysOut:0, paid:"Feb 28,'26"},
      {id:"INV-2026-001",period:"Jan 1–31,'26",  amt:9750,  status:"Paid",    due:"Feb 1,'26",  daysOut:0, paid:"Jan 30,'26"},
      {id:"INV-2025-012",period:"Dec 1–31,'25",  amt:10500, status:"Paid",    due:"Jan 1,'26",  daysOut:0, paid:"Dec 30,'25"},
    ],
    actions:[
      {label:"Flag Account At-Risk",     icon:"⚠️", variant:"danger",    reason:"Seat count down 38% — renewal in 87 days with no open opportunity"},
      {label:"Schedule Executive Call",  icon:"📞", variant:"primary",  reason:"No contact in 50 days — needs senior outreach before renewal"},
      {label:"Create Renewal Quote",     icon:"📋", variant:"secondary", reason:"Offer right-sized renewal at current seat count"},
    ],
    forecast:[
      {m:"Apr '26",est:9000,hasOv:false},{m:"May '26",est:9000,hasOv:false},{m:"Jun '26",est:9000,hasOv:false},
    ],
  },

  "finserv": {
    id:"finserv", name:"FinServ Inc.", industry:"Financial Services", owner:"Priya Kapoor",
    health:"attention", healthScore:54,
    arr:240000, openARR:0, renewalDays:124, renewalDate:"Jul 28, '26",
    phone:"212-555-8800", website:"www.finservinc.com",
    summary:"Prepaid credit model — $60K credit purchased. Burning at ~$14K/mo, projected exhaustion in 4 months with 5 months of contract remaining. Needs a credit top-up conversation now.",
    openOpps:[
      {name:"FinServ Inc. – Credit Top-Up Q2", stage:"Negotiation", amount:30000, closeDate:"Apr 30, '26"},
    ],
    recentActivity:[
      {type:"Meeting", desc:"Credit burn rate review",      date:"Mar 3, '26", rep:"Priya Kapoor"},
      {type:"Email",   desc:"Sent credit exhaustion forecast", date:"Feb 20, '26", rep:"Priya Kapoor"},
      {type:"Call",    desc:"Intro call — new champion",    date:"Feb 5, '26", rep:"Priya Kapoor"},
    ],
    contacts:[
      {name:"Sandra Okonkwo", title:"SVP Technology",  role:"Economic Buyer", email:"s.okonkwo@finservinc.com"},
      {name:"Kwame Asante",   title:"Platform Eng Mgr",role:"Champion",       email:"k.asante@finservinc.com"},
    ],
    monetizationModel:"prepaid-credit",
    products:[
      {
        id:"p1", name:"API Platform – Prepaid Credit", type:"Prepaid Credit",
        status:"Active", tcv:240000, billed:null, mrr:null,
        creditTotal:60000, creditUsed:42180, creditRemaining:17820, burnRate:14060,
        projectedExhaustionDays:38,
        term:"Jul 28, '25 – Jul 27, '26", renewalDays:124,
        charges:[
          {id:"api",  name:"API Calls",         model:"Credit Draw", uom:"1K calls",  included:null, currentQty:8200,  rate:"$1.20/1K calls",  currentAmt:9840,  trend:"up",  hasChart:true},
          {id:"stor", name:"Data Storage",      model:"Credit Draw", uom:"GB-mo",     included:null, currentQty:2800,  rate:"$1.50/GB-mo",     currentAmt:4200,  trend:"stable", hasChart:true},
        ],
        usageHistory:{
          "api": [{m:"Aug '25",qty:2100,amt:2520},{m:"Sep '25",qty:3400,amt:4080},{m:"Oct '25",qty:4800,amt:5760},{m:"Nov '25",qty:6200,amt:7440},{m:"Dec '25",qty:7100,amt:8520},{m:"Jan '26",qty:7800,amt:9360},{m:"Feb '26",qty:8200,amt:9840}],
          "stor":[{m:"Aug '25",qty:800,amt:1200},{m:"Sep '25",qty:1200,amt:1800},{m:"Oct '25",qty:1600,amt:2400},{m:"Nov '25",qty:2000,amt:3000},{m:"Dec '25",qty:2400,amt:3600},{m:"Jan '26",qty:2600,amt:3900},{m:"Feb '26",qty:2800,amt:4200}],
        }
      },
    ],
    invoices:[
      {id:"CREDIT-001",period:"Initial Credit Purchase",amt:60000,status:"Paid",due:"Jul 28,'25",daysOut:0,paid:"Jul 25,'25"},
    ],
    actions:[
      {label:"Start Credit Top-Up Quote",  icon:"💳", variant:"primary",  reason:"Credit exhausts in ~38 days — service interruption risk if not addressed"},
      {label:"Discuss Subscription Conversion", icon:"🔄", variant:"secondary", reason:"High consistent usage — committed pricing could save 15-20%"},
    ],
    forecast:[
      {m:"Mar '26",est:14060,hasOv:false},{m:"Apr '26",est:14500,hasOv:false},{m:"May '26",est:15000,hasOv:false},
      {m:"Jun '26",est:0,hasOv:false},{m:"Jul '26",est:0,hasOv:false},
    ],
  },

  "manutech": {
    id:"manutech", name:"ManuTech Corp", industry:"Manufacturing", owner:"Jake Torres",
    health:"healthy", healthScore:85,
    arr:36000, openARR:0, renewalDays:203, renewalDate:"Oct 14, '26",
    phone:"312-555-6600", website:"www.manutechcorp.com",
    summary:"One-time hardware purchase + annual support contract. Hardware delivered and live. Support utilization healthy. Renewal opportunity in 7 months — good candidate for hardware refresh + expanded support.",
    openOpps:[
      {name:"ManuTech – Hardware Refresh + Support Uplift", stage:"Discovery", amount:85000, closeDate:"Aug 15, '26"},
    ],
    recentActivity:[
      {type:"Call",    desc:"Post-install check-in call",    date:"Feb 28, '26", rep:"Jake Torres"},
      {type:"Email",   desc:"Hardware warranty info sent",   date:"Feb 10, '26", rep:"Jake Torres"},
      {type:"Meeting", desc:"On-site install & training",    date:"Oct 20, '25", rep:"Jake Torres"},
    ],
    contacts:[
      {name:"Carla Ruiz",    title:"Plant Manager",       role:"Champion",       email:"c.ruiz@manutechcorp.com"},
      {name:"David Engel",   title:"VP Operations",       role:"Economic Buyer", email:"d.engel@manutechcorp.com"},
    ],
    monetizationModel:"onetime-support",
    products:[
      {
        id:"p1", name:"Industrial IoT Gateway Hardware (x10 units)", type:"One-Time Purchase",
        status:"Delivered", tcv:50000, billed:50000, mrr:null,
        deliveryDate:"Oct 18, '25", warrantyExpiry:"Oct 18, '27",
        term:"One-time — no recurring billing",
        charges:[
          {id:"hw", name:"IoT Gateway Units (x10)", model:"One-Time", uom:"Units", included:null, currentQty:10, rate:"$5,000/unit", currentAmt:50000, trend:null, hasChart:false},
        ],
      },
      {
        id:"p2", name:"Premium Hardware Support", type:"Subscription",
        status:"Active", tcv:36000, billed:18000, mrr:3000,
        term:"Oct 14, '25 – Oct 13, '26", renewalDays:203,
        charges:[
          {id:"supp", name:"Hardware Support & Maintenance", model:"Flat", uom:"—", included:null, currentQty:null, rate:"$3,000/mo flat", currentAmt:3000, trend:null, hasChart:false},
          {id:"svc",  name:"Remote Monitoring (included)", model:"Included", uom:"Incidents", included:12, currentQty:4, rate:"Included", currentAmt:0, trend:"stable", hasChart:false},
        ],
      }
    ],
    invoices:[
      {id:"INV-2025-HW1",period:"Hardware Purchase",   amt:50000,status:"Paid",due:"Oct 14,'25",daysOut:0,paid:"Oct 12,'25"},
      {id:"INV-2026-003",period:"Mar 1–31,'26 Support",amt:3000, status:"Open",due:"Apr 1,'26", daysOut:2,paid:null},
      {id:"INV-2026-002",period:"Feb Support",         amt:3000, status:"Paid",due:"Mar 1,'26", daysOut:0,paid:"Feb 28,'26"},
      {id:"INV-2026-001",period:"Jan Support",         amt:3000, status:"Paid",due:"Feb 1,'26", daysOut:0,paid:"Jan 30,'26"},
      {id:"INV-2025-012",period:"Dec Support",         amt:3000, status:"Paid",due:"Jan 1,'26", daysOut:0,paid:"Dec 30,'25"},
    ],
    actions:[
      {label:"Start Renewal & Refresh Quote", icon:"🔄", variant:"primary",  reason:"Support renewal in 203 days — bundle with hardware refresh opportunity"},
      {label:"Log Activity",                  icon:"📝", variant:"secondary", reason:"Last contact 30 days ago — log post-install check-in"},
    ],
    forecast:[
      {m:"Apr '26",est:3000,hasOv:false},{m:"May '26",est:3000,hasOv:false},{m:"Jun '26",est:3000,hasOv:false},
      {m:"Jul '26",est:3000,hasOv:false},{m:"Aug '26",est:3000,hasOv:false},{m:"Sep '26",est:3000,hasOv:false},
    ],
  },
};

const ACCOUNT_LIST = ["pets","acme","retailco","finserv","manutech"];

// ── Shared Components ─────────────────────────────────────────────────────────
function Badge({color="gray",children,small=false}){
  const v={
    green:{bg:ct.greenBg,  color:ct.green,    border:ct.greenBorder},
    blue: {bg:ct.purpleBg, color:ct.purple,   border:ct.purpleBorder},
    purple:{bg:ct.purpleBg,color:ct.purpleMid,border:"#C4B5FD"},
    orange:{bg:ct.orangeBg,color:ct.orange,   border:ct.orangeBorder},
    red:  {bg:ct.redBg,    color:ct.red,      border:ct.redBorder},
    gray: {bg:ct.bgMuted,  color:ct.textMid,  border:ct.border},
    teal: {bg:"#F0FDFB",   color:"#0D9488",   border:"#99F6E4"},
  }[color]||{bg:ct.bgMuted,color:ct.textMid,border:ct.border};
  return (
    <span style={{
      background:v.bg,color:v.color,border:`1px solid ${v.border}`,
      borderRadius:12,padding:small?"1px 7px":"2px 9px",
      fontSize:small?10:11,fontWeight:600,fontFamily:font,
      display:"inline-flex",alignItems:"center",whiteSpace:"nowrap",
    }}>{children}</span>
  );
}

function Btn({children,onClick,variant="primary",small=false,style,disabled=false}:{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary"|"secondary"|"danger"|"ghost"|"orange";
  small?: boolean;
  style?: React.CSSProperties;
  disabled?: boolean;
}){
  const base: React.CSSProperties={fontFamily:font,fontWeight:600,cursor:disabled?"not-allowed":"pointer",
    borderRadius:8,border:"none",display:"inline-flex",alignItems:"center",
    gap:6,transition:"opacity 0.15s",fontSize:small?11:13,
    padding:small?"5px 12px":"8px 18px",opacity:disabled?0.5:1,
  };
  const variants: Record<string, React.CSSProperties>={
    primary:{background:ct.gradBtn,color:"#fff",boxShadow:"0 8px 30px rgba(77,98,255,0.28)"},
    secondary:{background:ct.bgCard,color:ct.secStroke,border:`1px solid ${ct.secStroke}`},
    danger:{background:"transparent",color:ct.red,border:`1px solid ${ct.red}`},
    ghost:{background:"transparent",color:ct.purple,border:"none",padding:small?"2px 6px":"4px 10px"},
    orange:{background:ct.orangeBg,color:ct.orange,border:`1px solid ${ct.orangeBorder}`},
  };
  return (
    <button disabled={disabled} onClick={onClick}
      style={{...base,...variants[variant],...style}}
      onMouseOver={e=>!disabled&&(e.currentTarget.style.opacity="0.82")}
      onMouseOut={e=>e.currentTarget.style.opacity=disabled?"0.5":"1"}>
      {children}
    </button>
  );
}

function SectionLabel({children}){
  return <div style={{fontSize:11,fontWeight:700,color:ct.labelMuted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:10,fontFamily:font}}>{children}</div>;
}

function MetricCard({label,value,sub,accent,alert=false}){
  return (
    <div style={{flex:1,minWidth:130,background:alert?ct.redBg:ct.bgCard,
      border:`1px solid ${alert?ct.redBorder:ct.border}`,borderTop:`3px solid ${alert?ct.red:accent}`,
      borderRadius:10,padding:"14px 16px",boxShadow:"0 1px 3px rgba(17,25,37,0.05)"}}>
      <div style={{fontSize:10,color:alert?ct.red:ct.labelMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.6,fontFamily:font}}>{label}</div>
      <div style={{fontSize:20,fontWeight:700,marginTop:4,color:alert?ct.red:ct.text,fontFamily:font}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:alert?ct.red:ct.textLight,marginTop:3,fontFamily:font}}>{sub}</div>}
    </div>
  );
}

// Health score badge
function HealthPill({health,score}){
  const cfg={
    "healthy":   {bg:ct.greenBg,  color:ct.green,  border:ct.greenBorder, label:"Healthy",    icon:"✓"},
    "upsell":    {bg:"#FFF8EC",   color:"#D97706", border:"#FDE68A",       label:"Upsell Opp", icon:"⚡"},
    "growth":    {bg:ct.purpleBg, color:ct.purple, border:ct.purpleBorder, label:"High Growth",icon:"🚀"},
    "attention": {bg:ct.orangeBg, color:ct.orange, border:ct.orangeBorder, label:"Needs Attention",icon:"⚠"},
    "churn-risk":{bg:ct.redBg,    color:ct.red,    border:ct.redBorder,    label:"Churn Risk", icon:"🔴"},
  }[health]||{bg:ct.bgMuted,color:ct.textMid,border:ct.border,label:"Unknown",icon:"?"};
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`,
        borderRadius:12,padding:"3px 10px",fontSize:12,fontWeight:700,fontFamily:font,
        display:"inline-flex",alignItems:"center",gap:5}}>
        <span>{cfg.icon}</span>{cfg.label}
      </span>
      <div style={{display:"flex",alignItems:"center",gap:5}}>
        <div style={{width:60,height:6,background:ct.bgMuted,borderRadius:3,overflow:"hidden"}}>
          <div style={{width:`${score}%`,height:"100%",borderRadius:3,
            background:score>75?ct.green:score>50?ct.orange:ct.red,transition:"width 0.4s"}}/>
        </div>
        <span style={{fontSize:11,fontWeight:700,color:ct.textMid,fontFamily:font}}>{score}</span>
      </div>
    </div>
  );
}

// Monetization model badge
function ModelBadge({type}){
  const cfg={
    "Subscription + Usage": {color:"blue",  icon:"🔄"},
    "Subscription":         {color:"blue",  icon:"🔄"},
    "Pay-As-You-Go":        {color:"purple",icon:"⚡"},
    "Prepaid Credit":       {color:"teal",  icon:"💳"},
    "One-Time Purchase":    {color:"gray",  icon:"📦"},
  };
  const c=cfg[type]||{color:"gray",icon:"•"};
  return <Badge color={c.color}>{c.icon} {type}</Badge>;
}

// ── Nav account switcher ──────────────────────────────────────────────────────
function AccountSwitcher({current,onChange}){
  const [open,setOpen]=useState(false);
  const ref=useRef();
  useEffect(()=>{
    const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[]);
  const acc=ACCOUNTS[current];
  const healthColors={"healthy":ct.green,"upsell":"#D97706","growth":ct.purple,"attention":ct.orange,"churn-risk":ct.red};
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(!open)} style={{
        background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",
        borderRadius:8,padding:"5px 12px",cursor:"pointer",fontFamily:font,
        color:"#fff",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:8,
      }}>
        <span style={{width:8,height:8,borderRadius:"50%",background:healthColors[acc.health]||ct.textLight,flexShrink:0}}/>
        {acc.name}
        <span style={{fontSize:10,opacity:0.6}}>▼</span>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,background:ct.bgCard,
          border:`1px solid ${ct.border}`,borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,0.15)",
          zIndex:100,minWidth:240,overflow:"hidden",padding:"4px 0"}}>
          {ACCOUNT_LIST.map(id=>{
            const a=ACCOUNTS[id];
            const dot=healthColors[a.health]||ct.textLight;
            return (
              <button key={id} onClick={()=>{onChange(id);setOpen(false);}} style={{
                display:"flex",alignItems:"center",gap:10,width:"100%",textAlign:"left",
                padding:"10px 14px",fontSize:13,background:id===current?ct.purpleBg:"transparent",
                border:"none",cursor:"pointer",fontFamily:font,color:id===current?ct.purple:ct.text,
                fontWeight:id===current?600:400,
              }}
                onMouseEnter={e=>id!==current&&(e.currentTarget.style.background=ct.bgHover)}
                onMouseLeave={e=>id!==current&&(e.currentTarget.style.background="transparent")}>
                <span style={{width:8,height:8,borderRadius:"50%",background:dot,flexShrink:0}}/>
                <span style={{flex:1}}>{a.name}</span>
                <span style={{fontSize:11,color:ct.textLight}}>{a.industry}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Lifecycle Actions ─────────────────────────────────────────────────────────


function getProductActions(product) {
  const type = product.type;
  const actions = [];
  if(type.includes("Subscription")) {
    actions.push({label:"Renew",               icon:"🔄", section:"lifecycle"});
    actions.push({label:"Amend (qty/price)",   icon:"✏️", section:"lifecycle"});
    actions.push({label:"Upgrade Tier",        icon:"⬆",  section:"lifecycle"});
    actions.push({label:"Downgrade Tier",      icon:"⬇",  section:"lifecycle"});
    actions.push({label:"Co-term with Bundle", icon:"📅", section:"lifecycle"});
    actions.push({label:"Suspend",             icon:"⏸",  section:"lifecycle"});
    actions.push({label:"Cancel",              icon:"✖",  section:"lifecycle", danger:true});
  }
  if(type==="Pay-As-You-Go") {
    actions.push({label:"Create Commit Deal",      icon:"🎯", section:"lifecycle"});
    actions.push({label:"Convert to Subscription", icon:"🔁", section:"lifecycle"});
    actions.push({label:"Suspend",                 icon:"⏸",  section:"lifecycle"});
    actions.push({label:"Cancel",                  icon:"✖",  section:"lifecycle", danger:true});
  }
  if(type==="Prepaid Credit") {
    actions.push({label:"Top-up Credit",           icon:"💳", section:"lifecycle"});
    actions.push({label:"Convert to Subscription", icon:"🔁", section:"lifecycle"});
    actions.push({label:"Adjust Allocation",       icon:"⚖️", section:"lifecycle"});
    actions.push({label:"Suspend",                 icon:"⏸",  section:"lifecycle"});
  }
  if(type==="One-Time Purchase") {
    actions.push({label:"Hardware Refresh",  icon:"🔧", section:"lifecycle"});
    actions.push({label:"Replace Unit(s)",   icon:"🔄", section:"lifecycle"});
    actions.push({label:"Extend Warranty",   icon:"🛡",  section:"lifecycle"});
    actions.push({label:"Create RMA",        icon:"📦", section:"lifecycle"});
  }
  return actions;
}

function ActionsDropdown({actions, label="⚡ Actions", align="right", secondary=false}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({top:0, left:0, width:220});
  const btnRef = useRef();
  const menuRef = useRef();

  useEffect(()=>{
    const h = e => {
      if(btnRef.current&&!btnRef.current.contains(e.target)&&
         menuRef.current&&!menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  },[]);

  const handleOpen = () => {
    if(!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuWidth = 230;
      // Calculate if dropdown would overflow viewport bottom
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedMenuHeight = actions.length * 40 + 60;
      const openUpward = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;
      setMenuPos({
        top: openUpward ? rect.top + window.scrollY - estimatedMenuHeight - 6
                        : rect.bottom + window.scrollY + 6,
        left: align==="right"
          ? rect.right + window.scrollX - menuWidth
          : rect.left + window.scrollX,
        width: menuWidth,
      });
    }
    setOpen(o=>!o);
  };

  const sections = [...new Set(actions.map(a=>a.section))];

  return (
    <>
      <button ref={btnRef} onClick={handleOpen} style={{
        background: secondary ? ct.bgCard : ct.gradBtn,
        color: secondary ? ct.text : "#fff",
        border: secondary ? `1px solid ${ct.border}` : "none",
        borderRadius:8, padding:"5px 12px", fontSize:11, fontWeight:600,
        cursor:"pointer", fontFamily:font, display:"flex", alignItems:"center", gap:6,
        boxShadow: secondary ? "none" : "0 8px 30px rgba(77,98,255,0.28)",
      }}>
        {label} <span style={{fontSize:10,opacity:0.8}}>▼</span>
      </button>
      {open&&(
        <div ref={menuRef} style={{
          position:"fixed",
          top: menuPos.top,
          left: menuPos.left,
          width: menuPos.width,
          background:ct.bgCard, border:`1px solid ${ct.border}`,
          borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.18)",
          zIndex:9999, padding:"4px 0",
        }}>
          {sections.map((sec,si)=>{
            const secActions = actions.filter(a=>a.section===sec);
            const secLabel = sec==="pipeline"?"Pipeline & Activity":"Lifecycle Actions";
            return (
              <div key={sec}>
                {si>0&&<div style={{height:1,background:ct.borderLight,margin:"4px 0"}}/>}
                <div style={{padding:"6px 14px 3px",fontSize:10,fontWeight:700,
                  color:ct.textLight,textTransform:"uppercase",letterSpacing:0.5,fontFamily:font}}>
                  {secLabel}
                </div>
                {secActions.map((a,i)=>(
                  <button key={i} onClick={()=>setOpen(false)} style={{
                    display:"flex",alignItems:"center",gap:10,width:"100%",
                    textAlign:"left",padding:"9px 14px",fontSize:13,
                    background:"transparent",border:"none",cursor:"pointer",
                    fontFamily:font,color:a.danger?ct.red:ct.text,
                  }}
                    onMouseEnter={e=>e.currentTarget.style.background=a.danger?ct.redBg:ct.bgHover}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <span style={{width:18,textAlign:"center"}}>{a.icon}</span>
                    {a.label}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ── Account Health Header ────────────────────────────────────────────────────
function HealthHeader({acc}){
  return (
    <div style={{background:ct.bgCard,border:`1px solid ${ct.border}`,borderRadius:12,
      padding:"16px 20px",marginBottom:16,boxShadow:"0 1px 3px rgba(17,25,37,0.05)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        {/* Left: account info */}
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5,flexWrap:"wrap"}}>
            <span style={{fontSize:22,fontWeight:700,color:ct.text,fontFamily:font}}>{acc.name}</span>
            <HealthPill health={acc.health} score={acc.healthScore}/>
          </div>
          <div style={{display:"flex",gap:18,fontSize:12,color:ct.textLight,fontFamily:font,flexWrap:"wrap"}}>
            <span>📞 {acc.phone}</span>
            <span>🌐 {acc.website}</span>
            <span>🏷 {acc.industry}</span>
            <span>👤 {acc.owner}</span>
          </div>
          <div style={{fontSize:12,color:ct.textMid,marginTop:8,lineHeight:1.6,fontFamily:font,maxWidth:680}}>{acc.summary}</div>
        </div>
        {/* Right: vital stats */}
        <div style={{display:"flex",gap:20,flexWrap:"wrap",justifyContent:"flex-end"}}>
          {acc.arr>0&&<div style={{textAlign:"right"}}>
            <div style={{fontSize:10,color:ct.labelMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,fontFamily:font}}>ARR</div>
            <div style={{fontSize:18,fontWeight:700,color:ct.text,fontFamily:font}}>{fmt$(acc.arr,0)}</div>
          </div>}
          {acc.openARR>0&&<div style={{textAlign:"right"}}>
            <div style={{fontSize:10,color:ct.purple,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,fontFamily:font}}>Open Opp ARR</div>
            <div style={{fontSize:18,fontWeight:700,color:ct.purple,fontFamily:font}}>{fmt$(acc.openARR,0)}</div>
          </div>}
          {acc.renewalDays&&(
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:10,color:acc.renewalDays<90?ct.red:ct.labelMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,fontFamily:font}}>Renewal</div>
              <div style={{fontSize:18,fontWeight:700,color:acc.renewalDays<90?ct.red:ct.text,fontFamily:font}}>{acc.renewalDays}d</div>
              <div style={{fontSize:10,color:ct.textLight,fontFamily:font}}>{acc.renewalDate}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Action Rail ───────────────────────────────────────────────────────────────
function ActionRail({acc}){
  if(!acc.actions?.length) return null;
  return (
    <div style={{background:ct.bgCard,border:`1px solid ${ct.border}`,borderRadius:12,
      padding:"12px 16px",marginBottom:16,display:"flex",gap:8,alignItems:"flex-start",
      flexWrap:"wrap",boxShadow:"0 1px 3px rgba(17,25,37,0.05)"}}>
      <div style={{fontSize:11,fontWeight:700,color:ct.labelMuted,textTransform:"uppercase",
        letterSpacing:0.5,fontFamily:font,paddingTop:6,marginRight:4,flexShrink:0}}>Actions</div>
      <div style={{flex:1,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        {acc.actions.map((a,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
            <Btn variant={a.variant==="danger"?"danger":a.variant==="primary"?"primary":"secondary"} small>
              {a.icon} {a.label}
            </Btn>
            <span style={{fontSize:11,color:ct.textLight,fontFamily:font,maxWidth:260}}>{a.reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
function Tabs({active,onChange,tabs}){
  return (
    <div style={{display:"flex",borderBottom:`1px solid ${ct.border}`,marginBottom:20}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)} style={{
          padding:"10px 18px",border:"none",background:"none",cursor:"pointer",
          fontSize:13,fontWeight:active===t.id?700:500,fontFamily:font,
          color:active===t.id?ct.purple:ct.textMid,
          borderBottom:active===t.id?`3px solid ${ct.purple}`:"3px solid transparent",
          transition:"color 0.15s",
        }}>{t.label}</button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: OVERVIEW
// ══════════════════════════════════════════════════════════════════════════════
function OverviewTab({acc}){
  const totalBilled=acc.products.reduce((s,p)=>s+(p.billed||0),0);
  const openInvoiceAmt=acc.invoices.filter(i=>i.status==="Open").reduce((s,i)=>s+i.amt,0);
  const activeProducts=acc.products.filter(p=>p.status==="Active"||p.status==="Delivered");

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      {/* Left column */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {/* Products at a glance */}
        <div style={{background:ct.bgCard,border:`1px solid ${ct.border}`,borderRadius:10,overflow:"hidden",boxShadow:"0 1px 3px rgba(17,25,37,0.05)"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${ct.borderLight}`,fontWeight:700,fontSize:13,fontFamily:font,color:ct.text}}>Products & Entitlements</div>
          <div style={{padding:"8px 0"}}>
            {acc.products.map(p=>(
              <div key={p.id} style={{padding:"10px 16px",borderBottom:`1px solid ${ct.borderLight}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13,color:ct.text,fontFamily:font,marginBottom:3}}>{p.name}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}><ModelBadge type={p.type}/><Badge color={p.status==="Active"||p.status==="Delivered"?"green":"gray"}>{p.status}</Badge></div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    {p.mrr&&<div style={{fontSize:13,fontWeight:700,color:ct.text,fontFamily:font}}>{fmt$(p.mrr)}<span style={{fontSize:10,color:ct.textLight}}>/mo</span></div>}
                    {p.tcv&&<div style={{fontSize:11,color:ct.textLight,fontFamily:font}}>TCV {fmt$(p.tcv,0)}</div>}
                    {p.creditRemaining!=null&&<div style={{fontSize:13,fontWeight:700,color:ct.orange,fontFamily:font}}>{fmt$(p.creditRemaining,0)} credit left</div>}
                  </div>
                </div>
                {p.renewalDays&&<div style={{fontSize:11,marginTop:5,fontFamily:font,color:p.renewalDays<90?ct.red:ct.textLight}}>
                  {p.renewalDays<90?"⚠ ":""}{p.term} · Renewal in {p.renewalDays}d
                </div>}
                {p.deliveryDate&&<div style={{fontSize:11,marginTop:5,fontFamily:font,color:ct.textLight}}>Delivered {p.deliveryDate} · Warranty to {p.warrantyExpiry}</div>}
                {p.type==="Prepaid Credit"&&(
                  <div style={{marginTop:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:ct.textLight,fontFamily:font,marginBottom:3}}>
                      <span>{fmt$(p.creditUsed,0)} used</span>
                      <span style={{color:p.projectedExhaustionDays<60?ct.red:ct.orange}}>Exhausts in ~{p.projectedExhaustionDays} days</span>
                      <span>{fmt$(p.creditTotal,0)} total</span>
                    </div>
                    <div style={{height:6,background:ct.bgMuted,borderRadius:3,overflow:"hidden"}}>
                      <div style={{width:`${(p.creditUsed/p.creditTotal)*100}%`,height:"100%",background:p.projectedExhaustionDays<60?ct.red:ct.orange,borderRadius:3}}/>
                    </div>
                  </div>
                )}
                {p.type==="Pay-As-You-Go"&&<div style={{fontSize:11,color:ct.textLight,fontFamily:font,marginTop:4}}>No commit — billed monthly on consumption</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Open opportunities */}
        <div style={{background:ct.bgCard,border:`1px solid ${ct.border}`,borderRadius:10,overflow:"hidden",boxShadow:"0 1px 3px rgba(17,25,37,0.05)"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${ct.borderLight}`,fontWeight:700,fontSize:13,fontFamily:font,color:ct.text}}>Open Opportunities</div>
          {acc.openOpps.length===0
            ? <div style={{padding:"16px",fontSize:12,color:ct.textLight,fontFamily:font}}>No open opportunities.</div>
            : acc.openOpps.map((o,i)=>(
              <div key={i} style={{padding:"10px 16px",borderBottom:`1px solid ${ct.borderLight}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                <div>
                  <div style={{fontWeight:600,fontSize:12,color:ct.link,fontFamily:font,marginBottom:2}}>{o.name}</div>
                  <div style={{fontSize:11,color:ct.textLight,fontFamily:font}}>Close {o.closeDate}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:700,fontSize:13,color:ct.text,fontFamily:font}}>{fmt$(o.amount,0)}</div>
                  <Badge color="blue" small>{o.stage}</Badge>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Right column */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {/* Financial snapshot */}
        <div style={{background:ct.bgCard,border:`1px solid ${ct.border}`,borderRadius:10,padding:"14px 16px",boxShadow:"0 1px 3px rgba(17,25,37,0.05)"}}>
          <SectionLabel>Financial Snapshot</SectionLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 20px"}}>
            {[
              {label:"Lifetime Billed",   value:fmt$(totalBilled), color:ct.text},
              {label:"Open Invoice",       value:openInvoiceAmt>0?fmt$(openInvoiceAmt):"None", color:openInvoiceAmt>0?ct.orange:ct.green},
              acc.arr>0&&{label:"ARR",     value:fmt$(acc.arr,0),   color:ct.text},
              acc.renewalDate&&{label:"Renewal Date", value:acc.renewalDate, color:acc.renewalDays<90?ct.red:ct.text},
              acc.products.find(p=>p.burnRate)&&{label:"Monthly Burn Rate", value:fmt$(acc.products.find(p=>p.burnRate).burnRate,0), color:ct.orange},
              acc.products.find(p=>p.creditRemaining!=null)&&{label:"Credit Remaining", value:fmt$(acc.products.find(p=>p.creditRemaining!=null).creditRemaining,0), color:ct.orange},
            ].filter(Boolean).map((item,i)=>(
              <div key={i}>
                <div style={{fontSize:10,color:ct.labelMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,fontFamily:font,marginBottom:2}}>{item.label}</div>
                <div style={{fontSize:14,fontWeight:700,color:item.color,fontFamily:font}}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contacts */}
        <div style={{background:ct.bgCard,border:`1px solid ${ct.border}`,borderRadius:10,overflow:"hidden",boxShadow:"0 1px 3px rgba(17,25,37,0.05)"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${ct.borderLight}`,fontWeight:700,fontSize:13,fontFamily:font,color:ct.text}}>Key Contacts</div>
          {acc.contacts.map((c,i)=>(
            <div key={i} style={{padding:"9px 16px",borderBottom:`1px solid ${ct.borderLight}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:600,fontSize:12,color:ct.text,fontFamily:font}}>{c.name}</div>
                <div style={{fontSize:11,color:ct.textLight,fontFamily:font}}>{c.title}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <Badge color={c.role==="Economic Buyer"?"orange":c.role==="Champion"?"blue":"gray"} small>{c.role}</Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div style={{background:ct.bgCard,border:`1px solid ${ct.border}`,borderRadius:10,overflow:"hidden",boxShadow:"0 1px 3px rgba(17,25,37,0.05)"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${ct.borderLight}`,fontWeight:700,fontSize:13,fontFamily:font,color:ct.text}}>Recent Activity <span style={{fontWeight:400,fontSize:11,color:ct.textLight}}>(via Salesforce)</span></div>
          {acc.recentActivity.length===0
            ? <div style={{padding:"16px",fontSize:12,color:ct.textLight,fontFamily:font}}>No recent activity.</div>
            : acc.recentActivity.map((a,i)=>(
              <div key={i} style={{padding:"9px 16px",borderBottom:`1px solid ${ct.borderLight}`,display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:14,marginTop:1}}>{a.type==="Call"?"📞":a.type==="Email"?"✉️":"🤝"}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,color:ct.text,fontFamily:font}}>{a.desc}</div>
                  <div style={{fontSize:11,color:ct.textLight,fontFamily:font,marginTop:2}}>{a.date} · {a.rep}</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: PRODUCTS & ENTITLEMENTS
// ══════════════════════════════════════════════════════════════════════════════
function ProductsTab({acc,onDrillCharge}){
  const tdStyle={padding:"10px 14px",borderBottom:`1px solid ${ct.borderLight}`,fontSize:12,fontFamily:font,color:ct.text};
  const tdrStyle={...tdStyle,textAlign:"right"};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {acc.products.map(p=><ProductCard key={p.id} product={p} onDrillCharge={onDrillCharge}/>)}
    </div>
  );
}

function ProductCard({product:p,onDrillCharge}){
  const [exp,setExp]=useState(true);
  const tdStyle={padding:"10px 14px",borderBottom:`1px solid ${ct.borderLight}`,fontSize:12,fontFamily:font,color:ct.text};
  const tdrStyle={...tdStyle,textAlign:"right"};
  const isOneTime=p.type==="One-Time Purchase";
  const headerBg=p.parentProduct?ct.purpleBg:ct.bgCool;
  const accentColor=p.parentProduct?ct.purpleMid:ct.purple;

  return (
    <div style={{background:ct.bgCard,border:`1px solid ${ct.border}`,borderRadius:10,overflow:"hidden",boxShadow:"0 1px 3px rgba(17,25,37,0.05)",marginLeft:p.parentProduct?24:0}}>
      <div style={{padding:"12px 16px",background:headerBg,borderBottom:`1px solid ${ct.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
            {p.parentProduct&&<span style={{color:accentColor,fontSize:13,fontWeight:700}}>↳</span>}
            <span style={{fontWeight:700,fontSize:14,color:accentColor,fontFamily:font}}>{p.name}</span>
            <ModelBadge type={p.type}/>
            <Badge color={p.status==="Active"||p.status==="Delivered"?"green":"gray"}>{p.status}</Badge>
            {p.parentProduct&&<Badge color="purple" small>Related to {p.parentProduct}</Badge>}
          </div>
          <div style={{fontSize:11,color:ct.textMid,fontFamily:font,display:"flex",gap:14,flexWrap:"wrap"}}>
            {p.tcv&&<span>TCV <b style={{color:ct.text}}>{fmt$(p.tcv,0)}</b></span>}
            {p.billed!=null&&<span>Billed <b style={{color:ct.green}}>{fmt$(p.billed)}</b></span>}
            {p.mrr&&<span>MRR <b style={{color:ct.text}}>{fmt$(p.mrr)}/mo</b></span>}
            {p.creditTotal&&<span>Credit <b style={{color:ct.text}}>{fmt$(p.creditTotal,0)}</b></span>}
            <span>{p.term}</span>
          </div>
          {p.type==="Prepaid Credit"&&(
            <div style={{marginTop:8,maxWidth:340}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:ct.textLight,fontFamily:font,marginBottom:3}}>
                <span>{fmt$(p.creditUsed,0)} used of {fmt$(p.creditTotal,0)}</span>
                <span style={{color:p.projectedExhaustionDays<60?ct.red:ct.orange,fontWeight:700}}>~{p.projectedExhaustionDays} days remaining</span>
              </div>
              <div style={{height:7,background:ct.bgMuted,borderRadius:3,overflow:"hidden"}}>
                <div style={{width:`${(p.creditUsed/p.creditTotal)*100}%`,height:"100%",background:p.projectedExhaustionDays<60?ct.red:ct.orange,borderRadius:3}}/>
              </div>
              <div style={{fontSize:11,color:ct.orange,fontFamily:font,marginTop:4}}>Monthly burn rate: <b>{fmt$(p.burnRate,0)}</b></div>
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <ActionsDropdown actions={getProductActions(p)} label="⚡ Actions" align="right" secondary={false}/>
          <Btn variant="ghost" small onClick={()=>setExp(!exp)}>{exp?"▲ Collapse":"▼ Expand"}</Btn>
        </div>
      </div>
      {exp&&(
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:ct.bgInput}}>
              {["Charge / Item","Billing Model","Unit","Entitlement","Current Period","Amount","Trend"].map(h=>(
                <th key={h} style={{...tdStyle,fontWeight:600,color:ct.labelMuted,
                  textAlign:["Current Period","Amount"].includes(h)?"right":"left"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.charges.map((ch,i)=>{
              const isOverModel=ch.model==="Overage"||ch.model==="PAYG"||ch.model==="Credit Draw";
              return (
                <tr key={ch.id} style={{background:i%2===1?ct.bgWarm:ct.bgCard}}
                  onMouseOver={e=>e.currentTarget.style.background=ct.bgHover}
                  onMouseOut={e=>e.currentTarget.style.background=i%2===1?ct.bgWarm:ct.bgCard}>
                  <td style={tdStyle}>
                    {ch.hasChart
                      ? <span style={{color:ct.link,cursor:"pointer",fontWeight:600}} onClick={()=>onDrillCharge({...ch,productName:p.name,usageHistory:p.usageHistory})}>{ch.name}</span>
                      : <span>{ch.name}</span>}
                  </td>
                  <td style={tdStyle}>
                    <Badge color={ch.model==="Overage"?"orange":ch.model==="PAYG"?"purple":ch.model==="Credit Draw"?"teal":ch.model==="Included"?"green":"gray"} small>{ch.model}</Badge>
                  </td>
                  <td style={tdStyle}>{ch.uom}</td>
                  <td style={tdStyle}>
                    {ch.included!=null?<span>{ch.included.toLocaleString()} incl.</span>
                    :ch.rate==="Included"?<span style={{color:ct.green,fontSize:11}}>✓ Included</span>
                    :<span style={{color:ct.textLight,fontSize:11}}>{ch.rate}</span>}
                  </td>
                  <td style={tdrStyle}>
                    {ch.currentQty!=null?<span style={{color:ch.included&&ch.currentQty>ch.included?ct.orange:ct.text,fontWeight:ch.included&&ch.currentQty>ch.included?700:400}}>
                      {ch.currentQty.toLocaleString()} {ch.uom!=="—"?ch.uom:""}
                    </span>:<span style={{color:ct.textLight}}>—</span>}
                  </td>
                  <td style={{...tdrStyle,fontWeight:700,color:ch.currentAmt>0&&isOverModel?ct.orange:ct.text}}>{fmt$(ch.currentAmt)}</td>
                  <td style={tdStyle}>{ch.trend?<TrendBadge t={ch.trend}/>:<span style={{color:ct.textLight,fontSize:11}}>—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function TrendBadge({t}){
  if(t==="up")   return <span style={{color:ct.orange,fontSize:11,fontWeight:600,fontFamily:font}}>↑ Rising</span>;
  if(t==="down") return <span style={{color:ct.red,  fontSize:11,fontWeight:600,fontFamily:font}}>↓ Falling</span>;
  return <span style={{color:ct.textLight,fontSize:11,fontFamily:font}}>— Stable</span>;
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: USAGE & SIGNALS
// ══════════════════════════════════════════════════════════════════════════════
function UsageTab({acc,onDrillCharge}){
  const usageProducts=acc.products.filter(p=>p.usageHistory);
  if(usageProducts.length===0){
    return (
      <div style={{background:ct.bgCard,border:`1px solid ${ct.border}`,borderRadius:10,padding:"40px",textAlign:"center",color:ct.textLight,fontSize:13,fontFamily:font}}>
        No usage-based charges on this account. All charges are flat-fee or one-time.
      </div>
    );
  }
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {usageProducts.map(p=>
        p.charges.filter(c=>c.hasChart).map(ch=>(
          <UsageSignalCard key={ch.id} charge={ch} product={p} onDrillCharge={onDrillCharge}/>
        ))
      )}
    </div>
  );
}

function Sparkline({data,color,included}){
  return (
    <ResponsiveContainer width="100%" height={52}>
      <ComposedChart data={data} margin={{top:4,right:2,left:2,bottom:0}}>
        {included>0&&<ReferenceLine y={included} stroke={ct.orange} strokeDasharray="3 2" strokeWidth={1}/>}
        <Bar dataKey="qty" fill={color} opacity={.75} radius={[2,2,0,0]} isAnimationActive={false}/>
        <XAxis dataKey="m" hide/><YAxis hide domain={['auto','auto']}/>
        <Tooltip contentStyle={{fontSize:10,padding:"6px 10px",background:ct.sfNavBg,border:"none",color:"#e0eaf8",borderRadius:6}} formatter={v=>[v.toLocaleString(),"Qty"]} labelStyle={{fontSize:10,color:"#7a9cc0"}}/>
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function UsageSignalCard({charge:ch,product:p,onDrillCharge}){
  const histKey=ch.id;
  const data=(p.usageHistory&&p.usageHistory[histKey])||[];
  if(!data.length) return null;
  const recent=data.slice(-6);
  const latest=data[data.length-1];
  const prev  =data[data.length-2]||latest;
  const baseline=data[0].qty;
  const trend=latest.qty>prev.qty?"up":latest.qty<prev.qty?"down":"stable";
  const overage=ch.included>0?Math.max(0,latest.qty-ch.included):0;
  const overPct=ch.included>0?Math.round((latest.qty/ch.included)*100):null;
  const growthVsBaseline=Math.round(((latest.qty-baseline)/baseline)*100);

  const isPAYG=p.type==="Pay-As-You-Go";
  const isCredit=p.type==="Prepaid Credit";
  const isUpsell=ch.included>0&&latest.qty>ch.included*0.85;
  const isChurn =trend==="down"&&(ch.included>0?latest.qty<ch.included*0.6:latest.qty<baseline*0.6);
  const isGrowth=isPAYG&&growthVsBaseline>100;

  const signalColor=isGrowth?ct.purple:isUpsell?ct.orange:isChurn?ct.red:ct.green;
  const signalBg   =isGrowth?ct.purpleBg:isUpsell?ct.orangeBg:isChurn?ct.redBg:ct.greenBg;
  const signalLabel=isGrowth?"🚀 Strong Growth":isUpsell?"⚡ Upsell Opportunity":isChurn?"⚠ Churn Risk":"✓ Healthy";

  const barColor=overPct>100?ct.orange:overPct>85?"#f0b429":ct.green;
  const sparkColor=trend==="up"?ct.purple:trend==="down"?ct.red:ct.textLight;

  return (
    <div style={{background:ct.bgCard,border:`1px solid ${ct.border}`,borderRadius:12,overflow:"hidden",boxShadow:"0 1px 3px rgba(17,25,37,0.05)"}}>
      <div style={{padding:"13px 16px 11px",borderBottom:`1px solid ${ct.borderLight}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:3,flexWrap:"wrap"}}>
            <span style={{fontWeight:700,fontSize:14,fontFamily:font,color:ct.text}}>{ch.name}</span>
            <span style={{background:signalBg,color:signalColor,border:`1px solid ${signalColor}33`,borderRadius:12,padding:"2px 10px",fontSize:11,fontWeight:700,fontFamily:font}}>{signalLabel}</span>
          </div>
          <div style={{fontSize:11,color:ct.textLight,fontFamily:font}}>{p.name} · {ch.uom} · {ch.rate}</div>
        </div>
        <Btn variant="ghost" small onClick={()=>onDrillCharge({...ch,productName:p.name,usageHistory:p.usageHistory})}>View Full Chart →</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr"}}>
        {/* Usage panel */}
        <div style={{padding:"13px 16px",borderRight:`1px solid ${ct.borderLight}`}}>
          <div style={{fontSize:10,color:ct.labelMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8,fontFamily:font}}>
            {isPAYG?"This Month":"Current Period"}
          </div>
          <div style={{fontSize:24,fontWeight:700,color:isUpsell?ct.orange:ct.text,fontFamily:font}}>{latest.qty.toLocaleString()}</div>
          <div style={{fontSize:11,color:ct.textLight,marginBottom:8,fontFamily:font}}>
            {ch.uom}
            {ch.included>0?` used of ${ch.included.toLocaleString()} included`:isPAYG?" consumed":isCredit?" drawn from credit":""}
          </div>
          {ch.included>0&&<>
            <div style={{background:ct.bgMuted,borderRadius:4,height:8,overflow:"hidden",marginBottom:4}}>
              <div style={{width:`${Math.min(100,overPct)}%`,background:barColor,height:"100%",borderRadius:4}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:ct.textLight,fontFamily:font}}>
              <span>0</span>
              <span style={{color:overPct>100?ct.orange:ct.textLight,fontWeight:overPct>100?700:400}}>{overPct}% of included</span>
              <span>{ch.included.toLocaleString()}</span>
            </div>
          </>}
          {overage>0&&<div style={{marginTop:8,padding:"5px 9px",background:ct.orangeBg,borderRadius:6,fontSize:11,fontFamily:font,border:`1px solid ${ct.orangeBorder}`}}>
            <span style={{color:ct.orange,fontWeight:700}}>{overage.toLocaleString()} {ch.uom} overage</span>
            <span style={{color:ct.textMid,marginLeft:4}}>· {fmt$(latest.amt)} billed</span>
          </div>}
          {isPAYG&&<div style={{marginTop:6,fontSize:11,color:ct.textMid,fontFamily:font}}>Billed: <b style={{color:ct.purple}}>{fmt$(latest.amt)}</b></div>}
          {isCredit&&<div style={{marginTop:6,fontSize:11,color:ct.textMid,fontFamily:font}}>Credit drawn: <b style={{color:ct.orange}}>{fmt$(latest.amt)}</b></div>}
        </div>
        {/* Trend panel */}
        <div style={{padding:"13px 16px",borderRight:`1px solid ${ct.borderLight}`}}>
          <div style={{fontSize:10,color:ct.labelMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4,fontFamily:font}}>Trend</div>
          <Sparkline data={recent} color={sparkColor} included={ch.included}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:ct.textLight,marginTop:4,fontFamily:font}}>
            <span>{recent[0]?.m}</span>
            <span style={{color:trend==="up"?ct.green:trend==="down"?ct.red:ct.textLight,fontWeight:600}}>
              {trend==="up"?"↑ Trending up":trend==="down"?"↓ Trending down":"— Stable"}
            </span>
            <span>{recent[recent.length-1]?.m}</span>
          </div>
          <div style={{fontSize:11,color:ct.textLight,marginTop:5,fontFamily:font}}>
            <span style={{color:growthVsBaseline>0?ct.green:ct.red,fontWeight:700}}>{growthVsBaseline>0?"+":""}{growthVsBaseline}%</span>
            {isPAYG?" since first billing period":" vs. subscription start"}
          </div>
        </div>
        {/* Actions */}
        <div style={{padding:"13px 16px"}}>
          <div style={{fontSize:10,color:ct.labelMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10,fontFamily:font}}>Rep Actions</div>
          {isGrowth&&<>
            <div style={{fontSize:12,color:ct.textMid,marginBottom:10,lineHeight:1.6,fontFamily:font}}>Usage up <b style={{color:ct.purple}}>{growthVsBaseline}%</b> since first period. Ideal candidate for a committed pricing deal.</div>
            <Btn variant="primary" small style={{width:"100%",justifyContent:"center",marginBottom:7}}>🎯 Create Commit Deal Opp.</Btn>
            <Btn variant="secondary" small style={{width:"100%",justifyContent:"center"}}>📊 Send Cost Comparison</Btn>
          </>}
          {isUpsell&&!isGrowth&&<>
            <div style={{fontSize:12,color:ct.textMid,marginBottom:10,lineHeight:1.6,fontFamily:font}}>At <b style={{color:ct.orange}}>{overPct}% of included tier</b>. Offer higher commit with lower per-unit rate.</div>
            <Btn variant="primary" small style={{width:"100%",justifyContent:"center",marginBottom:7}}>⚡ Create Upsell Opp.</Btn>
            <Btn variant="secondary" small style={{width:"100%",justifyContent:"center"}}>📧 Email Customer</Btn>
          </>}
          {isChurn&&<>
            <div style={{fontSize:12,color:ct.textMid,marginBottom:10,lineHeight:1.6,fontFamily:font}}>Usage dropped significantly. Offer a right-sized lower-commit tier.</div>
            <Btn variant="danger" small style={{width:"100%",justifyContent:"center",marginBottom:7}}>⚠ Flag At-Risk</Btn>
            <Btn variant="secondary" small style={{width:"100%",justifyContent:"center"}}>📞 Schedule Call</Btn>
          </>}
          {!isGrowth&&!isUpsell&&!isChurn&&<>
            <div style={{fontSize:12,color:ct.textMid,marginBottom:10,lineHeight:1.6,fontFamily:font}}>Usage is healthy — no immediate action needed.</div>
            <Btn variant="secondary" small style={{width:"100%",justifyContent:"center"}}>📋 Log Activity</Btn>
          </>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: BILLING
// ══════════════════════════════════════════════════════════════════════════════
function BillingTab({acc}){
  const [expanded,setExpanded]=useState(null);
  const totalBilled=acc.invoices.filter(i=>i.status==="Paid").reduce((s,i)=>s+i.amt,0);
  const openAmt=acc.invoices.filter(i=>i.status!=="Paid").reduce((s,i)=>s+i.amt,0);
  const totalForecast=acc.forecast.reduce((s,f)=>s+f.est,0);
  const tdStyle={padding:"10px 14px",borderBottom:`1px solid ${ct.borderLight}`,fontSize:12,fontFamily:font,color:ct.text};
  const tdrStyle={...tdStyle,textAlign:"right"};

  return (
    <>
      <div style={{display:"flex",gap:14,marginBottom:20,flexWrap:"wrap"}}>
        <MetricCard label="Open Invoices"  value={openAmt>0?fmt$(openAmt):"None"} sub={openAmt>0?"Outstanding":"All clear"} accent={openAmt>0?ct.orange:ct.green} alert={openAmt>0}/>
        <MetricCard label="Total Billed"   value={fmt$(totalBilled)} sub={`${acc.invoices.filter(i=>i.status==="Paid").length} invoices`} accent={ct.green}/>
        {acc.forecast.length>0&&<MetricCard label="Projected (6mo)" value={fmt$(totalForecast,0)} sub="Based on current usage trends" accent={ct.purple}/>}
      </div>
      <div style={{background:ct.bgCard,border:`1px solid ${ct.border}`,borderRadius:12,overflow:"hidden",marginBottom:16,boxShadow:"0 1px 3px rgba(17,25,37,0.05)"}}>
        <div style={{padding:"13px 16px",borderBottom:`1px solid ${ct.border}`,fontWeight:700,fontSize:14,fontFamily:font,color:ct.text}}>Invoice History</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:ct.bgInput}}>
              {["Invoice","Period","Amount","Status","Due","Paid"].map(h=>(
                <th key={h} style={{...tdStyle,fontWeight:600,color:ct.labelMuted,textAlign:h==="Amount"?"right":"left"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {acc.invoices.map((inv,i)=>(
              <tr key={inv.id} style={{background:i%2===1?ct.bgWarm:ct.bgCard}}
                onMouseOver={e=>e.currentTarget.style.background=ct.bgHover}
                onMouseOut={e=>e.currentTarget.style.background=i%2===1?ct.bgWarm:ct.bgCard}>
                <td style={tdStyle}><span style={{color:ct.link,fontWeight:600}}>{inv.id}</span></td>
                <td style={tdStyle}>{inv.period}</td>
                <td style={{...tdrStyle,fontWeight:700}}>{fmt$(inv.amt)}</td>
                <td style={tdStyle}><Badge color={inv.status==="Paid"?"green":inv.daysOut>30?"red":"orange"}>{inv.status}</Badge></td>
                <td style={tdStyle}>{inv.due}</td>
                <td style={{...tdStyle,color:ct.textLight}}>{inv.paid||<span style={{color:ct.orange,fontWeight:600}}>{inv.daysOut>0?`${inv.daysOut}d overdue`:"Pending"}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {acc.forecast.length>0&&(
        <div style={{background:ct.bgCard,border:`1px solid ${ct.border}`,borderRadius:12,overflow:"hidden",boxShadow:"0 1px 3px rgba(17,25,37,0.05)"}}>
          <div style={{padding:"13px 16px",borderBottom:`1px solid ${ct.border}`,fontWeight:700,fontSize:14,fontFamily:font,color:ct.text}}>Billing Forecast</div>
          <div style={{maxHeight:220,overflowY:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:ct.bgInput,position:"sticky",top:0}}>
                  {["Period","Est. Amount","Note"].map(h=>(
                    <th key={h} style={{...tdStyle,fontWeight:600,color:ct.labelMuted}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {acc.forecast.map((f,i)=>(
                  <tr key={i} style={{background:f.hasOv?ct.orangeBg:i%2===1?ct.bgWarm:ct.bgCard}}>
                    <td style={tdStyle}>{f.period}</td>
                    <td style={{...tdrStyle,fontWeight:f.hasOv?700:400,color:f.hasOv?ct.orange:f.est===0?ct.textLight:ct.text}}>{f.est>0?fmt$(f.est):"—"}</td>
                    <td style={{...tdStyle,color:ct.textLight}}>{f.hasOv?"⚠ Est. overage":f.est===0?"Credit likely exhausted":""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: COMMERCIAL
// ══════════════════════════════════════════════════════════════════════════════
function CommercialTab({acc}){
  const hasSubscription=acc.products.some(p=>p.type.includes("Subscription"));
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:ct.bgCard,border:`1px solid ${ct.border}`,borderRadius:10,padding:"16px",boxShadow:"0 1px 3px rgba(17,25,37,0.05)"}}>
          <SectionLabel>Contract Terms</SectionLabel>
          {acc.products.filter(p=>p.term).map(p=>(
            <div key={p.id} style={{padding:"10px 0",borderBottom:`1px solid ${ct.borderLight}`}}>
              <div style={{fontWeight:600,fontSize:12,color:ct.text,fontFamily:font,marginBottom:5}}>{p.name}</div>
              {[
                ["Product Type",   p.type],
                ["Term",           p.term||"—"],
                ["Billing Model",  p.charges.map(c=>c.model).filter((v,i,a)=>a.indexOf(v)===i).join(", ")],
                p.tcv&&["TCV",     fmt$(p.tcv,0)],
                p.renewalDays&&["Renewal",`In ${p.renewalDays} days (${acc.renewalDate})`],
                p.warrantyExpiry&&["Warranty", `Expires ${p.warrantyExpiry}`],
              ].filter(Boolean).map(([k,v])=>(
                <div key={k} style={{display:"flex",gap:8,padding:"3px 0",fontSize:12,fontFamily:font}}>
                  <span style={{width:120,color:ct.labelMuted,fontWeight:600,flexShrink:0}}>{k}</span>
                  <span style={{color:ct.text}}>{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Quotes placeholder */}
        <div style={{background:ct.bgCard,border:`1px solid ${ct.border}`,borderRadius:10,padding:"16px",boxShadow:"0 1px 3px rgba(17,25,37,0.05)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <SectionLabel>Quotes <span style={{fontWeight:400,textTransform:"none",letterSpacing:0,color:ct.textLight,fontSize:11}}>(via Salesforce CPQ)</span></SectionLabel>
            <Btn variant="primary" small>+ New Quote</Btn>
          </div>
          <div style={{fontSize:12,color:ct.textLight,fontFamily:font,padding:"8px 0"}}>No open quotes. Use the actions above to generate a new quote.</div>
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {/* Amendment history */}
        <div style={{background:ct.bgCard,border:`1px solid ${ct.border}`,borderRadius:10,padding:"16px",boxShadow:"0 1px 3px rgba(17,25,37,0.05)"}}>
          <SectionLabel>Amendment & Order History <span style={{fontWeight:400,textTransform:"none",letterSpacing:0,color:ct.textLight,fontSize:11}}>(via Salesforce)</span></SectionLabel>
          <div style={{fontSize:12,color:ct.textLight,fontFamily:font}}>
            {acc.monetizationModel==="paygo"
              ? "No amendments — PAYG customers adjust via usage naturally."
              : acc.monetizationModel==="onetime-support"
              ? "Original hardware order placed Oct 14, '25. Support contract co-termed."
              : "Original order placed at contract start. No amendments to date."}
          </div>
        </div>

        {/* Pricing notes */}
        <div style={{background:ct.bgCard,border:`1px solid ${ct.border}`,borderRadius:10,padding:"16px",boxShadow:"0 1px 3px rgba(17,25,37,0.05)"}}>
          <SectionLabel>Pricing & Discount Summary</SectionLabel>
          <div style={{fontSize:12,fontFamily:font,color:ct.textMid,lineHeight:1.7}}>
            {acc.monetizationModel==="subscription-usage"&&<>Standard overage rates apply: <b>$0.35/CPU-hr</b>, <b>$0.10/GB</b> over included units. Platform fee at list price.</>}
            {acc.monetizationModel==="paygo"&&<>PAYG rate: <b>$0.80/1K tokens</b>. A committed deal at 5K tokens/mo would reduce rate to <b>~$0.65/1K</b>, saving ~20%.</>}
            {acc.monetizationModel==="seat-flat"&&<>Seats billed at <b>$150/seat/mo</b>. Platform fee <b>$5,100/mo</b> flat. Volume discount available at 50+ seats.</>}
            {acc.monetizationModel==="prepaid-credit"&&<>Prepaid credit at <b>$1/credit</b>. API calls at <b>$1.20/1K</b>, storage <b>$1.50/GB-mo</b>. Subscription pricing available at <b>~15% discount</b>.</>}
            {acc.monetizationModel==="onetime-support"&&<>Hardware at list price ($5,000/unit). Support at <b>$3,000/mo</b>. Hardware refresh pricing TBD based on unit count.</>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CHARGE DRILL-DOWN
// ══════════════════════════════════════════════════════════════════════════════
function ChargeViewer({charge,onBack,accName}){
  const [period,setPeriod]=useState(12);
  const [tab,setTab]=useState("summary");
  const rawData=(charge.usageHistory&&charge.usageHistory[charge.id])||[];
  const chartData=rawData.slice(-Math.min(period,rawData.length));
  const included=charge.included||0;
  const unit=charge.uom;
  const first=chartData[0]?.m, last=chartData[chartData.length-1]?.m;
  const totQty=chartData.reduce((s,d)=>s+d.qty,0);
  const totAmt=chartData.reduce((s,d)=>s+d.amt,0);
  const amts=chartData.map(d=>d.amt), qtys=chartData.map(d=>d.qty);
  const tdStyle={padding:"10px 14px",borderBottom:`1px solid ${ct.borderLight}`,fontSize:12,fontFamily:font,color:ct.text};
  const tdrStyle={...tdStyle,textAlign:"right"};
  const CustomTip=({active,payload,label})=>{
    if(!active||!payload?.length) return null;
    return <div style={{background:ct.sfNavBg,borderRadius:8,padding:"10px 14px",fontSize:12,color:"#e0eaf8",fontFamily:font}}>
      <div style={{fontWeight:700,marginBottom:6}}>{label}</div>
      {payload.map((p,i)=><div key={i} style={{color:p.color}}>{p.name}: {p.name==="Billed Amount"?fmt$(p.value):p.value?.toLocaleString()}</div>)}
    </div>;
  };
  return (
    <div>
      <div style={{display:"flex",gap:4,fontSize:12,marginBottom:12,fontFamily:font,alignItems:"center"}}>
        {[{lbl:accName,cb:true},{lbl:charge.productName||"Product",cb:true},{lbl:charge.name,cb:false}].map((c,i)=>(
          <span key={i} style={{display:"flex",alignItems:"center",gap:4}}>
            {i>0&&<span style={{color:ct.textLight}}>›</span>}
            {c.cb?<span style={{color:ct.link,cursor:"pointer",fontWeight:600}} onClick={onBack}>{c.lbl}</span>
                 :<span style={{color:ct.text,fontWeight:700}}>{c.lbl}</span>}
          </span>
        ))}
      </div>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:10,color:ct.labelMuted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:4,fontFamily:font}}>Charge</div>
        <div style={{fontSize:22,fontWeight:700,color:ct.text,fontFamily:font}}>{charge.name}</div>
        <div style={{fontSize:12,color:ct.textLight,fontFamily:font,marginTop:4}}>
          {charge.productName} · {charge.rate} {included>0?`· ${included.toLocaleString()} ${unit} included/period`:""}
        </div>
      </div>
      <div style={{background:ct.darkest,borderRadius:14,padding:"22px 26px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{color:"#e0eaf8",fontWeight:700,fontSize:16,fontFamily:font}}>Monthly Consumption & Billing</div>
            <div style={{color:"#7a9cc0",fontSize:11,marginTop:4,fontFamily:font}}>{first} – {last}</div>
            <div style={{display:"flex",gap:20,marginTop:10,fontSize:12,flexWrap:"wrap"}}>
              <span style={{display:"flex",alignItems:"center",gap:7}}><span style={{width:14,height:14,background:ct.purple,borderRadius:3,display:"inline-block"}}/><span style={{color:"#b0cce8",fontFamily:font}}>Qty ({unit})</span></span>
              <span style={{display:"flex",alignItems:"center",gap:7}}><span style={{width:22,height:3,background:ct.teal,display:"inline-block",borderRadius:2}}/><span style={{color:"#b0cce8",fontFamily:font}}>Amount (USD)</span></span>
            </div>
          </div>
          <div style={{display:"flex",gap:4,background:"rgba(255,255,255,0.05)",borderRadius:10,padding:4}}>
            {[6,12].map(p=>(
              <button key={p} onClick={()=>setPeriod(p)} style={{
                padding:"6px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:p===period?700:400,
                fontFamily:font,background:p===period?ct.purple:"transparent",color:p===period?"#fff":"#7a9cc0",transition:"all 0.15s",
              }}>{p}mo</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={chartData} margin={{top:8,right:60,left:10,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3050" vertical={false}/>
            <XAxis dataKey="m" tick={{fill:"#7a9cc0",fontSize:12}} axisLine={false} tickLine={false}/>
            <YAxis yAxisId="q" orientation="left"  tick={{fill:"#7a9cc0",fontSize:12}} axisLine={false} tickLine={false}/>
            <YAxis yAxisId="a" orientation="right" tick={{fill:"#7a9cc0",fontSize:12}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/>
            <Tooltip content={<CustomTip/>}/>
            <Bar  yAxisId="q" dataKey="qty" name="Billed Quantity" fill={ct.purple} opacity={.85} radius={[3,3,0,0]}/>
            <Line yAxisId="a" type="monotone" dataKey="amt" name="Billed Amount" stroke={ct.teal} strokeWidth={2.5} dot={{fill:ct.teal,r:4}}/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div style={{background:ct.bgCard,border:`1px solid ${ct.border}`,borderRadius:12,overflow:"hidden",boxShadow:"0 1px 3px rgba(17,25,37,0.05)"}}>
        <div style={{display:"flex",padding:"0 16px",borderBottom:`1px solid ${ct.border}`}}>
          {[["summary","Summary"],["monthly","Monthly Detail"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:"12px 18px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:tab===id?700:500,color:tab===id?ct.purple:ct.textMid,fontFamily:font,borderBottom:tab===id?`3px solid ${ct.purple}`:"3px solid transparent",transition:"color 0.15s"}}>{lbl}</button>
          ))}
        </div>
        <div style={{padding:"16px"}}>
          <div style={{fontSize:11,color:ct.textLight,marginBottom:12,fontFamily:font}}>Showing <b style={{color:ct.textMid}}>{first} – {last}</b></div>
          {tab==="summary"&&(
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{background:ct.bgInput}}>
                {["Metric","Total","Avg/Mo","Low","High"].map(h=>(
                  <th key={h} style={{...tdStyle,fontWeight:600,color:ct.labelMuted,textAlign:h==="Metric"?"left":"right"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                <tr>
                  <td style={tdStyle}><span style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:12,height:12,background:ct.purple,borderRadius:3}}/> Qty ({unit})</span></td>
                  <td style={tdrStyle}><b>{totQty.toLocaleString()}</b></td>
                  <td style={tdrStyle}>{Math.round(totQty/chartData.length).toLocaleString()}</td>
                  <td style={tdrStyle}>{Math.min(...qtys).toLocaleString()}<div style={{fontSize:10,color:ct.textLight}}>{chartData.find(d=>d.qty===Math.min(...qtys))?.m}</div></td>
                  <td style={tdrStyle}>{Math.max(...qtys).toLocaleString()}<div style={{fontSize:10,color:ct.textLight}}>{chartData.find(d=>d.qty===Math.max(...qtys))?.m}</div></td>
                </tr>
                <tr style={{background:ct.bgWarm}}>
                  <td style={tdStyle}><span style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:20,height:3,background:ct.teal,borderRadius:2}}/> Billed Amount</span></td>
                  <td style={tdrStyle}><b>{fmt$(totAmt)}</b></td>
                  <td style={tdrStyle}>{fmt$(totAmt/chartData.length)}</td>
                  <td style={tdrStyle}>{fmt$(Math.min(...amts))}<div style={{fontSize:10,color:ct.textLight}}>{chartData.find(d=>d.amt===Math.min(...amts))?.m}</div></td>
                  <td style={tdrStyle}>{fmt$(Math.max(...amts))}<div style={{fontSize:10,color:ct.textLight}}>{chartData.find(d=>d.amt===Math.max(...amts))?.m}</div></td>
                </tr>
              </tbody>
            </table>
          )}
          {tab==="monthly"&&(
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{background:ct.bgInput}}>
                {["Month","Qty","Included","Overage","Billed Amount"].map(h=>(
                  <th key={h} style={{...tdStyle,fontWeight:600,color:ct.labelMuted,textAlign:h==="Month"?"left":"right"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{chartData.map((d,i)=>{
                const ov=included>0?Math.max(0,d.qty-included):0;
                return <tr key={i} style={{background:i%2===1?ct.bgWarm:ct.bgCard}}>
                  <td style={tdStyle}><b>{d.m}</b></td>
                  <td style={tdrStyle}>{d.qty.toLocaleString()} {unit}</td>
                  <td style={{...tdrStyle,color:ct.green}}>{included>0?`${included.toLocaleString()} ${unit}`:"—"}</td>
                  <td style={{...tdrStyle,color:ov>0?ct.orange:ct.textLight,fontWeight:ov>0?700:400}}>{ov>0?`${ov.toLocaleString()} ${unit}`:"—"}</td>
                  <td style={{...tdrStyle,color:d.amt>0?ct.orange:ct.textLight,fontWeight:d.amt>0?700:400}}>{d.amt>0?fmt$(d.amt):"—"}</td>
                </tr>;
              })}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function App(){
  const [accountId,setAccountId]=useState("pets");
  const [tab,setTab]=useState("overview");
  const [outerTab,setOuterTab]=useState("360");
  const [drillCharge,setDrillCharge]=useState(null);

  const acc=ACCOUNTS[accountId];

  const handleAccountChange=(id)=>{
    setAccountId(id);
    setTab("overview");
    setDrillCharge(null);
  };

  const TABS=[
    {id:"overview",    label:"Overview"},
    {id:"products",    label:"Products & Entitlements"},
    {id:"usage",       label:"Usage & Signals"},
    {id:"billing",     label:"Billing"},
    {id:"commercial",  label:"Commercial"},
  ];

  return (
    <div style={{fontFamily:font,background:ct.bg,minHeight:"100vh"}}>
      {/* Nav */}
      <div style={{background:ct.sfNavBg,color:"#fff",padding:"0 20px",display:"flex",alignItems:"center",height:46,gap:14}}>
        <span style={{fontWeight:800,fontSize:14,letterSpacing:1,fontFamily:font,marginRight:4}}>Continuous</span>
        <span style={{fontSize:11,opacity:.3}}>|</span>
        <AccountSwitcher current={accountId} onChange={handleAccountChange}/>
        {drillCharge&&<>
          <span style={{fontSize:11,opacity:.4}}>›</span>
          <span style={{fontSize:12,opacity:.7,cursor:"pointer",fontFamily:font}} onClick={()=>setDrillCharge(null)}>Usage & Signals</span>
          <span style={{fontSize:11,opacity:.4}}>›</span>
          <span style={{fontSize:12,fontFamily:font}}>{drillCharge.name}</span>
        </>}
        <div style={{flex:1}}/>
        <span style={{fontSize:11,opacity:.5,fontFamily:font}}>Salesforce Managed Package</span>
      </div>

      <div style={{maxWidth:1140,margin:"0 auto",padding:"20px 16px"}}>
        {/* Outer tabs */}
        <div style={{display:"flex",borderBottom:`1px solid ${ct.border}`,marginBottom:16}}>
          {[["360","Account 360°"],["related","Related"],["details","Details"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>{setOuterTab(id);setDrillCharge(null);}} style={{
              padding:"9px 18px",border:"none",background:"none",cursor:"pointer",fontSize:13,
              fontWeight:outerTab===id?700:500,color:outerTab===id?ct.purple:ct.textMid,fontFamily:font,
              borderBottom:outerTab===id?`3px solid ${ct.purple}`:"3px solid transparent",transition:"color 0.15s",
            }}>{lbl}</button>
          ))}
        </div>

        {outerTab!=="360"&&<div style={{color:ct.textLight,padding:"60px",textAlign:"center",fontSize:13,fontFamily:font}}>
          {outerTab==="related"?"Related records would appear here.":"Account details would appear here."}
        </div>}

        {outerTab==="360"&&<>
          {/* Health header + action rail always visible */}
          <HealthHeader acc={acc}/>
          <ActionRail acc={acc}/>

          {drillCharge
            ? <ChargeViewer charge={drillCharge} accName={acc.name} onBack={()=>setDrillCharge(null)}/>
            : <>
                <Tabs active={tab} onChange={setTab} tabs={TABS}/>
                {tab==="overview"   &&<OverviewTab acc={acc}/>}
                {tab==="products"   &&<ProductsTab acc={acc} onDrillCharge={setDrillCharge}/>}
                {tab==="usage"      &&<UsageTab    acc={acc} onDrillCharge={setDrillCharge}/>}
                {tab==="billing"    &&<BillingTab  acc={acc}/>}
                {tab==="commercial" &&<CommercialTab acc={acc}/>}
              </>
          }
        </>}
      </div>
    </div>
  );
}
