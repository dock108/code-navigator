import React from "react";

export default function ReferencesModal({ open, onClose, references, loading, error, symbol }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-8 relative max-h-[80vh] overflow-y-auto border border-gray-200 flex flex-col">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold bg-white bg-opacity-80 rounded-full w-9 h-9 flex items-center justify-center shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-6">References for <span className="text-blue-700">{symbol}</span></h2>
        {loading && <p className="text-gray-400 py-8 text-center">Loading references...</p>}
        {error && <p className="text-red-500 py-8 text-center">{error}</p>}
        {!loading && !error && references.length === 0 && (
          <p className="text-gray-500 py-8 text-center">No references found.</p>
        )}
        {!loading && !error && references.length > 0 && (
          <ul className="divide-y divide-gray-200">
            {references.map((ref) => (
              <li key={ref.line} className="py-3 flex items-center">
                <span className="font-mono text-xs text-gray-500 mr-3">Line {ref.line}:</span>
                <span className="font-mono text-sm bg-gray-50 px-3 py-1 rounded border border-gray-100">{ref.snippet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 