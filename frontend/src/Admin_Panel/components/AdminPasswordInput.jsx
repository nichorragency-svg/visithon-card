import React from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

/**
 * Tailwind password row with show/hide — used on admin login + bootstrap forms.
 */
export default function AdminPasswordInput({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
  required,
  minLength,
  placeholder,
  labelClassName = 'block text-xs font-medium uppercase tracking-wider text-white/40',
  inputClassName = 'w-full rounded-lg border border-white/10 bg-black/40 py-2.5 pl-3 pr-11 text-white placeholder:text-white/25 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30',
  toggleAriaLabel,
}) {
  const aria = toggleAriaLabel || (show ? 'Hide password' : 'Show password');
  return (
    <div>
      {label ? (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      ) : null}
      <div className="relative mt-1">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={onToggle}
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-white/45 transition hover:bg-white/10 hover:text-white/90"
          aria-label={aria}
        >
          {show ? <FaEyeSlash className="size-4" /> : <FaEye className="size-4" />}
        </button>
      </div>
    </div>
  );
}
