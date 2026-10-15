const form = document.getElementById("regForm");
const message = document.getElementById("message");
const studentList = document.getElementById("studentList");

function setError(input, text) {
  const field = input.closest(".field");
  field.querySelector(".error").textContent = text;
  field.classList.toggle("invalid", Boolean(text));
}

function validate() {
  let valid = true;
  const v = (id) => document.getElementById(id);

  const checks = [
    [v("name"), v("name").value.trim().length >= 3, "Naam kam se kam 3 akshar ka ho."],
    [v("email"), /^\S+@\S+\.\S+$/.test(v("email").value.trim()), "Valid email daalein."],
    [v("phone"), /^[6-9]\d{9}$/.test(v("phone").value.trim()), "10 digit ka valid mobile number daalein."],
    [v("course"), v("course").value !== "", "Course chunein."],
    [v("address"), v("address").value.trim().length >= 5, "Address likhein."],
  ];

  checks.forEach(([input, ok, msg]) => {
    setError(input, ok ? "" : msg);
    if (!ok) valid = false;
  });

  // Gender radio
  const gender = form.querySelector('input[name="gender"]:checked');
  const genderField = form.querySelector('input[name="gender"]');
  setError(genderField, gender ? "" : "Gender chunein.");
  if (!gender) valid = false;

  return valid;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  message.textContent = "";
  message.className = "";

  if (!validate()) return;

  const data = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    gender: form.querySelector('input[name="gender"]:checked').value,
    course: form.course.value,
    address: form.address.value.trim(),
  };

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    message.textContent = result.message;
    message.className = result.success ? "success" : "fail";

    if (result.success) {
      form.reset();
      loadStudents();
    }
  } catch (err) {
    message.textContent = "Server se connect nahi ho paya.";
    message.className = "fail";
  }
});

async function loadStudents() {
  const res = await fetch("/api/students");
  const students = await res.json();

  studentList.innerHTML = "";
  students.forEach((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${escapeHtml(s.phone)}</td>
      <td>${escapeHtml(s.course)}</td>
      <td><button class="del-btn" data-id="${s.id}">Delete</button></td>`;
    studentList.appendChild(tr);
  });
}

studentList.addEventListener("click", async (e) => {
  if (e.target.classList.contains("del-btn")) {
    await fetch("/api/students/" + e.target.dataset.id, { method: "DELETE" });
    loadStudents();
  }
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

loadStudents();
