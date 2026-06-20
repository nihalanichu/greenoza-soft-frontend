import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useShop } from '../hooks/useShop';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/inventory', label: 'Inventory' },
  { path: '/purchases', label: 'Purchases' },
  { path: '/sales', label: 'Sales' },
  { path: '/expenses', label: 'Expenses' },
  { path: '/payables', label: 'Payables' },
  { path: '/receivables', label: 'Receivables' },
  { path: '/reports', label: 'Reports' },
  { path: '/daily-closing', label: 'Daily Closing' },
  { path: '/shops', label: 'Shops' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { shops, selectedShopId, selectedShopName, selectShop, isLoading } = useShop();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">🍎</div>
          <div>
            <h1>FruitMarket</h1>
            <p>Accounting</p>
          </div>
        </div>

        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <h2>Fruit Market Accounting</h2>
            <p>{user?.role === 'admin' ? 'Administrator overview' : 'Shop-level dashboard'}</p>
            {user?.role === 'admin' ? (
              <div className="shop-select-wrapper">
                <label htmlFor="shop-select">Active shop</label>
                <select
                  id="shop-select"
                  value={selectedShopId ?? ''}
                  onChange={(event) => selectShop(event.target.value ? Number(event.target.value) : null)}
                  disabled={isLoading}
                >
                  <option value="">All shops</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.shop_name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              selectedShopName && <p className="shop-badge">Active shop: {selectedShopName}</p>
            )}
          </div>
          <button type="button" className="ghost-button" onClick={logout}>
            Sign out
          </button>
        </header>

        <section className="page-content">{children}</section>
      </main>
    </div>
  );
}
