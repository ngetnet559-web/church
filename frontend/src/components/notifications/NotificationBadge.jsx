export default function NotificationBadge({ count }) {
  if (!count || count === 0) return null;

  return (
    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
      {count > 99 ? "99+" : count}
    </span>
  );
}
