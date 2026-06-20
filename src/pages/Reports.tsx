import { useQuery } from '@tanstack/react-query';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Pie, PieChart, Cell, Legend } from 'recharts';
import api from '../api';
import Loading from '../components/Loading';
import { useShop } from '../hooks/useShop';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Reports() {
  const { selectedShopName } = useShop();

  const summaryQuery = useQuery<any>({
    queryKey: ['profitLoss', selectedShopName],
    queryFn: async () => {
      const response = await api.get('/reports/profit-loss');
      return response.data;
    },
  });

  const historyQuery = useQuery<any>({
    queryKey: ['salesHistory', selectedShopName],
    queryFn: async () => {
      const response = await api.get('/reports/sales-history');
      return response.data;
    },
  });

  const payablesQuery = useQuery<any>({
    queryKey: ['payablesStatus', selectedShopName],
    queryFn: async () => {
      const response = await api.get('/reports/payables-status');
      return response.data;
    },
  });

  const receivablesQuery = useQuery<any>({
    queryKey: ['receivablesStatus', selectedShopName],
    queryFn: async () => {
      const response = await api.get('/reports/receivables-status');
      return response.data;
    },
  });

  if (
    summaryQuery.isLoading ||
    historyQuery.isLoading ||
    payablesQuery.isLoading ||
    receivablesQuery.isLoading
  ) {
    return <Loading />;
  }

  const payableData = payablesQuery.data.map((row: any) => ({
    name: row.status,
    value: row.total,
    count: row.count,
  }));

  const receivableData = receivablesQuery.data.map((row: any) => ({
    name: row.status,
    value: row.total,
    count: row.count,
  }));

  return (
    <div className="page-grid">
      <section className="stats-grid">
        <div className="stat-card">
          <span>Cash sales</span>
          <strong>₹{summaryQuery.data.cash_sales.toFixed(2)}</strong>
        </div>
        <div className="stat-card">
          <span>Credit sales</span>
          <strong>₹{summaryQuery.data.credit_sales.toFixed(2)}</strong>
        </div>
        <div className="stat-card">
          <span>Cash purchases</span>
          <strong>₹{summaryQuery.data.cash_purchases.toFixed(2)}</strong>
        </div>
        <div className="stat-card">
          <span>Credit purchases</span>
          <strong>₹{summaryQuery.data.credit_purchases.toFixed(2)}</strong>
        </div>
        <div className="stat-card">
          <span>Expenses</span>
          <strong>₹{summaryQuery.data.total_expenses.toFixed(2)}</strong>
        </div>
        <div className="stat-card accent">
          <span>Profit</span>
          <strong>₹{summaryQuery.data.profit.toFixed(2)}</strong>
        </div>
      </section>

      <section className="chart-card">
        <div className="section-header">
          <div>
            <h2>Sales trend</h2>
            <p>Recent sale totals help you compare cash and credit performance.</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={historyQuery.data.map((sale: any) => ({ name: sale.invoice_no || `Sale ${sale.id}`, total: sale.total_amount }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-card">
        <div className="section-header">
          <div>
            <h2>Payables status</h2>
            <p>Open supplier liabilities by status and amounts.</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie data={payableData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} labelLine={false} label={({ name, value }) => `${name}: ₹${value.toFixed(0)}`}>
              {payableData.map((entry: any, index: number) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => `₹${typeof value === 'number' ? value.toFixed(2) : Number(Array.isArray(value) ? value[0] : value ?? 0).toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <div className="status-grid">
          {payableData.map((row: any) => (
            <div key={row.name} className="status-card">
              <span>{row.name}</span>
              <strong>₹{row.value.toFixed(2)}</strong>
              <p>{row.count} items</p>
            </div>
          ))}
        </div>
      </section>

      <section className="chart-card">
        <div className="section-header">
          <div>
            <h2>Receivables status</h2>
            <p>Customer amounts due by status and totals.</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie data={receivableData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} labelLine={false} label={({ name, value }) => `${name}: ₹${value.toFixed(0)}`}>
              {receivableData.map((entry: any, index: number) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => `₹${typeof value === 'number' ? value.toFixed(2) : Number(Array.isArray(value) ? value[0] : value ?? 0).toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <div className="status-grid">
          {receivableData.map((row: any) => (
            <div key={row.name} className="status-card">
              <span>{row.name}</span>
              <strong>₹{row.value.toFixed(2)}</strong>
              <p>{row.count} items</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
