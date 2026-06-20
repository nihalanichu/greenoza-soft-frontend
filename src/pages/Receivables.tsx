import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import Loading from '../components/Loading';

interface ReceivableForm {
  sale_id: number;
  customer_name: string;
  amount_due: number;
  due_date: string;
  status: 'pending' | 'paid';
}

export default function Receivables() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ReceivableForm>({
    sale_id: 0,
    customer_name: '',
    amount_due: 0,
    due_date: new Date().toISOString().slice(0, 10),
    status: 'pending',
  });

  const receivablesQuery = useQuery<any>({
    queryKey: ['receivables'],
    queryFn: async () => {
      const response = await api.get('/receivables');
      return response.data;
    },
  });

  const salesQuery = useQuery<any>({
    queryKey: ['sales'],
    queryFn: async () => {
      const response = await api.get('/sales');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => api.post('/receivables', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      setForm({ sale_id: 0, customer_name: '', amount_due: 0, due_date: new Date().toISOString().slice(0, 10), status: 'pending' });
    },
  });

  if (receivablesQuery.isLoading || salesQuery.isLoading) {
    return <Loading />;
  }

  return (
    <div className="page-grid">
      <section className="section-card">
        <div className="section-header">
          <div>
            <h2>Receivables</h2>
            <p>Track amounts owed by customers from credit sales.</p>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount due</th>
                <th>Due date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {receivablesQuery.data.map((receivable: any) => (
                <tr key={receivable.id}>
                  <td>{receivable.customer_name}</td>
                  <td>₹{receivable.amount_due}</td>
                  <td>{receivable.due_date || '-'}</td>
                  <td>{receivable.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card">
        <div className="section-header">
          <div>
            <h2>Add receivable</h2>
            <p>Record customer credit sales that are still owed.</p>
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
            Sale
            <select
              value={form.sale_id}
              onChange={(event) => setForm({ ...form, sale_id: Number(event.target.value) })}
              required
            >
              <option value={0}>Choose sale</option>
              {salesQuery.data
                .filter((sale: any) => sale.sale_type === 'credit')
                .map((sale: any) => (
                  <option key={sale.id} value={sale.id}>
                    {sale.customer_name || 'Credit sale'} - ₹{sale.balance}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Customer name
            <input
              type="text"
              value={form.customer_name}
              onChange={(event) => setForm({ ...form, customer_name: event.target.value })}
              required
            />
          </label>
          <label>
            Amount due
            <input
              type="number"
              value={form.amount_due}
              onChange={(event) => setForm({ ...form, amount_due: Number(event.target.value) })}
              required
            />
          </label>
          <label>
            Due date
            <input
              type="date"
              value={form.due_date}
              onChange={(event) => setForm({ ...form, due_date: event.target.value })}
            />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as 'pending' | 'paid' })}>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </label>
          <button type="submit" className="primary-button" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Saving…' : 'Save receivable'}
          </button>
        </form>
      </section>
    </div>
  );
}
