let currentUser = null;
let users = [];

function loadUsers() {
  const stored = localStorage.getItem('skillswap_users');
  if (stored) {
    try {
      users = JSON.parse(stored);
    } catch (e) { users = []; }
  } else {
    users = [];
  }
}

function saveUsers() {
  localStorage.setItem('skillswap_users', JSON.stringify(users));
}

function findUserByEmail(email) {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

function authenticateUser(email, password) {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
}

function saveCurrentUser(user) {
  currentUser = user;
  localStorage.setItem('skillswap_current_user', JSON.stringify(user));
}

function getCurrentUser() {
  const stored = localStorage.getItem('skillswap_current_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) { return null; }
  }
  return null;
}

function logout() {
  localStorage.removeItem('skillswap_current_user');
  currentUser = null;
  location.reload();
}

function updateUIForUser() {
  const placeholder = document.getElementById('userProfilePlaceholder');
  if (currentUser) {
    placeholder.innerHTML = `
      <div class="profile-bar">
        <i class="fas fa-user-circle"></i>
        <span>${currentUser.name}</span>
        <button class="logout-btn" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</button>
      </div>
    `;
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
  } else {
    placeholder.innerHTML = `<button id="registerBtn" class="btn-outline"><i class="fas fa-user-plus"></i> Get Started</button>`;
    document.getElementById('registerBtn')?.addEventListener('click', showLoginModal);
  }
}


function showLoginModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-container">
      <div style="text-align: right; margin-bottom: 16px;"><button id="closeLoginBtn" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button></div>
      <h3>Welcome Back</h3>
      <div class="form-group"><label>Email</label><input type="email" id="loginEmail" placeholder="you@example.com"></div>
      <div class="form-group"><label>Password</label><input type="password" id="loginPassword" placeholder="Enter your password"></div>
      <button class="btn-primary" id="loginBtn" style="width:100%;">Login</button>
      <p style="text-align: center; margin-top: 16px;">Don't have an account? <a href="#" id="showRegisterLink" style="color: var(--ethio-green);">Create an account</a></p>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#closeLoginBtn').onclick = () => modal.remove();
  modal.querySelector('#showRegisterLink').onclick = (e) => {
    e.preventDefault();
    modal.remove();
    showRegistrationModal();
  };
  modal.querySelector('#loginBtn').onclick = () => {
    const email = modal.querySelector('#loginEmail').value.trim();
    const password = modal.querySelector('#loginPassword').value;
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }
    const user = authenticateUser(email, password);
    if (user) {
      saveCurrentUser(user);
      modal.remove();
      currentUser = user;
      updateUIForUser();
      if (currentUser.interest) {
        currentCategoryFilter = currentUser.interest;
        renderJobs();
      }
      showPage('home');
    } else {
      alert('Invalid email or password. Please try again or create an account.');
    }
  };
}


function showRegistrationModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-container">
      <div style="text-align: right; margin-bottom: 16px;"><button id="closeModalBtn" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button></div>
      <div id="step1" class="step active-step">
        <h3>Step 1: Personal Info</h3>
        <div class="form-group"><label>Full Name *</label><input type="text" id="regName" placeholder="e.g., Abebe Bekele"></div>
        <div class="form-group"><label>Age *</label><input type="number" id="regAge" placeholder="18+"></div>
        <div class="form-group"><label>Email *</label><input type="email" id="regEmail" placeholder="you@example.com"></div>
        <div class="form-group"><label>Phone Number *</label><input type="tel" id="regPhone" placeholder="+2519XXXXXXXX"></div>
        <div class="form-group"><label>Password *</label><input type="password" id="regPassword" placeholder="Create a password"></div>
        <div class="form-group"><label>Confirm Password *</label><input type="password" id="regConfirmPassword" placeholder="Confirm password"></div>
        <button class="btn-primary" id="nextStep1">Next →</button>
        <p style="margin-top: 16px; text-align: center;">Already have an account? <a href="#" id="gotoLogin" style="color: var(--ethio-green);">Login here</a></p>
      </div>
      <div id="step2" class="step">
        <h3>Step 2: ID Verification</h3>
        <p>Please upload a photo of your ID (passport, national ID, or driver's license).</p>
        <div class="form-group"><label>ID Photo</label><input type="file" id="idPhoto" accept="image/*"></div>
        <div id="idPreview" style="margin: 12px 0;"></div>
        <button class="btn-primary" id="nextStep2">Next →</button>
        <button class="btn-outline" id="backStep1">← Back</button>
      </div>
      <div id="step3" class="step">
        <h3>Step 3: Skill Preference Test</h3>
        <div class="form-group"><label>Which field excites you most?</label>
          <div class="radio-group" id="interestGroup">
            <label><input type="radio" name="interest" value="tech"> 💻 Coding & Tech</label>
            <label><input type="radio" name="interest" value="design"> 🎨 Design & Creativity</label>
            <label><input type="radio" name="interest" value="agri"> 🌾 Agriculture & Environment</label>
            <label><input type="radio" name="interest" value="business"> 📊 Business & Leadership</label>
          </div>
        </div>
        <div class="form-group"><label>How do you prefer to work?</label>
          <div class="radio-group" id="workStyleGroup">
            <label><input type="radio" name="style" value="solo"> 🧠 Solo & deep focus</label>
            <label><input type="radio" name="style" value="team"> 🤝 Team collaboration</label>
            <label><input type="radio" name="style" value="company"> 🏢 In a company/organization</label>
          </div>
        </div>
        <button class="btn-primary" id="nextStep3">Next →</button>
        <button class="btn-outline" id="backStep2">← Back</button>
      </div>
      <div id="step4" class="step">
        <h3>Step 4: Follow Us</h3>
        <p>Follow our official channels to get updates.</p>
        <div class="follow-buttons">
          <a href="https://t.me/skillswapethiopia" target="_blank" class="follow-btn follow-telegram"><i class="fab fa-telegram"></i> Telegram</a>
          <a href="https://instagram.com/skillswapethiopia" target="_blank" class="follow-btn follow-instagram"><i class="fab fa-instagram"></i> Instagram</a>
        </div>
        <div class="follow-status">
          <label><input type="checkbox" id="followedTelegram"> I've followed on Telegram</label><br>
          <label><input type="checkbox" id="followedInstagram"> I've followed on Instagram</label>
        </div>
        <button class="btn-primary" id="nextStep4">Next →</button>
        <button class="btn-outline" id="backStep3">← Back</button>
      </div>
      <div id="step5" class="step">
        <h3>Step 5: Registration Fee</h3>
        <p>To access the full platform, a one-time registration fee of <strong>50 ETB</strong> is required. This helps us maintain the platform and provide quality services.</p>
        <div class="form-group">
          <label>Select Payment Method</label>
          <select id="paymentMethod">
            <option value="telebirr">Telebirr</option>
            <option value="cbebirr">CBE Birr</option>
            <option value="card">Visa/Mastercard</option>
          </select>
        </div>
        <div id="paymentSimulation" style="background: #f0f2e5; padding: 16px; border-radius: 24px; margin: 16px 0;">
          <p><i class="fas fa-info-circle"></i> <strong>Demo Mode:</strong> Click "Pay Now" to simulate payment. In production, this would connect to a real payment gateway.</p>
        </div>
        <button class="btn-primary" id="completePayment">Pay 50 ETB & Complete Registration</button>
        <button class="btn-outline" id="backStep4">← Back</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  let step1 = modal.querySelector('#step1'), step2 = modal.querySelector('#step2'), step3 = modal.querySelector('#step3'), step4 = modal.querySelector('#step4'), step5 = modal.querySelector('#step5');

  function showStep(step) {
    [step1, step2, step3, step4, step5].forEach((s, idx) => {
      if (idx + 1 === step) s.classList.add('active-step');
      else s.classList.remove('active-step');
    });
  }

  function validateStep1() {
    let name = modal.querySelector('#regName').value.trim();
    let age = modal.querySelector('#regAge').value;
    let email = modal.querySelector('#regEmail').value.trim();
    let phone = modal.querySelector('#regPhone').value.trim();
    let password = modal.querySelector('#regPassword').value;
    let confirm = modal.querySelector('#regConfirmPassword').value;
    if (!name) { alert('Please enter your full name'); return false; }
    if (!age || age < 16 || age > 100) { alert('Please enter a valid age (16-100)'); return false; }
    if (!email || !email.includes('@')) { alert('Please enter a valid email'); return false; }
    if (!phone || phone.length < 10) { alert('Please enter a valid phone number'); return false; }
    if (!password || password.length < 4) { alert('Password must be at least 4 characters'); return false; }
    if (password !== confirm) { alert('Passwords do not match'); return false; }
    if (findUserByEmail(email)) { alert('An account with this email already exists. Please login.'); return false; }
    return true;
  }
  function validateStep2() {
    let file = modal.querySelector('#idPhoto').files[0];
    if (!file) { alert('Please upload a photo of your ID'); return false; }
    return true;
  }
  function validateStep3() {
    let interest = modal.querySelector('input[name="interest"]:checked');
    let style = modal.querySelector('input[name="style"]:checked');
    if (!interest) { alert('Please select your preferred field'); return false; }
    if (!style) { alert('Please select your work style'); return false; }
    return true;
  }
  function validateStep4() {
    let followedTele = modal.querySelector('#followedTelegram').checked;
    let followedInsta = modal.querySelector('#followedInstagram').checked;
    if (!followedTele || !followedInsta) {
      alert('Please follow our Telegram and Instagram pages, then check the boxes to confirm.');
      return false;
    }
    return true;
  }

  modal.querySelector('#nextStep1').onclick = () => { if (validateStep1()) showStep(2); };
  modal.querySelector('#nextStep2').onclick = () => { if (validateStep2()) showStep(3); };
  modal.querySelector('#nextStep3').onclick = () => { if (validateStep3()) showStep(4); };
  modal.querySelector('#nextStep4').onclick = () => { if (validateStep4()) showStep(5); };
  modal.querySelector('#backStep1').onclick = () => showStep(1);
  modal.querySelector('#backStep2').onclick = () => showStep(2);
  modal.querySelector('#backStep3').onclick = () => showStep(3);
  modal.querySelector('#backStep4').onclick = () => showStep(4);


  modal.querySelector('#idPhoto').addEventListener('change', function(e) {
    let preview = modal.querySelector('#idPreview');
    preview.innerHTML = '';
    if (this.files && this.files[0]) {
      let img = document.createElement('img');
      img.src = URL.createObjectURL(this.files[0]);
      img.style.maxWidth = '100%';
      img.style.maxHeight = '150px';
      img.style.borderRadius = '12px';
      preview.appendChild(img);
    }
  });


  modal.querySelector('#completePayment').onclick = () => {
    alert('✅ Payment simulated successfully! 50 ETB registration fee received. You now have full access to SkillSwap Ethiopia.');
    let newUser = {
      name: modal.querySelector('#regName').value.trim(),
      age: parseInt(modal.querySelector('#regAge').value),
      email: modal.querySelector('#regEmail').value.trim(),
      phone: modal.querySelector('#regPhone').value.trim(),
      password: modal.querySelector('#regPassword').value,
      interest: modal.querySelector('input[name="interest"]:checked').value,
      workStyle: modal.querySelector('input[name="style"]:checked').value,
      registeredAt: new Date().toISOString(),
      paymentCompleted: true
    };
    users.push(newUser);
    saveUsers();
    saveCurrentUser(newUser);
    modal.remove();
    currentUser = newUser;
    updateUIForUser();
    if (currentUser.interest) {
      currentCategoryFilter = currentUser.interest;
      renderJobs();
    }
    showPage('home');
  };
  modal.querySelector('#closeModalBtn').onclick = () => modal.remove();
  modal.querySelector('#gotoLogin').onclick = (e) => {
    e.preventDefault();
    modal.remove();
    showLoginModal();
  };
}


