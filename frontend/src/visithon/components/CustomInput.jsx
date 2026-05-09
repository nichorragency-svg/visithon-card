import React from 'react';

const fieldClass =
  'w-full rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3.5 text-white shadow-inner shadow-black/20 backdrop-blur-xl outline-none transition placeholder:text-white/35 focus:border-fuchsia-400/40 focus:bg-white/[0.1] focus:ring-2 focus:ring-cyan-400/25';

export default function CustomInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  multiline = false,
  maxLength,
  rows = 4,
  className = '',
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/85"
        >
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={`${fieldClass} resize-none min-h-[120px] ${maxLength ? 'pb-8' : ''}`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={fieldClass}
        />
      )}
    </div>
  );
}
