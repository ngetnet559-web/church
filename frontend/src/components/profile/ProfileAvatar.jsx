export default function ProfileAvatar({ profile, size = 'lg', className = '' }) {
  const sizes = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-16 w-16 text-lg',
    lg: 'h-24 w-24 text-2xl',
    xl: 'h-32 w-32 text-3xl',
  };

  const name = profile?.fullName || profile?.user?.name || '?';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  if (profile?.profilePhoto) {
    return (
      <img
        src={profile.profilePhoto}
        alt={name}
        className={`${sizes[size]} rounded-2xl object-cover shadow-md ring-2 ring-white dark:ring-slate-800 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 font-semibold text-white shadow-md ring-2 ring-white dark:ring-slate-800 ${className}`}
    >
      {initials}
    </div>
  );
}
