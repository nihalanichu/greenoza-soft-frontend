import { useMemo } from 'react';
import { useShop } from '../hooks/useShop';
import Loading from '../components/Loading';

export default function Shops() {
  const { shops, selectedShopId, selectedShopName, isLoading, selectShop } = useShop();

  const summary = useMemo(() => ({
    count: shops.length,
    active: selectedShopName || 'All shops',
  }), [shops, selectedShopName]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="page-grid">
      <section className="welcome-card">
        <div>
          <h1>Shop management</h1>
          <p>Use this view to inspect shops and switch the active shop for admin actions.</p>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total shops</span>
          <strong>{summary.count}</strong>
        </div>
        <div className="stat-card accent">
          <span>Active shop</span>
          <strong>{summary.active}</strong>
        </div>
      </section>

      <section className="section-card">
        <div className="section-header">
          <div>
            <h2>All shops</h2>
            <p>Choose a shop to scope admin actions, or leave blank for all shops.</p>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Shop name</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr key={shop.id}>
                  <td>{shop.shop_name}</td>
                  <td>{shop.address || '—'}</td>
                  <td>{shop.phone || '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => selectShop(shop.id)}
                      disabled={selectedShopId === shop.id}
                    >
                      {selectedShopId === shop.id ? 'Selected' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
