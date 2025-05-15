import React, { useEffect, useState, useRef } from "react";
import Tree from "react-d3-tree";

const OWNER = "dock108";
const REPO = "code-navigator";
const API_URL = `http://localhost:8000/repo/${OWNER}/${REPO}/structure-visualization`;

function convertToTreeData(structure) {
  // Wrap the structure in a single root node for react-d3-tree
  return {
    name: "repo",
    children: structure.map((node) => {
      if (node.type === "directory") {
        return {
          name: `📁 ${node.name}`,
          children: convertToTreeData(node.children).children,
          _collapsed: false,
        };
      } else {
        return {
          name: `📄 ${node.name}`,
          children: [],
        };
      }
    }),
    _collapsed: false,
  };
}

export default function RepoTreeView({ onClose }) {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const treeContainerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load repo structure");
        return res.json();
      })
      .then((json) => {
        setTreeData(convertToTreeData(json.structure));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Measure container size for centering
  useEffect(() => {
    function updateSize() {
      if (treeContainerRef.current) {
        setDimensions({
          width: treeContainerRef.current.offsetWidth,
          height: treeContainerRef.current.offsetHeight,
        });
      }
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [treeContainerRef.current]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4">Repository Structure Visualization</h2>
        {loading && <p className="text-gray-400">Loading structure...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && treeData && (
          <div ref={treeContainerRef} style={{ width: "100%", height: "60vh" }}>
            <Tree
              data={treeData}
              orientation="vertical"
              collapsible
              zoomable
              separation={{ siblings: 1.5, nonSiblings: 2 }}
              translate={{ x: dimensions.width / 2, y: 50 }}
              styles={{
                nodes: {
                  node: {
                    circle: { fill: "#f3f4f6", stroke: "#3b82f6", strokeWidth: 2 },
                    name: { fontSize: "1rem", fontWeight: 500 },
                  },
                  leafNode: {
                    circle: { fill: "#f3f4f6", stroke: "#6b7280", strokeWidth: 2 },
                    name: { fontSize: "1rem", fontWeight: 400 },
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
} 