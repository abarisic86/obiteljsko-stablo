interface ZoomControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export default function ZoomControls({ onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        className="bg-white rounded-full shadow-lg p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        aria-label="Zoom in"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>
      <button
        onClick={onZoomOut}
        className="bg-white rounded-full shadow-lg p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        aria-label="Zoom out"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 12H4"
          />
        </svg>
      </button>
      <button
        onClick={onReset}
        className="bg-white rounded-full shadow-lg p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        aria-label="Reset zoom"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  )
}

