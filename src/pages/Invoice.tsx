import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import Loading from '../components/Loading';

export default function Invoice() {
  const { id } = useParams();

  const invoiceQuery = useQuery<any>({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const response = await api.get(`/invoice/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
  });

  if (!id || invoiceQuery.isLoading) {
    return <Loading />;
  }

  if (invoiceQuery.isError) {
    return (
      <div className="section-card">
        <h2>Invoice not found</h2>
        <p>Unable to load the invoice. Please go back and try again.</p>
        <Link to="/sales" className="secondary-button">
          Back to sales
        </Link>
      </div>
    );
  }

  const sale = invoiceQuery.data;

  return (
    <div className="page-grid">
      <section className="section-card invoice-card">
        <div className="section-header">
          <div>
            <h2>Invoice</h2>
            <p>Sale invoice details for {sale.invoice_no || `Sale ${sale.id}`}</p>
          </div>
          <Link to="/sales" className="secondary-button">
            Back to sales
          </Link>
        </div>

        <div className="invoice-summary">
          <div>
            <strong>Invoice No.</strong>
            <span>{sale.invoice_no || `Sale ${sale.id}`}</span>
          </div>
          <div>
            <strong>Customer</strong>
            <span>{sale.customer_name || '-'}</span>
          </div>
          <div>
            <strong>Sale Type</strong>
            <span>{sale.sale_type}</span>
          </div>
          <div>
            <strong>Paid</strong>
            <span>₹{sale.paid_amount}</span>
          </div>
          <div>
            <strong>Balance</strong>
            <span>₹{sale.balance}</span>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item: any, index: number) => (
                <tr key={index}>
                  <td>{item.item?.name || 'Unknown item'}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price}</td>
                  <td>₹{item.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-total">
          <strong>Total amount</strong>
          <span>₹{sale.total_amount}</span>
        </div>
      </section>
    </div>
  );
}
