export default function NotFound() {
  return (
    <main className="report-container">
      <div className="text-center py-16">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Report Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This report doesn&apos;t exist or has been revoked.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
          If you believe this is an error, please contact the person who shared this link.
        </p>
      </div>
    </main>
  );
}
