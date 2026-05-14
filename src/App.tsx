/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Users, 
  ArrowRight,
  Download,
  Calculator,
  LayoutDashboard,
  Target
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TestItem, FixedCosts, CRMParams, AppData, ReinvestmentItem } from './types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const INITIAL_DATA: AppData = {
  tests: [
    {
      id: '1',
      name: 'CBC (Complete Blood Count)',
      reagentCost: 150,
      consumablesCost: 20,
      laborCost: 80,
      machineDepreciation: 30,
      qcCost: 15,
      otherCosts: 5,
      testsPerMonth: 200,
      sellingPrice: 450
    },
    {
      id: '2',
      name: 'UA (Urine Analysis)',
      reagentCost: 30,
      consumablesCost: 15,
      laborCost: 40,
      machineDepreciation: 10,
      qcCost: 5,
      otherCosts: 2,
      testsPerMonth: 150,
      sellingPrice: 180
    },
    {
      id: '3',
      name: 'SNP Test (Molecular)',
      reagentCost: 2500,
      consumablesCost: 200,
      laborCost: 500,
      machineDepreciation: 1000,
      qcCost: 100,
      otherCosts: 50,
      testsPerMonth: 25,
      sellingPrice: 6500
    }
  ],
  fixedCosts: {
    rent: 25000,
    staff: 60000,
    utilities: 10000,
    marketing: 5000,
    other: 10000
  },
  crmParams: {
    returningRate: 35,
    visitsPerYear: 2,
    targetMargin: 45
  },
  reinvestments: [
    { id: '1', name: 'ซื้อเครื่องมือใหม่', amount: 5000 },
    { id: '2', name: 'งบพัฒนาบุคลากร', amount: 2000 }
  ],
  targetProfit: 100000,
  customGoals: {}
};