const pages = {
  home: document.getElementById('home-page'),
  aitest: document.getElementById('aitest-page'),
  learnearn: document.getElementById('learnearn-page'),
  offlineai: document.getElementById('offlineai-page'),
  jobs: document.getElementById('jobs-page'),
  jobdetail: document.getElementById('jobdetail-page'),
  coursedetail: document.getElementById('coursedetail-page')
};

function showPage(pageId) {
  Object.values(pages).forEach(page => page.classList.remove('active-page'));
  pages[pageId].classList.add('active-page');
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('data-page') === pageId) link.classList.add('active');
    else link.classList.remove('active');
  });
  if (pageId === 'jobs') renderJobs();
}

document.querySelectorAll('.nav-links a, [data-page]').forEach(el => {
  el.addEventListener('click', (e) => {
    const page = el.getAttribute('data-page');
    if (page && pages[page]) showPage(page);
  });
});
document.querySelector('.logo')?.addEventListener('click', () => showPage('home'));


const allJobs = [
  { id: 1, title: "Junior Full Stack Developer", company: "IceAddis Tech", category: "tech", location: "Addis Ababa", salary: "15k-22k ETB", desc: "React + Node.js, fresh grads welcome", requirements: "1+ year experience with MERN stack, good problem-solving skills, team player.", benefits: "Health insurance, remote work options, professional development budget." },
  { id: 2, title: "UI/UX Designer", company: "Creative Hub Ethiopia", category: "design", location: "Remote", salary: "12k-18k ETB", desc: "Figma, portfolio building", requirements: "Portfolio showcasing UI/UX projects, proficiency in Figma, understanding of user-centered design.", benefits: "Flexible hours, creative team environment." },
  { id: 3, title: "AgriTech Officer", company: "Green Ethiopia PLC", category: "agri", location: "Hawassa", salary: "10k-15k ETB", desc: "Smart irrigation & extension services", requirements: "Degree in agriculture or related, experience with irrigation systems, willingness to travel to rural areas.", benefits: "Accommodation support, field training." },
  { id: 4, title: "Business Development Associate", company: "Ethio Export Group", category: "business", location: "Addis", salary: "14k-20k ETB", desc: "Sales, partnership growth", requirements: "Sales experience, strong communication skills, knowledge of Ethiopian export market.", benefits: "Performance bonuses, career growth opportunities." },
  { id: 5, title: "Frontend Developer (React)", company: "Kifiya Financial", category: "tech", location: "Addis Ababa", salary: "20k-28k ETB", desc: "Fintech, high growth", requirements: "Strong React skills, experience with state management, fintech background a plus.", benefits: "Stock options, premium health coverage." },
  { id: 6, title: "Graphic Designer", company: "Roha Media", category: "design", location: "Bahir Dar", salary: "9k-14k ETB", desc: "Social media creatives", requirements: "Adobe Creative Suite, creative mindset, social media design experience.", benefits: "Creative freedom, company events." },
  { id: 7, title: "Sustainable Farming Specialist", company: "EthioAgri Corp", category: "agri", location: "Jimma", salary: "11k-16k ETB", desc: "Coffee & crop management", requirements: "Agronomy background, experience with coffee farming, sustainable practices.", benefits: "Housing allowance, research opportunities." },
  { id: 8, title: "Sales Team Lead", company: "Zemen Logistics", category: "business", location: "Dire Dawa", salary: "16k-22k ETB", desc: "B2B sales", requirements: "Proven sales track record, leadership skills, logistics experience preferred.", benefits: "Commission structure, travel allowance." }
];
let currentCategoryFilter = null;

