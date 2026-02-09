import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AppLayout from "../components/AppLayout";
import ReactFlow, {
  Background,
  Controls,
} from "reactflow";

import "reactflow/dist/style.css";
import { fetchWarehouses } from "../api/warehouseApi";
import { fetchOptimalRoute } from "../api/routingApi";

function Routing() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGraph() {
      try {
        const warehouses = await fetchWarehouses();
        const route = await fetchOptimalRoute();

        // Map warehouses to nodes
        const mappedNodes = warehouses.map(
          (w, index) => ({
            id: w.id.toString(),
            data: { label: w.name },
            position: {
              x: 150 + index * 200,
              y: 150 + (index % 2) * 150,
            },
          })
        );

        // Build a set of optimal edges for fast lookup
        const optimalEdgeSet = new Set(
          route.edges.map(
            (e) => `${e.from}-${e.to}`
          )
        );

        // Create edges for all possible connections
        const mappedEdges = route.edges.map(
          (e, index) => {
            const isOptimal =
              optimalEdgeSet.has(
                `${e.from}-${e.to}`
              );

            return {
              id: `e-${index}`,
              source: e.from.toString(),
              target: e.to.toString(),
              label: `${e.distance} km`,
              style: {
                stroke: isOptimal
                  ? "#22c55e"
                  : "#94a3b8",
                strokeWidth: isOptimal ? 4 : 2,
              },
              animated: isOptimal,
            };
          }
        );

        setNodes(mappedNodes);
        setEdges(mappedEdges);
      } catch (err) {
        console.error(
          "Failed to load routing data",
          err
        );
      } finally {
        setLoading(false);
      }
    }

    loadGraph();
  }, []);

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">
        Route Optimization (Dijkstra)
      </h1>

      <div className="bg-white rounded-xl shadow p-4 h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        )}
      </div>

      <div className="mt-6 bg-green-50 p-4 rounded-lg text-sm text-green-700">
        The highlighted route represents the shortest path
        computed by Dijkstra’s Algorithm on the backend,
        considering distance, inventory availability, and
        vehicle constraints.
      </div>
    </AppLayout>
  );
}

export default Routing;
