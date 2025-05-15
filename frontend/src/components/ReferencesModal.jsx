import React from "react";

export default function ReferencesModal({ open, onClose, references, loading, error, symbol }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6 relative max-h-[80vh] overflow-y-auto border border-gray-200">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4">References for <span className="text-blue-700">{symbol}</span></h2>
        {loading && <p className="text-gray-400">Loading references...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && references.length === 0 && (
          <p className="text-gray-500">No references found.</p>
        )}
        {!loading && !error && references.length > 0 && (
          <ul className="divide-y divide-gray-200">
            {references.map((ref) => (
              <li key={ref.line} className="py-2">
                <span className="font-mono text-xs text-gray-500 mr-2">Line {ref.line}:</span>
                <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">{ref.snippet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 