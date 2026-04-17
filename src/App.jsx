import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Thermometer, 
  Droplets, 
  Wind, 
  Clock, 
  ChevronRight, 
  LogOut,
  User,
  Lock,
  Bell,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Components ---

const LoginPage = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id && pass) onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#1295AE] flex items-center justify-center mb-4">
            <Truck size={32} color="white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#1295AE]">CSM</h1>
          <p className="font-accent text-sm uppercase tracking-widest text-[#64748B]">Supply Intelligence</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Access ID</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1295AE] pointer-events-none" size={18} />
              <input 
                type="text" 
                className="input-field pl-12" 
                placeholder="USER_01" 
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1295AE] pointer-events-none" size={18} />
              <input 
                type="password" 
                className="input-field pl-12" 
                placeholder="••••••••" 
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="skewed-btn w-full mt-4">
            Authenticate
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const FleetMonitor = ({ onSelectTruck }) => {
  const [trucks, setTrucks] = useState([]);

  useEffect(() => {
    fetch('/api/trucks')
      .then(res => {
         if (!res.ok) throw new Error('API missing');
         return res.json();
      })
      .then(data => setTrucks(data))
      .catch(err => {
         console.info("Using local fallback data for Vercel deployment.");
         setTrucks([
            { id: 1, reg: 'TN 45 D 2345', driver: 'Arjun Kumar', load: 'Apples', eta: '2h 15m', sensors: { temp: 4, humidity: 70, gas: 45 } },
            { id: 2, reg: 'TN 28 B 9901', driver: 'S Rajesh', load: 'Mixed Fruit', eta: '45m', sensors: { temp: 8, humidity: 65, gas: 80 } },
            { id: 3, reg: 'TN 30 C 1234', driver: 'M Selvam', load: 'Vegetables', eta: '4h 30m', sensors: { temp: 5, humidity: 75, gas: 30 } }
         ]);
      });
  }, []);

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto py-20">
      <header className="flex flex-col mb-12 border-l-8 border-[#1295AE] pl-6">
        <h1 className="text-5xl font-bold">Fleet <span className="text-[#1295AE]">Monitor</span></h1>
        <p className="font-accent text-sm uppercase tracking-widest text-[#64748B] mt-2">Active Logistics Intelligence</p>
      </header>

      <div className="space-y-6">
        {trucks.map((truck, idx) => (
          <motion.div 
            key={truck.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onSelectTruck(truck)}
            className="glass-card cursor-pointer hover:border-[#1295AE] transition-all flex items-center justify-between group bg-white shadow-lg"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-[#1295AE]/5 flex items-center justify-center border border-[#1295AE]/20">
                <Truck className="text-[#1295AE]" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{truck.reg}</h3>
                <p className="text-sm text-dim uppercase font-bold tracking-tighter">DRIVER: {truck.driver} • <span className="text-[#1295AE]">{truck.load}</span></p>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="text-right hidden md:block">
                <p className="text-xs uppercase font-bold text-dim">ETA Status</p>
                <p className="text-xl font-bold text-[#1295AE]">{truck.eta}</p>
              </div>
              <ChevronRight className="text-[#1295AE] group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = ({ initialTruck, onBack }) => {
  const [truck, setTruck] = useState(initialTruck);
  const [sensors, setSensors] = useState(initialTruck.sensors);
  const [activeTab, setActiveTab] = useState('predict'); // 'predict', 'live', 'alerts'
  const [shelfLife, setShelfLife] = useState(120);

  useEffect(() => {
    // Prediction Logic
    let base = 120;
    const tempDev = Math.abs(sensors.temp - 4);
    if (tempDev > 2) base -= tempDev * 8;
    const humDev = Math.abs(sensors.humidity - 70);
    if (humDev > 10) base -= humDev * 0.8;
    if (sensors.gas > 80) base -= (sensors.gas - 80) * 0.4;
    setShelfLife(Math.max(0, Math.round(base)));

    // Sync with API
    const timer = setTimeout(() => {
        fetch('/api/telemetry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: truck.id, sensors })
        }).catch(err => console.log("API Sync skipped on static hosting."));
    }, 1000);
    return () => clearTimeout(timer);
  }, [sensors]);

  const updateSensor = (key, val) => {
    setSensors(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24">

      <main className="max-w-4xl mx-auto px-4 md:px-6 mt-150 pb-24">
        <div className="content-width mx-auto flex flex-col gap-4">
          {/* Consolidated App Header inside the container */}
          <div className="bg-white border border-[#E2E8F0] shadow-sm px-6 py-5 flex items-center justify-between responsive-header">
            <div className="flex items-center gap-6">
              <button onClick={onBack} className="skewed-btn text-[10px] px-6 py-2 shrink-0">
                  BACK
              </button>
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">{truck.reg}</h2>
                <p className="text-[10px] font-bold text-dim uppercase tracking-[0.2em]">
                  {truck.load} Logistics terminal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-100 shrink-0">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest hidden sm:inline">Connected</span>
            </div>
          </div>
          {/* Integrated Navigation Bar inside the container */}
          <div className="flex bg-white border border-[#E2E8F0] shadow-sm mb-4">
            {['Predict', 'Live Data'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase().replace(' ', ''))}
                className={`flex-1 flex items-center justify-center h-14 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.toLowerCase().replace(' ', '') ? 'text-[#1295AE]' : 'text-[#64748B] hover:text-[#1295AE]'}`}
              >
                {tab}
                {activeTab === tab.toLowerCase().replace(' ', '') && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1295AE]" />
                )}
              </button>
            ))}
          </div>
        <AnimatePresence mode="wait">
          {activeTab === 'predict' && (
            <motion.div 
              key="predict"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-4 w-full"
            >
              {/* Telemetry Section Header (Optional/Compact) */}
              <div className="glass-card bg-white p-6 shadow-xl">
                  <div className="mb-8">
                      <h3 className="text-xl font-bold uppercase tracking-tight text-[#1a1a1a]">Supply Prediction</h3>
                      <p className="text-xs text-dim mt-1">Real-time algorithmic shelf life analytics</p>
                  </div>

                  <SmartSensorCard 
                      icon={<Thermometer size={20} className="text-[#1295AE]" />} 
                      label="Temperature" 
                      value={sensors.temp} 
                      unit="°C" 
                      min={-5} max={25}
                      onChange={(v) => updateSensor('temp', v)}
                      color="bg-blue-50"
                  />
              </div>

              {/* Separate Tracker Cards for Humidity and Ethylene */}
              <div className="glass-card bg-white p-6 shadow-xl">
                  <SmartSensorCard 
                      icon={<Droplets size={20} className="text-blue-500" />} 
                      label="Humidity" 
                      value={sensors.humidity} 
                      unit="%" 
                      min={0} max={100}
                      onChange={(v) => updateSensor('humidity', v)}
                      color="bg-blue-50"
                  />
              </div>

              <div className="glass-card bg-white p-6 shadow-xl">
                  <SmartSensorCard 
                      icon={<Activity size={20} className="text-emerald-500" />} 
                      label="Ethylene / Gas (MQ135)" 
                      value={sensors.gas} 
                      unit="ppm" 
                      min={0} max={500}
                      onChange={(v) => updateSensor('gas', v)}
                      color="bg-emerald-50"
                  />
              </div>

              {/* Large Prediction Summary Card */}
              <div className="glass-card bg-white p-10 border-[#1295AE]/10 flex flex-col items-center text-center shadow-xl">
                 <div className="flex flex-col items-center w-full">
                    <div className="p-3 bg-[#1295AE]/5 rounded-full mb-4 border border-[#1295AE]/10">
                        <Clock className="text-[#1295AE]" size={24} />
                    </div>
                    <h4 className="text-[10px] font-bold text-dim uppercase tracking-[0.3em] mb-2">Estimated Shelf Life</h4>
                    <h2 className="text-7xl font-bold text-[#1a1a1a] leading-none mb-4">{shelfLife} hrs</h2>
                    <div className={`px-4 py-1.5 border font-bold text-[10px] uppercase tracking-[0.2em] ${shelfLife > 80 ? 'bg-emerald-50 border-emerald-100 text-[#1295AE]' : 'bg-red-50 border-red-100 text-red-500'}`}>
                        Cargo Integrity: {shelfLife > 80 ? 'Optimal' : shelfLife > 40 ? 'Nominal' : 'Critical'}
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'livedata' && (
            <motion.div 
              key="livedata"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card bg-white p-6 md:p-8 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6 border-b border-[#E2E8F0] pb-4">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-[#1a1a1a]">Telemetry Log View</h3>
                  <p className="text-xs text-dim mt-1">Live raw data stream</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Streaming</span>
                </div>
              </div>
              
              <div className="border border-[#E2E8F0] rounded-sm overflow-hidden bg-white mt-4">
                {/* Header row */}
                <div className="text-[9px] font-bold uppercase tracking-widest text-[#64748B] border-b border-[#E2E8F0] hidden sm:grid sm:grid-cols-[100px_1fr_1fr_1fr_80px] bg-[#F8FAFB]">
                  <div className="px-[12px] py-[9px] text-left">Timestamp</div>
                  <div className="px-[12px] py-[9px] text-left">Temp</div>
                  <div className="px-[12px] py-[9px] text-left">Hum</div>
                  <div className="px-[12px] py-[9px] text-left">MQ135</div>
                  <div className="px-[12px] py-[9px] text-right">Status</div>
                </div>

                {/* Data rows */}
                {[
                  { time: '10:42:05', temp: '4.8°C', hum: '74%', gas: '28 ppm', status: 'OK' },
                  { time: '10:41:05', temp: '4.9°C', hum: '73%', gas: '29 ppm', status: 'OK' },
                  { time: '10:40:05', temp: '5.1°C', hum: '75%', gas: '30 ppm', status: 'WARN' },
                  { time: '10:39:05', temp: '5.0°C', hum: '75%', gas: '31 ppm', status: 'OK' },
                  { time: '10:38:05', temp: '4.8°C', hum: '76%', gas: '30 ppm', status: 'OK' },
                  { time: '10:37:05', temp: '4.7°C', hum: '76%', gas: '29 ppm', status: 'OK' },
                ].map((log, i) => (
                  <div key={i} className={`grid grid-cols-4 sm:grid-cols-[100px_1fr_1fr_1fr_80px] border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFB] transition-colors items-center ${log.status === 'WARN' ? 'bg-amber-50/50' : 'bg-white'}`}>
                    <div className="px-[12px] py-[9px] font-mono text-[10px] sm:text-[11px] font-bold text-[#1295AE] col-span-4 sm:col-span-1 border-b sm:border-b-0 text-left shrink-0">{log.time}</div>
                    <div className="px-[12px] py-[9px] font-mono font-bold text-[11px] sm:text-[13px] text-[#1a1a1a] text-left truncate">{log.temp}</div>
                    <div className="px-[12px] py-[9px] font-mono font-bold text-[11px] sm:text-[13px] text-[#1a1a1a] text-left truncate">{log.hum}</div>
                    <div className="px-[12px] py-[9px] font-mono font-bold text-[11px] sm:text-[13px] text-[#1a1a1a] text-left truncate">{log.gas}</div>
                    <div className="px-[12px] py-[9px] text-right shrink-0">
                       <span className={`text-[9.5px] uppercase tracking-wider font-bold ${log.status === 'OK' ? 'text-emerald-500' : 'text-amber-500'}`}>
                         {log.status}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// --- SmartFresha Styled Components ---

const SmartSensorCard = ({ icon, label, value, unit, min, max, onChange, color }) => (
  <div className="flex flex-row items-center justify-between gap-6 w-full sensor-card-inner">
    {/* Left Icon & Label */}
    <div className="flex items-center gap-4 w-[25%] min-w-0 sensor-label-box">
      <div className={`icon-box ${color} !w-10 !h-10 shrink-0`}>
        {icon}
      </div>
      <span className="font-bold uppercase text-[10px] tracking-widest text-[#64748B] leading-tight truncate">
          {label}
      </span>
    </div>

    {/* Middle Slider (Fixed 60%) */}
    <div className="w-[60%] flex items-center sensor-slider-box">
      <input 
        type="range" 
        min={min} max={max} step={label.toLowerCase().includes('temperature') ? 0.5 : 1}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#1295AE] h-1.5 bg-[#F1F5F9] rounded-full appearance-none flex-1"
      />
    </div>

    {/* Right Value & Unit */}
    <div className="flex items-baseline gap-1 shrink-0 text-right w-[15%] justify-end sensor-value-box">
      <span className="text-xl font-bold text-[#1a1a1a]">{value}</span>
      <span className="text-[9px] font-bold text-[#64748B] uppercase">{unit}</span>
    </div>
  </div>
);

// --- Main Entry ---

export default function App() {
  const [view, setView] = useState('login'); 
  const [selectedTruck, setSelectedTruck] = useState(null);

  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      <AnimatePresence mode="wait">
        {view === 'login' && <LoginPage key="login" onLogin={() => setView('fleet')} />}
        
        {view === 'fleet' && (
          <FleetMonitor key="fleet" onSelectTruck={(t) => {
            setSelectedTruck(t);
            setView('dashboard');
          }} />
        )}

        {view === 'dashboard' && (
          <Dashboard 
            key="dashboard"
            initialTruck={selectedTruck} 
            onBack={() => setView('fleet')} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
