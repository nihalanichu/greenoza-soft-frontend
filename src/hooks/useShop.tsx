import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'fruit-market-shop';

interface Shop {
  id: number;
  shop_name: string;
  address?: string;
  phone?: string;
}

interface ShopContextValue {
  shops: Shop[];
  selectedShopId: number | null;
  selectedShopName: string | null;
  isLoading: boolean;
  selectShop: (shopId: number | null) => void;
}

const ShopContext = createContext<ShopContextValue | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setShops([]);
      setSelectedShopId(null);
      return;
    }

    const savedShop = Number(localStorage.getItem(STORAGE_KEY));
    setIsLoading(true);

    api
      .get('/shops')
      .then((response) => {
        const data: Shop[] = response.data;
        setShops(data);

        if (user.role === 'admin') {
          const hasSavedShop = data.some((shop) => shop.id === savedShop);
          setSelectedShopId(hasSavedShop ? savedShop : null);
        } else {
          const shopId = user.shop_id;
          setSelectedShopId(shopId);
          localStorage.setItem(STORAGE_KEY, String(shopId));
        }
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  const selectShop = useCallback((shopId: number | null) => {
    setSelectedShopId(shopId);
    if (shopId) {
      localStorage.setItem(STORAGE_KEY, String(shopId));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const selectedShopName = useMemo(() => {
    return shops.find((shop) => shop.id === selectedShopId)?.shop_name || null;
  }, [shops, selectedShopId]);

  const value = useMemo(
    () => ({ shops, selectedShopId, selectedShopName, isLoading, selectShop }),
    [shops, selectedShopId, selectedShopName, isLoading, selectShop],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used inside ShopProvider');
  }
  return context;
}