export default function App() {
  const [data, setData] = useState<AppData>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('clinic_lab_data') : null;
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [activeTab, setActiveTab] = useState<'cost' | 'pricing' | 'dashboard' | 'breakeven' | 'investment' | 'goals'>('cost');

  useEffect(() => {
    localStorage.setItem('clinic_lab_data', JSON.stringify(data));
  }, [data]);

  const addTest = () => {
    const newTest: TestItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: `การทำการทดสอบใหม่ ${data.tests.length + 1}`,
      reagentCost: 0,
      consumablesCost: 0,
      laborCost: 0,
      machineDepreciation: 0,
      qcCost: 0,
      otherCosts: 0,
      testsPerMonth: 0,
      sellingPrice: 0
    };
    setData({ ...data, tests: [...data.tests, newTest] });
  };

  const updateTest = (id: string, updates: Partial<TestItem>) => {
    setData({
      ...data,
      tests: data.tests.map(t => t.id === id ? { ...t, ...updates } : t)
    });
  };

  const deleteTest = (id: string) => {
    setData({ ...data, tests: data.tests.filter(t => t.id !== id) });
  };

  const updateFixedCosts = (updates: Partial<FixedCosts>) => {
    setData({ ...data, fixedCosts: { ...data.fixedCosts, ...updates } });
  };

  const updateCRM = (updates: Partial<CRMParams>) => {
    setData({ ...data, crmParams: { ...data.crmParams, ...updates } });
  };

  const updateTargetProfit = (val: number) => {
    setData({ ...data, targetProfit: val });
  };

  const updateCustomGoal = (testId: string, count: number) => {
    setData({
      ...data,
      customGoals: {
        ...(data.customGoals || {}),
        [testId]: count
      }
    });
  };

  const exportCSV = () => {
    const headers = ['Test Name', 'Total Cost', 'Price', 'Profit', 'Margin (%)'];
    const rows = data.tests.map(t => {
      const totalCost = t.reagentCost + t.consumablesCost + t.laborCost + t.machineDepreciation + t.qcCost + t.otherCosts;
      const profit = t.sellingPrice - totalCost;
      const margin = (profit / (t.sellingPrice || 1)) * 100;
      return [t.name, totalCost, t.sellingPrice, profit, margin.toFixed(2)];
    });
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lab_cost_analysis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    const originalTitle = document.title;
    document.title = ' '; // Empty title helps hide browser header
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  const totals = useMemo(() => {
    let totalRevenue = 0;
    let totalVariableCost = 0;
    data.tests.forEach(t => {
      const unitCost = t.reagentCost + t.consumablesCost + t.laborCost + t.machineDepreciation + t.qcCost + t.otherCosts;
      totalRevenue += t.sellingPrice * t.testsPerMonth;
      totalVariableCost += unitCost * t.testsPerMonth;
    });
    
    // Type-safe reduction of fixed costs
    const fixedCostsValues: number[] = Object.values(data.fixedCosts);
    const totalFixed = fixedCostsValues.reduce((a, b) => a + b, 0);
    
    // Reinvestments
    const reinvestmentTotal = (data.reinvestments || []).reduce((acc, r) => acc + r.amount, 0);
    
    const profit = totalRevenue - totalVariableCost - totalFixed;
    const netNetProfit = profit - reinvestmentTotal;

    // Plans Calculation
    const targetProfit = data.targetProfit || 0;
    const requiredTotalMargin = targetProfit + totalFixed;
    
    // Heuristic Plans for Goal Analysis
    const testMargins = data.tests.map(t => {
      const unitCost = t.reagentCost + t.consumablesCost + t.laborCost + t.machineDepreciation + t.qcCost + t.otherCosts;
      return { id: t.id, name: t.name, margin: t.sellingPrice - unitCost, currentVol: t.testsPerMonth };
    }).filter(t => t.margin > 0);

    const calculatePlan = (weightFunc: (t: any) => number) => {
      const weights = testMargins.map(t => weightFunc(t));
      const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
      return testMargins.map((t, i) => ({
        ...t,
        targetVol: Math.ceil((requiredTotalMargin * (weights[i] / totalWeight)) / t.margin)
      }));
    };

    // Plan A: Volume Focus (Weight by current volume)
    const planA = calculatePlan(t => t.currentVol || 1);
    
    // Plan B: Profit Focus (Weight by margin value)
    const planB = calculatePlan(t => t.margin * (t.currentVol || 1));
    
    // Plan C: Balanced (Equal contribution)
    const planC = calculatePlan(() => 1);

    // Custom Goal Results
    const customGoals = data.customGoals || {};
    let customTotalProfit = -totalFixed;
    const customBreakdown = data.tests.map(t => {
      const unitCost = t.reagentCost + t.consumablesCost + t.laborCost + t.machineDepreciation + t.qcCost + t.otherCosts;
      const margin = t.sellingPrice - unitCost;
      const count = customGoals[t.id] ?? t.testsPerMonth;
      const contrib = margin * count;
      customTotalProfit += contrib;
      return { id: t.id, name: t.name, contrib, count, margin };
    });

    return {
      revenue: totalRevenue,
      variableCost: totalVariableCost,
      fixedCost: totalFixed,
      reinvestmentTotal,
      totalCost: totalVariableCost + totalFixed,
      profit,
      netNetProfit,
      planA,
      planB,
      planC,
      customTotalProfit,
      customBreakdown
    };
  }, [data]);

  const updateReinvestment = (id: string, updates: Partial<ReinvestmentItem>) => {
    setData({
      ...data,
      reinvestments: data.reinvestments.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  const addReinvestment = () => {
    const newItem: ReinvestmentItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'รายการลงทุนใหม่',
      amount: 0
    };
    setData({ ...data, reinvestments: [...(data.reinvestments || []), newItem] });
  };

  const deleteReinvestment = (id: string) => {
    setData({ ...data, reinvestments: data.reinvestments.filter(r => r.id !== id) });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm shadow-slate-100 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-800">Clinic Lab Economics</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Health Finance Pro</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={printReport}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
            >
              <Download size={18} />
              <span className="hidden lg:inline">Print Full Report (PDF)</span>
            </button>
            <button 
              onClick={() => {
                if(confirm('คุณต้องการล้างข้อมูลทั้งหมดและเริ่มใหม่ด้วยค่าเริ่มต้นใช่หรือไม่?')) {
                  setData(INITIAL_DATA);
                }
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button 
              onClick={exportCSV}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ArrowRight size={18} className="rotate-90" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex overflow-x-auto no-scrollbar gap-1 pt-1">
            {[
              { id: 'cost', label: 'ต้นทุนและการจัดการ', icon: Calculator },
              { id: 'pricing', label: 'วิเคราะห์กำไร', icon: DollarSign },
              { id: 'dashboard', label: 'แดชบอร์ดภาพรวม', icon: LayoutDashboard },
              { id: 'breakeven', label: 'จุดคุ้มทุน & CRM', icon: Target },
              { id: 'investment', label: 'การลงทุนต่อ', icon: TrendingUp },
              { id: 'goals', label: 'วิเคราะห์เป้าหมาย', icon: Calculator },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 relative",
                  activeTab === tab.id 
                    ? "text-blue-600 border-blue-600" 
                    : "text-slate-500 border-transparent hover:text-slate-700"
                )}
              >
                <tab.icon size={16} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 no-print">
        <AnimatePresence mode="wait">
          {activeTab === 'cost' && (
            <motion.div 
              key="cost"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">จัดการต้นทุนแล็บ</h2>
                  <p className="text-slate-500 text-sm">ใส่ข้อมูลต้นทุนผันแปรต่อรายการ (Unit Cost) และจำนวนการส่งตรวจ</p>
                </div>
                <button 
                  onClick={addTest}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  <Plus size={18} />
                  เพิ่มประเภทแล็บ
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.tests.map((test: TestItem) => (
                  <CostCard 
                    key={test.id} 
                    test={test} 
                    onUpdate={(u) => updateTest(test.id, u)}
                    onDelete={() => deleteTest(test.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'pricing' && (
            <motion.div 
              key="pricing"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="bg-blue-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Target size={28} />
                    Target Margin & Price Strategy
                  </h2>
                  <p className="opacity-80 mt-2 max-w-xl">
                    กำหนดเป้าหมาย GP Margin (%) ของคลินิก เพื่อให้ระบบแนะนำราคาขายที่เหมาะสม
                  </p>
                  
                  <div className="mt-8 flex flex-col sm:flex-row items-center gap-8">
                    <div className="w-full sm:w-64">
                      <label className="text-xs font-black uppercase tracking-widest opacity-70 block mb-2">เป้าหมายกำไรขั้นต้น (%)</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" min="10" max="90" 
                          value={data.crmParams.targetMargin}
                          onChange={(e) => updateCRM({ targetMargin: Number(e.target.value) })}
                          className="flex-1 h-1.5 bg-blue-400 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                        <span className="text-2xl font-black">{data.crmParams.targetMargin}%</span>
                      </div>
                    </div>
                    <div className="hidden sm:block h-12 w-px bg-white/20" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest opacity-70">กลยุทธ์ปัจจุบัน</p>
                      <p className="text-lg font-bold">
                        {data.crmParams.targetMargin >= 50 ? 'Premium Positioning' : data.crmParams.targetMargin >= 30 ? 'Balanced Value' : 'Cost Leadership'}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Decoration blobs */}
                <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-[-100px] left-[20%] w-96 h-96 bg-blue-700 rounded-full blur-3xl opacity-30" />
              </div>

              <div className="space-y-4">
                {data.tests.map((test: TestItem) => (
                  <PricingRow 
                    key={test.id} 
                    test={test} 
                    targetMargin={data.crmParams.targetMargin}
                    onUpdate={(u) => updateTest(test.id, u)} 
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Total Revenue (รายรับรวม)" 
                  value={totals.revenue} 
                  unit="บาท/เดือน" 
                  icon={TrendingUp} 
                  color="blue" 
                  description="ยอดเงินทั้งหมดที่คนไข้จ่ายให้แล็บ"
                />
                <StatCard 
                  title="Total Cost (ต้นทุนรวม)" 
                  value={totals.totalCost} 
                  unit="บาท/เดือน" 
                  icon={Activity} 
                  color="amber" 
                  description="ต้นทุนค่าน้ำยา + แรงงาน + ค่าเช่า"
                />
                <StatCard 
                  title="Net Profit (กำไรสุทธิ)" 
                  value={totals.profit} 
                  unit="บาท/เดือน" 
                  icon={DollarSign} 
                  color="green" 
                  description="กำไรที่เหลือจริงๆ หลังหักค่าใช้จ่ายทั้งหมด"
                />
                <StatCard 
                  title="Net Net Profit (กำไรสุทธิส่วนตัว)" 
                  value={totals.netNetProfit} 
                  unit="บาท/เดือน" 
                  icon={DollarSign} 
                  color="purple" 
                  description="กำไรที่แบ่งออกมาหลังจากหักเงินลงทุนต่อแล้ว"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-600" />
                    สัดส่วนกำไรรายรายการ
                  </h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={data.tests.map(t => {
                          const unitCost = t.reagentCost + t.consumablesCost + t.laborCost + t.machineDepreciation + t.qcCost + t.otherCosts;
                          return {
                            name: t.name,
                            revenue: t.sellingPrice * t.testsPerMonth,
                            cost: unitCost * t.testsPerMonth,
                            profit: (t.sellingPrice - unitCost) * t.testsPerMonth
                          };
                        })}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} interval={0} tick={false} />
                        <YAxis axisLine={false} tickLine={false} fontSize={10} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend />
                        <Bar dataKey="cost" name="ต้นทุนผันแปร" stackId="a" fill="#94a3b8" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="profit" name="กำไรขั้นต้น" stackId="a" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <PieChartIcon size={20} className="text-purple-600" />
                    โครงสร้างต้นทุนรวม
                  </h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Fixed Costs', value: totals.fixedCost },
                            { name: 'Reagents', value: data.tests.reduce((acc, t) => acc + (t.reagentCost * t.testsPerMonth), 0) },
                            { name: 'Consumables', value: data.tests.reduce((acc, t) => acc + (t.consumablesCost * t.testsPerMonth), 0) },
                            { name: 'Labor', value: data.tests.reduce((acc, t) => acc + (t.laborCost * t.testsPerMonth), 0) },
                            { name: 'Machine Costs', value: data.tests.reduce((acc, t) => acc + (t.machineDepreciation * t.testsPerMonth), 0) },
                            { name: 'QC & Others', value: data.tests.reduce((acc, t) => acc + ((t.qcCost + t.otherCosts) * t.testsPerMonth), 0) },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'breakeven' && (
            <motion.div 
              key="breakeven"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                      <Target className="text-blue-600" />
                      จุดคุ้มทุน (Break-even)
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">กำหนดต้นทุนคงที่ (Fixed Costs) ต่อเดือนของแล็บ</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Rent (ค่าเช่าอาคาร)" value={data.fixedCosts.rent} onChange={(v) => updateFixedCosts({ rent: v })} />
                      <InputField label="Staff Salary (เงินเดือนพนักงาน)" value={data.fixedCosts.staff} onChange={(v) => updateFixedCosts({ staff: v })} />
                      <InputField label="Utilities (ค่าน้ำ-ไฟ-เน็ต)" value={data.fixedCosts.utilities} onChange={(v) => updateFixedCosts({ utilities: v })} />
                      <InputField label="Marketing (ค่าการตลาด)" value={data.fixedCosts.marketing} onChange={(v) => updateFixedCosts({ marketing: v })} />
                      <div className="col-span-2">
                        <InputField label="Other Fixed Costs (ต้นทุนคงที่อื่นๆ)" value={data.fixedCosts.other} onChange={(v) => updateFixedCosts({ other: v })} />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 mt-4">
                      <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center justify-between shadow-xl">
                        <div>
                          <p className="text-xs uppercase font-black tracking-widest text-slate-400">Total Fixed Costs (ต้นทุนคงที่รวมทีม)</p>
                          <p className="text-3xl font-black">{totals.fixedCost.toLocaleString()} <span className="text-sm">บ./ด.</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-black tracking-widest text-blue-400">Break-even Volume (จุดคุ้มทุน)</p>
                          <p className="text-3xl font-black text-blue-400">
                            {Math.ceil(totals.fixedCost / ((totals.revenue - totals.variableCost) / (data.tests.reduce((acc, t) => acc + t.testsPerMonth, 0) || 1) || 1)).toLocaleString()}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 italic leading-tight mt-1 max-w-[150px] ml-auto">
                            * คำนวณจากกำไรเฉลี่ยถ่วงน้ำหนักตามสัดส่วนการตรวจจริง
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                      <Users className="text-indigo-600" />
                      ระบบ CRM & Customer LTV
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">วิเคราะห์ความคุ้มค่าของการรักษาลูกค้ายระยะยาว</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex flex-col items-center gap-4">
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-black uppercase tracking-widest text-indigo-700">Returning Rate (อัตรากลับมาซ้ำ %)</label>
                          <span className="text-lg font-black text-indigo-700">{data.crmParams.returningRate}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" 
                          value={data.crmParams.returningRate}
                          onChange={(e) => updateCRM({ returningRate: Number(e.target.value) })}
                          className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                      <div className="w-full pt-2">
                        <label className="text-xs font-black uppercase tracking-widest text-indigo-700 block mb-2">Avg. Annual Visits (จำนวนการตรวจต่อคน/ปี)</label>
                        <NumberInput 
                          value={data.crmParams.visitsPerYear}
                          onChange={(v) => updateCRM({ visitsPerYear: v })}
                          className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <div className="p-6 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-200 text-center relative overflow-hidden">
                        <div className="relative z-10">
                          <p className="text-xs uppercase font-black tracking-widest opacity-70">Annual Gross Lifetime Value (LTV)</p>
                          <h4 className="text-5xl font-black mt-2">
                            {(
                              ((totals.revenue - totals.variableCost) / (data.tests.reduce((acc, t) => acc + t.testsPerMonth, 0) || 1)) * 
                              data.crmParams.visitsPerYear * 
                              (1 + data.crmParams.returningRate / 100)
                            ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            <span className="text-xl ml-1 font-bold italic opacity-80 text-white"> บาท</span>
                          </h4>
                          <p className="text-[10px] mt-4 opacity-70 font-semibold tracking-wide text-balance">
                            กำไรขั้นต้นเฉลี่ยที่ลูกค้า 1 คนสร้างให้คลินิกใน 1 ปี (ยังไม่หักค่าใช้จ่ายคงตัว)
                          </p>
                        </div>
                        {/* Blob deco */}
                        <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'goals' && (
            <motion.div 
              key="goals"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                       <Calculator className="text-blue-600" />
                       วิเคราะห์เป้าหมายกำไร (Profit Goal)
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">ตั้งเป้าหมายกำไรที่คุณต้องการ และดูแผนแนะนำเพื่อให้ไปถึงเป้าหมาย</p>
                  </div>
                  <div className="w-full md:w-64 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1 block">ตั้งเป้าหมายกำไร (บาท/เดือน)</label>
                    <NumberInput 
                      value={data.targetProfit || 0}
                      onChange={(v) => updateTargetProfit(v)}
                      className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2 text-xl font-black text-blue-700 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Plan A: เน้นจำนวน (Volume)', breakdown: totals.planA, color: 'blue', desc: 'เน้นกระจายจำนวนตามสัดส่วนการตรวจปัจจุบัน' },
                  { name: 'Plan B: เน้นตัวทำกำไร (Premium)', breakdown: totals.planB, color: 'indigo', desc: 'ให้น้ำหนักกับตัวที่มี Margin สูงเพื่อให้เหนื่อยน้อยลง' },
                  { name: 'Plan C: เฉลี่ยทุกตัว (Balanced)', breakdown: totals.planC, color: 'purple', desc: 'ให้การทดสอบทุกตัวรับผิดชอบสัดส่วนกำไรเท่าๆ กัน' }
                ].map((plan) => (
                  <div key={plan.name} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
                    <div className="mb-6">
                      <h3 className={cn("font-black text-lg", {
                        "text-blue-600": plan.color === 'blue',
                        "text-indigo-600": plan.color === 'indigo',
                        "text-purple-600": plan.color === 'purple'
                      })}>{plan.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide">{plan.desc}</p>
                    </div>
                    <div className="space-y-3 flex-1">
                      {plan.breakdown.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                          <span className="text-xs font-bold text-slate-600 truncate mr-2">{item.name}</span>
                          <div className="text-right">
                             <p className={cn("text-sm font-black", {
                                "text-blue-600": plan.color === 'blue',
                                "text-indigo-600": plan.color === 'indigo',
                                "text-purple-600": plan.color === 'purple'
                             })}>{item.targetVol.toLocaleString()} <span className="text-[10px] text-slate-400">เคส</span></p>
                             <p className="text-[9px] text-slate-400 font-bold">กำไร: {(item.targetVol * item.margin).toLocaleString()} บ.</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl shadow-blue-200 overflow-hidden relative">
                <div className="relative z-10 flex flex-col lg:flex-row gap-12">
                  <div className="flex-1 space-y-8">
                    <div>
                      <h3 className="text-3xl font-black mb-2">เป้าหมายที่ตั้งเอง (Custom Goal)</h3>
                      <p className="text-slate-400 text-sm">ลองกำหนดจำนวนเคสที่ต้องการต่อเดือนด้วยตัวคุณเองเพื่อเปรียบเทียบกำไร</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {data.tests.map(test => (
                        <div key={test.id} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all">
                          <label className="text-xs font-bold opacity-80">{test.name}</label>
                          <div className="flex items-center gap-2">
                            <NumberInput 
                              value={data.customGoals?.[test.id] ?? test.testsPerMonth}
                              onChange={(v) => updateCustomGoal(test.id, v)}
                              className="w-20 bg-white/10 border border-white/20 rounded-xl px-2 py-2 text-center font-black text-blue-400 focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-[10px] opacity-40 font-bold">เคส</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full lg:w-96 flex flex-col gap-6">
                    <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/40 relative overflow-hidden flex flex-col items-center justify-center text-center">
                       <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">กำไรสุทธิจากเป้าหมายของคุณ</p>
                       <p className="text-5xl font-black mb-2">{(totals.customTotalProfit).toLocaleString()}</p>
                       <p className="text-sm font-bold opacity-70">บาท / เดือน</p>
                       
                       <div className="mt-6 flex flex-col items-center">
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">ความคืบหน้าหาเป้าหมาย</div>
                          <div className="w-48 h-3 bg-white/20 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-white transition-all duration-500" 
                                style={{ width: `${Math.min(100, (totals.customTotalProfit / (data.targetProfit || 1)) * 100)}%` }} 
                             />
                          </div>
                          <p className="text-lg font-black mt-2">
                            {((totals.customTotalProfit / (data.targetProfit || 1)) * 100).toFixed(1)}%
                          </p>
                       </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                       <h4 className="text-xs font-black uppercase tracking-widest opacity-60 text-center">สัดส่วนกำไรรายรายการ</h4>
                       <div className="space-y-2">
                          {totals.customBreakdown.map((item: any) => (
                             <div key={item.id} className="flex justify-between items-center text-[11px]">
                                <span className="opacity-60">{item.name}</span>
                                <span className="font-bold">
                                  {((item.contrib / ((totals.customTotalProfit + totals.fixedCost) || 1)) * 100).toFixed(1)}%
                                </span>
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'investment' && (
            <motion.div 
              key="investment"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">การนำกำไรไปลงทุนต่อ (Reinvestment)</h2>
                  <p className="text-slate-500 text-sm">วางแผนสัดส่วนกำไรที่จะนำไปขยายสเกลงานแล็บ เพื่อไม่ให้กระทบงบส่วนตัว</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">กำไรสุทธิปัจจุบัน</p>
                  <p className="text-3xl font-black text-green-600">{(totals.profit).toLocaleString()} บ.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg">รายการลงทุน</h3>
                      <button 
                        onClick={addReinvestment}
                        className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-all"
                      >
                        <Plus size={16} /> เพิ่มรายการ
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {(data.reinvestments || []).map((item) => (
                        <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl group">
                          <input 
                            type="text"
                            value={item.name}
                            onChange={(e) => updateReinvestment(item.id, { name: e.target.value })}
                            className="flex-1 bg-transparent border-none outline-none font-bold text-slate-700"
                            placeholder="รายการลงทุน เช่น ซื้อเครื่องใหม่"
                          />
                          <div className="flex items-center gap-2">
                            <NumberInput 
                              value={item.amount}
                              onChange={(v) => updateReinvestment(item.id, { amount: v })}
                              unit="บ."
                              className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-black text-slate-800 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <button 
                            onClick={() => deleteReinvestment(item.id)}
                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {(data.reinvestments || []).length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-sm italic">
                          ยังไม่มีรายการลงทุน กด "เพิ่มรายการ" เพื่อเริ่มวางแผน
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
                       <PieChartIcon size={48} className="text-blue-500 mb-2" />
                       <div className="text-center">
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Reinvestment (เงินลงทุนรวม)</p>
                         <p className="text-4xl font-black">{totals.reinvestmentTotal.toLocaleString()} บ.</p>
                       </div>
                       <div className="w-full h-px bg-white/10" />
                       <div className="text-center">
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Percentage of Profit (% ของกำไรที่นำไปลงทุน)</p>
                         <p className="text-2xl font-black text-blue-400">
                           {((totals.reinvestmentTotal / (totals.profit || 1)) * 100).toFixed(1)}%
                         </p>
                       </div>
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-blue-600 rounded-full blur-[80px] opacity-30" />
                  </div>

                  <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 flex flex-col items-center justify-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Remaining Net Net Profit (กำไรที่เหลือเข้าตัวจริงๆ)</p>
                    <p className="text-4xl font-black">{totals.netNetProfit.toLocaleString()} บาท</p>
                    <p className="text-[10px] bg-white/20 px-3 py-1 rounded-full font-bold">ยอดเงินสุทธิหลังหักการลงทุน</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Print Report Template */}
      <div className="print-only bg-white">
        {/* Page 1: Executive Overview (สรุปภาพรวมผู้บริหาร) */}
        <div className="print-page">
          <div className="print-header-sticky">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Activity size={28} />
            </div>
            <div className="ml-1">
              <h1 className="text-2xl font-black tracking-tight text-slate-800">Clinic Lab Economics</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black leading-none mt-1">HEALTH FINANCE PRO</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Financial Analytics Report (รายงานวิเคราะห์การเงิน)</p>
              <p className="text-xs font-bold text-slate-800">{new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-8 px-2 border-l-8 border-blue-600">Financial Performance Dashboard (ภาพรวมผลประกอบการ)</h2>
          
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="print-card !bg-blue-600 border-none">
              <p className="text-[10px] font-black uppercase text-blue-100 mb-1">Total Monthly Revenue</p>
              <p className="text-3xl font-black text-white">{totals.revenue.toLocaleString()} บาท</p>
            </div>
            <div className="print-card">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Operating Cost</p>
              <p className="text-3xl font-black text-slate-600">{totals.totalCost.toLocaleString()} บาท</p>
            </div>
            <div className="print-card">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Estimated Net Profit</p>
              <p className="text-3xl font-black text-green-600">{totals.profit.toLocaleString()} บาท</p>
            </div>
            <div className="print-card">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Personal Net Net Profit</p>
              <p className="text-3xl font-black text-indigo-600">{totals.netNetProfit.toLocaleString()} บาท</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="print-card">
              <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-400 border-b pb-2">Operating Efficiency</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">Average Margin (%)</span>
                  <span className="text-lg font-black text-blue-600">{((totals.profit / (totals.revenue || 1)) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">Variable Cost Ratio</span>
                  <span className="text-lg font-black text-amber-600">{((totals.variableCost / (totals.revenue || 1)) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">Fixed Cost Burden</span>
                  <span className="text-lg font-black text-slate-800">{((totals.fixedCost / (totals.revenue || 1)) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="print-card bg-slate-900 border-slate-800 text-white">
              <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-400 border-b border-white/10 pb-2">Break-even Analysis</h3>
              <div className="space-y-6 pt-2">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-black text-blue-400 mb-1">Required Volume to Break-even</p>
                  <p className="text-5xl font-black text-white">
                    {Math.ceil(totals.fixedCost / ((totals.revenue - totals.variableCost) / (data.tests.reduce((acc, t) => acc + t.testsPerMonth, 0) || 1) || 1)).toLocaleString()}
                  </p>
                  <p className="text-xs font-bold text-slate-400 mt-2">Cases per Month (เคสเฉลี่ยต่อเดือน)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page 2: Visual Analysis (การวิเคราะห์เชิงภาพ) */}
        <div className="print-page page-break">
          <div className="print-header-sticky">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Activity size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-800">Visual Insights & Profit Breakdown (ข้อมูลเชิงลึกและรายละเอียดกำไร)</h2>
          </div>

          <div className="space-y-12">
            <div className="print-card !bg-white">
               <h3 className="text-sm font-black mb-6 uppercase tracking-widest text-purple-600 border-b pb-2">โครงสร้างต้นทุนรวม (Total Cost Structure)</h3>
               <div className="h-[400px] w-full flex justify-center">
                    <PieChart width={700} height={400}>
                      <Pie
                        data={[
                          { name: 'Fixed Costs', value: totals.fixedCost },
                          { name: 'Reagents', value: data.tests.reduce((acc, t) => acc + (t.reagentCost * t.testsPerMonth), 0) },
                          { name: 'Consumables', value: data.tests.reduce((acc, t) => acc + (t.consumablesCost * t.testsPerMonth), 0) },
                          { name: 'Labor', value: data.tests.reduce((acc, t) => acc + (t.laborCost * t.testsPerMonth), 0) },
                          { name: 'Machine Costs', value: data.tests.reduce((acc, t) => acc + (t.machineDepreciation * t.testsPerMonth), 0) },
                          { name: 'QC & Others', value: data.tests.reduce((acc, t) => acc + ((t.qcCost + t.otherCosts) * t.testsPerMonth), 0) },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-print-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Legend align="right" verticalAlign="middle" layout="vertical" />
                    </PieChart>
               </div>
            </div>
          </div>
        </div>

        {/* Page 3: Pricing Strategy (กลยุทธ์การตั้งราคา) */}
        <div className="print-page page-break">
          <div className="print-header-sticky">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Target size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-800">Target Margin & Pricing Strategy (เป้าหมายกำไรและกลยุทธ์การตั้งราคา)</h2>
          </div>

          <div className="space-y-8">
             <div className="print-card !bg-blue-600 border-none !text-white flex flex-row justify-between items-center shadow-xl">
                <div>
                  <h3 className="text-2xl font-black mb-1">Target GP Margin: {data.crmParams.targetMargin}%</h3>
                  <p className="text-[10px] opacity-80 uppercase tracking-[0.2em] font-black">
                     POSITIONING: {data.crmParams.targetMargin >= 50 ? 'Premium Quality' : data.crmParams.targetMargin >= 30 ? 'Balanced Market' : 'Cost Leadership'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black opacity-60 uppercase mb-1">Multiplier</p>
                  <p className="text-3xl font-black">{(1 / (1 - data.crmParams.targetMargin / 100)).toFixed(2)}x</p>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {data.tests.map(test => {
                  const uc = test.reagentCost + test.consumablesCost + test.laborCost + test.machineDepreciation + test.qcCost + test.otherCosts;
                  const suggested = uc / (1 - data.crmParams.targetMargin / 100);
                  const margin = ((test.sellingPrice - uc) / (test.sellingPrice || 1)) * 100;
                  return (
                    <div key={`print-pricing-${test.id}`} className="print-card !bg-white !p-6 flex justify-between items-center border-l-[12px] border-l-blue-600">
                      <div>
                        <h4 className="font-bold text-lg text-slate-800">{test.name}</h4>
                        <p className="text-[10px] text-slate-400 font-black">UNIT COST: {uc.toLocaleString()} บ.</p>
                      </div>
                      <div className="flex gap-16 text-right">
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Selling Price</p>
                           <p className="text-lg font-black text-slate-800">{test.sellingPrice.toLocaleString()} บ.</p>
                           <p className={cn("text-[10px] font-bold", margin >= data.crmParams.targetMargin ? 'text-green-600' : 'text-amber-600')}>
                              Margin: {margin.toFixed(1)}%
                           </p>
                        </div>
                        <div className="w-px h-10 bg-slate-100 self-center" />
                        <div>
                           <p className="text-[9px] font-black text-blue-600 uppercase mb-1">Suggested (แนะนำ)</p>
                           <p className="text-xl font-black text-blue-600">{Math.ceil(suggested).toLocaleString()} บ.</p>
                           <p className="text-[10px] text-slate-400 font-bold">Goal: {data.crmParams.targetMargin}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Page 4: Operational Details (รายละเอียดการดำเนินงาน) */}
        <div className="print-page page-break">
          <div className="print-header-sticky">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Activity size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-800">Operational Breakdown & Test Economics (รายละเอียดต้นทุนและกำไรราบการ)</h2>
          </div>

          <div className="space-y-8">
            <div className="print-card">
              <h3 className="text-sm font-black mb-6 uppercase tracking-widest text-slate-400">Monthly Fixed Cost Structure (ต้นทุนคงที่รายเดือน)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {[
                  { l: "Rent", v: data.fixedCosts.rent },
                  { l: "Staff Salary", v: data.fixedCosts.staff },
                  { l: "Utilities", v: data.fixedCosts.utilities },
                  { l: "Marketing", v: data.fixedCosts.marketing },
                  { l: "Others", v: data.fixedCosts.other }
                ].map(f => (
                  <div key={f.l}>
                    <p className="text-[10px] font-black text-slate-400 uppercase">{f.l}</p>
                    <p className="text-lg font-black text-slate-800">{f.v.toLocaleString()} บ.</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-4 border-t-2 border-slate-200 flex justify-between items-center">
                <span className="font-black text-slate-800">Total Fixed Costs</span>
                <span className="text-2xl font-black text-blue-600">{totals.fixedCost.toLocaleString()} บาท</span>
              </div>
            </div>

            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 px-2 mt-12 mb-4">Detailed Test Inventory (รายการทดสอบรายหน่วย)</h3>
            <table className="w-full border-collapse print-table border border-slate-200">
              <thead>
                <tr className="bg-slate-900 text-white text-left text-[9px] uppercase font-black tracking-wider">
                  <th className="p-4">Lab Item (รายการ)</th>
                  <th className="p-4">Unit Cost (ต้นทุน)</th>
                  <th className="p-4">Selling Price (ราคาขาย)</th>
                  <th className="p-4">Suggested (แนะนำ)</th>
                  <th className="p-4">Current Qty (จำนวน)</th>
                  <th className="p-4">Monthly Profit (กำไร/ด.)</th>
                  <th className="p-4">Margin (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.tests.map(t => {
                  const uc = t.reagentCost + t.consumablesCost + t.laborCost + t.machineDepreciation + t.qcCost + t.otherCosts;
                  const unitProfit = t.sellingPrice - uc;
                  const totalP = unitProfit * t.testsPerMonth;
                  const margin = (unitProfit / (t.sellingPrice || 1)) * 100;
                  const suggested = uc / (1 - data.crmParams.targetMargin / 100);
                  return (
                    <tr key={t.id} className="text-[11px]">
                      <td className="p-4 font-bold text-slate-800">{t.name}</td>
                      <td className="p-4">{uc.toLocaleString()}</td>
                      <td className="p-4 font-black">{t.sellingPrice.toLocaleString()}</td>
                      <td className="p-4 text-blue-600 font-bold">{Math.ceil(suggested).toLocaleString()}</td>
                      <td className="p-4">{t.testsPerMonth}</td>
                      <td className="p-4 font-bold text-blue-600">{totalP.toLocaleString()}</td>
                      <td className={cn("p-4 font-black", margin > 50 ? 'text-green-600' : 'text-slate-800')}>
                        {margin.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Page 5: Strategic Growth (การเติบโตเชิงกลยุทธ์) */}
        <div className="print-page page-break">
          <div className="print-header-sticky">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Target size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-800">Profit Goals & Strategic Planning (เป้าหมายกำไรและการวางแผนกลยุทธ์)</h2>
          </div>

          <div className="mb-10 p-8 bg-blue-50 rounded-[2.5rem] border-2 border-blue-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Profit Target / Month</p>
              <h4 className="text-4xl font-black text-blue-700">{(data.targetProfit || 0).toLocaleString()} <span className="text-xl">บาท</span></h4>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Status vs Goal</p>
              <p className="text-2xl font-black text-indigo-700">{((totals.profit / (data.targetProfit || 1)) * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-12">
            {[
              { name: 'Plan A: Volume Focus', breakdown: totals.planA },
              { name: 'Plan B: Profit Focus', breakdown: totals.planB },
              { name: 'Plan C: Balanced', breakdown: totals.planC }
            ].map((plan) => (
              <div key={plan.name} className="print-card border-none shadow-sm !p-6">
                <h4 className="font-black text-sm text-slate-800 border-b pb-2 mb-4">{plan.name}</h4>
                <div className="space-y-3">
                  {plan.breakdown.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-[10px]">
                      <span className="font-bold text-slate-500 truncate mr-2">{item.name}</span>
                      <span className="font-black text-slate-900">{item.targetVol} <span className="opacity-40">เคส</span></span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="print-card overflow-hidden !p-0">
              <div className="bg-slate-900 p-6 text-white text-center">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">CRM Efficiency (Customer LTV)</p>
                <p className="text-3xl font-black">
                   {(
                    ((totals.revenue - totals.variableCost) / (data.tests.reduce((acc, t) => acc + t.testsPerMonth, 0) || 1)) * 
                    data.crmParams.visitsPerYear * 
                    (1 + data.crmParams.returningRate / 100)
                  ).toLocaleString(undefined, { maximumFractionDigits: 0 })} บ.
                </p>
                <p className="text-[9px] font-bold text-blue-400 mt-2">Annual Value generated per 1 regular customer</p>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <div>
                   <p className="text-[9px] font-black uppercase text-slate-400">Retention</p>
                   <p className="text-sm font-black">{data.crmParams.returningRate}%</p>
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase text-slate-400">Visits/Year</p>
                   <p className="text-sm font-black">{data.crmParams.visitsPerYear}</p>
                </div>
              </div>
            </div>

            <div className="print-card">
              <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-400 border-b pb-2">Reinvestment Details</h3>
              <div className="space-y-3">
                {data.reinvestments.map(r => (
                  <div key={r.id} className="flex justify-between text-[11px] border-b border-dashed pb-1">
                    <span className="text-slate-600">{r.name}</span>
                    <span className="font-bold">{r.amount.toLocaleString()} บ.</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-2 text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase">Total Re-investment</p>
                <p className="text-xl font-black text-blue-600">{totals.reinvestmentTotal.toLocaleString()} บาท</p>
              </div>
            </div>
          </div>

          </div>
        </div>
      </div>
    );
  }

function NumberInput({ 
  value, 
  onChange, 
  className,
  placeholder,
  unit
}: { 
  value: number, 
  onChange: (v: number) => void, 
  className?: string,
  placeholder?: string,
  unit?: string
}) {
  const [displayValue, setDisplayValue] = useState<string>(value.toString());
  
  useEffect(() => {
    if (parseFloat(displayValue) !== value && displayValue !== '') {
      setDisplayValue(value.toString());
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setDisplayValue(v);
    const numericValue = parseFloat(v);
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    } else if (v === '') {
      onChange(0);
    }
  };

  const handleBlur = () => {
    if (displayValue === '' || isNaN(parseFloat(displayValue))) {
      setDisplayValue('0');
      onChange(0);
    } else {
      setDisplayValue(parseFloat(displayValue).toString());
    }
  };

  return (
    <div className="relative w-full">
      <input 
        type="number" 
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          "w-full outline-none transition-all caret-blue-500",
          className
        )}
      />
      {unit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 pointer-events-none">
          {unit}
        </span>
      )}
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5 block">{label}</label>
      <NumberInput 
        value={value} 
        onChange={onChange} 
        unit="บ."
        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white"
      />
    </div>
  );
}

function CostField({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{label}</label>
      <NumberInput 
        value={value} 
        onChange={onChange} 
        className="bg-slate-50 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 border-none focus:bg-white focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

interface CostCardProps {
  key?: string;
  test: TestItem;
  onUpdate: (u: Partial<TestItem>) => void;
  onDelete: () => void;
}

function CostCard({ test, onUpdate, onDelete }: CostCardProps) {
  const totalCost = test.reagentCost + test.consumablesCost + test.laborCost + test.machineDepreciation + test.qcCost + test.otherCosts;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group relative overflow-hidden">
      <div className="flex items-start justify-between gap-2 mb-6">
        <input 
          type="text" 
          value={test.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="bg-transparent font-black text-lg text-slate-800 outline-none border-b-2 border-transparent focus:border-blue-500 flex-1 truncate py-1"
          placeholder="ชื่อการทดสอบ เช่น CBC"
        />
        <button 
          onClick={onDelete} 
          className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all flex items-center gap-1 group/del"
          title="ลบรายการนี้"
        >
          <span className="text-[10px] font-bold opacity-0 group-hover/del:opacity-100 transition-opacity">ลบรายการ</span>
          <Trash2 size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <CostField label="Reagent Cost (ค่าน้ำยา)" value={test.reagentCost} onChange={(v) => onUpdate({ reagentCost: v })} />
        <CostField label="Supplies (วัสดุสิ้นเปลือง)" value={test.consumablesCost} onChange={(v) => onUpdate({ consumablesCost: v })} />
        <CostField label="Staff/Labor (ค่าแรง/เคส)" value={test.laborCost} onChange={(v) => onUpdate({ laborCost: v })} />
        <CostField label="Depreciation (ค่าเสื่อม)" value={test.machineDepreciation} onChange={(v) => onUpdate({ machineDepreciation: v })} />
        <CostField label="QC Cost (ค่า QC)" value={test.qcCost} onChange={(v) => onUpdate({ qcCost: v })} />
        <CostField label="Other (อื่นๆ)" value={test.otherCosts} onChange={(v) => onUpdate({ otherCosts: v })} />
      </div>

      <div className="mt-8 pt-4 border-t border-slate-50 flex items-end justify-between">
        <div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Unit Cost (ต้นทุนรวมต่อเคส)</p>
          <p className="text-2xl font-black text-blue-600 slashed-zero">{totalCost.toLocaleString()} <span className="text-[10px] text-slate-400">บาท</span></p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Volume (เคส/เดือน)</p>
          <NumberInput 
            value={test.testsPerMonth}
            onChange={(v) => onUpdate({ testsPerMonth: v })}
            className="bg-slate-100 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-600 w-16 text-center focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}


interface PricingRowProps {
  key?: string;
  test: TestItem;
  targetMargin: number;
  onUpdate: (u: Partial<TestItem>) => void;
}

function PricingRow({ test, targetMargin, onUpdate }: PricingRowProps) {
  const totalCost = test.reagentCost + test.consumablesCost + test.laborCost + test.machineDepreciation + test.qcCost + test.otherCosts;
  const profit = test.sellingPrice - totalCost;
  const margin = (profit / (test.sellingPrice || 1)) * 100;
  
  const suggestedPrice = totalCost / (1 - targetMargin / 100);

  const getStatusColor = (m: number) => {
    if (m > 50) return { bg: 'bg-green-500', text: 'text-green-600', ring: 'ring-green-100', label: 'Strong Margin' };
    if (m >= 20) return { bg: 'bg-amber-500', text: 'text-amber-600', ring: 'ring-amber-100', label: 'Moderate Margin' };
    return { bg: 'bg-red-500', text: 'text-red-600', ring: 'ring-red-100', label: 'Low Margin' };
  };

  const status = getStatusColor(margin);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row group hover:shadow-md transition-all">
      <div className="p-8 lg:w-80 bg-slate-50/50 border-r border-slate-100 shrink-0">
        <h4 className="font-black text-xl text-slate-800 mb-1">{test.name}</h4>
        <div className="flex items-center gap-2 mb-6">
          <div className={cn("w-2 h-2 rounded-full", status.bg)} />
          <span className={cn("text-[10px] font-black uppercase tracking-widest", status.text)}>{status.label}</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Unit Cost (ต้นทุน/เคส)</span>
            <span className="font-black text-slate-600">{totalCost.toLocaleString()} บ.</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Monthly Case (จำนวนเคส)</span>
            <span className="font-black text-slate-600">{test.testsPerMonth.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="p-8 flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 block">Actual Selling Price (ราคาขายต่อเคส)</label>
          <div className="relative group/input">
            <NumberInput 
              value={test.sellingPrice}
              onChange={(v) => onUpdate({ sellingPrice: v })}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-2xl font-black text-slate-800 focus:border-blue-500 h-16 group-hover/input:border-slate-200"
              unit="บาท"
            />
          </div>
        </div>

        <div>
           <div className="flex justify-between items-end mb-2">
            <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Profit per case (กำไรต่อรายการ)</label>
            <span className={cn("text-lg font-black", status.text)}>{margin.toFixed(1)}%</span>
          </div>
          <div className="h-16 flex flex-col justify-center gap-2">
            <span className={cn("text-3xl font-black", profit >= 0 ? "text-slate-900" : "text-red-500")}>
              {profit.toLocaleString()} <span className="text-sm font-bold opacity-30 italic">บ.</span>
            </span>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, margin))}%` }}
                className={cn("h-full", status.bg)}
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-100 flex flex-col justify-center relative overflow-hidden group/suggest">
          <div className="relative z-10">
            <label className="text-[9px] font-black uppercase tracking-widest opacity-70 flex items-center gap-1 mb-1">
              Suggested Price (ราคาขายแนะนำ) <ArrowRight size={10} />
            </label>
            <div className="text-2xl font-black tracking-tight">
              {Math.ceil(suggestedPrice).toLocaleString()} บาท
            </div>
            <p className="text-[9px] mt-1 opacity-70 font-bold">เพื่อให้ได้กำไรขั้นต้นตามเป้า {targetMargin}%</p>
          </div>
          <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover/suggest:scale-110 transition-transform">
            <Calculator size={100} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, unit, icon: Icon, color, description }: { title: string, value: number, unit: string, icon: any, color: string, description?: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-600 text-white shadow-blue-100',
    amber: 'bg-white text-amber-600 border-slate-200 shadow-slate-100',
    green: 'bg-white text-green-600 border-slate-200 shadow-slate-100',
    purple: 'bg-white text-purple-600 border-slate-200 shadow-slate-100'
  };

  const isBlue = color === 'blue';

  return (
    <div className={cn("p-6 rounded-[2.5rem] shadow-xl border flex flex-col justify-between h-48 group hover:-translate-y-1 transition-all", colorMap[color])}>
      <div className="flex justify-between items-start">
        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", isBlue ? "bg-white/20" : "bg-slate-50")}>
          <Icon size={20} />
        </div>
        <div className={cn("text-[9px] font-black uppercase tracking-widest", isBlue ? "opacity-60" : "text-slate-400")}>{unit}</div>
      </div>
      <div>
        <h4 className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", isBlue ? "opacity-70" : "text-slate-400")}>{title}</h4>
        <div className="text-3xl font-black tracking-tight mb-1">
          {value.toLocaleString(undefined, { maximumFractionDigits: (unit === '%' ? 1 : 0) })}
        </div>
        {description && (
          <p className={cn("text-[10px] font-medium leading-tight", isBlue ? "text-blue-100" : "text-slate-400")}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
