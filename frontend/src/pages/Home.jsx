import React, { useEffect, useState, useRef } from "react";
// import Sidebar from "../components/Sidebar"; // Remove Sidebar import
import CodeViewer from "../components/CodeViewer";
import Header from "../components/Header";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

// const OWNER = "dock108"; // Default owner removed
// const REPO = "code-navigator"; // Default repo removed
// const API_URL = `http://localhost:8000/repo/${OWNER}/${REPO}/metadata`; // Default API_URL removed

export default function Home() {
  const [data, setData] = useState(null); // Repo metadata
  const [loading, setLoading] = useState(false); // General loading for initial repo metadata (not Vibe)
  const [error, setError] = useState(null); // General error for initial repo metadata
  const [selectedFile, setSelectedFile] = useState("");
  const [showTree, setShowTree] = useState(false);
  const [yamlLoading, setYamlLoading] = useState(false);
  const [yamlError, setYamlError] = useState(null);
  const [owner, setOwner] = useState(""); // Init with empty owner
  const [repo, setRepo] = useState(""); // Init with empty repo
  const [headerLoading, setHeaderLoading] = useState(false);
  const [headerError, setHeaderError] = useState(null);

  // States for VIBE.md display in main content area
  const [mainVibeMarkdown, setMainVibeMarkdown] = useState("");
  const [mainVibeLoading, setMainVibeLoading] = useState(false);
  const [mainVibeError, setMainVibeError] = useState(null);

  // Add a ref to cache Vibe overviews by owner/repo
  const vibeCache = useRef({}); // { 'owner/repo': markdown }

  // useEffect(() => { // Removed initial metadata fetch for default repo
  //   setLoading(true);
  //   setError(null);
  //   fetch(API_URL)
  //     .then((res) => {
  //       if (!res.ok) throw new Error("Repository not found");
  //       return res.json();
  //     })
  //     .then((json) => {
  //       setData(json);
  //       setLoading(false);
  //     })
  //     .catch((err) => {
  //       setError(err.message);
  //       setLoading(false);
  //     });
  // }, []);

  const handleFileClick = (filePath) => {
    setSelectedFile(filePath);
    // setMainVibeMarkdown(""); // Keep Vibe in background, CodeViewer will overlay it
  };

  const handleExportYaml = async () => {
    if (!owner || !repo) return; // Ensure repo is loaded
    setYamlLoading(true);
    setYamlError(null);
    try {
      const res = await fetch(
        `http://localhost:8000/repo/${owner}/${repo}/yaml-context`,
        { headers: { Accept: "text/yaml" } }
      );
      if (!res.ok) throw new Error("Failed to fetch YAML context");
      const yaml = await res.text();
      const blob = new Blob([yaml], { type: "text/yaml" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${repo}-context.yaml`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setYamlError(err.message);
    } finally {
      setYamlLoading(false);
    }
  };

  const fetchRepoVibe = async (currentOwner, currentRepo) => {
    setMainVibeLoading(true);
    setMainVibeError(null);
    setMainVibeMarkdown("");
    setSelectedFile(""); // Ensure Vibe is shown, not a file
    const cacheKey = `${currentOwner}/${currentRepo}`;
    if (vibeCache.current[cacheKey]) {
      setMainVibeMarkdown(vibeCache.current[cacheKey]);
      setMainVibeLoading(false);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/repo/${currentOwner}/${currentRepo}/vibe`);
      if (!res.ok) throw new Error(`Failed to fetch Repo Vibe summary (status: ${res.status})`);
      const md = await res.text();
      setMainVibeMarkdown(md);
      vibeCache.current[cacheKey] = md; // Cache it
    } catch (err) {
      setMainVibeError(err.message);
    } finally {
      setMainVibeLoading(false);
    }
  };

  const handleRepoLoad = async (newOwner, newRepo) => {
    setHeaderLoading(true);
    setHeaderError(null);
    setData(null); // Clear previous repo data
    setMainVibeMarkdown(""); // Clear previous vibe
    setMainVibeError(null);
    setSelectedFile(""); // Clear selected file
    // Clear cache for new repo
    // (optional: clear all, or just let it grow if you want multi-repo cache)
    // vibeCache.current = {}; // Uncomment to clear all cache on repo change
    try {
      const metaRes = await fetch(`http://localhost:8000/repo/${newOwner}/${newRepo}/metadata`);
      if (!metaRes.ok) throw new Error(`Repository not found or inaccessible (status: ${metaRes.status})`);
      const metaData = await metaRes.json();
      setData(metaData);
      setOwner(newOwner);
      setRepo(newRepo);
      setError(null); // Clear previous general error
      // After metadata is loaded, fetch the Vibe
      await fetchRepoVibe(newOwner, newRepo);
    } catch (err) {
      setHeaderError(err.message); // Error from header load (metadata)
      setData(null);
      setOwner("");
      setRepo("");
    } finally {
      setHeaderLoading(false);
    }
  };

  // Button to re-show Vibe in main content area
  const handleShowRepoVibeMain = () => {
    if (owner && repo) {
      fetchRepoVibe(owner, repo); // This also clears selectedFile
    }
  };

  const renderMainContent = () => {
    if (!owner || !repo) {
      return (
        <div className="text-center text-gray-500 py-10 px-4">
          <p className="text-2xl font-semibold mb-2">Welcome to Code Navigator!</p>
          <p className="text-lg">Please enter a GitHub repository (e.g., <code className="bg-gray-200 text-gray-700 px-1 py-0.5 rounded">owner/repo</code>) in the header to get started.</p>
        </div>
      );
    }
    if (headerLoading) {
        return <div className="text-gray-500 py-10 text-center animate-pulse text-lg">Loading repository data...</div>;
    }
    if (headerError) {
        return <div className="text-red-600 py-10 text-center text-lg">Error loading repository: {headerError}</div>;
    }
    if (selectedFile) {
      return <CodeViewer filePath={selectedFile} owner={owner} repo={repo} />;
    }
    if (mainVibeLoading) {
      return <div className="text-gray-500 py-10 text-center animate-pulse text-lg">Generating Repo Overview...</div>;
    }
    if (mainVibeError) {
      return <div className="text-red-600 py-10 text-center text-lg">Error loading Repo Overview: {mainVibeError}</div>;
    }
    if (mainVibeMarkdown) {
      return (
        <div className="p-6 bg-white rounded-lg shadow-lg 
                        prose prose-lg prose-slate 
                        dark:prose-invert 
                        prose-headings:font-semibold prose-headings:tracking-tight 
                        prose-h1:text-4xl prose-h1:mb-4 
                        prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-3 
                        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-2
                        prose-p:leading-relaxed 
                        prose-a:text-blue-600 hover:prose-a:text-blue-500
                        prose-ul:list-disc prose-ul:pl-5 prose-li:my-1
                        prose-ol:list-decimal prose-ol:pl-5 prose-li:my-1
                        prose-code:bg-gray-100 prose-code:p-1 prose-code:rounded prose-code:text-sm
                        prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic
                        max-w-none overflow-y-auto max-h-[calc(100vh-250px)] border border-gray-200">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{mainVibeMarkdown}</ReactMarkdown>
        </div>
      );
    }
    return <div className="text-gray-500 py-10 text-center text-lg">Select a file or click "Show Repo Overview" to get started.</div>;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800">
      <Header onRepoLoad={handleRepoLoad} loading={headerLoading} error={headerError} />
      <div className="flex flex-1 overflow-hidden">
        {/* Remove Sidebar here */}
        <main className="flex-1 flex flex-col p-6 bg-gray-50 overflow-y-auto">
          {data && (
            <>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                {data.owner}/{data.repo_name}
              </h1>
              <p className="text-md text-gray-600 mb-4 italic">{data.description || "No description available."}</p>
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
                <button
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:opacity-50"
                  onClick={handleExportYaml}
                  disabled={!owner || !repo || yamlLoading || headerLoading}
                >
                  {yamlLoading ? "Exporting YAML..." : "Export YAML Context"}
                </button>
                <button
                  className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition flex items-center disabled:opacity-50"
                  onClick={handleShowRepoVibeMain} 
                  disabled={!owner || !repo || headerLoading || mainVibeLoading} 
                >
                  <span className="mr-1.5">📖</span> Show Repo Overview
                </button>
              </div>
              {yamlError && <div className="text-red-500 mb-4 py-2 px-3 bg-red-50 rounded border border-red-200 text-sm">{yamlError}</div>}
            </>
          )}
          <div className="flex-1 w-full max-w-full bg-white shadow-inner rounded-lg p-1 overflow-hidden">
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  );
} 