import { Eye, EyeOff } from 'lucide-react'
import { useId, useState } from 'react'

type PasswordInputProps = {
  value: string

  onChange: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  disabled?: boolean
  name?: string
}

export default function PasswordInput({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  disabled,
  name,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const id = useId()

  return (
    <div className={className ?? ''}>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'password' : 'text'}
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={
            inputClassName ??
            'glass-panel w-full px-4 py-3 pr-12 outline-none focus:border-[#c7a575] dark:border-slate-700'
          }
          autoComplete={visible ? 'off' : 'current-password'}
        />

        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}

