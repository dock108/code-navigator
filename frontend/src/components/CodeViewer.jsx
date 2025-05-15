import React, { useEffect, useState, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const API_SUMMARY_URL = "http://localhost:8000/ai/summarize-file";

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

export default function CodeViewer({ filePath, owner, repo }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const codeContainerRef = useRef(null);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [summaryRequested, setSummaryRequested] = useState(false);

  useEffect(() => {
    if (!filePath || !owner || !repo) {
      setContent("");
      setError(null);
      setLoading(false);
      setSummary("");
      setSummaryError(null);
      setSummaryLoading(false);
      setSummaryRequested(false);
      return;
    }
    setLoading(true);
    setError(null);
    setContent("");
    setSummary("");
    setSummaryError(null);
    setSummaryLoading(false);
    setSummaryRequested(false);

    fetch(
      `http://localhost:8000/repo/${owner}/${repo}/file-content?path=${encodeURIComponent(
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
  }, [filePath, owner, repo]);

  const handleGenerateSummary = async () => {
    if (!filePath || !owner || !repo) return;
    setSummaryRequested(true);
    setSummaryLoading(true);
    setSummaryError(null);
    setSummary("");
    try {
      const res = await fetch(API_SUMMARY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, path: filePath }),
      });
      if (!res.ok) throw new Error(`Failed to fetch summary (status: ${res.status})`);
      const json = await res.json();
      setSummary(json.summary || "");
    } catch (err) {
      setSummaryError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  if (!filePath || !owner || !repo) {
    return <div className="text-gray-500 p-4 text-center">Select a file to view its content.</div>;
  }

  if (loading) {
    return <div className="text-gray-400 animate-pulse p-4 text-center">Loading file...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  }

  return (
    <div className="w-full h-full overflow-auto bg-white rounded shadow p-4 flex flex-col" ref={codeContainerRef}>
      {filePath && owner && repo && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          {!summaryRequested && (
            <button 
              onClick={handleGenerateSummary}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
            >
              Generate AI Summary
            </button>
          )}
          {summaryRequested && summaryLoading && <div className="text-gray-400 animate-pulse text-center py-2">Generating summary…</div>}
          {summaryRequested && summaryError && <div className="text-red-500 text-center py-2">Error: {summaryError}</div>}
          {summaryRequested && !summaryLoading && !summaryError && summary && (
            <div className="mt-2">
              <h3 className="text-md font-semibold text-gray-700 mb-1">AI Summary:</h3>
              <div className="bg-indigo-50 border border-indigo-200 rounded p-3 text-indigo-900 text-sm prose max-w-none prose-sm sm:prose lg:prose-lg xl:prose-xl">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{summary}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <SyntaxHighlighter
          language={getLanguageFromPath(filePath)}
          style={oneLight}
          showLineNumbers
          wrapLongLines
          customStyle={{ fontSize: 13, background: "#fff", lineHeight: "1.45" }}
          lineNumberStyle={{ minWidth: "3.25em", paddingRight: "1em", textAlign: "right", color: "#aaa", userSelect: "none"}}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
} 