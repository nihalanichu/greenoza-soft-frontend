import { useQuery } from '@tanstack/react-query';
import api from '../api';
import Loading from '../components/Loading';

export default function DailyClosing() {
  const closingQuery = useQuery<any>({
    queryKey: ['daily-closing'],
    queryFn: async () => {
      const response = await api.get('/daily-closing');
      return response.data;
    },
  });

  if (closingQuery.isLoading) {
    return <Loading />;
  }

  return (
    <div className="page-grid">
      <section className="welcome-card">
        <div>
          <h1>Daily closing</h1>
          <p>Review today’s cash, credit, expenses, and closing balance.</p>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Cash sales</span>
          <strong>₹{closingQuery.data.cash_sales.toFixed(2)}</strong>
        </div>
        <div className="stat-card">
          <span>Credit sales</span>
          <strong>₹{closingQuery.data.credit_sales.toFixed(2)}</strong>
        </div>
        <div className="stat-card">
          <span>Total expenses</span>
          <strong>₹{closingQuery.data.expenses.toFixed(2)}</strong>
        </div>
        <div className="stat-card accent">
          <span>Closing balance</span>
          <strong>₹{closingQuery.data.closing_balance.toFixed(2)}</strong>
        </div>
      </section>
    </div>
  );
}
