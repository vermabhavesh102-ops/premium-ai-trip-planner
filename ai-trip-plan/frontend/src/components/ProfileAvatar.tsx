import { getInitials } from '../lib/profile'

type Props = {
  image?: string
  fullName?: string
  username?: string
  className?: string
}

export default function ProfileAvatar({ image, fullName, username, className = 'h-12 w-12 text-base' }: Props) {

  if (image) {
    return (
      <img
        src={image}
        alt={`${fullName || username || 'User'} profile`}
        className={`${className} rounded-full border border-[#23466a] object-cover ring-0`}
      />
    )
  }

  return (
    <span
      className={`${className} inline-flex shrink-0 items-center justify-center rounded-full border border-[#23466a] bg-[#cfb083] font-black text-white ring-0`}
      aria-hidden="true"
    >
      {getInitials(fullName, username)}
    </span>
  )
}
