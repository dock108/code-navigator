import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CodeViewer from "../components/CodeViewer";
import RepoTreeView from "../components/RepoTreeView";
import Header from "../components/Header";
import ReactMarkdown from "react-markdown";

const OWNER = "dock108";
const REPO = "code-navigator";
const API_URL = `http://localhost:8000/repo/${OWNER}/${REPO}/metadata`;

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState("");
  const [showTree, setShowTree] = useState(false);
  const [yamlLoading, setYamlLoading] = useState(false);
  const [yamlError, setYamlError] = useState(null);
  const [owner, setOwner] = useState(OWNER);
  const [repo, setRepo] = useState(REPO);
  const [headerLoading, setHeaderLoading] = useState(false);
  const [headerError, setHeaderError] = useState(null);
  const [vibeOpen, setVibeOpen] = useState(false);
  const [vibeLoading, setVibeLoading] = useState(false);
  const [vibeError, setVibeError] = useState(null);
  const [vibeMarkdown, setVibeMarkdown] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Repository not found");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleFileClick = (filePath) => {
    setSelectedFile(filePath);
  };

  const handleExportYaml = async () => {
    setYamlLoading(true);
    setYamlError(null);
    try {
      const res = await fetch(
        `http://localhost:8000/repo/${OWNER}/${REPO}/yaml-context`,
        { headers: { Accept: "text/yaml" } }
      );
      if (!res.ok) throw new Error("Failed to fetch YAML context");
      const yaml = await res.text();
      const blob = new Blob([yaml], { type: "text/yaml" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${REPO}-context.yaml`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setYamlLoading(false);
    } catch (err) {
      setYamlError(err.message);
      setYamlLoading(false);
    }
  };

  const handleRepoLoad = async (newOwner, newRepo) => {
    setHeaderLoading(true);
    setHeaderError(null);
    try {
      // Test endpoints to validate repo
      const metaRes = await fetch(`http://localhost:8000/repo/${newOwner}/${newRepo}/metadata`);
      if (!metaRes.ok) throw new Error("Repository not found or inaccessible");
      // If valid, update state and trigger all data reloads
      setOwner(newOwner);
      setRepo(newRepo);
      setSelectedFile("");
      setHeaderLoading(false);
    } catch (err) {
      setHeaderError(err.message);
      setHeaderLoading(false);
    }
  };

  const handleOpenVibe = async () => {
    setVibeOpen(true);
    setVibeLoading(true);
    setVibeError(null);
    setVibeMarkdown("");
    try {
      const res = await fetch(`http://localhost:8000/repo/${owner}/${repo}/vibe`);
      if (!res.ok) throw new Error("Failed to fetch Repo Vibe summary");
      const md = await res.text();
      setVibeMarkdown(md);
      setVibeLoading(false);
    } catch (err) {
      setVibeError(err.message);
      setVibeLoading(false);
    }
  };

  const handleCloseVibe = () => {
    setVibeOpen(false);
    setVibeMarkdown("");
    setVibeError(null);
    setVibeLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onRepoLoad={handleRepoLoad} loading={headerLoading} error={headerError} />
      <div className="flex flex-1">
        <Sidebar onFileClick={handleFileClick} owner={owner} repo={repo} />
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Code Navigator</h1>
          <p className="text-lg text-gray-600 mb-8">Easily navigate GitHub repositories.</p>
          <div className="flex items-center space-x-4 mb-6">
            <button
              className="px-5 py-2 bg-blue-700 text-white font-semibold rounded-lg shadow-md border border-blue-800 hover:bg-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
              onClick={() => setShowTree(true)}
              disabled={false}
            >
              Visualize Repo Structure
            </button>
            <button
              className="px-5 py-2 bg-green-700 text-white font-semibold rounded-lg shadow-md border border-green-800 hover:bg-green-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-150 disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
              onClick={handleExportYaml}
              disabled={yamlLoading}
            >
              {yamlLoading ? "Exporting YAML..." : "Export YAML Context"}
            </button>
            <button
              className="px-5 py-2 bg-purple-700 text-white font-semibold rounded-lg shadow-md border border-purple-800 hover:bg-purple-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-150 flex items-center disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
              onClick={handleOpenVibe}
              disabled={false}
            >
              <span className="mr-2">📖</span> View Repo Vibe
            </button>
          </div>
          {yamlError && <div className="text-red-500 mb-4">{yamlError}</div>}
          {showTree && <RepoTreeView onClose={() => setShowTree(false)} />}
          <div className="w-full max-w-xl bg-white rounded-lg shadow p-6 mb-8">
            {loading && <p className="text-gray-400">Loading repository data...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {data && (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Repository: <span className="font-mono">{data.owner}/{data.repo_name}</span>
                </h2>
                <p className="text-gray-700 mb-2">{data.description || "No description provided."}</p>
                <p className="text-gray-600 mb-2">Language: <span className="font-semibold">{data.language || "N/A"}</span></p>
                <div className="flex items-center space-x-4 mb-2">
                  <span className="text-yellow-500">⭐ {data.stars}</span>
                  <span className="text-pink-500">🍴 {data.forks}</span>
                  <span className="text-blue-500">❗{data.open_issues}</span>
                </div>
                <a
                  href={data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-600 hover:underline font-medium"
                >
                  View on GitHub
                </a>
              </>
            )}
          </div>
          <div className="w-full max-w-3xl flex-1">
            <CodeViewer filePath={selectedFile} owner={owner} repo={repo} />
          </div>
          {vibeOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 relative flex flex-col border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-bold flex items-center"><span className="mr-2">📝</span>Repo Vibe</span>
                  <button
                    className="text-gray-400 hover:text-gray-700 text-2xl font-bold bg-white bg-opacity-80 rounded-full w-9 h-9 flex items-center justify-center shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={handleCloseVibe}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[60vh]">
                  {vibeLoading && <div className="text-gray-400 py-8 text-center">Loading Repo Vibe…</div>}
                  {vibeError && <div className="text-red-500 py-8 text-center">{vibeError}</div>}
                  {!vibeLoading && !vibeError && typeof vibeMarkdown === "string" && vibeMarkdown.trim() !== "" ? (
                    (() => {
                      try {
                        return (
                          <div className="prose max-w-none">
                            <ReactMarkdown>{vibeMarkdown}</ReactMarkdown>
                          </div>
                        );
                      } catch (err) {
                        return <div className="text-red-500">Error rendering markdown.</div>;
                      }
                    })()
                  ) : (!vibeLoading && !vibeError && (
                    <div className="text-gray-400 py-8 text-center">No summary available.</div>
                  ))}
                </div>
                <button
                  className="mt-8 px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-medium self-end shadow"
                  onClick={handleCloseVibe}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 