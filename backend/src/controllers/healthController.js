/**
 * Health check controller
 * GET /api/health
 */
const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "School Management API is running"
  });
};

module.exports = {
  getHealth
};
