export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          InGauge Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This page hosts shared wellness reports.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
          Reports are accessed via unique share links.
        </p>
      </div>
    </main>
  );
}