function renderJobs() {
  const container = document.getElementById("jobListContainer");
  if (!container) return;
  let filtered = currentCategoryFilter ? allJobs.filter(job => job.category === currentCategoryFilter) : allJobs;
  if (filtered.length === 0) { container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px;">✨ New jobs coming soon. Take a course & unlock hidden roles!</div>`; return; }
  container.innerHTML = filtered.map(job => `
    <div class="job-card" data-job-id="${job.id}">
      <h4><i class="fas fa-briefcase"></i> ${job.title}</h4>
      <p style="color: var(--ethio-green); font-weight:600;">${job.company}</p>
      <p><i class="fas fa-map-marker-alt"></i> ${job.location} &nbsp;| 💰 ${job.salary}</p>
      <p style="font-size:0.9rem; margin:12px 0;">${job.desc}</p>
      <button class="btn-outline learn-apply-btn" data-job-id="${job.id}" style="padding:6px 14px;"><i class="fas fa-graduation-cap"></i> Learn & Apply</button>
    </div>
  `).join('');
  const label = document.getElementById("activeFilterLabel");
  if (label) label.innerText = currentCategoryFilter ? `🔥 ${currentCategoryFilter.toUpperCase()} jobs (matched by AI)` : `📢 All open positions (${allJobs.length}+ live)`;

  document.querySelectorAll('.learn-apply-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const jobId = parseInt(btn.getAttribute('data-job-id'));
      const job = allJobs.find(j => j.id === jobId);
      if (job) showJobDetail(job);
    });
  });
}

