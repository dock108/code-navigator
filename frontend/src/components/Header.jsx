import React, { useState } from "react";
import { FaGithub, FaSearch } from "react-icons/fa";

export default function Header({ onRepoLoad, loading, error }) {
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");

  const handleLoad = () => {
    setInputError("");
    const match = input.match(/^([\w-]+)\/(\w[\w-]*)$/);
    if (!match) {
      setInputError("Format: owner/repo");
      return;
    }
    const [, owner, repo] = match;
    onRepoLoad(owner, repo);
  };

  return (
    <header className="w-full bg-white shadow flex items-center px-6 py-3 space-x-6">
      <span className="text-2xl font-bold text-blue-700 flex items-center space-x-2 mr-8">
        <span role="img" aria-label="rocket">🚀</span>
        <span>Code Navigator</span>
      </span>
      <div className="flex-1 flex justify-center">
        <div className="flex items-center space-x-3 w-full max-w-md">
          <input
            type="text"
            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            placeholder="Enter GitHub repository (owner/repo)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleLoad(); }}
            disabled={loading}
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center disabled:opacity-60 min-w-[80px] relative"
            onClick={handleLoad}
            disabled={loading}
            aria-label="Load repository"
          >
            {loading ? (
              <span className="flex items-center justify-center w-full">
                <svg className="animate-spin h-6 w-6 mr-0.5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                <span className="ml-2">Loading</span>
              </span>
            ) : (
              <><FaSearch className="mr-2" />Load</>
            )}
          </button>
        </div>
      </div>
      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 text-xl ml-6">
        <FaGithub />
      </a>
      {(inputError || error) && (
        <div className="ml-6 text-red-500 text-sm font-medium whitespace-nowrap">{inputError || error}</div>
      )}
    </header>
  );
} 