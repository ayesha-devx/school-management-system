const express = require('express');
const router = express.Router();
const {
  getSchool,
  getClasses,
  getClassById,
  getStudentsByClassId,
  enrollStudent,
  unenrollStudent
} = require('../controllers/schoolController');

// GET /api/school
router.get('/school', getSchool);

// GET /api/classes
router.get('/classes', getClasses);

// GET /api/classes/:classId
router.get('/classes/:classId', getClassById);

// GET /api/classes/:classId/students
router.get('/classes/:classId/students', getStudentsByClassId);

// POST /api/students
router.post('/students', enrollStudent);

// PUT /api/students/:studentCode
router.put('/students/:studentCode', require('../controllers/schoolController').updateStudent);

// DELETE /api/classes/:classId/students/:studentId
router.delete('/classes/:classId/students/:studentId', unenrollStudent);

module.exports = router;
