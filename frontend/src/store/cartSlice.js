import { createSlice } from '@reduxjs/toolkit';

const saved = localStorage.getItem('lb_cart');
const initialState = saved ? JSON.parse(saved) : { items: [] };

function persist(state) {
  localStorage.setItem('lb_cart', JSON.stringify(state));
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const existing = state.items.find((i) => i.productId === action.payload.productId);
      if (existing) {
        existing.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({ ...action.payload, quantity: action.payload.quantity || 1 });
      }
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

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
