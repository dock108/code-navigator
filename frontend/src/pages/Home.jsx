import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CodeViewer from "../components/CodeViewer";
import RepoTreeView from "../components/RepoTreeView";

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onFileClick={handleFileClick} />
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Code Navigator</h1>
        <p className="text-lg text-gray-600 mb-8">Easily navigate GitHub repositories.</p>
        <div className="flex items-center space-x-4 mb-6">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => setShowTree(true)}
          >
            Visualize Repo Structure
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            onClick={handleExportYaml}
            disabled={yamlLoading}
          >
            {yamlLoading ? "Exporting YAML..." : "Export YAML Context"}
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
          <CodeViewer filePath={selectedFile} />
        </div>
      </main>
    </div>
  );
} 