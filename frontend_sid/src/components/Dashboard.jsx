import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { Activity, Thermometer, Droplets, Layers, SlidersHorizontal, TrendingUp } from 'lucide-react';
import { API_BASE } from '../config';

/* ─── Chart component ─── */
function LineChart({ data, title, color, accentColor, xLabel = 'Depth', yLabel = 'Value', icon }) {
    const containerRef = useRef();
    const svgRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const containerWidth = containerRef.current?.clientWidth || 360;
        const width = Math.max(280, containerWidth - 2);
        const height = 220;
        const margin = { top: 20, right: 16, bottom: 38, left: 48 };

        svg.attr('width', width).attr('height', height);

        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.x))
            .range([margin.left, width - margin.right]);

        const yExtent = d3.extent(data, d => d.y);
        let yMin = yExtent[0];
        let yMax = yExtent[1];
        if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) { yMin = 0; yMax = 1; }
        if (yMin === yMax) {
            const pad = Math.abs(yMin) > 0 ? Math.abs(yMin) * 0.05 : 1;
            yMin -= pad; yMax += pad;
        }

        const y = d3.scaleLinear()
            .domain([yMin, yMax])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const line = d3.line()
            .x(d => x(d.x))
            .y(d => y(d.y))
            .curve(d3.curveMonotoneX);

        // Subtle gridlines
        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).tickSize(-(width - margin.left - margin.right)).tickFormat(''))
            .selectAll('line')
            .attr('stroke', 'rgba(255,255,255,0.04)');
        svg.selectAll('.domain').remove();

        // X axis
        const xAxis = svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(5));
        xAxis.selectAll('text').attr('fill', 'rgba(232,244,253,0.35)').style('font-size', '9px').style('font-family', 'Inter, sans-serif');
        xAxis.selectAll('line').attr('stroke', 'rgba(255,255,255,0.06)');
        xAxis.selectAll('path').attr('stroke', 'rgba(255,255,255,0.06)');

        // Y axis
        const yAxis = svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(5));
        yAxis.selectAll('text').attr('fill', 'rgba(232,244,253,0.35)').style('font-size', '9px').style('font-family', 'Inter, sans-serif');
        yAxis.selectAll('line').attr('stroke', 'rgba(255,255,255,0.06)');
        yAxis.selectAll('path').attr('stroke', 'rgba(255,255,255,0.06)');

        // Gradient area fill
        const gradId = `area-${title.replace(/\s+/g, '')}`;
        const grad = svg.append('defs').append('linearGradient')
            .attr('id', gradId)
            .attr('x1', '0').attr('y1', '0')
            .attr('x2', '0').attr('y2', '1');
        grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.18);
        grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0);

        const area = d3.area()
            .x(d => x(d.x))
            .y0(height - margin.bottom)
            .y1(d => y(d.y))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(data)
            .attr('fill', `url(#${gradId})`)
            .attr('d', area);

        // Line
        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('d', line);

        // Hover interaction
        const focus = svg.append('g').style('display', 'none');
        focus.append('circle')
            .attr('r', 4.5)
            .attr('fill', color)
            .attr('stroke', '#040d18')
            .attr('stroke-width', 2.5);

        // Tooltip group
        const tooltip = focus.append('g');
        tooltip.append('rect')
            .attr('rx', 6).attr('ry', 6)
            .attr('fill', 'rgba(4, 14, 30, 0.92)')
            .attr('stroke', color)
            .attr('stroke-opacity', 0.3)
            .attr('stroke-width', 1)
            .attr('x', -4).attr('y', -32)
            .attr('width', 90).attr('height', 24);

        tooltip.append('text')
            .attr('x', 41).attr('y', -14)
            .attr('text-anchor', 'middle')
            .attr('fill', 'rgba(232,244,253,0.9)')
            .style('font-size', '10px')
            .style('font-family', 'Inter, sans-serif')
            .attr('class', 'tooltip-text');

        const bisect = d3.bisector(d => d.x).center;
        function moved(event) {
            const [mx] = d3.pointer(event);
            const dx = x.invert(mx);
            const i = bisect(data, dx);
            const d = data[Math.max(0, Math.min(data.length - 1, i))];
            const px = x(d.x);
            const py = y(d.y);
            focus.attr('transform', `translate(${px},${py})`);
            focus.select('.tooltip-text').text(`${d.x.toFixed(1)} → ${d.y.toFixed(2)}`);

            // Smart tooltip positioning
            const tooltipX = px > width - 100 ? -90 : -4;
            tooltip.select('rect').attr('x', tooltipX);
            tooltip.select('text').attr('x', tooltipX + 45);
        }

        svg.append('rect')
            .attr('fill', 'transparent')
            .attr('pointer-events', 'all')
            .attr('x', margin.left).attr('y', margin.top)
            .attr('width', width - margin.left - margin.right)
            .attr('height', height - margin.top - margin.bottom)
            .on('mouseenter', () => focus.style('display', null))
            .on('mousemove', moved)
            .on('mouseleave', () => focus.style('display', 'none'));

        // Axis labels
        svg.append('text')
            .attr('x', (width) / 2).attr('y', height - 4)
            .attr('text-anchor', 'middle')
            .attr('fill', 'rgba(232,244,253,0.3)')
            .style('font-size', '9px').style('font-family', 'Inter, sans-serif')
            .text(xLabel);

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -(height / 2)).attr('y', 12)
            .attr('text-anchor', 'middle')
            .attr('fill', 'rgba(232,244,253,0.3)')
            .style('font-size', '9px').style('font-family', 'Inter, sans-serif')
            .text(yLabel);

    }, [data]);

    return (
        <div ref={containerRef} className="card overflow-hidden">
            {/* Card header */}
            <div
                className="flex items-center gap-3 px-5 py-3.5"
                style={{ borderBottom: '1px solid rgba(0,212,255,0.07)' }}
            >
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}15`, border: `1px solid ${color}22` }}
                >
                    <span style={{ color }}>{icon}</span>
                </div>
                <h3
                    className="text-sm font-semibold text-white"
                    style={{ fontFamily: "'Space Grotesk', Inter, sans-serif" }}
                >
                    {title}
                </h3>
                <div className="ml-auto">
                    <TrendingUp size={13} style={{ color: `${color}70` }} />
                </div>
            </div>
            <div className="px-2 pt-2 pb-1 overflow-x-auto">
                <svg ref={svgRef} className="w-full" style={{ minWidth: 260 }} />
            </div>
        </div>
    );
}

/* ─── Stat card ─── */
function StatCard({ label, value, unit, icon, color = '#00d4ff' }) {
    return (
        <motion.div
            className="stat-card"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            <div className="flex items-start justify-between mb-4">
                <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(232,244,253,0.4)' }}>
                    {label}
                </p>
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}15`, border: `1px solid ${color}22` }}
                >
                    <span style={{ color }}>{icon}</span>
                </div>
            </div>
            <p
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', Inter, sans-serif" }}
            >
                {value}
                {unit && <span className="text-sm ml-1.5 font-normal" style={{ color: 'rgba(232,244,253,0.35)' }}>{unit}</span>}
            </p>
        </motion.div>
    );
}

