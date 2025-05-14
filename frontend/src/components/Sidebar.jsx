import React, { useEffect, useState } from "react";

const OWNER = "dock108";
const REPO = "code-navigator";
const API_URL = `http://localhost:8000/repo/${OWNER}/${REPO}/files`;

function TreeNode({ node, onFileClick }) {
  const [expanded, setExpanded] = useState(false);

  if (node.type === "directory") {
    return (
      <div className="ml-2">
        <div
          className="flex items-center cursor-pointer select-none"
          onClick={() => setExpanded((e) => !e)}
        >
          <span className="mr-1">{expanded ? "📂" : "📁"}</span>
          <span className="font-semibold">{node.path.split("/").slice(-2, -1)[0] || node.path}</span>
        </div>
        {expanded && node.contents && node.contents.length > 0 && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {node.contents.map((child, idx) => (
              <TreeNode node={child} key={child.path + idx} onFileClick={onFileClick} />
            ))}
          </div>
        )}
        {expanded && node.contents && node.contents.length === 0 && (
          <div className="ml-6 text-gray-400 text-sm">(empty)</div>
        )}
      </div>
    );
  } else {
    return (
      <div
        className="ml-6 flex items-center cursor-pointer hover:text-blue-600"
        onClick={() => onFileClick(node.path)}
      >
        <span className="mr-1">📄</span>
        <span>{node.path.split("/").pop()}</span>
      </div>
    );
  }
}

export default function Sidebar({ onFileClick = () => {} }) {
  const [structure, setStructure] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load file structure");
        return res.json();
      })
      .then((json) => {
        setStructure(json.structure || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <aside className="w-64 h-screen overflow-y-auto bg-gray-100 border-r border-gray-200 p-4">
      <h2 className="text-lg font-bold mb-4">Files</h2>
      {loading && <p className="text-gray-400">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && structure.length === 0 && (
        <p className="text-gray-400">No files found.</p>
      )}
      <div>
        {structure.map((node, idx) => (
          <TreeNode node={node} key={node.path + idx} onFileClick={onFileClick} />
        ))}
      </div>
    </aside>
  );
} 