export default function UnreadIndicator({ isRead }) {
  if (isRead) return null;

  return (
    <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500" />
  );
}
