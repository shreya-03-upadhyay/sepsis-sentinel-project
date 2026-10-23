import React, { useMemo, useState } from 'react'
import {
  Activity, LayoutDashboard, HeartPulse, AlertTriangle, ChartNoAxesCombined,
  BookOpen, Search, Bell, ChevronRight, Menu, X, Clock3, ShieldCheck,
  Users, TrendingUp, CircleHelp, SlidersHorizontal, ArrowUpRight, Database
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, Legend
} from 'recharts'
import beds, { hourlyTrend, patientTimeline } from './data.js'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'monitoring', label: 'Patient Monitoring', icon: HeartPulse },
  { id: 'risk', label: 'Risk Analysis', icon: AlertTriangle },
  { id: 'performance', label: 'Model Performance', icon: ChartNoAxesCombined },
  { id: 'about', label: 'About & Sources', icon: BookOpen }
]
const titles = {
  overview: ['ICU Early Warning Centre', 'Unit-wide view of simulated observations and risk stratification.'],
  monitoring: ['Patient Monitoring', 'Review bed-level observations, trends, and missing measurements.'],
  risk: ['Unit-Wide Risk Analysis', 'Prioritised demonstration alerts and risk category distribution.'],
  performance: ['Model Performance & Validation', 'Evaluation status, intended metrics, and validation requirements.'],
  about: ['About Sepsis Sentinel', 'Scope, data provenance, and responsible-use information.']
}
const palette = { HIGH: '#c84b4b', ELEVATED: '#c58a2b', LOW: '#188779' }
const fmt = n => `${n}%`

function Card({ children, className = '' }) { return <section className={`panel ${className}`}>{children}</section> }
function SectionHeading({ title, detail, action }) {
  return <div className="section-heading"><div><h2>{title}</h2>{detail && <p>{detail}</p>}</div>{action}</div>
}
function Pill({ category }) { return <span className={`pill ${category.toLowerCase()}`}>{category === 'HIGH' ? 'High priority' : category === 'ELEVATED' ? 'Elevated' : category || 'Demo'}</span> }
function Metric({ label, value, note, icon: Icon, tone = 'teal' }) {
  return <Card className="metric"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}><Icon size={18}/></span></div><div className="metric-value">{value}</div><div className="metric-note">{note}</div></Card>
}
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return <div className="chart-tooltip"><strong>{label}</strong>{payload.map((p, i) => <div key={i}><span style={{color:p.color}}>●</span> {p.name}: <b>{p.value}</b></div>)}</div>
}

