import { createSlice } from '@reduxjs/toolkit';

function loadInitialState() {
  try {
    const saved = localStorage.getItem('lb_cart');
    return saved ? JSON.parse(saved) : { items: [] };
  } catch {
    return { items: [] };
  }
}

const initialState = loadInitialState();

function persist(state) {
  try {
    localStorage.setItem('lb_cart', JSON.stringify({ items: state.items }));
  } catch {
    // Ignore localStorage write error if disabled
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const existing = state.items.find((i) => i.productId === action.payload.productId);
      const addQty = Math.max(1, parseInt(action.payload.quantity, 10) || 1);
      if (existing) {
        existing.quantity += addQty;
      } else {
        state.items.push({ ...action.payload, quantity: addQty });
      }
      persist(state);
    },
    setQuantity(state, action) {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (!item) return;
      const parsed = parseInt(action.payload.quantity, 10);
      item.quantity = isNaN(parsed) || parsed < 1 ? 1 : parsed;
      persist(state);
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      persist(state);
    },
    clearCart(state) {
      state.items = [];
      persist(state);
    },
  },
});

export const { addItem, setQuantity, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
