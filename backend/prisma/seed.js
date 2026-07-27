require('dotenv').config();
const prisma = require('../src/lib/prisma');
const schoolData = require('../src/data/schoolData');

async function main() {
  console.log("Seeding database...");

  // 1. Find or create School
  let school = await prisma.school.findFirst({
    where: { name: schoolData.name }
  });
  if (!school) {
    school = await prisma.school.create({
      data: { name: schoolData.name }
    });
    console.log(`Created new school: ${school.name}`);
  } else {
    console.log(`Using existing school: ${school.name}`);
  }

  const targetCounts = [30, 35, 32];

  // 2. Loop through classes
  for (let i = 0; i < schoolData.classes.length; i++) {
    const classItem = schoolData.classes[i];
    const targetCount = targetCounts[i] || 30;

    // Find or create Class
    let classRecord = await prisma.class.findFirst({
      where: {
        name: classItem.name,
        schoolId: school.id
      }
    });

    if (!classRecord) {
      classRecord = await prisma.class.create({
        data: {
          name: classItem.name,
          schoolId: school.id
        }
      });
      console.log(`Created new class: ${classRecord.name}`);
    } else {
      console.log(`Using existing class: ${classRecord.name}`);
    }

    // Real Indian Student Names pool for realistic seed data expansion
    const indianFirstNames = [
      "Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Krishna", "Ishaan", "Shaurya", "Pranav", "Aryan",
      "Ananya", "Diya", "Saanvi", "Aadhya", "Pari", "Angel", "Ipshita", "Kiara", "Meera", "Zara",
      "Kabir", "Rohan", "Dev", "Neil", "Amit", "Sanjay", "Vikram", "Gaurav", "Deepak", "Rishi",
      "Kavya", "Sneha", "Priya", "Shruti", "Tanvi", "Neha", "Ritu", "Divya", "Anjali", "Roshni",
      "Karan", "Abhishek", "Rahul", "Varun", "Siddharth", "Yash", "Dhruv", "Vivek", "Alok", "Harsh"
    ];

    const indianLastNames = [
      "Sharma", "Verma", "Gupta", "Patel", "Mehta", "Reddy", "Nair", "Iyer", "Joshi", "Rao",
      "Singh", "Kumar", "Mishra", "Choudhury", "Das", "Banerjee", "Chatterjee", "Sen", "Roy", "Bose",
      "Gill", "Dhillon", "Sodhi", "Kapoor", "Khan", "Malhotra", "Trivedi", "Pandey", "Dubey", "Yadav"
    ];

    const clubsPool = [
      "Sports Club", "Chess Club", "Drama Club", "Debate Club", "Science Club", 
      "Math Club", "Art Club", "Music Club", "Robotics Club", "Literary Club"
    ];

    // Add realistic students if count is lower than target
    const currentStudentCount = classItem.students.length;
    for (let j = 0; j < (targetCount - currentStudentCount); j++) {
      const fnIdx = (i * 30 + j) % indianFirstNames.length;
      const lnIdx = (i * 30 + j) % indianLastNames.length;
      const clubIdx = (i * 30 + j) % clubsPool.length;
      
      const fullName = `${indianFirstNames[fnIdx]} ${indianLastNames[lnIdx]}`;
      
      classItem.students.push({
        id: `STD-${200 + (i * 100) + j}`,
        name: fullName,
        data: `Active (${clubsPool[clubIdx]})`
      });
    }

    // 3. Loop through class students
    for (const student of classItem.students) {
      // Find or create Student (by studentCode)
      let studentRecord = await prisma.student.findUnique({
        where: { studentCode: student.id }
      });

      if (!studentRecord) {
        studentRecord = await prisma.student.create({
          data: {
            studentCode: student.id,
            name: student.name,
            data: student.data
          }
        });
        console.log(`Created new student record: ${studentRecord.name} (${studentRecord.studentCode})`);
      } else {
        // Update student name and data if they have changed in the seed data
        studentRecord = await prisma.student.update({
          where: { id: studentRecord.id },
          data: {
            name: student.name,
            data: student.data
          }
        });
        console.log(`Updated existing student record: ${studentRecord.name} (${studentRecord.studentCode})`);
      }

      // 4. Enroll student in class (if not already enrolled)
      const enrollment = await prisma.classStudent.findUnique({
        where: {
          classId_studentId: {
            classId: classRecord.id,
            studentId: studentRecord.id
          }
        }
      });

      if (!enrollment) {
        await prisma.classStudent.create({
          data: {
            classId: classRecord.id,
            studentId: studentRecord.id
          }
        });
        console.log(`Linked student ${studentRecord.name} to class ${classRecord.name}`);
      } else {
        console.log(`Student ${studentRecord.name} is already linked to class ${classRecord.name}`);
      }
    }
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding process:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
