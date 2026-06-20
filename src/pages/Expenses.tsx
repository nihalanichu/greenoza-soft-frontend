import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import Loading from '../components/Loading';

interface ExpenseForm {
  category: string;
  title: string;
  amount: number;
  expense_date: string;
  notes: string;
}

export default function Expenses() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ExpenseForm>({
    category: 'salary',
    title: '',
    amount: 0,
    expense_date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const expensesQuery = useQuery<any>({
    queryKey: ['expenses'],
    queryFn: async () => {
      const response = await api.get('/expenses');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => api.post('/expenses', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setForm({ ...form, title: '', amount: 0, notes: '' });
    },
  });

  if (expensesQuery.isLoading) {
    return <Loading />;
  }

  return (
    <div className="page-grid">
      <section className="section-card">
        <div className="section-header">
          <div>
            <h2>Expenses</h2>
            <p>Record salaries and goods purchasing expenses.</p>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Title</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {expensesQuery.data.map((expense: any) => (
                <tr key={expense.id}>
                  <td>{expense.category}</td>
                  <td>{expense.title}</td>
                  <td>₹{expense.amount}</td>
                  <td>{expense.expense_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card">
        <div className="section-header">
          <div>
            <h2>Add expense</h2>
            <p>Capture salary or goods purchasing costs.</p>
          </div>
        </div>

        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <label>
            Category
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              <option value="salary">Salary</option>
              <option value="goods purchasing">Goods purchasing</option>
            </select>
          </label>
          <label>
            Title
            <input type="text" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          </label>
          <label>
            Amount
            <input type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })} required />
          </label>
          <label>
            Date
            <input type="date" value={form.expense_date} onChange={(event) => setForm({ ...form, expense_date: event.target.value })} required />
          </label>
          <label>
            Notes
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </label>
          <button type="submit" className="primary-button" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Saving…' : 'Save expense'}
          </button>
        </form>
      </section>
    </div>
  );
}
