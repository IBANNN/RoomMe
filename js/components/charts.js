// Simple Chart Components (CSS/SVG based)
const Charts = {
  barChart(data, height = 200) {
    const max = Math.max(...data.map(d => d.value));
    return `
      <div class="bar-chart" style="height: ${height}px">
        ${data.map(d => `
          <div class="bar-chart-item">
            <div class="bar-chart-value">${d.value}</div>
            <div class="bar-chart-bar" style="height: ${(d.value / max) * 100}%"></div>
            <div class="bar-chart-label">${d.label}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  donutChart(segments, size = 160) {
    const total = segments.reduce((sum, s) => sum + s.value, 0);
    const circumference = 2 * Math.PI * 60;
    let offset = 0;

    const circles = segments.map(s => {
      const pct = s.value / total;
      const dashArray = pct * circumference;
      const circle = `<circle cx="80" cy="80" r="60" stroke="${s.color}" stroke-dasharray="${dashArray} ${circumference}" stroke-dashoffset="${-offset}" />`;
      offset += dashArray;
      return circle;
    });

    const legend = segments.map(s => `
      <div class="donut-chart-legend-item">
        <div class="donut-chart-legend-dot" style="background: ${s.color}"></div>
        <span>${s.label}: ${s.value}</span>
      </div>
    `).join('');

    return `
      <div class="donut-chart">
        <svg viewBox="0 0 160 160" width="${size}" height="${size}" style="transform: rotate(-90deg)">
          ${circles.join('')}
        </svg>
        <div class="donut-chart-legend">
          ${legend}
        </div>
      </div>
    `;
  }
};
