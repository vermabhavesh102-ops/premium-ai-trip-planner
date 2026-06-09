import React, { InputHTMLAttributes } from 'react'

type InputProps = {
  label?: string
  error?: string
  invalid?: boolean
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
    value: string
    onChange: (value: string) => void
  }

export default function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  name,
  error,
  disabled,
  invalid,
  autoComplete,
  ...rest
}: InputProps) {
  const showError = Boolean(error) && (invalid ?? true)

  return (
    <div className="space-y-2">
      {label ? (
        <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">{label}</label>
      ) : null}

      <input
        name={name}
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={[
          'glass-panel w-full px-4 py-3 outline-none transition',
          disabled ? 'opacity-60 cursor-not-allowed' : '',
          showError ? 'border border-red-500 focus:border-red-500' : 'border border-slate-300 focus:border-[#c7a575] dark:border-slate-700',
        ].join(' ')}
        {...rest}
      />

      {showError ? <p className="text-xs font-semibold text-red-500">{error}</p> : null}
    </div>
  )
}