/* ─── Dashboard ─── */
function Dashboard() {
    const [allRecords, setAllRecords] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [lat, setLat] = useState(0);
    const [lon, setLon] = useState(0);
    const [rangeDeg, setRangeDeg] = useState('');

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

    useEffect(() => {
        const rangeNum = typeof rangeDeg === 'string' ? parseFloat(rangeDeg) : rangeDeg;
        const hasFinite = Number.isFinite(lat) && Number.isFinite(lon) && Number.isFinite(rangeNum);
        if (!hasFinite) { setRecords(allRecords); return; }
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

    const filtered = records;
    const total = records.length;
    const avgTemp = records.reduce((s, r) => s + (Number(r.temperature) || 0), 0) / (total || 1);
    const avgSal = records.reduce((s, r) => s + (Number(r.salinity) || 0), 0) / (total || 1);
    const maxDepth = records.reduce((m, r) => Math.max(m, Number(r.depth) || 0), 0);

    function buildSeries(metricKey) {
        const pts = filtered
            .map(r => ({ x: Number(r.depth), y: Number(r[metricKey]) }))
            .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
        pts.sort((a, b) => a.x - b.x);
        return pts;
    }

    const tempData = useMemo(() => buildSeries('temperature'), [filtered]);
    const salData = useMemo(() => buildSeries('salinity'), [filtered]);
    const oxyData = useMemo(() => buildSeries('oxygen'), [filtered]);

    useEffect(() => {
        console.log('Series sizes -> temp:', tempData.length, 'sal:', salData.length, 'oxy:', oxyData.length);
    }, [tempData, salData, oxyData]);

    return (
        <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">

            {/* ── Filter Section ── */}
            <motion.div
                className="card p-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.18)' }}
                    >
                        <SlidersHorizontal size={14} style={{ color: '#00d4ff' }} />
                    </div>
                    <h3
                        className="text-sm font-semibold text-white"
                        style={{ fontFamily: "'Space Grotesk', Inter, sans-serif" }}
                    >
                        Filter by Location
                    </h3>
                    <div
                        className="ml-auto text-xs px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(0,212,255,0.08)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.15)' }}
                    >
                        {filtered.length} records
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Latitude', value: lat, onChange: e => setLat(parseFloat(e.target.value)), step: '0.01', type: 'number' },
                        { label: 'Longitude', value: lon, onChange: e => setLon(parseFloat(e.target.value)), step: '0.01', type: 'number' },
                        { label: 'Range (°)', value: rangeDeg, onChange: e => { const v = e.target.value; setRangeDeg(v === '' ? '' : parseFloat(v)); }, step: '0.1', placeholder: 'No filter', type: 'number' },
                    ].map(f => (
                        <div key={f.label}>
                            <label
                                className="block text-[10px] uppercase tracking-wider font-semibold mb-1.5"
                                style={{ color: 'rgba(232,244,253,0.4)' }}
                            >
                                {f.label}
                            </label>
                            <input
                                type={f.type}
                                step={f.step}
                                value={f.value}
                                onChange={f.onChange}
                                placeholder={f.placeholder}
                                min={f.min}
                                className="input-field"
                            />
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ── Stat Cards ── */}
            <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
            >
                <StatCard
                    label="Total Records"
                    value={loading ? '—' : total.toLocaleString()}
                    icon={<Activity size={14} />}
                    color="#00d4ff"
                />
                <StatCard
                    label="Avg Temperature"
                    value={loading ? '—' : avgTemp.toFixed(2)}
                    unit="°C"
                    icon={<Thermometer size={14} />}
                    color="#f97316"
                />
                <StatCard
                    label="Avg Salinity"
                    value={loading ? '—' : avgSal.toFixed(2)}
                    unit="PSU"
                    icon={<Droplets size={14} />}
                    color="#7c3aed"
                />
                <StatCard
                    label="Max Depth"
                    value={loading ? '—' : maxDepth.toFixed(0)}
                    unit="m"
                    icon={<Layers size={14} />}
                    color="#22c55e"
                />
            </motion.div>

            {error && (
                <div
                    className="px-4 py-3 rounded-xl text-sm"
                    style={{ color: 'rgba(248,113,113,0.9)', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
                >
                    Error: {error}
                </div>
            )}

            {/* ── Loading Skeleton ── */}
            {loading && (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="card p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="skeleton w-7 h-7 rounded-lg" />
                                <div className="skeleton h-3 w-32 rounded" />
                            </div>
                            <div className="skeleton w-full rounded" style={{ height: 220 }} />
                        </div>
                    ))}
                </motion.div>
            )}

            {/* ── Charts ── */}
            {!loading && (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.45 }}
                >
                    {tempData.length > 0 ? (
                        <LineChart
                            title="Temperature vs Depth"
                            data={tempData}
                            color="#f97316"
                            xLabel="Depth (m)"
                            yLabel="Temperature (°C)"
                            icon={<Thermometer size={14} />}
                        />
                    ) : (
                        <div className="card p-5 flex flex-col items-center justify-center min-h-[200px] gap-3">
                            <Thermometer size={24} style={{ color: 'rgba(232,244,253,0.2)' }} />
                            <p className="text-sm" style={{ color: 'rgba(232,244,253,0.3)' }}>No temperature data</p>
                        </div>
                    )}

                    {salData.length > 0 ? (
                        <LineChart
                            title="Salinity vs Depth"
                            data={salData}
                            color="#7c3aed"
                            xLabel="Depth (m)"
                            yLabel="Salinity (PSU)"
                            icon={<Droplets size={14} />}
                        />
                    ) : (
                        <div className="card p-5 flex flex-col items-center justify-center min-h-[200px] gap-3">
                            <Droplets size={24} style={{ color: 'rgba(232,244,253,0.2)' }} />
                            <p className="text-sm" style={{ color: 'rgba(232,244,253,0.3)' }}>No salinity data</p>
                        </div>
                    )}

                    {oxyData.length > 0 ? (
                        <LineChart
                            title="Oxygen vs Depth"
                            data={oxyData}
                            color="#22c55e"
                            xLabel="Depth (m)"
                            yLabel="Oxygen"
                            icon={<Activity size={14} />}
                        />
                    ) : (
                        <div className="card p-5 flex flex-col items-center justify-center min-h-[200px] gap-3">
                            <Activity size={24} style={{ color: 'rgba(232,244,253,0.2)' }} />
                            <p className="text-sm" style={{ color: 'rgba(232,244,253,0.3)' }}>No oxygen data</p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}

export default Dashboard;
