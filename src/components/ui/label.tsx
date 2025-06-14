import React from 'react';

// Allows the component to accept all standard HTML label props
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    // Defines the base styling for the label
    const baseClasses = "text-sm font-bold text-gray-700 block";
    
    // Combines base styles with any additional classes
    return (
      <label
        className={`${baseClasses} ${className || ''}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Label.displayName = 'Label';

export { Label };