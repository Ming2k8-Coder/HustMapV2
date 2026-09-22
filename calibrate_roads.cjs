const https = require('https');
const fs = require('fs');

// Bounding box for HUST (Đại học Bách Khoa Hà Nội):
// [minLat, minLon, maxLat, maxLon]
const bbox = '20.9990,105.8390,21.0090,105.8520';

const overpassQuery = `[out:json][timeout:30];
(
  way["highway"](${bbox});
);
out body;
>;
out skel qt;`;

const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(overpassQuery);

console.log('Fetching OpenStreetMap road network for HUST campus...');

https.get(url, { headers: { 'User-Agent': 'HustMapV2/1.0 (contact@hustmap.com)' } }, (res) => {
  let raw = '';
  res.on('data', chunk => raw += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(raw);
      console.log('Total OSM elements:', data.elements?.length || 0);

      const nodesMap = new Map();
      const ways = [];

      for (const el of data.elements) {
        if (el.type === 'node') {
          nodesMap.set(el.id, [Number(el.lon.toFixed(6)), Number(el.lat.toFixed(6))]);
        } else if (el.type === 'way' && el.tags && el.tags.highway) {
          ways.push(el);
        }
      }

      console.log(`Parsed ${nodesMap.size} nodes and ${ways.length} road/footway ways.`);

      // Exclude expressways or non-pedestrian if any
      const ignoredHighwayTypes = new Set(['motorway', 'trunk']);

      function dist(p1, p2) {
        const dLat = (p2[1] - p1[1]) * 111139;
        const dLng = (p2[0] - p1[0]) * 111139 * Math.cos(((p1[1] + p2[1]) / 2) * Math.PI / 180);
        return Math.sqrt(dLat * dLat + dLng * dLng);
      }

      const formattedRoads = [];

      for (const way of ways) {
        const hType = way.tags.highway;
        if (ignoredHighwayTypes.has(hType)) continue;

        // Determine weight based on OSM highway type
        let weight = 1.0;
        if (hType === 'footway' || hType === 'pedestrian' || hType === 'path') {
          weight = 0.9; // Prefer pedestrian walkways inside campus
        } else if (hType === 'service' || hType === 'living_street') {
          weight = 1.0;
        } else if (hType === 'steps') {
          weight = 1.5; // Walking steps takes slightly more effort
        } else if (hType === 'primary' || hType === 'secondary') {
          weight = 1.1; // Exterior perimeter roads
        }

        const coords = [];
        for (const nodeId of way.nodes) {
          const pt = nodesMap.get(nodeId);
          if (pt) coords.push(pt);
        }

        if (coords.length >= 2) {
          let totalLen = 0;
          for (let i = 0; i < coords.length - 1; i++) {
            totalLen += dist(coords[i], coords[i + 1]);
          }

          formattedRoads.push({
            id: String(way.id),
            name: way.tags.name || (way.tags.highway === 'footway' ? 'Đường đi bộ' : 'Đường nội bộ'),
            lenM: Number(totalLen.toFixed(2)),
            weight,
            segments: [coords],
            highwayType: hType
          });
        }
      }

      console.log(`Successfully converted ${formattedRoads.length} OSM ways.`);

      // Verify connectivity: count unique intersection nodes
      const nodeOccurrences = new Map();
      for (const r of formattedRoads) {
        for (const line of r.segments) {
          for (const pt of line) {
            const key = `${pt[0]},${pt[1]}`;
            nodeOccurrences.set(key, (nodeOccurrences.get(key) || 0) + 1);
          }
        }
      }

      console.log(`Total unique nodes: ${nodeOccurrences.size}`);
      const intersections = Array.from(nodeOccurrences.values()).filter(c => c > 1).length;
      console.log(`Intersections (shared across 2+ roads): ${intersections}`);

      // Save formatted OSM roads
      fs.writeFileSync('public/campus_roads.json', JSON.stringify(formattedRoads, null, 2));
      console.log('Successfully saved calibrated road network to public/campus_roads.json!');

    } catch (e) {
      console.error('Error processing OSM data:', e.message);
      fs.writeFileSync('osm_error.log', raw.slice(0, 1000));
    }
  });
}).on('error', err => {
  console.error('Network request failed:', err.message);
});
