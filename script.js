const usersKey = 'cms_users'
const attendanceKey = 'cms_attendance'
const marksKey = 'cms_marks'
const timetableKey = 'cms_timetable'

function getUsers() {
  return JSON.parse(localStorage.getItem(usersKey)) || []
}

function saveUsers(users) {
  localStorage.setItem(usersKey, JSON.stringify(users))
}

function getAttendance() {
  return JSON.parse(localStorage.getItem(attendanceKey)) || {}
}

function getMarks() {
  return JSON.parse(localStorage.getItem(marksKey)) || {}
}

function getTimetable() {
  return JSON.parse(localStorage.getItem(timetableKey)) || {}
}

function saveDummyData() {
  if (!localStorage.getItem(attendanceKey)) {
    localStorage.setItem(attendanceKey, JSON.stringify({
      "student1": [
        { date: '2025-10-10', status: 'Present' },
        { date: '2025-10-11', status: 'Absent' },
        { date: '2025-10-12', status: 'Present' }
      ]
    }))
  }
  if (!localStorage.getItem(marksKey)) {
    localStorage.setItem(marksKey, JSON.stringify({
      "student1": [
        { subject: 'Math', obtained: 85, total: 100 },
        { subject: 'Physics', obtained: 90, total: 100 },
        { subject: 'Chemistry', obtained: 78, total: 100 }
      ]
    }))
  }
  if (!localStorage.getItem(timetableKey)) {
    localStorage.setItem(timetableKey, JSON.stringify({
      "student1": [
        { day: 'Monday', slot1: 'Math', slot2: 'Physics', slot3: 'Break', slot4: 'Chemistry' },
        { day: 'Tuesday', slot1: 'English', slot2: 'Math', slot3: 'Break', slot4: 'Computer Science' }
      ]
    }))
  }
}

function redirect(url) {
  window.location.href = url
}

if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault()
    let username = document.getElementById('username').value.trim()
    let password = document.getElementById('password').value.trim()
    let role = document.getElementById('role').value
    let users = getUsers()
    if (role === 'admin') {
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('cms_loggedInUser', JSON.stringify({ username, role }))
        redirect('admin-dashboard.html')
      } else {
        alert('Invalid admin credentials')
      }
    } else {
      let user = users.find(u => u.username === username && u.password === password)
      if (user) {
        localStorage.setItem('cms_loggedInUser', JSON.stringify({ username, role: 'student' }))
        redirect('student-dashboard.html')
      } else {
        alert('Invalid student credentials')
      }
    }
  })
}

if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').addEventListener('submit', e => {
    e.preventDefault()
    let username = document.getElementById('regUsername').value.trim()
    let password = document.getElementById('regPassword').value.trim()
    let roll = document.getElementById('regRoll').value.trim()
    let course = document.getElementById('regCourse').value.trim()
    if (!username || !password || !roll || !course) {
      alert('Please fill all fields')
      return
    }
    let users = getUsers()
    if (users.find(u => u.username === username)) {
      alert('Username already exists')
      return
    }
    users.push({ username, password, roll, course })
    saveUsers(users)
    alert('Registration successful! You can now login.')
    redirect('index.html')
  })
}

if (document.title === 'Student Dashboard') {
  let user = JSON.parse(localStorage.getItem('cms_loggedInUser'))
  if (!user || user.role !== 'student') {
    redirect('index.html')
  } else {
    saveDummyData()
    let users = getUsers()
    let student = users.find(u => u.username === user.username)
    let infoDiv = document.getElementById('studentInfo')
    infoDiv.innerHTML = `<p><strong>Username:</strong> ${student.username}</p>
                         <p><strong>Roll Number:</strong> ${student.roll}</p>
                         <p><strong>Course:</strong> ${student.course}</p>`
  }
}

if (document.title === 'Admin Dashboard') {
  let user = JSON.parse(localStorage.getItem('cms_loggedInUser'))
  if (!user || user.role !== 'admin') {
    redirect('index.html')
  } else {
    let users = getUsers()
    let list = document.getElementById('studentList')
    list.innerHTML = users.map(u => `<li>${u.username} | Roll: ${u.roll} | Course: ${u.course}</li>`).join('')
  }
}

if (document.title === 'Attendance') {
  let user = JSON.parse(localStorage.getItem('cms_loggedInUser'))
  if (!user || user.role !== 'student') {
    redirect('index.html')
  } else {
    saveDummyData()
    let attendanceData = getAttendance()[user.username] || []
    let container = document.getElementById('attendanceList')
    if (attendanceData.length === 0) {
      container.innerHTML = '<p>No attendance data found.</p>'
    } else {
      let html = '<table><thead><tr><th>Date</th><th>Status</th></tr></thead><tbody>'
      attendanceData.forEach(record => {
        html += `<tr><td>${record.date}</td><td>${record.status}</td></tr>`
      })
      html += '</tbody></table>'
      container.innerHTML = html
    }
  }
}

if (document.title === 'Marks') {
  let user = JSON.parse(localStorage.getItem('cms_loggedInUser'))
  if (!user || user.role !== 'student') {
    redirect('index.html')
  } else {
    saveDummyData()
    let marksData = getMarks()[user.username] || []
    let tbody = document.getElementById('marksTableBody')
    if (marksData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3">No marks data found.</td></tr>'
    } else {
      tbody.innerHTML = marksData.map(m => `<tr><td>${m.subject}</td><td>${m.obtained}</td><td>${m.total}</td></tr>`).join('')
    }
  }
}

if (document.title === 'Timetable') {
  let user = JSON.parse(localStorage.getItem('cms_loggedInUser'))
  if (!user || user.role !== 'student') {
    redirect('index.html')
  } else {
    saveDummyData()
    let timetableData = getTimetable()[user.username] || []
    let tbody = document.getElementById('timetableBody')
    if (timetableData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">No timetable data found.</td></tr>'
    } else {
      tbody.innerHTML = timetableData.map(day => `<tr>
        <td>${day.day}</td>
        <td>${day.slot1}</td>
        <td>${day.slot2}</td>
        <td>${day.slot3}</td>
        <td>${day.slot4}</td>
      </tr>`).join('')
    }
  }
}

function logout() {
  localStorage.removeItem('cms_loggedInUser')
  redirect('index.html')
}

function backToDashboard() {
  let user = JSON.parse(localStorage.getItem('cms_loggedInUser'))
  if (user && user.role === 'student') {
    redirect('student-dashboard.html')
  } else if (user && user.role === 'admin') {
    redirect('admin-dashboard.html')
  } else {
    redirect('index.html')
  }
}