function showJobDetail(job) {
  const container = document.getElementById('jobDetailContainer');
  container.innerHTML = `
    <div class="job-detail-header">
      <h2>${job.title}</h2>
      <p><i class="fas fa-building"></i> ${job.company}</p>
    </div>
    <div class="job-detail-meta">
      <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
      <span><i class="fas fa-money-bill-wave"></i> ${job.salary}</span>
      <span><i class="fas fa-tag"></i> ${job.category.toUpperCase()}</span>
    </div>
    <div class="job-description">
      <h3>Job Description</h3>
      <p>${job.desc}</p>
      <h3 style="margin-top: 20px;">Requirements</h3>
      <p>${job.requirements || "• Relevant experience\n• Strong communication skills\n• Passion for growth"}</p>
      <h3 style="margin-top: 20px;">Benefits</h3>
      <p>${job.benefits || "• Competitive salary\n• Health insurance\n• Career development opportunities"}</p>
    </div>
    <div class="apply-section">
      <button id="applyNowBtn" class="btn-primary"><i class="fab fa-telegram"></i> Apply via Telegram Bot</button>
      <p style="margin-top: 12px; font-size: 0.85rem;">Clicking will open <strong>@SkillSwapEthiopiaBot</strong> on Telegram. Complete your application there.</p>
    </div>
  `;
  document.getElementById('applyNowBtn')?.addEventListener('click', () => {
    window.open('https://t.me/SkillSwapEthiopiaBot', '_blank');
  });
  showPage('jobdetail');
}

document.getElementById("resetJobsBtn")?.addEventListener("click", () => { currentCategoryFilter = null; renderJobs(); });
document.getElementById("backToJobsBtn")?.addEventListener("click", () => showPage('jobs'));
renderJobs();


document.getElementById("runAiTestBtn")?.addEventListener("click", () => {
  const selectedInterest = document.querySelector('#aitest-page input[name="interest"]:checked');
  if (!selectedInterest) { alert("🇪🇹 Please select your main interest field to unlock AI job match!"); return; }
  const category = selectedInterest.value;
  const jobRoleMap = { tech: "Software Developer, IT Support, Data Analyst", design: "UI/UX Designer, Graphic Artist", agri: "Agronomist, Farm Manager", business: "Business Analyst, Project Manager" };
  const courseMap = { tech: "🎓 Recommended: Full Stack Web Dev", design: "🎨 Recommended: Professional Design Masterclass", agri: "🌱 Recommended: Smart Farming & Agribusiness", business: "📈 Recommended: Business Leadership & Sales Track" };
  document.getElementById("aiMatchText").innerHTML = `<i class="fas fa-microchip"></i> ✅ AI analysis: You're a perfect fit for ${jobRoleMap[category]}.`;
  document.getElementById("aiRecommendCourse").innerHTML = `<div style="margin-top:12px;"><i class="fas fa-book-open"></i> ${courseMap[category]}</div><div>✨ Matched jobs updated below!</div>`;
  document.getElementById("aiResultContainer").style.display = "block";
  currentCategoryFilter = category;
  renderJobs();
  showPage('jobs');
});


