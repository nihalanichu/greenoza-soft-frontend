import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import Loading from '../components/Loading';

interface SaleForm {
  customer_name: string;
  sale_type: 'cash' | 'credit';
  invoice_no: string;
  paid_amount: number;
  items: Array<{ item_id: number; quantity: number; price: number }>;
}

export default function Sales() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SaleForm>({
    customer_name: '',
    sale_type: 'cash',
    invoice_no: '',
    paid_amount: 0,
    items: [{ item_id: 0, quantity: 1, price: 0 }],
  });

  const salesQuery = useQuery<any>({
    queryKey: ['sales'],
    queryFn: async () => {
      const response = await api.get('/sales');
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
    mutationFn: async () => api.post('/sales', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setForm({ customer_name: '', sale_type: 'cash', invoice_no: '', paid_amount: 0, items: [{ item_id: 0, quantity: 1, price: 0 }] });
    },
  });

  if (salesQuery.isLoading || inventoryQuery.isLoading) {
    return <Loading />;
  }

  return (
    <div className="page-grid">
      <section className="section-card">
        <div className="section-header">
          <div>
            <h2>Sales</h2>
            <p>Record cash and credit sales with invoice details.</p>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salesQuery.data.map((sale: any) => (
                <tr key={sale.id}>
                  <td>{sale.invoice_no || `Sale ${sale.id}`}</td>
                  <td>{sale.customer_name || '-'}</td>
                  <td>{sale.sale_type}</td>
                  <td>₹{sale.total_amount}</td>
                  <td>₹{sale.paid_amount}</td>
                  <td>₹{sale.balance}</td>
                  <td>
                    <Link to={`/invoice/${sale.id}`} className="secondary-button">
                      View invoice
                    </Link>
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
            <h2>Add sale</h2>
            <p>Publish a new sale and reduce inventory automatically.</p>
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
            Customer name
            <input type="text" value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} />
          </label>
          <label>
            Sale type
            <select value={form.sale_type} onChange={(event) => setForm({ ...form, sale_type: event.target.value as 'cash' | 'credit' })}>
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
                onClick={() => setForm({ ...form, items: form.items.filter((_, rowIndex) => rowIndex !== index) })}
              >
                Remove
              </button>
            </div>
          ))}

          <button type="button" className="secondary-button" onClick={() => setForm({ ...form, items: [...form.items, { item_id: 0, quantity: 1, price: 0 }] })}>
            Add another item
          </button>
          <button type="submit" className="primary-button" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Saving…' : 'Save sale'}
          </button>
        </form>
      </section>
    </div>
  );
}
