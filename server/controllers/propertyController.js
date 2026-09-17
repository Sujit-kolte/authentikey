const axios = require("axios");
const FormData = require("form-data");
const { query } = require("../db");
const { getConfig } = require("../config");
const { createHttpError } = require("../middleware");
const cats = new Set(["FLAT", "HOUSE", "PLOT"]),
  types = new Set(["RENT", "SALE"]),
  docs = new Set(["7_12_SADBARA", "LIGHT_BILL", "INDEX_II", "TAX_RECEIPT"]);
function num(v, n) {
  if (v === undefined || v === null || v === "") return null;
  const x = Number(v);
  if (!Number.isFinite(x)) throw createHttpError(400, `${n} must be numeric`);
  return x;
}
function boundary(raw) {
  let x = raw;
  try {
    if (typeof x === "string") x = JSON.parse(x);
  } catch {
    throw createHttpError(400, "boundaryCoordinates must be valid JSON");
  }
  if (!Array.isArray(x) || x.length < 3)
    throw createHttpError(
      400,
      "A plot requires at least three boundary coordinates",
    );
  return x.map((p) => {
    const lng = Number(p.longitude ?? p.lng),
      lat = Number(p.latitude ?? p.lat);
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    )
      throw createHttpError(400, "Invalid boundary coordinate");
    return [lng, lat];
  });
}
async function verify(file, owner, survey) {
  if (!file) throw createHttpError(400, "An image document is required");
  if (!file.mimetype?.startsWith("image/"))
    throw createHttpError(415, "Document must be an image");
  const form = new FormData();
  form.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });
  form.append("expected_owner_name", owner);
  if (survey) form.append("survey_number", survey);
  return (
    await axios.post(
      `${getConfig().aiServiceUrl}/api/v1/verify/document`,
      form,
      { headers: form.getHeaders(), timeout: 30000 },
    )
  ).data;
}
async function createProperty(req, res) {
  const b = req.body || {},
    price = num(b.price, "price"),
    token = num(b.tokenAmount, "tokenAmount"),
    lat = num(b.latitude, "latitude"),
    lng = num(b.longitude, "longitude");
  if (
    !types.has(b.transactionType) ||
    !cats.has(b.category) ||
    !b.title ||
    !b.description ||
    !b.addressText
  )
    throw createHttpError(
      400,
      "transactionType, category, title, description, and addressText are required",
    );
  if (b.documentType && !docs.has(b.documentType))
    throw createHttpError(400, "Invalid documentType");
  if (
    [price, token, lat, lng].some((x) => x === null) ||
    price < 0 ||
    token < 0 ||
    token > price ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  )
    throw createHttpError(400, "Invalid property values");
  const points = b.category === "PLOT" ? boundary(b.boundaryCoordinates) : null;
  const v = await verify(
      req.file,
      req.user.fullName || req.user.email,
      b.surveyNumber,
    ),
    wkt = points
      ? `POLYGON((${points
          .concat([points[0]])
          .map(([x, y]) => `${x} ${y}`)
          .join(",")}))`
      : null;
  const r = await query(
    `INSERT INTO properties(seller_id,transaction_type,category,title,description,price,token_amount,carpet_area_sqft,survey_number,zone,address_text,location,boundary_polygon,document_url,document_type,is_verified,composite_risk_score) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,ST_SetSRID(ST_MakePoint($12,$13),4326),CASE WHEN $14::text IS NULL THEN NULL ELSE ST_GeomFromText($14,4326) END,$15,$16,$17,$18) RETURNING *`,
    [
      req.user.id,
      b.transactionType,
      b.category,
      b.title.trim(),
      b.description.trim(),
      price,
      token,
      num(b.carpetAreaSqft, "carpetAreaSqft"),
      b.surveyNumber || null,
      b.zone || null,
      b.addressText.trim(),
      lng,
      lat,
      wkt,
      b.documentUrl || null,
      b.documentType || null,
      !!v.verified,
      Math.max(
        0,
        Math.min(
          100,
          Math.round(100 - Number(v.name_match_confidence || 0) * 100),
        ),
      ),
    ],
  );
  return res.status(201).json({ property: r.rows[0], verification: v });
}
async function getProperties(req, res) {
  const b = req.query,
    where = [],
    vals = [];
  const add = (s, v) => {
    vals.push(v);
    where.push(s.replace("$", `$${vals.length}`));
  };
  if (b.category) {
    if (!cats.has(b.category)) throw createHttpError(400, "Invalid category");
    add("p.category = $", b.category);
  }
  if (b.transactionType) {
    if (!types.has(b.transactionType))
      throw createHttpError(400, "Invalid transactionType");
    add("p.transaction_type = $", b.transactionType);
  }
  if (b.maxPrice !== undefined)
    add("p.price <= $", num(b.maxPrice, "maxPrice"));
  if (b.search)
    add(
      "(p.title ILIKE $ OR p.description ILIKE $ OR p.address_text ILIKE $)",
      `%${b.search}%`,
    );
  let distance = "NULL AS distance_metres";
  if (b.lat !== undefined || b.lng !== undefined || b.radius !== undefined) {
    const lat = num(b.lat, "lat"),
      lng = num(b.lng, "lng"),
      radius = num(b.radius, "radius");
    if (
      lat === null ||
      lng === null ||
      radius === null ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180 ||
      radius <= 0
    )
      throw createHttpError(
        400,
        "lat, lng, and positive radius are required together",
      );
    vals.push(lat, lng, radius);
    const point = `ST_SetSRID(ST_MakePoint($${vals.length - 1},$${vals.length - 2}),4326)::geography`;
    where.push(`ST_DWithin(p.location::geography,${point},$${vals.length})`);
    distance = `ST_Distance(p.location::geography,${point}) AS distance_metres`;
  }
  const r = await query(
    `SELECT p.*,ST_X(p.location) longitude,ST_Y(p.location) latitude,ST_AsGeoJSON(p.boundary_polygon)::json boundary_polygon,${distance} FROM properties p ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY p.created_at DESC`,
    vals,
  );
  res.json({ properties: r.rows });
}
async function verifyProperty(req, res) {
  const result = await query(
    `SELECT id,price,token_amount,address_text,document_url,owner_name,owner_phone,owner_id_number,property_media,physical_proof_video_url,proof_address_distance_metres,external_listing_urls FROM properties WHERE id=$1 AND seller_id=$2`,
    [req.params.propertyId, req.user.id],
  );
  if (!result.rows[0]) throw createHttpError(404, "Property not found");
  const property = result.rows[0];
  const checks = {
    price:
      Number(property.price) > 0 &&
      Number(property.token_amount) <= Number(property.price),
    address:
      Boolean(property.address_text) &&
      (property.proof_address_distance_metres == null ||
        Number(property.proof_address_distance_metres) <= 1000),
    documents: Boolean(property.document_url),
    owner: Boolean(
      property.owner_name && property.owner_phone && property.owner_id_number,
    ),
    media:
      Array.isArray(property.property_media) &&
      property.property_media.length > 0,
    physicalProof: Boolean(property.physical_proof_video_url),
    externalListings:
      Array.isArray(property.external_listing_urls) &&
      property.external_listing_urls.every((url) => /^https?:\/\//i.test(url)),
  };
  const issues = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([key]) => `Missing or invalid ${key} evidence.`);
  const status = issues.length ? "NEEDS_ATTENTION" : "VERIFIED";
  const updated = await query(
    `UPDATE properties SET is_verified=$1, verification_status=$2, verification_checks=$3::jsonb, verification_issues=$4::jsonb WHERE id=$5 RETURNING *`,
    [
      !issues.length,
      status,
      JSON.stringify(checks),
      JSON.stringify(issues),
      property.id,
    ],
  );
  res.json({ property: updated.rows[0], checks, issues, status });
}
module.exports = { createProperty, getProperties, verifyProperty };
