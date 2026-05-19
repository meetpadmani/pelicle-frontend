import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { dashboardAPI } from '../../services/api';
import { TrendingUp, BarChart2, AlertTriangle, ArrowRight, Activity, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageWrapper from '../components/PageWrapper';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    document.title = 'Dashboard — Pelicle Workspace';
    dashboardAPI.getStats().then(res => {
      const data = res.data.stats || res.data;
      
      // Transform chart data for area chart (Revenue & Profit mock)
      const chartData = data.monthlySales?.map(item => ({
        name: `${item._id.month}/${item._id.year}`,
        Revenue: item.revenue,
        Profit: Math.round(item.revenue * 0.35) // Mock profit
      })) || [];
      
      setStats({ ...data, salesChartData: chartData });
    }).catch(() => {});
  }, []);

  if (!stats) return <div className="animate-pulse flex gap-4"><div className="skeleton h-32 w-1/4 rounded-xl" /></div>;

  const todayStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const currentHour = new Date().getHours();
  let greeting = 'Good evening';
  if (currentHour < 12) greeting = 'Good morning';
  else if (currentHour < 17) greeting = 'Good afternoon';
  const firstName = user?.name ? user.name.split(' ')[0] : '';

  return (
    <PageWrapper>
    <div className="font-body text-charcoal">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-[26px] font-heading font-extrabold text-deep-forest flex items-center gap-2">
            {greeting}{firstName ? `, ${firstName}` : ''}! 👋
          </h2>
          <p className="text-sm font-medium text-cool-taupe mt-1">{todayStr} - Business Overview</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-[#0E8A74] hover:bg-[#0B705E] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm md:w-auto w-full">
          <Plus size={16} /> New Sale
        </button>
      </div>

      {/* ── 4 Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-stone-gray shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">₹</div>
            <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1">↑ Today</span>
          </div>
          <p className="text-[10px] font-bold text-cool-taupe tracking-widest uppercase mb-1">Today's Revenue</p>
          <h3 className="text-3xl font-bold text-deep-forest font-heading">₹{(stats.totalRevenue ? Math.round(stats.totalRevenue/30) : 48200).toLocaleString('en-IN')}</h3>
          <p className="text-xs text-cool-taupe mt-1 font-medium">{stats.recentOrders?.length || 8} sales recorded today</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-stone-gray shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><Activity size={16} /></div>
            <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1">↑ 24.8%</span>
          </div>
          <p className="text-[10px] font-bold text-cool-taupe tracking-widest uppercase mb-1">Today's Profit</p>
          <h3 className="text-3xl font-bold text-deep-forest font-heading">₹{Math.round((stats.totalRevenue ? stats.totalRevenue/30 : 48200) * 0.248).toLocaleString('en-IN')}</h3>
          <p className="text-xs text-cool-taupe mt-1 font-medium">24.8% margin today</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-stone-gray shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><BarChart2 size={16} /></div>
          </div>
          <p className="text-[10px] font-bold text-cool-taupe tracking-widest uppercase mb-1">All-Time Revenue</p>
          <h3 className="text-3xl font-bold text-deep-forest font-heading">₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}</h3>
          <p className="text-xs text-cool-taupe mt-1 font-medium">{stats.totalOrders || 0} total transactions</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-stone-gray shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center"><AlertTriangle size={16} /></div>
            <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md flex items-center gap-1">Action needed</span>
          </div>
          <p className="text-[10px] font-bold text-cool-taupe tracking-widest uppercase mb-1">Low Stock Alerts</p>
          <h3 className="text-3xl font-bold text-deep-forest font-heading">3</h3>
          <p className="text-xs text-cool-taupe mt-1 font-medium">3 items need reordering</p>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Takes up 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart */}
          <div className="bg-white p-6 rounded-2xl border border-stone-gray shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-base font-bold text-deep-forest">Revenue & Profit Trend</h2>
                <p className="text-xs text-cool-taupe mt-0.5">Last 7 days - Daily breakdown</p>
              </div>
              <button className="text-sm font-semibold text-[#0E8A74] flex items-center gap-1 hover:underline">
                Full report <ArrowRight size={14} />
              </button>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.salesChartData || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0E8A74" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0E8A74" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8CC1B6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8CC1B6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#B8B5AE' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#B8B5AE' }} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #D9D9D6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="Revenue" stroke="#0E8A74" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="Profit" stroke="#8CC1B6" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2"><div className="w-4 h-1 bg-[#0E8A74] rounded-full"></div><span className="text-xs font-semibold text-charcoal">Revenue</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-1 bg-[#8CC1B6] rounded-full"></div><span className="text-xs font-semibold text-charcoal">Profit</span></div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white p-6 rounded-2xl border border-stone-gray shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-base font-bold text-deep-forest">Top Performing Products</h2>
                <p className="text-xs text-cool-taupe mt-0.5">Ranked by total revenue - All time</p>
              </div>
              <button className="text-sm font-semibold text-[#0E8A74] flex items-center gap-1 hover:underline">
                All products <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Olive Cotton T-Shirt', sales: 124, rev: 62000, margin: 34, width: '100%' },
                { name: 'Beige Cargo Pants', sales: 98, rev: 44000, margin: 28, width: '75%' },
                { name: 'Forest Green Hoodie', sales: 67, rev: 34000, margin: 42, width: '55%' },
                { name: 'Navy Blue Joggers', sales: 54, rev: 22000, margin: 31, width: '40%' },
                { name: 'White Classic Sneakers', sales: 41, rev: 16000, margin: 22, width: '30%' },
              ].map((prod, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded bg-[#0E8A74] text-white flex items-center justify-center text-xs font-bold shrink-0">{i+1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-deep-forest">{prod.name}</span>
                      <span className="text-xs text-cool-taupe">{prod.sales} sold</span>
                    </div>
                    <div className="w-full bg-light-beige rounded-full h-1.5">
                      <div className="bg-[#0E8A74] h-1.5 rounded-full" style={{ width: prod.width }}></div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 min-w-[60px]">
                    <div className="text-sm font-bold text-deep-forest">₹{prod.rev/1000}k</div>
                    <div className="text-[10px] font-bold text-amber-500">{prod.margin}% margin</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Takes up 1/3) */}
        <div className="space-y-6">
          
          {/* Business Health */}
          <div className="bg-white p-6 rounded-2xl border border-stone-gray shadow-sm">
            <h2 className="text-base font-bold text-deep-forest">Business Health</h2>
            <p className="text-xs text-cool-taupe mt-0.5 mb-6">All-time performance</p>
            
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-deep-forest">Overall Margin</span>
                <span className="text-xl font-bold text-[#0E8A74]">32.4%</span>
              </div>
              <div className="w-full bg-light-beige rounded-full h-2 mb-2">
                <div className="bg-[#0E8A74] h-2 rounded-full w-[32.4%] relative">
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0E8A74] rounded-full ring-4 ring-green-100"></div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs font-semibold text-green-600">Excellent</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-stone-gray pb-2">
                <span className="text-sm font-semibold text-charcoal">Gross Revenue</span>
                <span className="text-sm font-bold text-deep-forest">₹{(stats.totalRevenue || 284750).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-end border-b border-stone-gray pb-2">
                <span className="text-sm font-semibold text-charcoal">Cost of Goods</span>
                <span className="text-sm font-bold text-deep-forest">₹{Math.round((stats.totalRevenue || 284750) * 0.676).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="bg-white p-6 rounded-2xl border border-stone-gray shadow-sm">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-base font-bold text-deep-forest">Stock Alerts</h2>
                <p className="text-xs text-cool-taupe mt-0.5">Items needing attention</p>
              </div>
              <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md">3 low</span>
            </div>
            
            <div className="space-y-3">
              {[
                { name: 'Olive Green Bomber Jacket', amount: '0 / 10 pcs', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', bar: 'bg-rose-500' },
                { name: 'Beige Chinos', amount: '2 / 50 pcs', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', bar: 'bg-amber-500' },
                { name: 'White Basic Tee', amount: '4 / 100 pcs', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', bar: 'bg-orange-500' }
              ].map((alert, i) => (
                <div key={i} className={`p-4 rounded-xl border ${alert.bg} ${alert.border} relative overflow-hidden`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.bar}`}></div>
                  <h4 className={`text-sm font-bold ${alert.text} mb-1`}>{alert.name}</h4>
                  <p className={`text-xs font-semibold opacity-70 ${alert.text}`}>{alert.amount}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
    </PageWrapper>
  );
};

export default AdminDashboard;
