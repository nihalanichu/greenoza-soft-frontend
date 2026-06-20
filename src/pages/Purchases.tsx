import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import Loading from '../components/Loading';

interface PurchaseForm {
  supplier_name: string;
  purchase_type: 'cash' | 'credit';
  invoice_no: string;
  paid_amount: number;
  items: Array<{ item_id: number; quantity: number; price: number }>;
}

export default function Purchases() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PurchaseForm>({
    supplier_name: '',
    purchase_type: 'cash',
    invoice_no: '',
    paid_amount: 0,
    items: [{ item_id: 0, quantity: 1, price: 0 }],
  });

  const purchasesQuery = useQuery<any>({
    queryKey: ['purchases'],
    queryFn: async () => {
      const response = await api.get('/purchases');
      return response.data;
    },
  });

  const inventoryQuery = useQuery<any>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const response = await api.get('/inventory');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => api.post('/purchases', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setForm({ supplier_name: '', purchase_type: 'cash', invoice_no: '', paid_amount: 0, items: [{ item_id: 0, quantity: 1, price: 0 }] });
    },
  });

  if (purchasesQuery.isLoading || inventoryQuery.isLoading) {
    return <Loading />;
  }

  return (
    <div className="page-grid">
      <section className="section-card">
        <div className="section-header">
          <div>
            <h2>Purchases</h2>
            <p>Track cash and credit purchases by supplier.</p>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Type</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {purchasesQuery.data.map((purchase: any) => (
                <tr key={purchase.id}>
                  <td>{purchase.supplier_name}</td>
                  <td>{purchase.purchase_type}</td>
                  <td>₹{purchase.total_amount}</td>
                  <td>₹{purchase.paid_amount}</td>
                  <td>₹{purchase.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card">
        <div className="section-header">
          <div>
            <h2>Add purchase</h2>
            <p>Create a cash or credit purchase with item details.</p>
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
            Supplier name
            <input type="text" value={form.supplier_name} onChange={(event) => setForm({ ...form, supplier_name: event.target.value })} required />
          </label>
          <label>
            Purchase type
            <select value={form.purchase_type} onChange={(event) => setForm({ ...form, purchase_type: event.target.value as 'cash' | 'credit' })}>
              <option value="cash">Cash</option>
              <option value="credit">Credit</option>
            </select>
          </label>
          <label>
            Invoice number
            <input type="text" value={form.invoice_no} onChange={(event) => setForm({ ...form, invoice_no: event.target.value })} />
          </label>
          <label>
            Paid amount
            <input type="number" value={form.paid_amount} onChange={(event) => setForm({ ...form, paid_amount: Number(event.target.value) })} required />
          </label>

          {form.items.map((item, index) => (
            <div className="item-row" key={index}>
              <select
                value={item.item_id}
                onChange={(event) => {
                  const updated = [...form.items];
                  updated[index].item_id = Number(event.target.value);
                  setForm({ ...form, items: updated });
                }}
                required
              >
                <option value={0}>Select item</option>
                {inventoryQuery.data.map((product: any) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(event) => {
                  const updated = [...form.items];
                  updated[index].quantity = Number(event.target.value);
                  setForm({ ...form, items: updated });
                }}
                placeholder="Quantity"
                required
              />
              <input
                type="number"
                min={0}
                value={item.price}
                onChange={(event) => {
                  const updated = [...form.items];
                  updated[index].price = Number(event.target.value);
                  setForm({ ...form, items: updated });
                }}
                placeholder="Price"
                required
              />
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setForm({ ...form, items: form.items.filter((_, rowIndex) => rowIndex !== index) });
                }}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            className="secondary-button"
            onClick={() => setForm({ ...form, items: [...form.items, { item_id: 0, quantity: 1, price: 0 }] })}
          >
            Add another item
          </button>
          <button type="submit" className="primary-button" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Saving…' : 'Save purchase'}
          </button>
        </form>
      </section>
    </div>
  );
}