export default function App() {
  const [page, setPage] = useState('overview')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')
  const [pod, setPod] = useState('ALL')
  const [selected, setSelected] = useState('P-106')
  const [highThreshold, setHighThreshold] = useState(65)
  const [elevThreshold, setElevThreshold] = useState(35)
  const [mobileNav, setMobileNav] = useState(false)
  const [sortRisk, setSortRisk] = useState(true)

  const patients = useMemo(() => beds.map(p => ({
    ...p, category: p.risk >= highThreshold ? 'HIGH' : p.risk >= elevThreshold ? 'ELEVATED' : 'LOW'
  })), [highThreshold, elevThreshold])
  const filtered = useMemo(() => patients.filter(p =>
    (p.id.toLowerCase().includes(search.toLowerCase()) || p.bed.toLowerCase().includes(search.toLowerCase())) &&
    (category === 'ALL' || p.category === category) && (pod === 'ALL' || p.pod === pod)
  ).sort((a, b) => sortRisk ? b.risk - a.risk : a.bed.localeCompare(b.bed)), [patients, search, category, pod, sortRisk])
  const high = patients.filter(p => p.category === 'HIGH').length
  const elevated = patients.filter(p => p.category === 'ELEVATED').length
  const selectedPatient = patients.find(p => p.id === selected) || patients[0]
  const riskDistribution = [
    { name: 'High priority', value: high, color: palette.HIGH },
    { name: 'Elevated', value: elevated, color: palette.ELEVATED },
    { name: 'Low', value: 40 - high - elevated, color: palette.LOW }
  ]
  const go = id => { setPage(id); setMobileNav(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return <div className="app-shell">
    {mobileNav && <button className="scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><Activity size={23}/></div>
        <div><strong>SEPSIS SENTINEL</strong><span>ICU EARLY-WARNING PLATFORM</span></div>
        <button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18}/></button>
      </div>
      <div className="mode-banner"><span className="status-dot"/><span><b>DEMO ENVIRONMENT</b><small>Synthetic patient data</small></span></div>
      <div className="nav-label">WORKSPACE</div>
      <nav className="side-nav">{navItems.map(item => {
        const Icon = item.icon
        return <button key={item.id} className={`nav-link ${page === item.id ? 'active' : ''}`} onClick={() => go(item.id)}>
          <Icon size={18}/><span>{item.label}</span>{page === item.id && <ChevronRight size={15} className="nav-chevron"/>}
        </button>
      })}</nav>
      <div className="threshold-box">
        <div className="threshold-title"><SlidersHorizontal size={15}/> Alert thresholds</div>
        <label className="range-label"><span>High priority</span><b>{highThreshold}%</b></label>
        <input aria-label="High risk threshold" type="range" min="40" max="90" value={highThreshold} onChange={e => setHighThreshold(Math.min(Number(e.target.value), elevThreshold + 10))}/>
        <label className="range-label"><span>Elevated</span><b>{elevThreshold}%</b></label>
        <input aria-label="Elevated risk threshold" type="range" min="15" max="60" value={elevThreshold} onChange={e => setElevThreshold(Math.min(Number(e.target.value), highThreshold - 10))}/>
        <p>Adjustable demo cutoffs only. Not clinical diagnostic thresholds.</p>
      </div>
      <div className="sidebar-footer"><ShieldCheck size={16}/><span>Research prototype<br/><b>Not for clinical decision-making</b></span></div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <button className="icon-button menu-trigger" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20}/></button>
        <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14}/><b>{navItems.find(n => n.id === page)?.label}</b></div>
        <div className="topbar-right"><span className="system-status"><i/> Simulation active</span><button className="icon-button" title="Demo mode information" onClick={() => go('about')}><CircleHelp size={18}/></button><div className="avatar">SS</div></div>
      </header>
      <div className="content-wrap">
        <div className="page-title-row"><div><div className="eyebrow">CLINICAL RESEARCH INTERFACE <span>•</span> DEMONSTRATION</div><h1>{titles[page][0]}</h1><p>{titles[page][1]}</p></div><div className="timestamp"><Clock3 size={15}/><span>Last refresh<br/><b>Simulated · T-0h</b></span></div></div>
        <div className="global-notice"><span className="notice-icon"><ShieldCheck size={17}/></span><p><b>Simulation notice</b> All patient records and risk scores shown are synthetic demonstration data. This interface is not a validated medical device.</p></div>

        {page === 'overview' && <Overview patients={patients} high={high} elevated={elevated} riskDistribution={riskDistribution} setPage={go} setSelected={setSelected}/>}
        {page === 'monitoring' && <Monitoring filtered={filtered} search={search} setSearch={setSearch} category={category} setCategory={setCategory} pod={pod} setPod={setPod} selected={selected} setSelected={setSelected} selectedPatient={selectedPatient} patients={patients}/>}
        {page === 'risk' && <Risk patients={patients} riskDistribution={riskDistribution} high={high} elevated={elevated} setPage={go} setSelected={setSelected}/>}
        {page === 'performance' && <Performance/>}
        {page === 'about' && <About/>}
        <footer className="page-footer"><span>SEPSIS SENTINEL <i>v0.1.0 · HACKATHON DEMO</i></span><span>Built for research demonstration <span className="footer-dot">•</span> Synthetic data only</span></footer>
      </div>
    </main>
  </div>
}

