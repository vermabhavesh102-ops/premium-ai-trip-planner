type Props = {
  image?: string
  fullName?: string
  className?: string
}

export default function ProfileAvatar({ image, fullName, className = 'h-12 w-12 text-base' }: Props) {

  if (image) {
    return (
      <img
        src={image}
        alt={`${fullName || 'User'} profile`}
        className={`${className} rounded-full border border-[#23466a] object-cover ring-0`}
      />
    )
  }

  return (
    <span
      className={`${className} inline-flex shrink-0 items-center justify-center rounded-full border border-[#23466a] bg-[#cfb083] font-black text-white ring-0`}
      aria-hidden="true"
    >
      {fullName?.trim().charAt(0).toUpperCase() || '?'}
    </span>
  )
}
