import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { API_BASE } from '../config';

function LineChart({ data, title, color, xLabel = 'Depth', yLabel = 'Value' }) {
    const containerRef = useRef();
    const svgRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Responsive width
        const containerWidth = containerRef.current?.clientWidth || 360;
        const width = Math.max(280, containerWidth - 32);
        const height = 240;
        const margin = { top: 24, right: 20, bottom: 40, left: 50 };

        svg.attr('width', width).attr('height', height);

        const x = d3
            .scaleLinear()
            .domain(d3.extent(data, (d) => d.x))
            .range([margin.left, width - margin.right]);

        const yExtent = d3.extent(data, (d) => d.y);
        let yMin = yExtent[0];
        let yMax = yExtent[1];
        if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) {
            yMin = 0;
            yMax = 1;
        }

        if (yMin === yMax) {
            const pad = Math.abs(yMin) > 0 ? Math.abs(yMin) * 0.05 : 1;
            yMin -= pad;
            yMax += pad;
        }
        const y = d3
            .scaleLinear()
            .domain([yMin, yMax])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const line = d3
            .line()
            .x((d) => x(d.x))
            .y((d) => y(d.y))
            .curve(d3.curveMonotoneX);

        // Gridlines
        const yGrid = d3.axisLeft(y)
            .tickSize(-(width - margin.left - margin.right))
            .tickFormat('');
        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .attr('class', 'grid')
            .call(yGrid)
            .selectAll('line')
            .attr('stroke', 'rgba(139,161,183,0.08)');
        svg.selectAll('.grid path').remove();

        const xAxis = svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(6));
        xAxis.selectAll('text').attr('fill', '#8ba1b7').style('font-size', '10px');
        xAxis.selectAll('line').attr('stroke', 'rgba(139,161,183,0.2)');
        xAxis.selectAll('path').attr('stroke', 'rgba(139,161,183,0.2)');

        const yAxis = svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(5));
        yAxis.selectAll('text').attr('fill', '#8ba1b7').style('font-size', '10px');
        yAxis.selectAll('line').attr('stroke', 'rgba(139,161,183,0.15)');
        yAxis.selectAll('path').attr('stroke', 'rgba(139,161,183,0.15)');

        // Area fill
        const area = d3.area()
            .x(d => x(d.x))
            .y0(height - margin.bottom)
            .y1(d => y(d.y))
            .curve(d3.curveMonotoneX);

        const grad = svg.append('defs').append('linearGradient')
            .attr('id', `area-${title.replace(/\s+/g, '')}`)
            .attr('x1', '0').attr('y1', '0')
            .attr('x2', '0').attr('y2', '1');
        grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.15);
        grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0);

        svg.append('path')
            .datum(data)
            .attr('fill', `url(#area-${title.replace(/\s+/g, '')})`)
            .attr('d', area);

        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 1.5)
            .attr('d', line);

        // Hover interaction
        const focus = svg.append('g').style('display', 'none');
        focus.append('circle')
            .attr('r', 3.5)
            .attr('fill', color)
            .attr('stroke', '#0a1e30')
            .attr('stroke-width', 2);
        const focusText = focus.append('text')
            .attr('x', 8)
            .attr('dy', '-0.8em')
            .attr('fill', '#cfe8ff')
            .style('font-size', '10px')
            .style('font-family', 'Inter, sans-serif');

        const bisect = d3.bisector(d => d.x).center;
        function moved(event) {
            const [mx] = d3.pointer(event);
            const dx = x.invert(mx);
            const i = bisect(data, dx);
            const d = data[Math.max(0, Math.min(data.length - 1, i))];
            const px = x(d.x);
            const py = y(d.y);
            focus.attr('transform', `translate(${px},${py})`);
            focusText.text(`${d.x.toFixed(1)}, ${d.y.toFixed(2)}`);
        }

        svg.append('rect')
            .attr('fill', 'transparent')
            .attr('pointer-events', 'all')
            .attr('x', margin.left)
            .attr('y', margin.top)
            .attr('width', width - margin.left - margin.right)
            .attr('height', height - margin.top - margin.bottom)
            .on('mouseenter', () => focus.style('display', null))
            .on('mousemove', moved)
            .on('mouseleave', () => focus.style('display', 'none'));

        // Axis labels
        svg.append('text')
            .attr('x', (width) / 2)
            .attr('y', height - 6)
            .attr('text-anchor', 'middle')
            .attr('fill', '#8ba1b7')
            .style('font-size', '10px')
            .style('font-family', 'Inter, sans-serif')
            .text(xLabel);
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -(height / 2))
            .attr('y', 14)
            .attr('text-anchor', 'middle')
            .attr('fill', '#8ba1b7')
            .style('font-size', '10px')
            .style('font-family', 'Inter, sans-serif')
            .text(yLabel);
    }, [data]);

    return (
        <div ref={containerRef} className="card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">{title}</h3>
            <div className="overflow-x-auto">
                <svg ref={svgRef} className="w-full" style={{ minWidth: 280 }}></svg>
            </div>
        </div>
    );
}

