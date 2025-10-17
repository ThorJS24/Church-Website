export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="text-white text-2xl font-bold animate-pulse">
        Loading...
      </div>
    </div>
  );
}