const R = 6371008.8;
const F = 3.280839895;
const rad = (x) => (x * Math.PI) / 180;
function valid(lat, lng) {
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  )
    throw new RangeError("Invalid latitude or longitude");
}
function haversineDistance(a, b, c, d) {
  valid(a, b);
  valid(c, d);
  const x = rad(c - a),
    y = rad(d - b),
    q =
      Math.sin(x / 2) ** 2 +
      Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(y / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
}
function calculateGeodesicPolygonArea(coords) {
  if (!Array.isArray(coords) || coords.length < 3)
    throw new RangeError("At least three boundary coordinates are required");
  const p = coords.map((x) => {
      const lat = Number(x.latitude ?? x.lat),
        lng = Number(x.longitude ?? x.lng);
      valid(lat, lng);
      return { lat, lng };
    }),
    mean = p.reduce((s, x) => s + x.lat, 0) / p.length,
    ys = (R * Math.PI) / 180,
    xs = ys * Math.cos(rad(mean));
  let area = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i],
      b = p[(i + 1) % p.length];
    area +=
      rad(a.lng) * xs * (rad(b.lat) * ys) - rad(b.lng) * xs * (rad(a.lat) * ys);
  }
  const squareMetres = Math.abs(area) / 2;
  return { squareMetres, squareFeet: squareMetres * F ** 2 };
}
function verifyBoundaryTolerance(calculated, deed, tolerancePercent = 5) {
  return (
    Number.isFinite(calculated) &&
    Number.isFinite(deed) &&
    Number.isFinite(tolerancePercent) &&
    deed > 0 &&
    tolerancePercent >= 0 &&
    (Math.abs(calculated - deed) / deed) * 100 <= tolerancePercent
  );
}
module.exports = {
  haversineDistance,
  calculateGeodesicPolygonArea,
  verifyBoundaryTolerance,
};
