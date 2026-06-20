import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import Loading from '../components/Loading';

interface FormState {
  name: string;
  quantity: number;
  buy_price: number;
  sell_price: number;
  unit: string;
}

export default function Inventory() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>({
    name: '',
    quantity: 0,
    buy_price: 0,
    sell_price: 0,
    unit: '',
  });

  const inventoryQuery = useQuery<any>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const response = await api.get('/inventory');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => api.post('/inventory', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setForm({ name: '', quantity: 0, buy_price: 0, sell_price: 0, unit: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/inventory/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  });

  if (inventoryQuery.isLoading) {
    return <Loading />;
  }

  return (
    <div className="page-grid">
      <section className="section-card">
        <div className="section-header">
          <div>
            <h2>Inventory</h2>
            <p>Manage items and stock quantities.</p>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Buy price</th>
                <th>Sell price</th>
                <th>Unit</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {inventoryQuery.data.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.buy_price}</td>
                  <td>₹{item.sell_price}</td>
                  <td>{item.unit || '-'}</td>
                  <td>
                    <button type="button" className="ghost-button" onClick={() => deleteMutation.mutate(item.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card">
        <div className="section-header">
          <div>
            <h2>Add item</h2>
            <p>Create new inventory records for your shop.</p>
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
            Item name
            <input type="text" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label>
            Quantity
            <input type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })} required />
          </label>
          <label>
            Buy price
            <input type="number" value={form.buy_price} onChange={(event) => setForm({ ...form, buy_price: Number(event.target.value) })} required />
          </label>
          <label>
            Sell price
            <input type="number" value={form.sell_price} onChange={(event) => setForm({ ...form, sell_price: Number(event.target.value) })} required />
          </label>
          <label>
            Unit
            <input type="text" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} />
          </label>
          <button type="submit" className="primary-button" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating…' : 'Add item'}
          </button>
        </form>
      </section>
    </div>
  );
}
