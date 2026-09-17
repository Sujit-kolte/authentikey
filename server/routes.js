const express = require("express");
const multer = require("multer");
const { asyncHandler, requireAuth, requireRole } = require("./middleware");
const auth = require("./controllers/authController");
const property = require("./controllers/propertyController");
const escrow = require("./controllers/escrowController");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
});
const router = express.Router();
router.post("/auth/register", asyncHandler(auth.register));
router.post("/auth/login", asyncHandler(auth.login));
router.get("/properties", asyncHandler(property.getProperties));
router.post(
  "/properties",
  requireAuth,
  requireRole("SELLER"),
  upload.single("document"),
  asyncHandler(property.createProperty),
);
router.post(
  "/properties/:propertyId/verify",
  requireAuth,
  requireRole("SELLER"),
  asyncHandler(property.verifyProperty),
);
router.post(
  "/escrow/properties/:propertyId/initiate",
  requireAuth,
  requireRole("BUYER"),
  asyncHandler(escrow.initiateEscrow),
);
router.post(
  "/escrow/:escrowId/seller-qr",
  requireAuth,
  requireRole("SELLER"),
  asyncHandler(escrow.generateSellerQR),
);
router.post(
  "/escrow/:escrowId/confirm-inspection",
  requireAuth,
  requireRole("BUYER"),
  asyncHandler(escrow.confirmBuyerInspection),
);
router.post(
  "/escrow/:escrowId/refund",
  requireAuth,
  asyncHandler(escrow.disputeRefund),
);
module.exports = router;
