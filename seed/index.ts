// Comprehensive seeding script to populate the database with realistic dummy data
import User from "@/models/User";
import Test from "@/models/Test";
import Question from "@/models/Question";
import Result from "@/models/Result";
import dbConnect from "@/lib/mongoose-connect";
import { hashPassword } from "@/lib/auth";
import { encryptString } from "@/lib/encryption";
import crypto from "crypto";

// Helper to generate random dates
function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Helper to generate random score (normally distributed around mean)
function randomScore(mean: number = 75, stdDev: number = 15): number {
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  const score = Math.round(mean + z * stdDev);
  return Math.max(0, Math.min(100, score));
}

// Sample question banks by subject
const questionBanks: Record<
  string,
  Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>
> = {
  Mathematics: [
    {
      question: "What is the derivative of x²?",
      options: ["x", "2x", "x²", "2"],
      correctIndex: 1,
      explanation: "Using power rule: d/dx(x²) = 2x^(2-1) = 2x",
    },
    {
      question: "Solve for x: 2x + 5 = 15",
      options: ["5", "10", "7.5", "20"],
      correctIndex: 0,
      explanation: "2x = 15 - 5 = 10, so x = 5",
    },
    {
      question: "What is the value of π (pi) approximately?",
      options: ["2.718", "3.142", "1.618", "2.236"],
      correctIndex: 1,
      explanation: "π (pi) is approximately 3.14159...",
    },
    {
      question: "What is 15% of 200?",
      options: ["20", "25", "30", "35"],
      correctIndex: 2,
      explanation: "15% of 200 = (15/100) × 200 = 30",
    },
    {
      question: "What is the area of a circle with radius 5?",
      options: ["78.54", "31.42", "25", "50"],
      correctIndex: 0,
      explanation: "Area = πr² = π × 5² = 25π ≈ 78.54",
    },
    {
      question: "What is the square root of 144?",
      options: ["10", "11", "12", "13"],
      correctIndex: 2,
      explanation: "√144 = 12 because 12 × 12 = 144",
    },
    {
      question: "What is 7 × 8?",
      options: ["54", "56", "58", "60"],
      correctIndex: 1,
      explanation: "7 × 8 = 56",
    },
    {
      question: "What is the sum of angles in a triangle?",
      options: ["90°", "180°", "270°", "360°"],
      correctIndex: 1,
      explanation:
        "The sum of interior angles in any triangle is always 180 degrees",
    },
  ],
  Physics: [
    {
      question: "What is Newton's Second Law of Motion?",
      options: ["F = ma", "E = mc²", "V = IR", "PV = nRT"],
      correctIndex: 0,
      explanation:
        "Newton's Second Law states that Force equals mass times acceleration (F = ma)",
    },
    {
      question: "What is the speed of light in vacuum?",
      options: ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10⁷ m/s", "3 × 10⁹ m/s"],
      correctIndex: 0,
      explanation:
        "The speed of light in vacuum is approximately 3 × 10⁸ meters per second",
    },
    {
      question: "What is the SI unit of force?",
      options: ["Joule", "Newton", "Watt", "Pascal"],
      correctIndex: 1,
      explanation: "The Newton (N) is the SI unit of force, defined as kg⋅m/s²",
    },
    {
      question: "What is the acceleration due to gravity on Earth?",
      options: ["8.8 m/s²", "9.8 m/s²", "10.8 m/s²", "11.8 m/s²"],
      correctIndex: 1,
      explanation:
        "The acceleration due to gravity on Earth is approximately 9.8 m/s²",
    },
    {
      question: "What does AC stand for in electricity?",
      options: [
        "Alternating Current",
        "Automatic Current",
        "Active Current",
        "Average Current",
      ],
      correctIndex: 0,
      explanation:
        "AC stands for Alternating Current, where the flow of electric charge periodically reverses direction",
    },
    {
      question: "What is the formula for kinetic energy?",
      options: ["KE = mv", "KE = ½mv²", "KE = mgh", "KE = ma"],
      correctIndex: 1,
      explanation: "Kinetic Energy = ½ × mass × velocity², or KE = ½mv²",
    },
  ],
  Chemistry: [
    {
      question: "What is the chemical symbol for Gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      correctIndex: 2,
      explanation: "Gold's chemical symbol is Au, from its Latin name Aurum",
    },
    {
      question: "What is the pH of pure water?",
      options: ["5", "7", "9", "11"],
      correctIndex: 1,
      explanation: "Pure water has a pH of 7, which is neutral",
    },
    {
      question: "What is the most abundant gas in Earth's atmosphere?",
      options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
      correctIndex: 2,
      explanation:
        "Nitrogen makes up about 78% of Earth's atmosphere, making it the most abundant gas",
    },
    {
      question: "What is the atomic number of Carbon?",
      options: ["4", "6", "8", "12"],
      correctIndex: 1,
      explanation:
        "Carbon has an atomic number of 6, meaning it has 6 protons in its nucleus",
    },
    {
      question: "What is H₂O commonly known as?",
      options: ["Oxygen", "Hydrogen", "Water", "Peroxide"],
      correctIndex: 2,
      explanation: "H₂O is the chemical formula for water",
    },
    {
      question: "What is the process of a solid turning directly into gas?",
      options: ["Melting", "Evaporation", "Sublimation", "Condensation"],
      correctIndex: 2,
      explanation:
        "Sublimation is the phase transition from solid directly to gas without passing through liquid phase",
    },
  ],
  Biology: [
    {
      question: "What is the powerhouse of the cell?",
      options: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"],
      correctIndex: 1,
      explanation:
        "Mitochondria are called the powerhouse of the cell because they produce ATP (energy)",
    },
    {
      question: "What is the process by which plants make food?",
      options: ["Respiration", "Digestion", "Photosynthesis", "Transpiration"],
      correctIndex: 2,
      explanation:
        "Photosynthesis is the process by which plants convert light energy into chemical energy (glucose)",
    },
    {
      question: "How many chromosomes do humans have?",
      options: ["23", "46", "48", "92"],
      correctIndex: 1,
      explanation: "Humans have 46 chromosomes (23 pairs) in each somatic cell",
    },
    {
      question: "What is DNA an abbreviation for?",
      options: [
        "Deoxyribonucleic Acid",
        "Dinitrogen Acid",
        "Dextrose Nucleic Acid",
        "Dynamic Nuclear Acid",
      ],
      correctIndex: 0,
      explanation:
        "DNA stands for Deoxyribonucleic Acid, the molecule that carries genetic information",
    },
    {
      question: "What is the largest organ in the human body?",
      options: ["Liver", "Brain", "Skin", "Heart"],
      correctIndex: 2,
      explanation:
        "The skin is the largest organ of the human body, covering about 2 square meters",
    },
    {
      question: "What type of blood cells fight infection?",
      options: [
        "Red Blood Cells",
        "White Blood Cells",
        "Platelets",
        "Plasma Cells",
      ],
      correctIndex: 1,
      explanation:
        "White Blood Cells (leukocytes) are part of the immune system and fight infections",
    },
  ],
  "Computer Science": [
    {
      question: "What does HTML stand for?",
      options: [
        "Hyper Text Markup Language",
        "High Tech Modern Language",
        "Home Tool Markup Language",
        "Hyperlinks and Text Markup Language",
      ],
      correctIndex: 0,
      explanation:
        "HTML stands for Hyper Text Markup Language, used to create web pages",
    },
    {
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correctIndex: 1,
      explanation:
        "Binary search has O(log n) time complexity as it halves the search space in each step",
    },
    {
      question: "What does CPU stand for?",
      options: [
        "Central Processing Unit",
        "Computer Personal Unit",
        "Central Program Utility",
        "Computer Processing Utility",
      ],
      correctIndex: 0,
      explanation:
        "CPU stands for Central Processing Unit, the brain of the computer",
    },
    {
      question: "Which data structure uses LIFO?",
      options: ["Queue", "Stack", "Array", "Tree"],
      correctIndex: 1,
      explanation:
        "Stack uses LIFO (Last In First Out) principle - the last element added is the first to be removed",
    },
    {
      question: "What is the base of the binary number system?",
      options: ["2", "8", "10", "16"],
      correctIndex: 0,
      explanation: "Binary number system has base 2, using only digits 0 and 1",
    },
  ],
  English: [
    {
      question: "What is a noun?",
      options: [
        "An action word",
        "A describing word",
        "A person, place, or thing",
        "A connecting word",
      ],
      correctIndex: 2,
      explanation:
        "A noun is a word that represents a person, place, thing, or idea",
    },
    {
      question: "Who wrote 'Romeo and Juliet'?",
      options: [
        "Charles Dickens",
        "William Shakespeare",
        "Jane Austen",
        "Mark Twain",
      ],
      correctIndex: 1,
      explanation:
        "William Shakespeare wrote the famous tragedy 'Romeo and Juliet'",
    },
    {
      question: "What is the past tense of 'go'?",
      options: ["Goed", "Gone", "Went", "Going"],
      correctIndex: 2,
      explanation: "The simple past tense of 'go' is 'went'",
    },
    {
      question: "What is a synonym for 'happy'?",
      options: ["Sad", "Joyful", "Angry", "Tired"],
      correctIndex: 1,
      explanation:
        "Joyful is a synonym for happy, both meaning feeling pleasure or contentment",
    },
    {
      question: "What punctuation mark ends a question?",
      options: [
        "Period (.)",
        "Comma (,)",
        "Question Mark (?)",
        "Exclamation (!)",
      ],
      correctIndex: 2,
      explanation:
        "A question mark (?) is used to end an interrogative sentence",
    },
  ],
};

