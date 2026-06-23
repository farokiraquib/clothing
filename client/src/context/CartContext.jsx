import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'supremeit_cart';

function getInitialCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Custom items always create a new entry (never merge)
      if (action.payload.customText || action.payload.customImage) {
        return [...state, { ...action.payload, quantity: action.payload.quantity || 1 }];
      }
      const existing = state.findIndex(
        item => item.id === action.payload.id && 
                item.selectedSize === action.payload.selectedSize && 
                item.selectedColor === action.payload.selectedColor &&
                !item.customText && !item.customImage
      );
      if (existing >= 0) {
        const updated = [...state];
        updated[existing].quantity += action.payload.quantity || 1;
        return updated;
      }
      return [...state, { ...action.payload, quantity: action.payload.quantity || 1 }];
    }
    case 'REMOVE_ITEM':
      return state.filter((_, i) => i !== action.payload);
    case 'UPDATE_QUANTITY': {
      const updated = [...state];
      updated[action.payload.index].quantity = action.payload.quantity;
      if (updated[action.payload.index].quantity <= 0) {
        updated.splice(action.payload.index, 1);
      }
      return updated;
    }
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], getInitialCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, selectedSize, selectedColor, quantity = 1, customText = '', customImage = '') => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...product, selectedSize, selectedColor, quantity, customText, customImage }
    });
  };

  const removeFromCart = (index) => {
    dispatch({ type: 'REMOVE_ITEM', payload: index });
  };

  const updateQuantity = (index, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } });
  };

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