function Dashboard() {
    const [allRecords, setAllRecords] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const [lat, setLat] = useState(0);
    const [lon, setLon] = useState(0);
    const [rangeDeg, setRangeDeg] = useState(''); // radius in degrees (great-circle); empty means no filter

    // Initial load: everything
    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/everything`);
                const data = await res.json();
                const arr = Array.isArray(data) ? data : [];
                setAllRecords(arr);
                setRecords(arr);
            } catch (e) {
                setError(e.message || 'Failed to load');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // When filters are finite, fetch from backend /profiles; else show baseline
    useEffect(() => {
        const rangeNum = typeof rangeDeg === 'string' ? parseFloat(rangeDeg) : rangeDeg;
        const hasFinite = Number.isFinite(lat) && Number.isFinite(lon) && Number.isFinite(rangeNum);
        if (!hasFinite) {
            setRecords(allRecords);
            return;
        }
        let aborted = false;
        async function fetchProfiles() {
            try {
                setLoading(true);
                const url = new URL(`${API_BASE}/profiles`);
                url.searchParams.set('lat', String(lat));
                url.searchParams.set('lon', String(lon));
                url.searchParams.set('rangeDeg', String(rangeNum));
                const res = await fetch(url.toString());
                const data = await res.json();
                if (!aborted) setRecords(Array.isArray(data) ? data : []);
            } catch (e) {
                if (!aborted) setError(e.message || 'Failed to load filtered data');
            } finally {
                if (!aborted) setLoading(false);
            }
        }
        fetchProfiles();
        return () => { aborted = true; };
    }, [lat, lon, rangeDeg, allRecords]);

    // Angular (great-circle) distance in degrees between two lat/lon points
    function angularDistanceDeg(lat1, lon1, lat2, lon2) {
        const toRad = (d) => (d * Math.PI) / 180;
        const toDeg = (r) => (r * 180) / Math.PI;
        const φ1 = toRad(lat1);
        const φ2 = toRad(lat2);
        const Δλ = toRad(lon2 - lon1);
        const cosd = Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ);
        // numerical safety
        const d = Math.acos(Math.min(1, Math.max(-1, cosd)));
        return toDeg(d);
    }

    // No client-side distance filter anymore; use records as-is
    const filtered = records;

    const total = records.length;
    const avgTemp = records.reduce((s, r) => s + (Number(r.temperature) || 0), 0) / (total || 1);
    const avgSal = records.reduce((s, r) => s + (Number(r.salinity) || 0), 0) / (total || 1);
    const maxDepth = records.reduce((m, r) => Math.max(m, Number(r.depth) || 0), 0);
    const uniqueLocations = new Set(records.map(r => `${r.latitude?.toFixed?.(2)},${r.longitude?.toFixed?.(2)}`)).size;

    // Build series from filtered data: x = depth, y = metric
    function buildSeries(metricKey) {
        const pts = filtered
            .map(r => ({
                x: Number(r.depth),
                y: Number(r[metricKey])
            }))
            .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
        // Sort by depth ascending
        pts.sort((a, b) => a.x - b.x);
        return pts;
    }

    const tempData = useMemo(() => buildSeries('temperature'), [filtered]);
    const salData = useMemo(() => buildSeries('salinity'), [filtered]);
    const oxyData = useMemo(() => buildSeries('oxygen'), [filtered]);

    // Debug sizes (visible in browser console)
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.log('Series sizes -> temp:', tempData.length, 'sal:', salData.length, 'oxy:', oxyData.length, 'filtered:', filtered.length);
    }, [tempData, salData, oxyData, filtered]);

    return (
        <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row md:items-end gap-3">
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-white mb-3">Filter by Location</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-[11px] text-white/50 font-medium uppercase tracking-wider mb-1 block">Latitude</label>
                                <input
                                    type="number" step="0.01" value={lat}
                                    onChange={(e) => setLat(parseFloat(e.target.value))}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] text-white/50 font-medium uppercase tracking-wider mb-1 block">Longitude</label>
                                <input
                                    type="number" step="0.01" value={lon}
                                    onChange={(e) => setLon(parseFloat(e.target.value))}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] text-white/50 font-medium uppercase tracking-wider mb-1 block">Range (°)</label>
                                <input
                                    type="number" step="0.1" min="0"
                                    placeholder="No filter"
                                    value={rangeDeg}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (v === '') setRangeDeg('');
                                        else setRangeDeg(parseFloat(v));
                                    }}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="text-sm text-white/50 pb-1">
                        Matching: <span className="text-[var(--accent)] font-semibold">{filtered.length}</span> records
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="stat-card">
                    <p className="text-[11px] text-white/45 uppercase tracking-wider font-medium">Records</p>
                    <p className="text-2xl font-bold text-white mt-1">{total || 0}</p>
                </div>
                <div className="stat-card">
                    <p className="text-[11px] text-white/45 uppercase tracking-wider font-medium">Avg Temperature</p>
                    <p className="text-2xl font-bold text-white mt-1">{avgTemp.toFixed(2)} <span className="text-sm text-white/40">°C</span></p>
                </div>
                <div className="stat-card">
                    <p className="text-[11px] text-white/45 uppercase tracking-wider font-medium">Avg Salinity</p>
                    <p className="text-2xl font-bold text-white mt-1">{avgSal.toFixed(2)} <span className="text-sm text-white/40">PSU</span></p>
                </div>
                <div className="stat-card">
                    <p className="text-[11px] text-white/45 uppercase tracking-wider font-medium">Max Depth</p>
                    <p className="text-2xl font-bold text-white mt-1">{maxDepth.toFixed(0)} <span className="text-sm text-white/40">m</span></p>
                </div>
            </div>

            {error && <div className="card p-3 text-red-400/80 text-sm">Error: {error}</div>}

            {loading && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="stat-card animate-pulse">
                                <div className="h-2.5 w-20 bg-white/8 rounded mb-2.5" />
                                <div className="h-6 w-28 bg-white/8 rounded" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="card p-5 animate-pulse">
                                <div className="h-3 w-36 bg-white/8 rounded mb-4" />
                                <div className="h-[240px] w-full bg-white/3 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tempData.length > 0 ? (
                    <LineChart title="Temperature vs Depth" data={tempData} color="#22d3ee" xLabel="Depth" yLabel="Temperature (°C)" />
                ) : (
                    <div className="card p-5 flex items-center justify-center min-h-[240px] text-sm text-white/40">No temperature data</div>
                )}
                {salData.length > 0 ? (
                    <LineChart title="Salinity vs Depth" data={salData} color="#fb923c" xLabel="Depth" yLabel="Salinity (PSU)" />
                ) : (
                    <div className="card p-5 flex items-center justify-center min-h-[240px] text-sm text-white/40">No salinity data</div>
                )}
                {oxyData.length > 0 ? (
                    <LineChart title="Oxygen vs Depth" data={oxyData} color="#a3e635" xLabel="Depth" yLabel="Oxygen" />
                ) : (
                    <div className="card p-5 flex items-center justify-center min-h-[240px] text-sm text-white/40">No oxygen data</div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
