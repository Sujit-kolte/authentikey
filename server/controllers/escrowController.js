const crypto = require("crypto");
const { query, withTransaction } = require("../db");
const { getConfig } = require("../config");
const { createHttpError } = require("../middleware");
const { haversineDistance } = require("../utils/geoUtils");
const TTL = 60,
  MAX = 50;
const n = (v, k) => {
  const x = Number(v);
  if (!Number.isFinite(x)) throw createHttpError(400, `${k} must be numeric`);
  return x;
};
const sign = (id, seller, t) =>
  crypto
    .createHmac("sha256", getConfig().escrowHmacSecret)
    .update(`${id}.${seller}.${t}`)
    .digest("hex");
const decode = (x) => {
  try {
    const p = JSON.parse(Buffer.from(x, "base64url").toString());
    if (
      !p.escrowId ||
      !p.sellerId ||
      !Number.isInteger(p.timestamp) ||
      !p.signature
    )
      throw 0;
    return p;
  } catch {
    throw createHttpError(400, "Invalid QR payload");
  }
};
async function escrow(id) {
  const r = await query(
    "SELECT e.*,ST_X(p.location) longitude,ST_Y(p.location) latitude FROM escrow_transactions e JOIN properties p ON p.id=e.property_id WHERE e.id=$1",
    [id],
  );
  if (!r.rows[0]) throw createHttpError(404, "Escrow transaction not found");
  return r.rows[0];
}
async function initiateEscrow(req, res) {
  const propertyId = req.params.propertyId || req.body?.propertyId,
    amount = n(req.body?.amount, "amount");
  if (!propertyId || amount <= 0)
    throw createHttpError(400, "propertyId and positive amount are required");
  const e = await withTransaction(async (c) => {
    const r = await c.query(
        "SELECT id,seller_id,token_amount FROM properties WHERE id=$1 FOR UPDATE",
        [propertyId],
      ),
      p = r.rows[0];
    if (!p) throw createHttpError(404, "Property not found");
    if (p.seller_id === req.user.id)
      throw createHttpError(400, "Seller cannot escrow own property");
    if (amount < Number(p.token_amount))
      throw createHttpError(400, "Amount must cover token amount");
    const x = await c.query(
      "INSERT INTO escrow_transactions(property_id,buyer_id,seller_id,amount,status,qr_secret) VALUES($1,$2,$3,$4,'HELD_IN_ESCROW',$5) RETURNING id,property_id,buyer_id,seller_id,amount,status,created_at",
      [
        propertyId,
        req.user.id,
        p.seller_id,
        amount,
        crypto.randomBytes(32).toString("hex"),
      ],
    );
    return x.rows[0];
  });
  res.status(201).json({ escrow: e });
}
async function generateSellerQR(req, res) {
  const lat = n(req.body?.sellerLat, "sellerLat"),
    lng = n(req.body?.sellerLng, "sellerLng"),
    e = await escrow(req.params.escrowId);
  if (e.seller_id !== req.user.id)
    throw createHttpError(403, "Only the seller can generate the QR");
  if (e.status !== "HELD_IN_ESCROW")
    throw createHttpError(409, "Escrow is not awaiting inspection");
  const distance = haversineDistance(
    lat,
    lng,
    Number(e.latitude),
    Number(e.longitude),
  );
  if (distance > MAX)
    throw createHttpError(400, "Seller must be within 50 metres");
  const timestamp = Math.floor(Date.now() / 1000),
    expires = new Date((timestamp + TTL) * 1000),
    payload = {
      escrowId: e.id,
      sellerId: e.seller_id,
      timestamp,
      signature: sign(e.id, e.seller_id, timestamp),
    };
  await query(
    "UPDATE escrow_transactions SET qr_expires_at=$1 WHERE id=$2 AND status='HELD_IN_ESCROW'",
    [expires, e.id],
  );
  res.json({
    qrPayload: Buffer.from(JSON.stringify(payload)).toString("base64url"),
    expiresAt: expires,
    distanceMetres: distance,
  });
}
async function confirmBuyerInspection(req, res) {
  const lat = n(req.body?.buyerLat, "buyerLat"),
    lng = n(req.body?.buyerLng, "buyerLng"),
    p = decode(req.body?.qrPayload || ""),
    e = await escrow(req.params.escrowId);
  if (e.buyer_id !== req.user.id)
    throw createHttpError(403, "Only the buyer can confirm inspection");
  if (e.status !== "HELD_IN_ESCROW")
    throw createHttpError(409, "Escrow is not awaiting inspection");
  const now = Math.floor(Date.now() / 1000);
  if (
    p.escrowId !== e.id ||
    p.sellerId !== e.seller_id ||
    p.timestamp > now + 5 ||
    now - p.timestamp >= TTL
  )
    throw createHttpError(400, "QR payload is invalid or expired");
  const a = Buffer.from(p.signature, "hex"),
    b = Buffer.from(sign(p.escrowId, p.sellerId, p.timestamp), "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
    throw createHttpError(400, "QR signature is invalid");
  const distance = haversineDistance(
    lat,
    lng,
    Number(e.latitude),
    Number(e.longitude),
  );
  if (distance > MAX)
    throw createHttpError(400, "Buyer must be within 50 metres");
  const r = await query(
    "UPDATE escrow_transactions SET status='RELEASED_TO_SELLER' WHERE id=$1 AND status='HELD_IN_ESCROW' RETURNING *",
    [e.id],
  );
  if (!r.rows[0])
    throw createHttpError(409, "Escrow changed before confirmation");
  res.json({ escrow: r.rows[0], distanceMetres: distance });
}
async function disputeRefund(req, res) {
  const e = await escrow(req.params.escrowId);
  if (e.buyer_id !== req.user.id && e.seller_id !== req.user.id)
    throw createHttpError(403, "Not an escrow party");
  if (!["INITIATED", "HELD_IN_ESCROW"].includes(e.status))
    throw createHttpError(409, "Escrow cannot be refunded");
  const failed = req.body?.physicalScanFailed === true,
    timeout = e.qr_expires_at && new Date(e.qr_expires_at) <= new Date();
  if (!failed && !timeout)
    throw createHttpError(400, "Refund requires failed scan or timeout");
  const r = await query(
    "UPDATE escrow_transactions SET status='REFUNDED_TO_BUYER' WHERE id=$1 AND status IN ('INITIATED','HELD_IN_ESCROW') RETURNING *",
    [e.id],
  );
  if (!r.rows[0]) throw createHttpError(409, "Escrow changed before refund");
  res.json({
    escrow: r.rows[0],
    reason: failed ? "PHYSICAL_SCAN_FAILED" : "INSPECTION_TIMEOUT",
  });
}
module.exports = {
  initiateEscrow,
  generateSellerQR,
  confirmBuyerInspection,
  disputeRefund,
};
