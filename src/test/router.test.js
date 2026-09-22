import { describe, it, expect, beforeEach } from 'vitest';
import { CampusRouter } from '../router.js';

describe('CampusRouter', () => {
  const sampleRoads = [
    {
      id: 'road-1',
      weight: 1,
      segments: [
        [
          [105.842, 21.004],
          [105.843, 21.004],
          [105.844, 21.004],
        ],
      ],
    },
    {
      id: 'road-2',
      weight: 1.5,
      segments: [
        [
          [105.844, 21.004],
          [105.844, 21.006],
        ],
      ],
    },
  ];

  let router;

  beforeEach(() => {
    router = new CampusRouter(sampleRoads);
  });

  describe('Coordinate parsing & formatting', () => {
    it('correctly creates and parses coordinate keys', () => {
      const key = router.coordKey(105.8421234, 21.0045678);
      expect(key).toBe('105.842123,21.004568');

      const parsed = router.parseKey('105.842123,21.004568');
      expect(parsed[0]).toBeCloseTo(105.842123);
      expect(parsed[1]).toBeCloseTo(21.004568);
    });

    it('calculates geographic distance accurately', () => {
      const p1 = [105.842, 21.004];
      const p2 = [105.843, 21.004];
      const dist = router.distance(p1, p2);
      expect(dist).toBeGreaterThan(90);
      expect(dist).toBeLessThan(120);
    });
  });

  describe('Graph Construction', () => {
    it('populates adjacency graph from road segments', () => {
      expect(router.graph.size).toBe(4);
      const startKey = router.coordKey(105.842, 21.004);
      expect(router.graph.has(startKey)).toBe(true);

      const neighbors = router.graph.get(startKey);
      expect(neighbors.size).toBe(1);
    });

    it('identifies main connected component', () => {
      expect(router.mainComponentNodes.size).toBeGreaterThan(0);
      const nodeKey = router.coordKey(105.843, 21.004);
      expect(router.mainComponentNodes.has(nodeKey)).toBe(true);
    });
  });

  describe('Snapping to nearest road node', () => {
    it('snaps arbitrary coordinate to nearest node in graph', () => {
      const snapped = router.snapToNearestNode(105.84201, 21.00401);
      expect(snapped).toBe(router.coordKey(105.842, 21.004));
    });
  });

  describe('Route finding with A*', () => {
    it('returns direct path if start and end are identical', () => {
      const point = [105.842, 21.004];
      const route = router.findRoute(point, point, 80);

      expect(route).toBeDefined();
      expect(route.distanceM).toBe(0);
      expect(route.timeMins).toBe(1);
      expect(route.path.length).toBe(2);
    });

    it('finds valid route between two points on the network', () => {
      const start = [105.842, 21.004];
      const end = [105.844, 21.006];
      const route = router.findRoute(start, end, 80);

      expect(route).toBeDefined();
      expect(route.path.length).toBeGreaterThanOrEqual(2);
      expect(route.distanceM).toBeGreaterThan(0);
      expect(route.timeMins).toBeGreaterThanOrEqual(1);

      // Path should begin at start and end at target
      expect(route.path[0]).toEqual(start);
      expect(route.path[route.path.length - 1]).toEqual(end);
    });

    it('returns null if start or end coordinates are invalid', () => {
      expect(router.findRoute(null, [105.842, 21.004])).toBeNull();
      expect(router.findRoute([105.842, 21.004], null)).toBeNull();
    });

    it('handles empty roads without throwing', () => {
      const emptyRouter = new CampusRouter([]);
      const route = emptyRouter.findRoute([105.842, 21.004], [105.844, 21.006]);
      expect(route).toBeNull();
    });
  });
});