const courses = {
  webdev: {
    title: "Full-Stack Web Development",
    description: "Master modern web development with MERN stack (MongoDB, Express, React, Node.js) and AI tools. This course prepares you for high-demand tech roles with job guarantee.",
    lectures: [
      "Introduction to Web Development & HTML/CSS",
      "JavaScript Fundamentals & ES6+",
      "React.js: Components, State, and Props",
      "Backend with Node.js & Express",
      "MongoDB Database Design",
      "Building Full-Stack Applications",
      "Deployment & DevOps Basics",
      "AI Integration in Web Apps"
    ],
    videos: [
      { title: "HTML & CSS Full Course (freeCodeCamp)", url: "https://youtu.be/mU6anWqZJcc" },
      { title: "JavaScript Full Course (freeCodeCamp)", url: "https://youtu.be/PkZNo7MFNFg" },
      { title: "React JS Course (Traversy Media)", url: "https://youtu.be/w7ejDZ8SWv8" },
      { title: "Node.js & Express Crash Course (Traversy Media)", url: "https://youtu.be/fBNz5xF-Kx4" },
      { title: "MongoDB Full Course (freeCodeCamp)", url: "https://youtu.be/2QQGWYe7IDU" },
      { title: "MERN Stack Tutorial (freeCodeCamp)", url: "https://youtu.be/7CqJlxBYj-M" },
      { title: "Deploy MERN App to Heroku", url: "https://youtu.be/4D1MkwYfJfo" },
      { title: "AI for Web Developers (Google AI)", url: "https://youtu.be/1f1h0_uvmUY" }
    ],
    pdfUrl: "https://t.me/skillswapethiopia",
    telegramGroup: "https://t.me/skillswapethiopia"
  },
  marketing: {
    title: "Digital Marketing",
    description: "Learn SEO, Social Media Marketing, Email Campaigns, and Analytics. Get certified and land internships with top Ethiopian brands.",
    lectures: [
      "Introduction to Digital Marketing",
      "SEO Fundamentals",
      "Social Media Strategy (Facebook, Instagram, TikTok)",
      "Content Marketing & Blogging",
      "Email Marketing & Automation",
      "Google Analytics & Data Insights",
      "Paid Advertising (Google Ads, Meta Ads)",
      "E-commerce Marketing"
    ],
    videos: [
      { title: "Digital Marketing Full Course (Google)", url: "https://youtu.be/7bNPg8UbhaE" },
      { title: "SEO Tutorial for Beginners (Ahrefs)", url: "https://youtu.be/9tH6KhZ4KdU" },
      { title: "Social Media Marketing 2024 (Neil Patel)", url: "https://youtu.be/IO9p8c7dC-A" },
      { title: "Content Marketing Masterclass (HubSpot)", url: "https://youtu.be/0tVJqVW_OGU" },
      { title: "Email Marketing with Mailchimp", url: "https://youtu.be/0B5rUy7t3M4" },
      { title: "Google Analytics 4 Tutorial", url: "https://youtu.be/4bq-WZqTXr4" },
      { title: "Google Ads Complete Course", url: "https://youtu.be/2U2z7VjYxTo" },
      { title: "E-commerce Marketing Strategies", url: "https://youtu.be/3bFv2M7JhAg" }
    ],
    pdfUrl: "https://t.me/skillswapethiopia",
    telegramGroup: "https://t.me/skillswapethiopia"
  },
  agritech: {
    title: "Smart Farming & Agri-tech",
    description: "Modern agriculture techniques, irrigation systems, drone technology, and agribusiness management. Direct placement with cooperatives.",
    lectures: [
      "Introduction to Precision Agriculture",
      "Soil Science & Crop Management",
      "Irrigation Systems & Water Management",
      "Drone Technology in Farming",
      "Agribusiness & Marketing",
      "Sustainable Farming Practices",
      "Digital Tools for Farmers",
      "Access to Finance & Government Programs"
    ],
    videos: [
      { title: "Precision Agriculture Overview", url: "https://youtu.be/8Kq-8iR6F6I" },
      { title: "Soil Health & Management", url: "https://youtu.be/URjQbHpBQ7U" },
      { title: "Modern Irrigation Techniques", url: "https://youtu.be/0jPvSb6jF0U" },
      { title: "Drones in Agriculture (DJI)", url: "https://youtu.be/Ph9bS2zA9Lg" },
      { title: "Agribusiness Marketing", url: "https://youtu.be/7Gd7QaU2fMk" },
      { title: "Sustainable Farming Practices", url: "https://youtu.be/6vGt4-1Z0aI" },
      { title: "Digital Tools for Farmers (FAO)", url: "https://youtu.be/3J8Z7T0uM8w" },
      { title: "Agricultural Finance & Grants", url: "https://youtu.be/4A1Rq1VqH7k" }
    ],
    pdfUrl: "https://t.me/skillswapethiopia",
    telegramGroup: "https://t.me/skillswapethiopia"
  },
  business: {
    title: "Business Management & Leadership",
    description: "Project management, finance, entrepreneurship, and leadership skills. Guaranteed interview with partner firms upon completion.",
    lectures: [
      "Introduction to Business Management",
      "Strategic Planning & Decision Making",
      "Financial Management Basics",
      "Project Management (Agile, Scrum)",
      "Marketing & Sales Strategy",
      "Human Resources & Team Leadership",
      "Entrepreneurship & Startup Culture",
      "Business Ethics & Corporate Governance"
    ],
    videos: [
      { title: "Business Management 101 (Crash Course)", url: "https://youtu.be/9HxGcL1Y1LA" },
      { title: "Strategic Planning (Harvard)", url: "https://youtu.be/5g9jRrC9J0U" },
      { title: "Financial Management Basics", url: "https://youtu.be/6X7pLkG2R4c" },
      { title: "Project Management Full Course (Google)", url: "https://youtu.be/3WrNpJ-Po1U" },
      { title: "Marketing Strategy (Kotler)", url: "https://youtu.be/3FpU8eC7FJg" },
      { title: "Leadership & HR (Simon Sinek)", url: "https://youtu.be/ILJfJq4_3lE" },
      { title: "Entrepreneurship 101 (Stanford)", url: "https://youtu.be/2P6d6p7KjGc" },
      { title: "Business Ethics (TEDx)", url: "https://youtu.be/1o5VZgQzC1c" }
    ],
    pdfUrl: "https://t.me/skillswapethiopia",
    telegramGroup: "https://t.me/skillswapethiopia"
  }
};

