import React from 'react';

// This allows the component to accept all standard HTML input props
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // Defines the base styling for the input field.
    // The border and placeholder colors have been made darker for better visibility.
    const baseClasses = "w-full pr-3 py-2 border border-gray-900 rounded-md shadow-sm placeholder-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900";
    
    // Combines base styles with any additional classes passed in via props
    return (
      <input
        type={type}
        className={`${baseClasses} ${className || ''}`}
        ref={ref}
        {...props}
      />
    );
  }
);
// This is helpful for debugging with React DevTools
Input.displayName = 'Input';

export { Input };