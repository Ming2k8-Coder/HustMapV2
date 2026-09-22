// Client-side A* Pathfinding Engine for HUST Campus
// Extracted and optimized from tkproboy-cmd/hustmapfinal road network

export class CampusRouter {
  constructor(roadsData) {
    this.roads = roadsData || [];
    this.graph = new Map(); // key: "lng,lat" -> Map(neighborKey: distanceInMeters)
    this.roadSegments = [];
    this.mainComponentNodes = new Set();
    this.buildGraph();
  }

  coordKey(lng, lat) {
    return `${lng.toFixed(6)},${lat.toFixed(6)}`;
  }

  parseKey(key) {
    const [lng, lat] = key.split(',').map(Number);
    return [lng, lat];
  }

  // Haversine distance in meters
  distance(p1, p2) {
    const dLat = (p2[1] - p1[1]) * 111139;
    const dLng = (p2[0] - p1[0]) * 111139 * Math.cos(((p1[1] + p2[1]) / 2) * Math.PI / 180);
    return Math.sqrt(dLat * dLat + dLng * dLng);
  }

  buildGraph() {
    this.graph.clear();
    this.roadSegments = [];

    const addEdge = (u, v, weight = 1) => {
      const ku = this.coordKey(u[0], u[1]);
      const kv = this.coordKey(v[0], v[1]);
      const d = this.distance(u, v) * weight;

      if (!this.graph.has(ku)) this.graph.set(ku, new Map());
      if (!this.graph.has(kv)) this.graph.set(kv, new Map());

      this.graph.get(ku).set(kv, d);
      this.graph.get(kv).set(ku, d);
    };

    this.roads.forEach((road) => {
      road.segments.forEach((line) => {
        this.roadSegments.push(line);
        for (let i = 0; i < line.length - 1; i++) {
          addEdge(line[i], line[i + 1], road.weight || 1);
        }
      });
    });

    // Determine connected components
    const visited = new Set();
    let largestComponent = [];

    for (const node of this.graph.keys()) {
      if (!visited.has(node)) {
        const comp = [];
        const queue = [node];
        visited.add(node);

        while (queue.length > 0) {
          const curr = queue.pop();
          comp.push(curr);
          const neighbors = this.graph.get(curr);
          if (neighbors) {
            for (const neighbor of neighbors.keys()) {
              if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
              }
            }
          }
        }

        if (comp.length > largestComponent.length) {
          largestComponent = comp;
        }
      }
    }

    this.mainComponentNodes = new Set(largestComponent);

    // Bridge isolated components to the closest node in mainComponent
    // to ensure complete connectivity across campus
    for (const node of this.graph.keys()) {
      if (!this.mainComponentNodes.has(node)) {
        const p1 = this.parseKey(node);
        let nearestMain = null;
        let minDist = Infinity;

        for (const mainNode of this.mainComponentNodes) {
          const p2 = this.parseKey(mainNode);
          const d = this.distance(p1, p2);
          if (d < minDist) {
            minDist = d;
            nearestMain = mainNode;
          }
        }

        // Bridge if reasonable distance (< 150m)
        if (nearestMain && minDist < 150) {
          const pMain = this.parseKey(nearestMain);
          addEdge(p1, pMain, 1.2);
          this.mainComponentNodes.add(node);
        }
      }
    }
  }

  // Snap any arbitrary [lng, lat] coordinate to the nearest road network node
  snapToNearestNode(lng, lat) {
    const clickPoint = [lng, lat];
    let nearestNodeKey = null;
    let minDist = Infinity;

    // Search against all nodes in main network
    for (const nodeKey of this.mainComponentNodes) {
      const p = this.parseKey(nodeKey);
      const d = this.distance(clickPoint, p);
      if (d < minDist) {
        minDist = d;
        nearestNodeKey = nodeKey;
      }
    }

    return nearestNodeKey;
  }

  // A* Shortest Path Search
  findRoute(startCoord, endCoord, speedMPerMin = 80) {
    if (!startCoord || !endCoord || this.graph.size === 0) {
      return null;
    }

    const startNode = this.snapToNearestNode(startCoord[0], startCoord[1]);
    const endNode = this.snapToNearestNode(endCoord[0], endCoord[1]);

    if (!startNode || !endNode) {
      return null;
    }

    if (startNode === endNode) {
      const d = this.distance(startCoord, endCoord);
      return {
        path: [startCoord, endCoord],
        distanceM: Math.round(d),
        timeMins: Math.max(1, Math.round(d / speedMPerMin)),
      };
    }

    // A* algorithm
    const endP = this.parseKey(endNode);
    const gScore = new Map(); // cost from start to node
    const fScore = new Map(); // estimated total cost
    const cameFrom = new Map();

    gScore.set(startNode, 0);
    fScore.set(startNode, this.distance(this.parseKey(startNode), endP));

    const openSet = new Set([startNode]);

    while (openSet.size > 0) {
      // Get node with lowest fScore
      let current = null;
      let lowestF = Infinity;
      for (const node of openSet) {
        const score = fScore.get(node) ?? Infinity;
        if (score < lowestF) {
          lowestF = score;
          current = node;
        }
      }

      if (current === endNode) {
        // Reconstruct path
        const path = [];
        let curr = endNode;
        while (curr) {
          path.unshift(this.parseKey(curr));
          curr = cameFrom.get(curr);
        }

        // Add start and end points for complete continuity
        path.unshift(startCoord);
        path.push(endCoord);

        // Calculate total distance in meters
        let totalDist = 0;
        for (let i = 0; i < path.length - 1; i++) {
          totalDist += this.distance(path[i], path[i + 1]);
        }

        return {
          path, // array of [lng, lat]
          distanceM: Math.round(totalDist),
          timeMins: Math.max(1, Math.round(totalDist / speedMPerMin)),
        };
      }

      openSet.delete(current);
      const currentG = gScore.get(current) ?? Infinity;
      const neighbors = this.graph.get(current);

      if (neighbors) {
        for (const [neighbor, edgeWeight] of neighbors.entries()) {
          const tentativeG = currentG + edgeWeight;
          const neighborG = gScore.get(neighbor) ?? Infinity;

          if (tentativeG < neighborG) {
            cameFrom.set(neighbor, current);
            gScore.set(neighbor, tentativeG);
            const h = this.distance(this.parseKey(neighbor), endP);
            fScore.set(neighbor, tentativeG + h);
            openSet.add(neighbor);
          }
        }
      }
    }

    // Fallback: direct line if no path found
    const directDist = this.distance(startCoord, endCoord);
    return {
      path: [startCoord, endCoord],
      distanceM: Math.round(directDist),
      timeMins: Math.max(1, Math.round(directDist / speedMPerMin)),
    };
  }
}
