const prisma = require('../lib/prisma');

/**
 * Validates database business constraints dynamically inside a transaction.
 * Rule 1: Every class must contain at least 5 enrolled students.
 * Rule 2: Every class must contain at least 2 students who are also enrolled in at least one other class.
 * Avoids N+1 queries by querying all class-student relationships in a single query.
 */
const validateDatabaseConstraints = async (tx) => {
  // 1. Fetch all classes dynamically
  const classes = await tx.class.findMany({
    select: { id: true, name: true }
  });

  // 2. Fetch all ClassStudent records in the database in a single query
  const allEnrollments = await tx.classStudent.findMany({
    select: { classId: true, studentId: true }
  });

  // Maps to aggregate data in-memory (O(N) operations)
  const classEnrollmentCounts = new Map(); // classId -> total student count
  const studentClassCounts = new Map();    // studentId -> total class count

  for (const enrollment of allEnrollments) {
    const { classId, studentId } = enrollment;

    classEnrollmentCounts.set(classId, (classEnrollmentCounts.get(classId) || 0) + 1);
    studentClassCounts.set(studentId, (studentClassCounts.get(studentId) || 0) + 1);
  }

  // 3. Enforce Rule 1: Minimum 5 students per class
  for (const c of classes) {
    const totalStudents = classEnrollmentCounts.get(c.id) || 0;
    if (totalStudents < 5) {
      throw new Error(`Validation failed: Class "${c.name}" must contain a minimum of 5 students.`);
    }
  }

  // 4. Enforce Rule 2: Minimum 2 shared students per class
  const classSharedCounts = new Map(); // classId -> total shared student count

  for (const enrollment of allEnrollments) {
    const { classId, studentId } = enrollment;
    const isShared = (studentClassCounts.get(studentId) || 0) > 1;

    if (isShared) {
      classSharedCounts.set(classId, (classSharedCounts.get(classId) || 0) + 1);
    }
  }

  for (const c of classes) {
    const sharedCount = classSharedCounts.get(c.id) || 0;
    if (sharedCount < 2) {
      throw new Error(`Validation failed: Class "${c.name}" must contain at least 2 students shared with another class.`);
    }
  }
};

/**
 * GET /api/school
 * Returns school name, classes, and student lists from PostgreSQL via Prisma
 */
const getSchool = async (req, res) => {
  try {
    const school = await prisma.school.findFirst({
      include: {
        classes: {
          include: {
            students: {
              include: {
                student: true
              }
            }
          }
        }
      }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found"
      });
    }

    // Map database records to match frontend API response expectations
    const mappedClasses = school.classes.map(c => ({
      id: c.id,
      name: c.name,
      students: c.students.map(cs => ({
        id: cs.student.studentCode, // map studentCode to id for frontend badge display
        name: cs.student.name,
        data: cs.student.data
      }))
    }));

    res.status(200).json({
      success: true,
      data: {
        name: school.name,
        classes: mappedClasses
      }
    });
  } catch (error) {
    console.error("Error fetching school data from database:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while retrieving school records."
    });
  }
};

/**
 * GET /api/classes
 * Returns all classes from PostgreSQL via Prisma
 */
const getClasses = async (req, res) => {
  try {
    const dbClasses = await prisma.class.findMany({
      include: {
        students: {
          include: {
            student: true
          }
        }
      }
    });

    const mappedClasses = dbClasses.map(c => ({
      id: c.id,
      name: c.name,
      students: c.students.map(cs => ({
        id: cs.student.studentCode,
        name: cs.student.name,
        data: cs.student.data
      }))
    }));

    res.status(200).json({
      success: true,
      data: mappedClasses
    });
  } catch (error) {
    console.error("Error fetching classes from database:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while retrieving classrooms."
    });
  }
};

/**
 * GET /api/classes/:classId
 * Returns a single class details by its database ID
 */
const getClassById = async (req, res) => {
  try {
    const { classId } = req.params;

    const dbClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: {
          include: {
            student: true
          }
        }
      }
    });

    if (!dbClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found"
      });
    }

    const mappedClass = {
      id: dbClass.id,
      name: dbClass.name,
      students: dbClass.students.map(cs => ({
        id: cs.student.studentCode,
        name: cs.student.name,
        data: cs.student.data
      }))
    };

    res.status(200).json({
      success: true,
      data: mappedClass
    });
  } catch (error) {
    console.error(`Error fetching class ${req.params.classId} from database:`, error);
    if (error.code === 'P2023') {
      return res.status(404).json({
        success: false,
        message: "Class not found (Invalid ID format)"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while retrieving classroom details."
    });
  }
};

/**
 * GET /api/classes/:classId/students
 * Returns the list of students belonging to a class
 */
