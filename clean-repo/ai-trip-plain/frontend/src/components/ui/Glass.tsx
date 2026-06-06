import React from 'react'

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function GlassCard({
  className,
  children
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-white/40 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-soft overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  )
}

export function GlassPanel({
  className,
  children
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-white/35 bg-white/50 dark:bg-white/5 backdrop-blur-xl shadow-soft',
        className
      )}
    >
      {children}
    </div>
  )
}