function showCourseDetail(courseKey) {
  const course = courses[courseKey];
  if (!course) return;
  const container = document.getElementById('courseDetailContainer');
  container.innerHTML = `
    <div class="course-detail-header">
      <h2>${course.title}</h2>
      <p>${course.description}</p>
    </div>
    <div class="tutorial-section">
      <h3><i class="fas fa-chalkboard-teacher"></i> Lectures</h3>
      <ul class="video-list">
        ${course.lectures.map(lec => `<li><i class="fas fa-play-circle"></i> ${lec}</li>`).join('')}
      </ul>
      <h3><i class="fas fa-video"></i> Video Tutorials</h3>
      <ul class="video-list">
        ${course.videos.map(vid => `<li><i class="fab fa-youtube"></i> <a href="${vid.url}" target="_blank">${vid.title}</a></li>`).join('')}
      </ul>
      <h3><i class="fas fa-book-open"></i> Resources</h3>
      <a href="${course.pdfUrl}" target="_blank" class="pdf-button"><i class="fab fa-telegram"></i> Download Course PDF (via Telegram Group)</a>
      <p style="margin-top: 12px;">Join our Telegram group to get the PDF and interact with instructors: <a href="${course.telegramGroup}" target="_blank">${course.telegramGroup}</a></p>
    </div>
  `;
  showPage('coursedetail');
}