function Overview({ patients, high, elevated, riskDistribution, setPage, setSelected }) {
  const alerts = [...patients].filter(p => p.category !== 'LOW').sort((a,b) => b.risk-a.risk).slice(0,5)
  return <>
    <div className="metrics-grid">
      <Metric label="Patients monitored" value="40" note="Simulated ICU beds" icon={Users} tone="teal"/>
      <Metric label="High-priority flags" value={high} note="Above current demo threshold" icon={AlertTriangle} tone="red"/>
      <Metric label="Elevated risk flags" value={elevated} note="Requires review in demo flow" icon={Activity} tone="amber"/>
      <Metric label="Data completeness" value={`${Math.round(patients.reduce((s,p)=>s+p.completeness,0)/patients.length)}%`} note="Synthetic observation coverage" icon={Database} tone="blue"/>
    </div>
    <div className="two-col overview-charts">
      <Card><SectionHeading title="Risk distribution over time" detail="Illustrative category counts across a simulated 24-hour window" action={<span className="tiny-tag">24H WINDOW</span>}/><div className="chart-wrap tall"><ResponsiveContainer width="100%" height="100%"><AreaChart data={hourlyTrend} margin={{top:12,right:8,left:-18,bottom:0}}><defs><linearGradient id="highFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c84b4b" stopOpacity={.22}/><stop offset="95%" stopColor="#c84b4b" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#e8eef5"/><XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{fontSize:11,fill:'#8290a2'}}/><YAxis tickLine={false} axisLine={false} tick={{fontSize:11,fill:'#8290a2'}}/><Tooltip content={<ChartTip/>}/><Area type="monotone" dataKey="high" name="High" stroke={palette.HIGH} fill="url(#highFill)" strokeWidth={2.2}/><Area type="monotone" dataKey="elevated" name="Elevated" stroke={palette.ELEVATED} fill="transparent" strokeWidth={2}/><Area type="monotone" dataKey="low" name="Low" stroke={palette.LOW} fill="transparent" strokeWidth={2}/><Legend iconType="circle" wrapperStyle={{fontSize:11,paddingTop:12}}/></AreaChart></ResponsiveContainer></div></Card>
      <Card><SectionHeading title="Current risk stratification" detail="Distribution of simulated beds by adjustable cutoff" action={<span className="tiny-tag">LIVE FILTER</span>}/><div className="donut-layout"><div className="chart-wrap donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={65} outerRadius={88} paddingAngle={3} stroke="none">{riskDistribution.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="donut-center"><b>40</b><span>ICU beds</span></div></div><div className="legend-list">{riskDistribution.map(d=><div key={d.name}><span><i style={{background:d.color}}/>{d.name}</span><b>{d.value}<small> beds</small></b></div>)}</div></div></Card>
    </div>
    <div className="two-col overview-bottom">
      <Card><SectionHeading title="Priority review queue" detail="Highest demonstration scores first" action={<button className="text-action" onClick={()=>setPage('risk')}>View all alerts <ArrowUpRight size={14}/></button>}/><div className="alert-list">{alerts.map(p=><button className="alert-row" key={p.id} onClick={()=>{setSelected(p.id);setPage('monitoring')}}><span className={`alert-symbol ${p.category.toLowerCase()}`}><AlertTriangle size={16}/></span><span className="alert-copy"><b>{p.id} <small>· {p.bed}</small></b><span>{p.hr} bpm heart rate · SBP {p.sbp} mmHg</span></span><span className="alert-score"><b>{p.risk}%</b><Pill category={p.category}/></span><ChevronRight size={15} className="muted-chevron"/></button>)}</div></Card>
      <Card><SectionHeading title="Unit snapshot" detail="Bed distribution by care pod"/><div className="pod-stat"><div><span>Pod A</span><b>20 beds</b></div><div className="progress"><i style={{width:'50%'}}/></div><small>{patients.filter(p=>p.pod==='Pod A'&&p.category!=='LOW').length} flagged beds</small></div><div className="pod-stat"><div><span>Pod B</span><b>20 beds</b></div><div className="progress amber"><i style={{width:'50%'}}/></div><small>{patients.filter(p=>p.pod==='Pod B'&&p.category!=='LOW').length} flagged beds</small></div><div className="mini-note"><TrendingUp size={17}/><span>Scores are generated by a transparent demo heuristic—not a trained or validated prediction model.</span></div></Card>
    </div>
  </>
}

