const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "students.json");

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Helper functions
function readStudents() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8") || "[]");
}

function saveStudents(students) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
}

// POST - register a new student
app.post("/api/register", (req, res) => {
  const { name, email, phone, gender, course, address } = req.body;

  // Server-side validation
  if (!name || !email || !phone || !gender || !course || !address) {
    return res.status(400).json({ success: false, message: "Saari fields bharna zaroori hai." });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Email galat hai." });
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ success: false, message: "10 digit ka valid mobile number daalein." });
  }

  const students = readStudents();

  if (students.some((s) => s.email === email)) {
    return res.status(409).json({ success: false, message: "Is email se pehle hi registration ho chuka hai." });
  }

  const student = {
    id: Date.now(),
    name, email, phone, gender, course, address,
    registeredAt: new Date().toISOString(),
  };
  students.push(student);
  saveStudents(students);

  res.status(201).json({ success: true, message: "Registration safal raha!", student });
});

// GET - list all students
app.get("/api/students", (req, res) => {
  res.json(readStudents());
});

// DELETE - remove a student
app.delete("/api/students/:id", (req, res) => {
  const students = readStudents().filter((s) => String(s.id) !== req.params.id);
  saveStudents(students);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server chal raha hai: http://localhost:${PORT}`);
});
