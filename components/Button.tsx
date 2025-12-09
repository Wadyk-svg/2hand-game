import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative px-6 py-3 font-bold uppercase transition-all duration-200 clip-path-polygon transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#00f0ff] text-black hover:shadow-[0_0_15px_#00f0ff] border border-[#00f0ff]",
    secondary: "bg-transparent text-[#00f0ff] border border-[#00f0ff] hover:bg-[#00f0ff]/10 hover:shadow-[0_0_10px_#00f0ff]",
    danger: "bg-[#ff003c] text-white hover:shadow-[0_0_15px_#ff003c] border border-[#ff003c]"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? "LOADING..." : children}
      </span>
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white opacity-50"></div>
    </button>
  );
};