import React from "react";

export const Button = ({ children, className = "", variant = "default", ...props }) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-100",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
    };

    const finalClass = `${baseStyles} ${variants[variant] || variants.default
        } ${className}`;

    return (
        <button className={finalClass} {...props}>
            {children}
        </button>
    );
};