import { useQuery } from '@tanstack/react-query';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../api';
import Loading from '../components/Loading';

export default function Dashboard() {
  const summaryQuery = useQuery<any>({
    queryKey: ['profitLoss'],
    queryFn: async () => {
      const response = await api.get('/reports/profit-loss');
      return response.data;
    },
  });

  const historyQuery = useQuery<any>({
    queryKey: ['salesHistory'],
    queryFn: async () => {
      const response = await api.get('/reports/sales-history');
      return response.data;
    },
  });

  const salesByDate = historyQuery.data?.slice(0, 8).map((sale: any) => ({
    name: sale.invoice_no || `Sale ${sale.id}`,
    total: sale.total_amount,
  })) ?? [];

  if (summaryQuery.isLoading || historyQuery.isLoading) {
    return <Loading />;
  }

  return (
    <div className="page-grid">
      <section className="welcome-card">
        <div>
          <h1>Dashboard overview</h1>
          <p>Track your sales, purchases, expenses, and cash flow in one place.</p>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Cash sales</span>
          <strong>₹{summaryQuery.data?.cash_sales.toFixed(2)}</strong>
        </div>
        <div className="stat-card">
          <span>Credit sales</span>
          <strong>₹{summaryQuery.data?.credit_sales.toFixed(2)}</strong>
        </div>
        <div className="stat-card">
          <span>Cash purchases</span>
          <strong>₹{summaryQuery.data?.cash_purchases.toFixed(2)}</strong>
        </div>
        <div className="stat-card">
          <span>Credit purchases</span>
          <strong>₹{summaryQuery.data?.credit_purchases.toFixed(2)}</strong>
        </div>
        <div className="stat-card accent">
          <span>Profit</span>
          <strong>₹{summaryQuery.data?.profit.toFixed(2)}</strong>
        </div>
      </section>

      <section className="chart-card">
        <div className="section-header">
          <h2>Recent sales history</h2>
          <p>Latest invoices and sales totals.</p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesByDate} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