function Monitoring({ filtered, search, setSearch, category, setCategory, pod, setPod, selected, setSelected, selectedPatient, patients }) {
  return <><Card className="table-panel"><SectionHeading title="Bedside patient roster" detail={`${filtered.length} of ${patients.length} synthetic records shown`} action={<span className="tiny-tag"><span className="tiny-live"/> DEMO FEED</span>}/><div className="filters"><div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patient ID or bed…" aria-label="Search patients"/></div><select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Filter by risk"><option value="ALL">All risk categories</option><option value="HIGH">High priority</option><option value="ELEVATED">Elevated</option><option value="LOW">Low</option></select><select value={pod} onChange={e=>setPod(e.target.value)} aria-label="Filter by pod"><option value="ALL">All pods</option><option value="Pod A">Pod A</option><option value="Pod B">Pod B</option></select></div><div className="table-scroll"><table><thead><tr><th>Patient / Bed</th><th>Pod</th><th>Risk score</th><th>Heart rate</th><th>SBP</th><th>Resp. rate</th><th>Temp.</th><th>SpO₂</th><th>Category</th></tr></thead><tbody>{filtered.map(p=><tr key={p.id} className={selected===p.id?'selected-row':''} onClick={()=>setSelected(p.id)} tabIndex="0" onKeyDown={e=>e.key==='Enter'&&setSelected(p.id)}><td><b>{p.id}</b><small>{p.bed}</small></td><td>{p.pod}</td><td><div className="risk-cell"><b>{p.risk}%</b><span><i style={{width:`${p.risk}%`,background:palette[p.category]}}/></span></div></td><td>{p.hr} <small>bpm</small></td><td>{p.sbp} <small>mmHg</small></td><td>{p.rr} <small>/min</small></td><td>{p.temp} <small>°C</small></td><td>{p.spo2} <small>%</small></td><td><Pill category={p.category}/></td></tr>)}</tbody></table>{filtered.length===0&&<div className="empty-state">No demo records match those filters.</div>}</div><div className="table-foot">Select a row to inspect its simulated trend below. Values are illustrative only.</div></Card>
    <div className="two-col patient-detail"><Card><SectionHeading title={`Patient trend · ${selectedPatient.id}`} detail={`${selectedPatient.bed} · ${selectedPatient.pod} · Synthetic 24-hour series`}/><div className="selected-summary"><div><span>Demo risk score</span><b style={{color:palette[selectedPatient.category]}}>{selectedPatient.risk}%</b></div><div><span>Category</span><Pill category={selectedPatient.category}/></div><div><span>Completeness</span><b>{selectedPatient.completeness}%</b></div></div><div className="chart-wrap tall"><ResponsiveContainer width="100%" height="100%"><LineChart data={patientTimeline} margin={{top:10,right:12,left:-15,bottom:0}}><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#e8eef5"/><XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{fontSize:10,fill:'#8290a2'}} interval={3}/><YAxis tickLine={false} axisLine={false} tick={{fontSize:10,fill:'#8290a2'}}/><Tooltip content={<ChartTip/>}/><Line type="monotone" dataKey="risk" name="Risk score" stroke={palette[selectedPatient.category]} strokeWidth={2.5} dot={false}/><Line type="monotone" dataKey="hr" name="Heart rate" stroke="#277cae" strokeWidth={1.8} dot={false}/><Legend wrapperStyle={{fontSize:11}}/></LineChart></ResponsiveContainer></div></Card><Card><SectionHeading title="Observation summary" detail="Latest synthetic vital signs"/><div className="vitals-grid">{[['Heart rate',`${selectedPatient.hr} bpm`],['Systolic BP',`${selectedPatient.sbp} mmHg`],['Respiratory rate',`${selectedPatient.rr} /min`],['Temperature',`${selectedPatient.temp} °C`],['Oxygen saturation',`${selectedPatient.spo2}%`],['Data completeness',`${selectedPatient.completeness}%`]].map(([l,v])=><div className="vital-tile" key={l}><span>{l}</span><b>{v}</b></div>)}</div><div className="mini-note warning"><CircleHelp size={17}/><span>These values are synthetic and cannot guide diagnosis, treatment, or patient triage.</span></div></Card></div>
  </>
}