async function seed() {
  try {
    console.log("🌱 Starting database seeding...\n");
    await dbConnect();

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("🗑️  Clearing existing data...");
    await Result.deleteMany({});
    await Question.deleteMany({});
    await Test.deleteMany({});
    await User.deleteMany({ role: { $ne: "superadmin" } });

    // Create Super Admin if doesn't exist
    console.log("👑 Creating Super Admin...");
    let superAdmin = await User.findOne({ email: "superadmin@edu.com" });
    if (!superAdmin) {
      const hashed = await hashPassword("admin123");
      superAdmin = await User.create({
        email: "superadmin@edu.com",
        name: "Super Admin",
        password: hashed,
        role: "superadmin",
        createdAt: new Date("2024-01-15"),
      });
    }

    // Create Admins
    console.log("👨‍💼 Creating Admins...");
    const adminData = [
      { name: "Admin One", email: "admin1@edu.com" },
      { name: "Admin Two", email: "admin2@edu.com" },
    ];
    const admins = [];
    for (const admin of adminData) {
      const hashed = await hashPassword("admin123");
      const createdAdmin = await User.create({
        ...admin,
        password: hashed,
        role: "admin",
        createdBy: superAdmin._id,
        createdAt: randomDate(new Date("2024-02-01"), new Date("2024-03-01")),
      });
      admins.push(createdAdmin);
    }

    // Create Teachers
    console.log("👨‍🏫 Creating Teachers...");
    const teacherData = [
      {
        name: "Dr. Sarah Johnson",
        email: "sarah.j@edu.com",
        subjects: ["Mathematics", "Physics"],
      },
      {
        name: "Prof. Michael Chen",
        email: "michael.c@edu.com",
        subjects: ["Chemistry", "Biology"],
      },
      {
        name: "Ms. Emily Davis",
        email: "emily.d@edu.com",
        subjects: ["English", "Computer Science"],
      },
      {
        name: "Dr. Robert Brown",
        email: "robert.b@edu.com",
        subjects: ["Mathematics", "Computer Science"],
      },
      {
        name: "Prof. Lisa Anderson",
        email: "lisa.a@edu.com",
        subjects: ["Physics", "Chemistry"],
      },
    ];
    const teachers = [];
    for (const teacher of teacherData) {
      const hashed = await hashPassword("teacher123");
      const createdTeacher = await User.create({
        ...teacher,
        password: hashed,
        role: "teacher",
        createdBy: admins[0]._id,
        createdAt: randomDate(new Date("2024-03-01"), new Date("2024-04-01")),
      });
      teachers.push(createdTeacher);
    }

    // Create Students
    console.log("👨‍🎓 Creating Students...");
    const studentNames = [
      "Alex Martinez",
      "Emma Wilson",
      "James Taylor",
      "Sophia Lee",
      "William Garcia",
      "Olivia Rodriguez",
      "Benjamin Kim",
      "Ava Patel",
      "Lucas Singh",
      "Isabella Wang",
      "Mason Lopez",
      "Mia Johnson",
      "Ethan Brown",
      "Charlotte Davis",
      "Alexander Miller",
      "Amelia Wilson",
      "Daniel Moore",
      "Harper Anderson",
      "Matthew Thomas",
      "Evelyn Jackson",
      "David White",
      "Abigail Harris",
      "Joseph Martin",
      "Emily Thompson",
      "Andrew Garcia",
      "Elizabeth Martinez",
      "Joshua Robinson",
      "Sofia Clark",
      "Christopher Lewis",
      "Avery Walker",
    ];

    const students = [];
    for (let i = 0; i < studentNames.length; i++) {
      const hashed = await hashPassword("student123");
      const student = await User.create({
        name: studentNames[i],
        email: `student${i + 1}@edu.com`,
        studentId: `STU${String(i + 1).padStart(4, "0")}`,
        password: hashed,
        role: "student",
        createdBy: admins[Math.floor(Math.random() * admins.length)]._id,
        createdAt: randomDate(new Date("2024-04-01"), new Date("2024-06-01")),
      });
      students.push(student);
    }

    // Create Tests with Questions
    console.log("📝 Creating Tests and Questions...");
    const allTests = [];
    const subjects = Object.keys(questionBanks);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    for (let i = 0; i < 25; i++) {
      const subject = subjects[i % subjects.length];
      const teacher =
        teachers.find((t) => t.subjects.includes(subject)) || teachers[0];

      // Generate test date within last 6 months
      const testDate = randomDate(sixMonthsAgo, new Date());
      const startTime = new Date(testDate);
      startTime.setHours(9, 0, 0); // 9 AM
      const endTime = new Date(testDate);
      endTime.setHours(17, 0, 0); // 5 PM

      // Generate a unique encryption key for this test
      const encryptionKey = crypto.randomBytes(32).toString("hex");

      // Randomly assign 8-15 students to each test
      const numStudents = 8 + Math.floor(Math.random() * 8);
      const shuffled = [...students].sort(() => 0.5 - Math.random());
      const assignedStudents = shuffled.slice(0, numStudents).map((s) => s._id);

      // Create test
      const test = await Test.create({
        title: `${subject} ${
          ["Quiz", "Midterm", "Final", "Assessment", "Exam"][
            Math.floor(Math.random() * 5)
          ]
        } ${i + 1}`,
        subject,
        description: `Comprehensive ${subject} assessment covering key concepts`,
        teacher: teacher._id,
        assignedStudents,
        totalQuestions: 0, // Will update after adding questions
        testDate,
        startTime,
        endTime,
        durationMinutes: [30, 45, 60, 90][Math.floor(Math.random() * 4)],
        encryptionKey,
        termsAndConditions: [
          "Complete the test within the given time limit",
          "Do not refresh the page during the test",
          "Each question must be answered before moving to the next",
          "No going back to previous questions",
          "Ensure stable internet connection",
        ],
        status:
          testDate < new Date()
            ? "completed"
            : testDate.toDateString() === new Date().toDateString()
            ? "ongoing"
            : "upcoming",
        createdAt: new Date(testDate.getTime() - 7 * 24 * 60 * 60 * 1000), // Created 1 week before test date
      });
      allTests.push(test);

      // Create questions for this test (5-8 questions per test)
      const numQuestions = 5 + Math.floor(Math.random() * 4);
      const questionsData = questionBanks[subject] || questionBanks.Mathematics;
      const selectedQuestions = [];

      for (let q = 0; q < numQuestions; q++) {
        const questionData = questionsData[q % questionsData.length];

        // Encrypt question and options
        const encryptedQuestion = encryptString(questionData.question);
        const encryptedOptions = questionData.options.map((opt) =>
          encryptString(opt)
        );

        selectedQuestions.push({
          questionNumber: q + 1,
          encryptedQuestion,
          encryptedOptions,
          correctAnswerIndex: questionData.correctIndex,
          explanation: questionData.explanation,
          createdAt: test.createdAt,
        });
      }

      await Question.create({
        testId: test._id,
        subject,
        questions: selectedQuestions,
        createdBy: teacher._id,
        uploadedFileName: `${subject}_questions.docx`,
        fileType: "word",
        uploadedAt: test.createdAt,
        createdAt: test.createdAt,
      });

      // Update test with total questions
      await Test.findByIdAndUpdate(test._id, {
        totalQuestions: numQuestions,
      });

      // Create results for completed tests
      if (test.status === "completed") {
        for (const studentId of assignedStudents) {
          // 80% chance of completion
          if (Math.random() < 0.8) {
            const correctAnswers = Math.floor(
              Math.random() * (numQuestions + 1)
            );
            const percentage = Math.round(
              (correctAnswers / numQuestions) * 100
            );

            // Generate answers array
            const answers = [];
            for (let a = 0; a < numQuestions; a++) {
              const isCorrect = a < correctAnswers;
              answers.push({
                questionNumber: a + 1,
                chosenOption: isCorrect
                  ? selectedQuestions[a].correctAnswerIndex
                  : (selectedQuestions[a].correctAnswerIndex + 1) % 4,
                isCorrect,
                timeTakenSec: 30 + Math.floor(Math.random() * 90),
              });
            }

            await Result.create({
              student: studentId,
              test: test._id,
              totalQuestions: numQuestions,
              correctAnswers,
              percentage,
              answers,
              testCompleted: true,
              submittedAt: randomDate(
                startTime,
                new Date(Math.min(endTime.getTime(), new Date().getTime()))
              ),
              createdAt: test.createdAt,
            });
          }
        }
      }
    }

    console.log("\n✅ Seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Super Admins: 1`);
    console.log(`   - Admins: ${admins.length}`);
    console.log(`   - Teachers: ${teachers.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Tests: ${allTests.length}`);
    console.log(`   - Results: ${await Result.countDocuments()}`);
    console.log("\n🔑 Login Credentials:");
    console.log("   Super Admin: superadmin@edu.com / admin123");
    console.log("   Admin: admin1@edu.com / admin123");
    console.log("   Teacher: sarah.j@edu.com / teacher123");
    console.log("   Student: student1@edu.com / student123");
    console.log("\n💡 All users have similar password patterns!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