const getStudentsByClassId = async (req, res) => {
  try {
    const { classId } = req.params;

    const dbClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: {
          include: {
            student: true
          }
        }
      }
    });

    if (!dbClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found"
      });
    }

    const mappedStudents = dbClass.students.map(cs => ({
      id: cs.student.studentCode,
      name: cs.student.name,
      data: cs.student.data
    }));

    res.status(200).json({
      success: true,
      data: mappedStudents
    });
  } catch (error) {
    console.error(`Error fetching class students for ${req.params.classId} from database:`, error);
    if (error.code === 'P2023') {
      return res.status(404).json({
        success: false,
        message: "Class not found (Invalid ID format)"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while retrieving student list."
    });
  }
};

/**
 * POST /api/students
 * Enrolls a student in a class. Creates student if code doesn't exist, otherwise reuses record.
 * Wraps operations in a transaction block to validate constraints generically before committing.
 */
const enrollStudent = async (req, res) => {
  try {
    const { name, studentCode, data, classId } = req.body;

    if (!name || !studentCode || !classId) {
      return res.status(400).json({
        success: false,
        message: "Name, studentCode, and classId are required fields."
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // CASE 4: Verify target class exists
      const targetClass = await tx.class.findUnique({
        where: { id: classId }
      });
      if (!targetClass) {
        throw { status: 404, message: "Class not found." };
      }

      // Check if student with studentCode already exists
      let student = await tx.student.findUnique({
        where: { studentCode }
      });

      if (student) {
        // CASE 2: If studentCode already exists, check if name conflicts
        if (student.name.toLowerCase() !== name.toLowerCase()) {
          throw { 
            status: 409, 
            message: `Conflict: Student code ${studentCode} belongs to an existing student named "${student.name}" (submitted: "${name}").` 
          };
        }

        // CASE 3: Check if student is already enrolled in this class
        const existingEnrollment = await tx.classStudent.findUnique({
          where: {
            classId_studentId: {
              classId,
              studentId: student.id
            }
          }
        });

        if (existingEnrollment) {
          throw { status: 409, message: "Student is already enrolled in this class." };
        }

        // Create only ClassStudent relationship
        await tx.classStudent.create({
          data: {
            classId,
            studentId: student.id
          }
        });
      } else {
        // CASE 1: studentCode does not exist. Create Student and ClassStudent link.
        const newStudent = await tx.student.create({
          data: {
            studentCode,
            name,
            data: data || null
          }
        });

        await tx.classStudent.create({
          data: {
            classId,
            studentId: newStudent.id
          }
        });
      }

      // Validate constraints inside transaction
      await validateDatabaseConstraints(tx);

      return { status: 201, message: "Student successfully enrolled." };
    });

    res.status(result.status).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }
    if (error.message && error.message.startsWith("Validation failed:")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    console.error("Error in enrollStudent:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while enrolling the student."
    });
  }
};

/**
 * DELETE /api/classes/:classId/students/:studentId
 * Unenrolls a student from a specific class. Validates minimum size and overlap constraints dynamically inside a transaction.
 */
const unenrollStudent = async (req, res) => {
  try {
    const { classId, studentId: studentIdOrCode } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify class exists
      const targetClass = await tx.class.findUnique({
        where: { id: classId }
      });
      if (!targetClass) {
        throw { status: 404, message: "Class not found." };
      }

      // 2. Verify student exists (by internal UUID or studentCode)
      const student = await tx.student.findFirst({
        where: {
          OR: [
            { id: studentIdOrCode },
            { studentCode: studentIdOrCode }
          ]
        }
      });
      if (!student) {
        throw { status: 404, message: "Student not found." };
      }

      // 3. Verify student is actually enrolled in that class
      const enrollment = await tx.classStudent.findUnique({
        where: {
          classId_studentId: {
            classId,
            studentId: student.id
          }
        }
      });
      if (!enrollment) {
        throw { status: 404, message: "Student is not enrolled in this class." };
      }

      // 4. Delete the ClassStudent relationship inside transaction
      await tx.classStudent.delete({
        where: {
          id: enrollment.id
        }
      });

      // 5. Perform validation checks
      await validateDatabaseConstraints(tx);

      return { status: 200, message: "Student successfully unenrolled from class." };
    });

    res.status(result.status).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }
    if (error.message && error.message.startsWith("Validation failed:")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    console.error("Error in unenrollStudent:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while unenrolling the student."
    });
  }
};

/**
 * PUT /api/students/:studentCode
 * Updates an existing student record's name and/or data.
 */
const updateStudent = async (req, res) => {
  try {
    const { studentCode } = req.params;
    const { name, data } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is a required field."
      });
    }

    const student = await prisma.student.findUnique({
      where: { studentCode }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }

    const updated = await prisma.student.update({
      where: { id: student.id },
      data: {
        name,
        data: data || null
      }
    });

    res.status(200).json({
      success: true,
      message: "Student details updated successfully.",
      data: {
        id: updated.studentCode,
        name: updated.name,
        data: updated.data
      }
    });
  } catch (error) {
    console.error("Error in updateStudent:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while updating the student."
    });
  }
};

module.exports = {
  getSchool,
  getClasses,
  getClassById,
  getStudentsByClassId,
  enrollStudent,
  unenrollStudent,
  updateStudent
};
