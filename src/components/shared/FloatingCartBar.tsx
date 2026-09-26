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
  if (
    location.pathname.startsWith("/booking") ||
    location.pathname.startsWith("/auth") ||
    location.pathname.startsWith("/app/book")
  ) {
    return null;
  }

  if (itemCount === 0) return null;

  return (
    <>
      {/* Backdrop overlay when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Expanded Drawer: Desktop Right-Side Drawer / Mobile Bottom Sheet */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 sm:bottom-24 sm:left-auto sm:right-6 z-50 sm:w-96 max-h-[80vh] sm:max-h-[65vh] p-5 rounded-t-3xl sm:rounded-3xl bg-[#07172E] border-t sm:border border-white/20 text-white shadow-2xl flex flex-col space-y-3 overflow-hidden backdrop-blur-xl"
          >
            {/* Mobile Sheet Drag Indicator */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto -mt-2 mb-1 sm:hidden shrink-0" />

            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-accent" />
                <span className="font-heading text-sm font-bold">Cart Items ({itemCount})</span>
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

            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate max-w-[60%]">
                    {item.thumbnail || (item as any).image ? (
                      <img
                        src={item.thumbnail || (item as any).image}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10"
                      />
                    ) : (
                      <span className="text-base shrink-0 p-2 rounded-xl bg-white/10">🛠️</span>
                    )}
                    <div className="truncate">
                      <h5 className="font-bold text-white truncate">{item.name}</h5>
                      <span className="text-[11px] text-accent font-bold font-mono">
                        {formatCurrency((item.discountedPrice || item.basePrice) * item.quantity)}
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
                      <span className="text-xs font-bold px-1.5 text-white font-mono">{item.quantity}</span>
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

            <div className="pt-2 border-t border-white/10 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] text-white/60 uppercase tracking-wider block">Cart Subtotal</span>
                <span className="font-mono font-extrabold text-base text-accent">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <Button
                variant="accent"
                size="sm"
                onClick={() => {
                  setIsExpanded(false);
                  navigate(`${ROUTES.APP_BOOK}?fromCart=true`);
                }}
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                className="font-bold text-xs px-4"
              >
                Checkout All
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Collapsed Cart Bar (Compact Bottom-Right Desktop, Mobile Sheet) */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:translate-x-0 z-40 sm:w-auto max-w-md"
      >
        <div className="flex items-center justify-between gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl bg-[#07172E]/95 border border-white/20 text-white backdrop-blur-xl shadow-2xl">
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            role="button"
            tabIndex={0}
            aria-label="View cart details"
          >
            <div className="relative h-9 w-9 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingBag className="h-4.5 w-4.5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center shadow-md">
                {itemCount}
              </span>
            </div>

            <div className="pr-1">
              <div className="flex items-center gap-1">
                <span className="font-heading text-xs font-bold text-white group-hover:text-accent transition-colors">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
                <span className="text-white/40">•</span>
                <span className="font-mono font-extrabold text-xs text-accent">
                  {formatCurrency(subtotal)}
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 text-accent/80 ml-0.5" />
                ) : (
                  <ChevronUp className="h-3 w-3 text-accent/80 ml-0.5" />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden sm:inline-flex text-[11px] h-8 px-2.5 text-white/90 border-white/20 hover:bg-white/10"
            >
              {isExpanded ? "Close" : "View"}
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate(`${ROUTES.APP_BOOK}?fromCart=true`)}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              className="font-bold shadow-glow text-xs h-8 px-3.5"
            >
              Checkout
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
