import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import Loading from '../components/Loading';

interface PayableForm {
  purchase_id: number;
  supplier_name: string;
  amount_due: number;
  due_date: string;
  status: 'pending' | 'paid';
}

export default function Payables() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PayableForm>({
    purchase_id: 0,
    supplier_name: '',
    amount_due: 0,
    due_date: new Date().toISOString().slice(0, 10),
    status: 'pending',
  });

  const payablesQuery = useQuery<any>({
    queryKey: ['payables'],
    queryFn: async () => {
      const response = await api.get('/payables');
      return response.data;
    },
  });

  const purchasesQuery = useQuery<any>({
    queryKey: ['purchases'],
    queryFn: async () => {
      const response = await api.get('/purchases');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => api.post('/payables', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payables'] });
      setForm({ purchase_id: 0, supplier_name: '', amount_due: 0, due_date: new Date().toISOString().slice(0, 10), status: 'pending' });
    },
  });

  if (payablesQuery.isLoading || purchasesQuery.isLoading) {
    return <Loading />;
  }

  return (
    <div className="page-grid">
      <section className="section-card">
        <div className="section-header">
          <div>
            <h2>Payables</h2>
            <p>View supplier payables for credit purchases.</p>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Amount due</th>
                <th>Due date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payablesQuery.data.map((payable: any) => (
                <tr key={payable.id}>
                  <td>{payable.supplier_name}</td>
                  <td>₹{payable.amount_due}</td>
                  <td>{payable.due_date || '-'}</td>
                  <td>{payable.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card">
        <div className="section-header">
          <div>
            <h2>Add payable</h2>
            <p>Record supplier invoices for credit purchases.</p>
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
            Purchase
            <select
              value={form.purchase_id}
              onChange={(event) => setForm({ ...form, purchase_id: Number(event.target.value) })}
              required
            >
              <option value={0}>Choose purchase</option>
              {purchasesQuery.data.map((purchase: any) => (
                <option key={purchase.id} value={purchase.id}>
                  {purchase.supplier_name} - ₹{purchase.balance}
                </option>
              ))}
            </select>
          </label>
          <label>
            Supplier name
            <input
              type="text"
              value={form.supplier_name}
              onChange={(event) => setForm({ ...form, supplier_name: event.target.value })}
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
            {createMutation.isPending ? 'Saving…' : 'Save payable'}
          </button>
        </form>
      </section>
    </div>
  );
}
