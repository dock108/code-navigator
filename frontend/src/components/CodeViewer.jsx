import React, { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

const OWNER = "dock108";
const REPO = "code-navigator";

function getLanguageFromPath(path) {
  if (!path) return "text";
  const ext = path.split(".").pop();
  switch (ext) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "py":
      return "python";
    case "md":
      return "markdown";
    case "json":
      return "json";
    case "css":
      return "css";
    case "html":
      return "html";
    case "yml":
    case "yaml":
      return "yaml";
    case "sh":
      return "bash";
    case "c":
      return "c";
    case "cpp":
      return "cpp";
    case "java":
      return "java";
    case "go":
      return "go";
    case "rb":
      return "ruby";
    case "php":
      return "php";
    case "rs":
      return "rust";
    case "xml":
      return "xml";
    case "dockerfile":
      return "docker";
    default:
      return "text";
  }
}

export default function CodeViewer({ filePath }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filePath) return;
    setLoading(true);
    setError(null);
    setContent("");
    fetch(
      `http://localhost:8000/repo/${OWNER}/${REPO}/file-content?path=${encodeURIComponent(
        filePath
      )}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("File not found");
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [filePath]);

  if (!filePath) {
    return <div className="text-gray-400">Select a file to view its content.</div>;
  }

  if (loading) {
    return <div className="text-gray-400 animate-pulse">Loading file...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="w-full h-full overflow-auto bg-white rounded shadow p-4">
      <SyntaxHighlighter
        language={getLanguageFromPath(filePath)}
        style={oneLight}
        showLineNumbers
        wrapLongLines
        customStyle={{ fontSize: 14, background: "#fff" }}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
} 