import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../atoms/Input';

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const PasswordField = (props: PasswordFieldProps) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        className="pr-12"
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};