function Risk({ patients, riskDistribution, high, elevated, setPage, setSelected }) {
  const alerts = [...patients].filter(p=>p.category!=='LOW').sort((a,b)=>b.risk-a.risk)
  const pods = ['Pod A','Pod B'].map(name=>({pod:name, high:patients.filter(p=>p.pod===name&&p.category==='HIGH').length, elevated:patients.filter(p=>p.pod===name&&p.category==='ELEVATED').length}))
  return <><div className="metrics-grid three"><Metric label="High priority" value={high} note="Current demo cutoff" icon={AlertTriangle} tone="red"/><Metric label="Elevated" value={elevated} note="Current demo cutoff" icon={Activity} tone="amber"/><Metric label="All flagged" value={high+elevated} note="High + elevated categories" icon={Bell} tone="blue"/></div><div className="two-col"><Card><SectionHeading title="Prioritised alert stream" detail="Sorted by synthetic risk score"/><div className="alert-list risk-list">{alerts.map(p=><button className="alert-row" key={p.id} onClick={()=>{setSelected(p.id);setPage('monitoring')}}><span className={`alert-symbol ${p.category.toLowerCase()}`}><AlertTriangle size={16}/></span><span className="alert-copy"><b>{p.id} <small>· {p.bed} · {p.pod}</small></b><span>HR {p.hr} bpm · SBP {p.sbp} mmHg · RR {p.rr}/min</span><span className="alert-reason">{p.hr>100?'Elevated heart rate':p.sbp<95?'Lower systolic pressure':'Multi-parameter demo score'}</span></span><span className="alert-score"><b>{p.risk}%</b><Pill category={p.category}/></span><ChevronRight size={15} className="muted-chevron"/></button>)}</div></Card><div className="stacked"><Card><SectionHeading title="Risk stratification" detail="Current category counts"/><div className="chart-wrap medium"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>{riskDistribution.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip/><Legend iconType="circle" wrapperStyle={{fontSize:11}}/></PieChart></ResponsiveContainer></div></Card><Card><SectionHeading title="Flagged beds by pod" detail="Grouped category counts"/><div className="chart-wrap medium"><ResponsiveContainer width="100%" height="100%"><BarChart data={pods} margin={{top:10,right:4,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#e8eef5"/><XAxis dataKey="pod" tickLine={false} axisLine={false} tick={{fontSize:11,fill:'#8290a2'}}/><YAxis tickLine={false} axisLine={false} tick={{fontSize:10,fill:'#8290a2'}}/><Tooltip content={<ChartTip/>}/><Bar dataKey="high" name="High" fill={palette.HIGH} radius={[4,4,0,0]}/><Bar dataKey="elevated" name="Elevated" fill={palette.ELEVATED} radius={[4,4,0,0]}/><Legend wrapperStyle={{fontSize:11}}/></BarChart></ResponsiveContainer></div></Card></div></div><div className="mini-note warning"><ShieldCheck size={17}/><span>Alert categories are produced from adjustable demo cutoffs. They are not clinical alerts and should not be used for patient care.</span></div></>
}

function Performance() {
  return <><div className="status-banner"><div className="status-icon"><ChartNoAxesCombined size={23}/></div><div><span className="eyebrow">VALIDATION STATUS</span><h2>Clinical performance evaluation pending</h2><p>No clinical model metrics are reported because this starter interface uses synthetic data and a demonstration heuristic.</p></div><span className="status-pill">Not validated</span></div><div className="three-col"><Card className="info-card"><div className="info-icon blue"><Activity size={19}/></div><h3>Discrimination</h3><p>When a trained model and labelled validation set are available, report AUROC alongside AUPRC, especially where sepsis events are uncommon.</p><span className="info-tag">Metrics pending</span></Card><Card className="info-card"><div className="info-icon amber"><ShieldCheck size={19}/></div><h3>Calibration & safety</h3><p>Evaluate calibration, missing-data behaviour, subgroup performance, alert burden, and false negatives before considering clinical use.</p><span className="info-tag">Review required</span></Card><Card className="info-card"><div className="info-icon teal"><Database size={19}/></div><h3>Dataset integrity</h3><p>Document dataset source, cohort definition, patient-level splits, leakage checks, prediction horizon, and reproducible evaluation code.</p><span className="info-tag">Protocol required</span></Card></div><Card><SectionHeading title="Evaluation checklist" detail="Required before claiming predictive performance"/><div className="checklist">{['Identify a suitable, permissioned clinical dataset and document provenance.','Define the sepsis label and prediction horizon before training.','Split by patient, not by individual time-series row, to reduce leakage.','Report AUROC, AUPRC, sensitivity, specificity, PPV, NPV, and calibration.','Assess missing data, subgroup performance, and alert burden.','Obtain appropriate clinical, privacy, and governance review.'].map((t,i)=><div className="check-item" key={t}><span>{String(i+1).padStart(2,'0')}</span><p>{t}</p><small>Pending</small></div>)}</div></Card></>
}
function About() {
  return <><Card className="about-hero"><div className="about-mark"><Activity size={30}/></div><div><div className="eyebrow">PROJECT OVERVIEW</div><h2>Earlier insight. Better decisions.</h2><p>Sepsis Sentinel is a hackathon research-interface concept for exploring how ICU time-series observations and transparent risk summaries might be presented to a clinical team.</p><span className="status-pill">Research / demonstration prototype</span></div></Card><div className="two-col"><Card><SectionHeading title="Demo data provenance" detail="What the current interface contains"/><div className="provenance-list"><div><Database size={18}/><span><b>Population</b><small>40 synthetic adult ICU bed records generated locally in the browser.</small></span></div><div><Activity size={18}/><span><b>Observations</b><small>Illustrative vital signs and time-series values, not real patient records.</small></span></div><div><SlidersHorizontal size={18}/><span><b>Risk scoring</b><small>Transparent synthetic score categories using configurable demonstration cutoffs.</small></span></div><div><BookOpen size={18}/><span><b>Validation</b><small>No validated model metrics or clinical performance claims are included.</small></span></div></div></Card><Card><SectionHeading title="Responsible use" detail="Important scope boundaries"/><div className="disclaimer-block"><AlertTriangle size={20}/><div><b>Not for clinical use</b><p>This interface is not a medical device and has not been clinically validated. Do not use its scores or alerts to diagnose, treat, or triage any person.</p></div></div><p className="body-copy">Before connecting real health data, establish appropriate permissions, privacy safeguards, security controls, clinical oversight, and a validated model evaluation process.</p></Card></div><Card><SectionHeading title="Suggested technical architecture" detail="A sensible next stage for the hackathon build"/><div className="architecture">{[['01','Frontend','React + Vite, responsive dashboard and chart components'],['02','API layer','Node.js / Express endpoints with schema validation'],['03','Model service','Versioned inference service with documented features'],['04','Data layer','Permissioned, de-identified dataset or synthetic demo fixture'],['05','Evaluation','Reproducible metrics, calibration, drift and safety review']].map(([n,t,d])=><div key={n}><span>{n}</span><section><b>{t}</b><small>{d}</small></section></div>)}</div></Card></>
}