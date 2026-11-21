// Procedural abstract study generator for Glass Carousel
export function paintStudy(seed = 1, width = 420, height = 560) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Pseudo-random generator based on seed
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const palettes = [
    ["#1b1916", "#25211c", "#38322a", "#c9a992", "#f5f2eb"],
    ["#181613", "#27231d", "#403930", "#d4bba7", "#faf7f2"],
    ["#1f1c19", "#302b24", "#4a4136", "#bfa088", "#f3ede4"],
    ["#1a1714", "#2c2620", "#453c33", "#ddc8b6", "#f7f4ee"],
    ["#161512", "#24201a", "#3c352c", "#c2a68e", "#f0e9df"],
    ["#1d1a17", "#2e2822", "#483e34", "#d8c0ad", "#f6f1e8"],
    ["#141310", "#221e19", "#373027", "#cca990", "#ede5da"],
    ["#1c1815", "#2a241e", "#443a30", "#e0cdbd", "#f8f5ef"],
  ];

  const palette = palettes[Math.abs(seed) % palettes.length];

  // Deep architectural gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, palette[0]);
  bgGrad.addColorStop(0.5, palette[1]);
  bgGrad.addColorStop(1, palette[2]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Soft luminous radial accents
  for (let i = 0; i < 3; i++) {
    const rx = rnd() * width;
    const ry = rnd() * height;
    const rad = 80 + rnd() * 200;
    const radGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, rad);
    radGrad.addColorStop(0, palette[3] + "55");
    radGrad.addColorStop(0.7, palette[3] + "08");
    radGrad.addColorStop(1, "transparent");
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Abstract architectural geometric slabs & shadows
  ctx.save();
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = palette[i % palette.length] + "22";
    ctx.strokeStyle = palette[3] + "33";
    ctx.lineWidth = 1 + rnd() * 2;
    const x = rnd() * (width * 0.8);
    const y = rnd() * (height * 0.8);
    const w = 60 + rnd() * (width * 0.5);
    const h = 80 + rnd() * (height * 0.5);
    const radius = 8 + rnd() * 24;

    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // Fine architectural grid lines & coordinates
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  const gridStep = 40;
  for (let x = 0; x < width; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Atmospheric grain
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 14;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Minimal typographic watermark
  ctx.font = "600 12px monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.fillText(`SASWAT MOHANTY // STUDY ${String(seed).padStart(2, "0")}`, 24, height - 28);

  return canvas;
}
