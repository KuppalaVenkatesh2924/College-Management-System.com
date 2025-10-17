const usersKey = 'cms_users';
const attendanceKey = 'cms_attendance';
const timetableKey = 'cms_timetable';

function redirect(page) {
  window.location.href = page;
}

function getUsers() {
  return JSON.parse(localStorage.getItem(usersKey)) || [];
}

function saveUsers(users) {
  localStorage.setItem(usersKey, JSON.stringify(users));
}

function getAttendance() {
  return JSON.parse(localStorage.getItem(attendanceKey)) || {};
}

function getTimetable() {
  return JSON.parse(localStorage.getItem(timetableKey)) || {};
}

function saveAttendance(data) {
  localStorage.setItem(attendanceKey, JSON.stringify(data));
}

function saveTimetable(data) {
  localStorage.setItem(timetableKey, JSON.stringify(data));
}

function userExists(username) {
  return getUsers().some(user => user.username === username);
}

function registerUser(user) {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

function login(username, password, role) {
  if (role === 'admin') {
    if (username === 'admin' && password === 'admin123') {
      return { username: 'admin', role: 'admin' };
    } else {
      return null;
    }
  }

  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password && u.role === role);
  return user || null;
}

function setLoggedInUser(user) {
  localStorage.setItem('cms_loggedInUser', JSON.stringify(user));
}

function getLoggedInUser() {
  return JSON.parse(localStorage.getItem('cms_loggedInUser'));
}

function logout() {
  localStorage.removeItem('cms_loggedInUser');
  redirect('index.html');
}

if (document.title === 'Login') {
  const loginForm = document.getElementById('loginForm');
  
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;

    if (!username || !password) {
      alert('Please fill all fields.');
      return;
    }

    const user = login(username, password, role);
    if (user) {
      setLoggedInUser(user);
      if (user.role === 'admin') {
        redirect('admin-dashboard.html');
      } else {
        redirect('student-dashboard.html');
      }
    } else {
      alert('Invalid credentials or role.');
    }
  });
}

if (document.title === 'Register') {
  const registerForm = document.getElementById('registerForm');

  registerForm.addEventListener('submit', e => {
    e.preventDefault();

    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const roll = document.getElementById('registerRoll').value.trim();
    const course = document.getElementById('registerCourse').value.trim();

    if (!username || !password || !roll || !course) {
      alert('Please fill all fields.');
      return;
    }

    if (userExists(username)) {
      alert('Username already exists.');
      return;
    }

    const newUser = {
      username,
      password,
      roll,
      course,
      role: 'student'
    };

    registerUser(newUser);
    alert('Registration successful! Please login.');
    redirect('index.html');
  });
}

if (document.title === 'Admin Dashboard') {
  const user = getLoggedInUser();
  if (!user || user.role !== 'admin') {
    redirect('index.html');
  } else {
    const studentList = document.getElementById('studentList');
    const attendanceStudentSelect = document.getElementById('attendanceStudent');
    const timetableStudentSelect = document.getElementById('timetableStudent');
    const attendanceForm = document.getElementById('attendanceForm');
    const timetableForm = document.getElementById('timetableForm');

    const users = getUsers();
    if (users.length === 0) {
      studentList.innerHTML = '<li>No students registered.</li>';
    } else {
      studentList.innerHTML = users.map(u => 
        `<li><strong>${u.username}</strong> | Roll: ${u.roll} | Course: ${u.course}</li>`
      ).join('');
    }

    const optionsHTML = users.map(u => `<option value="${u.username}">${u.username}</option>`).join('');
    attendanceStudentSelect.innerHTML = optionsHTML;
    timetableStudentSelect.innerHTML = optionsHTML;

    attendanceForm.addEventListener('submit', e => {
      e.preventDefault();

      const username = attendanceStudentSelect.value;
      const date = document.getElementById('attendanceDate').value;
      const status = document.getElementById('attendanceStatus').value;

      if (!date) {
        alert('Please select a date.');
        return;
      }

      const attendanceData = getAttendance();
      if (!attendanceData[username]) attendanceData[username] = [];

      attendanceData[username].push({ date, status });
      saveAttendance(attendanceData);

      alert('Attendance added successfully!');
      attendanceForm.reset();
    });

    timetableForm.addEventListener('submit', e => {
      e.preventDefault();

      const username = timetableStudentSelect.value;
      const day = document.getElementById('timetableDay').value;
      const slot1 = document.getElementById('slot1').value;
      const slot2 = document.getElementById('slot2').value;
      const slot3 = document.getElementById('slot3').value;
      const slot4 = document.getElementById('slot4').value;

      if (!slot1 || !slot2 || !slot3 || !slot4) {
        alert('Please select all subjects for timetable.');
        return;
      }

      const timetableData = getTimetable();
      if (!timetableData[username]) timetableData[username] = [];

      const existingIndex = timetableData[username].findIndex(t => t.day === day);
      const dayEntry = { day, slot1, slot2, slot3, slot4 };

      if (existingIndex >= 0) {
        timetableData[username][existingIndex] = dayEntry;
      } else {
        timetableData[username].push(dayEntry);
      }

      saveTimetable(timetableData);

      alert('Timetable updated successfully!');
      timetableForm.reset();
    });
  }
}

if (document.title === 'Student Dashboard') {
  const user = getLoggedInUser();
  if (!user || user.role !== 'student') {
    redirect('index.html');
  } else {
    const welcomeMsg = document.getElementById('welcomeMsg');
    const attendanceList = document.getElementById('attendanceList');
    const timetableList = document.getElementById('timetableList');

    welcomeMsg.textContent = `Welcome, ${user.username}`;

    const attendanceData = getAttendance();
    const studentAttendance = attendanceData[user.username] || [];
    if (studentAttendance.length === 0) {
      attendanceList.innerHTML = '<li>No attendance records.</li>';
    } else {
      attendanceList.innerHTML = studentAttendance.map(rec =>
        `<li>${rec.date} - ${rec.status}</li>`
      ).join('');
    }

    const timetableData = getTimetable();
    const studentTimetable = timetableData[user.username] || [];
    if (studentTimetable.length === 0) {
      timetableList.innerHTML = '<li>No timetable set.</li>';
    } else {
      timetableList.innerHTML = studentTimetable.map(day => `
        <li>
          <strong>${day.day}</strong>: 
          9-10: ${day.slot1}, 
          10-11: ${day.slot2}, 
          11-12: ${day.slot3}, 
          12-1: ${day.slot4}
        </li>
      `).join('');
    }
  }
}
