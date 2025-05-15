import React, { useEffect, useState, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReferencesModal from "./ReferencesModal";

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

export default function CodeViewer({ filePath, owner = "dock108", repo = "code-navigator" }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [definitions, setDefinitions] = useState([]);
  const [defError, setDefError] = useState(null);
  const codeContainerRef = useRef(null);
  const [referencesModalOpen, setReferencesModalOpen] = useState(false);
  const [references, setReferences] = useState([]);
  const [referencesLoading, setReferencesLoading] = useState(false);
  const [referencesError, setReferencesError] = useState(null);
  const [referencesSymbol, setReferencesSymbol] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    if (!filePath) return;
    setLoading(true);
    setError(null);
    setContent("");
    setDefinitions([]);
    setDefError(null);
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

    // Fetch definitions if Python file
    if (filePath.endsWith(".py")) {
      fetch(`http://localhost:8000/repo/${owner}/${repo}/definitions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: filePath }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Could not fetch definitions");
          return res.json();
        })
        .then((json) => {
          setDefinitions(json.definitions || []);
        })
        .catch((err) => {
          setDefError(err.message);
        });
    } else {
      setDefinitions([]);
    }

    // Fetch AI summary for the file
    setSummary("");
    setSummaryLoading(false);
    setSummaryError(null);
    if (filePath) {
      setSummaryLoading(true);
      fetch(API_SUMMARY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, path: filePath }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch summary");
          return res.json();
        })
        .then((json) => {
          setSummary(json.summary || "");
          setSummaryLoading(false);
        })
        .catch((err) => {
          setSummaryError(err.message);
          setSummaryLoading(false);
        });
    }
  }, [filePath, owner, repo]);

  // Fetch references for a symbol and open modal
  const handleFindReferences = (symbol) => {
    setReferencesModalOpen(true);
    setReferences([]);
    setReferencesLoading(true);
    setReferencesError(null);
    setReferencesSymbol(symbol);
    fetch(`http://localhost:8000/repo/${owner}/${repo}/references`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: filePath, name: symbol }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch references");
        return res.json();
      })
      .then((json) => {
        setReferences(json.references || []);
        setReferencesLoading(false);
      })
      .catch((err) => {
        setReferencesError(err.message);
        setReferencesLoading(false);
      });
  };

  if (!filePath) {
    return <div className="text-gray-400">Select a file to view its content.</div>;
  }

  if (loading) {
    return <div className="text-gray-400 animate-pulse">Loading file...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // Helper: map line numbers to definition names
  const defLineMap = {};
  definitions.forEach((def) => {
    defLineMap[def.line] = def;
  });

  // Helper: get all definition names for quick lookup
  const defNames = new Set(definitions.map((d) => d.name));

  // Split code into lines for rendering and scrolling
  const codeLines = content.split("\n");

  // Scroll to a line number (1-based)
  const scrollToLine = (line) => {
    const el = document.getElementById(`code-line-${line}`);
    console.log("Jump to line:", line, "Element found:", !!el);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Render each line, highlighting definition names and making them clickable
  function renderLine(line, idx) {
    const lineNum = idx + 1;
    let rendered = line;
    if (defLineMap[lineNum]) {
      const def = defLineMap[lineNum];
      const nameIdx = line.indexOf(def.name);
      if (nameIdx !== -1) {
        rendered = (
          <>
            {line.slice(0, nameIdx)}
            <span
              className="text-blue-600 underline cursor-pointer font-semibold bg-blue-50 px-1 rounded"
              onClick={() => handleFindReferences(def.name)}
              title={`Find references for ${def.name}`}
            >
              {def.name}
            </span>
            {line.slice(nameIdx + def.name.length)}
          </>
        );
      }
    } else {
      for (const name of defNames) {
        const nameIdx = line.indexOf(name);
        if (nameIdx !== -1) {
          rendered = (
            <>
              {line.slice(0, nameIdx)}
              <span
                className="text-blue-500 underline cursor-pointer hover:bg-blue-100 px-1 rounded"
                onClick={() => handleFindReferences(name)}
                title={`Find references for ${name}`}
              >
                {name}
              </span>
              {line.slice(nameIdx + name.length)}
            </>
          );
          break;
        }
      }
    }
    return (
      <div
        key={lineNum}
        id={`code-line-${lineNum}`}
        className="whitespace-pre font-mono text-sm leading-6"
        style={{ background: defLineMap[lineNum] ? "#e0f2fe" : undefined }}
      >
        <span className="select-none text-gray-400 pr-4" style={{ minWidth: 32, display: "inline-block" }}>
          {lineNum}
        </span>
        {rendered}
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto bg-white rounded shadow p-4" ref={codeContainerRef}>
      {/* AI Summary UI */}
      {filePath && (
        <div className="mb-4">
          <div className="font-semibold text-gray-700 mb-1">AI Summary:</div>
          {summaryLoading && <div className="text-gray-400 animate-pulse">Generating summary…</div>}
          {summaryError && <div className="text-red-500">{summaryError}</div>}
          {!summaryLoading && !summaryError && summary && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-900 text-sm mb-2">{summary}</div>
          )}
        </div>
      )}
      <ReferencesModal
        open={referencesModalOpen}
        onClose={() => setReferencesModalOpen(false)}
        references={references}
        loading={referencesLoading}
        error={referencesError}
        symbol={referencesSymbol}
      />
      {defError && (
        <div className="text-red-400 mb-2">Jump-to-definition unavailable: {defError}</div>
      )}
      {definitions.length > 0 && (
        <div className="mb-2 text-xs text-blue-700">Click a highlighted name to jump to its definition or find references.</div>
      )}
      {content && filePath.endsWith(".py") && definitions.length > 0 ? (
        <div>
          {codeLines.map((line, idx) => renderLine(line, idx))}
        </div>
      ) : (
        <SyntaxHighlighter
          language={getLanguageFromPath(filePath)}
          style={oneLight}
          showLineNumbers
          wrapLongLines
          customStyle={{ fontSize: 14, background: "#fff" }}
        >
          {content}
        </SyntaxHighlighter>
      )}
    </div>
  );
} 