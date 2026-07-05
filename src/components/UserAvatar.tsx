import { DEFAULT_USER_AVATAR } from '../utils/branding'

type AvatarSize = 'sm' | 'md' | 'list' | 'lg' | 'xl'

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  list: 'h-14 w-14',
  lg: 'h-20 w-20',
  xl: 'h-24 w-24',
}

interface UserAvatarProps {
  avatarUrl?: string | null
  alt?: string
  size?: AvatarSize
  className?: string
}

export default function UserAvatar({
  avatarUrl,
  alt = 'Avatar',
  size = 'md',
  className = '',
}: UserAvatarProps) {
  return (
    <img
      src={avatarUrl?.trim() || DEFAULT_USER_AVATAR}
      alt={alt}
      className={[
        'shrink-0 rounded-full object-cover bg-primary/10 shadow-sm ring-2 ring-white',
        SIZE_CLASS[size],
        className,
      ].join(' ')}
    />
  )
}
