"use client";

import { ReactNode } from "react";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function LoadingButton({
  loading = false,
  loadingText,
  children,
  variant = "primary",
  size = "md",
  disabled,
  className = "",
  ...props
}: LoadingButtonProps) {
  const baseClasses = "inline-flex items-center justify-center gap-2 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25 focus:ring-primary",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-primary",
    danger: "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/25 focus:ring-red-500",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-primary",
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl",
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading && (
        <span className="material-symbols-outlined animate-spin text-lg">
          refresh
        </span>
      )}
      {loading ? (loadingText || "Cargando...") : children}
    </button>
  );
}

