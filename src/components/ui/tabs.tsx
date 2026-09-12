import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (val: string) => void;
  variant: "underline" | "pills";
}

const TabsContext = React.createContext<TabsContextValue>({
  activeTab: "",
  setActiveTab: () => {},
  variant: "underline",
});

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (val: string) => void;
  variant?: "underline" | "pills";
}

export function Tabs({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  variant = "underline",
  className,
  children,
  ...props
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const activeTab = isControlled ? controlledValue : uncontrolledValue;

  const handleTabChange = React.useCallback(
    (val: string) => {
      if (!isControlled) {
        setUncontrolledValue(val);
      }
      onValueChange?.(val);
    },
    [isControlled, onValueChange]
  );

  return (
    <TabsContext.Provider
      value={{
        activeTab,
        setActiveTab: handleTabChange,
        variant,
      }}
    >
      <div className={cn("w-full space-y-4", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TabsList({ className, children, ...props }: TabsListProps) {
  const { variant } = React.useContext(TabsContext);

  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center overflow-x-auto scrollbar-hide select-none",
        variant === "underline" && "border-b border-border gap-6",
        variant === "pills" && "bg-muted p-1 rounded-2xl gap-1.5 inline-flex",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const { activeTab, setActiveTab, variant } = React.useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={cn(
        "relative whitespace-nowrap text-sm font-semibold transition-colors duration-200 cursor-pointer",
        variant === "underline" &&
          cn(
            "pb-3 pt-1",
            isActive
              ? "text-accent font-bold"
              : "text-foreground-secondary hover:text-foreground"
          ),
        variant === "pills" &&
          cn(
            "px-4 py-2 rounded-xl",
            isActive
              ? "bg-surface text-primary shadow-xs font-bold"
              : "text-foreground-secondary hover:text-foreground"
          ),
        className
      )}
      {...props}
    >
      {children}

      {/* Underline Indicator Animation */}
      {variant === "underline" && isActive && (
        <motion.div
          layoutId="tab-underline-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
          transition={{ type: "spring", stiffness: 450, damping: 35 }}
        />
      )}
    </button>
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const { activeTab } = React.useContext(TabsContext);
  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={cn("focus-visible:outline-none animate-fade-in", className)}
      {...props}
    >
      {children}
    </div>
  );
}
