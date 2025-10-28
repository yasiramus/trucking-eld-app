export default function drawELDLog(canvas, dayLog) {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Layout
    const padding = 60;
    const gridWidth = width - padding * 2;
    const gridHeight = height - padding * 2;
    const rowHeight = gridHeight / 4;

    // Clear canvas
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);

    // Background grid
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(padding, padding, gridWidth, gridHeight);

    // Vertical grid lines (24 hours)
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let h = 0; h <= 24; h++) {
        const x = padding + (gridWidth / 24) * h;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, padding + gridHeight);
        ctx.stroke();

        if (h % 3 === 0) {
            ctx.fillStyle = "#64748b";
            ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(h.toString(), x, padding - 10);
        }
    }

    // Horizontal grid lines
    for (let row = 0; row <= 4; row++) {
        const y = padding + rowHeight * row;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + gridWidth, y);
        ctx.stroke();
    }

    // Labels & colors
    const rowLabels = ["1. Off Duty", "2. Sleeper", "3. Driving", "4. On Duty"];
    const rowColors = {
        "off-duty": "#94a3b8",
        sleeper: "#10b981",
        driving: "#2563eb",
        "on-duty": "#f59e0b",
    };

    ctx.textAlign = "right";
    ctx.font = "14px sans-serif";
    rowLabels.forEach((label, i) => {
        const y = padding + rowHeight * i + rowHeight / 2;
        ctx.fillStyle = "#1e293b";
        ctx.fillText(label, padding - 10, y + 5);
    });

    // Draw segments
    dayLog.segments.forEach((s) => {
        const startX = padding + (gridWidth / 24) * s.startHour;
        const segmentWidth = (gridWidth / 24) * s.duration;
        const rowIndex = ["off-duty", "sleeper", "driving", "on-duty"].indexOf(s.type);
        const y = padding + rowIndex * rowHeight + rowHeight / 2;
        const color = rowColors[s.type] || "#94a3b8";

        // Segment line
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + segmentWidth, y);
        ctx.stroke();

        // Dots
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(startX, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(startX + segmentWidth, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Border
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, gridWidth, gridHeight);

    // Bottom hour labels
    ctx.fillStyle = "#64748b";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    const bottomLabels = ["MIDNIGHT", "6 AM", "NOON", "6 PM", "MIDNIGHT"];
    bottomLabels.forEach((label, i) => {
        const x = padding + (gridWidth / 4) * i;
        ctx.fillText(label, x, height - 10);
    });
}