document.querySelectorAll('.course-card').forEach(card => {
  card.addEventListener('click', () => {
    const courseKey = card.getAttribute('data-course');
    if (courseKey) showCourseDetail(courseKey);
  });
});
document.getElementById('backToCoursesBtn')?.addEventListener('click', () => showPage('learnearn'));


const chatBox = document.getElementById("aiChatBox");
const smsInput = document.getElementById("smsMessageInput");
const sendBtn = document.getElementById("sendSmsBtn");
const phoneNumber = "+251900818678";

function getHelpMenu() {
  return `📋 *SkillSwap AI Help Menu* 📋\n\nI can help you with:\n1️⃣ Jobs – current openings, specific roles\n2️⃣ Courses – learn about our programs\n3️⃣ Skills & Careers – advice on in-demand skills\n4️⃣ AI Skill Test – discover your ideal career\n5️⃣ Offline Access – how to use SkillSwap without internet\n\nWhat would you like to know? 🇪🇹`;
}

function getAIResponse(userMessage) {
  const lowerMsg = userMessage.toLowerCase().trim();
  if (lowerMsg === "help" || lowerMsg === "menu") return getHelpMenu();
  if (lowerMsg.includes("job") || lowerMsg.includes("work")) return `Here are current job openings:\n• Junior Full Stack Developer (Addis)\n• UI/UX Designer (Remote)\n• AgriTech Officer (Hawassa)\n• Business Development Associate (Addis)\nType a specific job title for details.`;
  if (lowerMsg.includes("course") || lowerMsg.includes("learn")) return `📚 Our courses: Full-Stack Web Dev (job guarantee), Digital Marketing, Smart Farming, Business Management. Which one interests you?`;
  if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) return "Selam! 🙌 I'm SkillSwap AI. Ask me about jobs, courses, or type 'help' for menu.";
  return "I'm here to help with jobs, courses, and career advice. Type 'help' to see what I can do. 🇪🇹";
}

function addMessage(text, isUser, isStatus = false) {
  const msgDiv = document.createElement("div");
  if (isStatus) {
    msgDiv.className = "status-message";
    msgDiv.innerText = text;
  } else {
    msgDiv.className = `message ${isUser ? 'user' : 'ai'}`;
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerText = text;
    msgDiv.appendChild(bubble);
  }
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addTypingIndicator() {
  const indicatorDiv = document.createElement("div");
  indicatorDiv.className = "message ai";
  indicatorDiv.id = "typingIndicator";
  const bubble = document.createElement("div");
  bubble.className = "typing-indicator";
  bubble.innerHTML = '<span></span><span></span><span></span>';
  indicatorDiv.appendChild(bubble);
  chatBox.appendChild(indicatorDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) indicator.remove();
}

function simulateSMSAndReply(userMsg) {
  if (!userMsg.trim()) return;
  sendBtn.disabled = true;
  sendBtn.textContent = "Sending...";
  addMessage(userMsg, true);
  addMessage(`📤 SMS sent to ${phoneNumber} at ${new Date().toLocaleTimeString()}`, false, true);
  setTimeout(() => {
    addMessage(`✅ Delivered to ${phoneNumber}`, false, true);
    addTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator();
      const reply = getAIResponse(userMsg);
      addMessage(reply, false);
      sendBtn.disabled = false;
      sendBtn.textContent = "Send SMS";
    }, 1500);
  }, 800);
}

if (sendBtn) {
  sendBtn.addEventListener("click", () => {
    const msg = smsInput.value.trim();
    if (msg === "") { alert("Please type a message."); return; }
    simulateSMSAndReply(msg);
    smsInput.value = "";
  });
  smsInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendBtn.click(); });
}


loadUsers();
currentUser = getCurrentUser();
updateUIForUser();
if (currentUser && currentUser.interest) {
  currentCategoryFilter = currentUser.interest;
  renderJobs();
}
