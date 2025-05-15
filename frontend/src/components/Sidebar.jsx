import React, { useEffect, useState } from "react";
import { FaFolder, FaFolderOpen, FaFileAlt, FaChevronRight, FaChevronDown } from "react-icons/fa";

export default function Sidebar({ onFileClick = () => {}, owner = "dock108", repo = "code-navigator" }) {
  const API_URL = `http://localhost:8000/repo/${owner}/${repo}/files`;
  const [structure, setStructure] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState("");

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
  }, [API_URL]);

  const handleToggle = (path) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleFileClick = (path) => {
    setSelected(path);
    onFileClick(path);
  };

  function TreeNode({ node, level = 0 }) {
    const isDir = node.type === "directory";
    const isOpen = expanded[node.path];
    const isSelected = selected === node.path;
    return (
      <div>
        <div
          className={`flex items-center pl-${2 + level * 4} py-1.5 pr-2 rounded cursor-pointer transition-colors duration-150
            ${isSelected ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200 text-gray-800"}
            ${isDir ? "font-semibold" : "font-normal"}`}
          style={{ userSelect: "none" }}
          onClick={() => (isDir ? handleToggle(node.path) : handleFileClick(node.path))}
        >
          {isDir ? (
            <span className="mr-1.5 flex items-center transition-transform duration-200">
              {isOpen ? <FaChevronDown className="text-gray-400 mr-1" /> : <FaChevronRight className="text-gray-400 mr-1" />}
              {isOpen ? <FaFolderOpen className="text-yellow-500" /> : <FaFolder className="text-yellow-500" />}
            </span>
          ) : (
            <FaFileAlt className="text-gray-400 mr-2" />
          )}
          <span className="truncate">{node.path.split("/").filter(Boolean).pop()}</span>
        </div>
        {isDir && isOpen && node.contents && (
          <div
            className="ml-2 border-l border-gray-100 pl-2 overflow-hidden animate-expand"
            style={{ transition: "max-height 0.2s ease" }}
          >
            {node.contents.length > 0 ? (
              node.contents.map((child, idx) => (
                <TreeNode node={child} key={child.path + idx} level={level + 1} />
              ))
            ) : (
              <div className="ml-6 text-gray-400 text-sm py-1">(empty)</div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <aside className="w-64 h-screen overflow-y-auto bg-gray-50 border-r border-gray-200 p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-4 text-gray-700">Files</h2>
      {loading && (
        <div className="flex items-center text-gray-400 py-8 justify-center">
          <svg className="animate-spin h-5 w-5 mr-2 text-blue-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
          Loading files…
        </div>
      )}
      {error && <div className="text-red-500 py-8 text-center">{error}</div>}
      {!loading && !error && structure.length === 0 && (
        <div className="text-gray-400 py-8 text-center">No files found.</div>
      )}
      <div className="flex-1 overflow-y-auto mt-1">
        {structure.map((node, idx) => (
          <TreeNode node={node} key={node.path + idx} />
        ))}
      </div>
    </aside>
  );
} 