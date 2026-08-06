import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, Sparkles, Trash2, ChevronUp, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart.store";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

export function FloatingCartBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { items, getItemCount, getSubtotal, removeItem, updateQuantity, clearCart } = useCartStore();

  const itemCount = getItemCount();
  const subtotal = getSubtotal();

  // Don't render on booking checkout wizard page or auth pages
  if (location.pathname.startsWith("/booking") || location.pathname.startsWith("/auth")) {
    return null;
  }

  if (itemCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="fixed bottom-18 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl"
      >
        {/* Expanded Items Drawer Popover */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="mb-2 p-4 rounded-2xl bg-[#07172E] border border-white/20 text-white backdrop-blur-2xl shadow-2xl space-y-3 max-h-[50vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-accent" />
                <span className="font-heading text-sm font-bold">Your Cart ({itemCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-red-400 hover:text-red-300 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate max-w-[55%]">
                    <span className="text-base shrink-0">🛠️</span>
                    <div className="truncate">
                      <h5 className="font-bold text-white truncate">{item.name}</h5>
                      <span className="text-[10px] text-accent font-bold">
                        {formatCurrency(item.discountedPrice || item.basePrice)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-white/10 rounded-lg p-0.5 border border-white/10">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-5 w-5 rounded bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold px-1 text-white">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="h-5 w-5 rounded bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Sticky Bottom Cart Bar */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#07172E] border border-white/20 text-white backdrop-blur-xl shadow-2xl">
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative h-11 w-11 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                {itemCount}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-sm font-bold text-white group-hover:text-accent transition-colors">
                  {itemCount} {itemCount === 1 ? "Service" : "Services"} Added
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-accent" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-accent" />
                )}
              </div>
              <p className="text-xs text-white/70">
                Subtotal:{" "}
                <span className="font-extrabold text-accent">
                  {formatCurrency(subtotal)}
                </span>
              </p>
            </div>
          </div>

          <Button
            variant="accent"
            size="default"
            onClick={() => navigate(ROUTES.BOOKING)}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="font-bold shadow-glow text-xs sm:text-sm px-4 sm:px-6"
          >
            Checkout
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
