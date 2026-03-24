const DB_NAME = 'SkillSwapDB';
const DB_VERSION = 1;
let db = null;


function initDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Database error:', event.target.error);
      reject('Could not open database');
    };
    
    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('✅ Database opened successfully');
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      

      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'email' });
        userStore.createIndex('email', 'email', { unique: true });
        console.log('✅ Users store created');
      }
      

      if (!db.objectStoreNames.contains('jobs')) {
        const jobStore = db.createObjectStore('jobs', { keyPath: 'id', autoIncrement: true });
        jobStore.createIndex('category', 'category');
        console.log('✅ Jobs store created');
      }
      

      if (!db.objectStoreNames.contains('courses')) {
        db.createObjectStore('courses', { keyPath: 'id' });
        console.log('✅ Courses store created');
      }
      

      if (!db.objectStoreNames.contains('session')) {
        db.createObjectStore('session', { keyPath: 'id' });
        console.log('✅ Session store created');
      }
    };
  });
}


async function addToStore(storeName, data) {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);
    
    request.onsuccess = () => resolve(data);
    request.onerror = () => reject(request.error);
  });
}

async function getFromStore(storeName, key) {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllFromStore(storeName, indexName = null, indexValue = null) {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    let request;
    
    if (indexName && indexValue) {
      const index = store.index(indexName);
      request = index.getAll(indexValue);
    } else {
      request = store.getAll();
    }
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function updateInStore(storeName, data) {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    
    request.onsuccess = () => resolve(data);
    request.onerror = () => reject(request.error);
  });
}

async function deleteFromStore(storeName, key) {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}


async function seedInitialData() {
  // Check if jobs already exist
  const existingJobs = await getAllFromStore('jobs');
  if (existingJobs.length === 0) {
    const initialJobs = [
      {
        id: 1,
        title: "Junior Full Stack Developer",
        company: "IceAddis Tech",
        category: "tech",
        location: "Addis Ababa",
        salary: "15k-22k ETB",
        description: "React + Node.js, fresh grads welcome. Join a dynamic team building innovative solutions for Ethiopian businesses.",
        requirements: "1+ year experience with MERN stack, good problem-solving skills, team player. Fresh graduates with strong portfolio are encouraged to apply.",
        benefits: "Health insurance, remote work options, professional development budget, mentorship program.",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "UI/UX Designer",
        company: "Creative Hub Ethiopia",
        category: "design",
        location: "Remote",
        salary: "12k-18k ETB",
        description: "Create beautiful and intuitive designs for web and mobile applications. Work with international clients.",
        requirements: "Portfolio showcasing UI/UX projects, proficiency in Figma, understanding of user-centered design principles.",
        benefits: "Flexible hours, creative team environment, equipment allowance, annual retreat.",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        title: "AgriTech Officer",
        company: "Green Ethiopia PLC",
        category: "agri",
        location: "Hawassa",
        salary: "10k-15k ETB",
        description: "Implement smart irrigation systems and provide agricultural extension services to rural communities.",
        requirements: "Degree in agriculture or related field, experience with irrigation systems, willingness to travel to rural areas.",
        benefits: "Accommodation support, field training, vehicle allowance, performance bonuses.",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 4,
        title: "Business Development Associate",
        company: "Ethio Export Group",
        category: "business",
        location: "Addis Ababa",
        salary: "14k-20k ETB",
        description: "Drive business growth through strategic partnerships and market expansion initiatives.",
        requirements: "Sales experience, strong communication skills, knowledge of Ethiopian export market, degree in business or related field.",
        benefits: "Performance bonuses, career growth opportunities, international travel, health insurance.",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 5,
        title: "Frontend Developer (React)",
        company: "Kifiya Financial Technology",
        category: "tech",
        location: "Addis Ababa",
        salary: "20k-28k ETB",
        description: "Build responsive and performant web applications for financial services sector.",
        requirements: "Strong React skills, experience with state management (Redux/Zustand), TypeScript knowledge, fintech background a plus.",
        benefits: "Stock options, premium health coverage, gym membership, learning budget.",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 6,
        title: "Graphic Designer",
        company: "Roha Media Solutions",
        category: "design",
        location: "Bahir Dar",
        salary: "9k-14k ETB",
        description: "Create engaging visual content for social media, print, and digital campaigns.",
        requirements: "Adobe Creative Suite proficiency, creative mindset, social media design experience, portfolio required.",
        benefits: "Creative freedom, company events, professional development, equipment provided.",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 7,
        title: "Sustainable Farming Specialist",
        company: "EthioAgri Corporation",
        category: "agri",
        location: "Jimma",
        salary: "11k-16k ETB",
        description: "Implement sustainable farming practices and conduct research on crop optimization.",
        requirements: "Agronomy background, experience with coffee farming, sustainable practices knowledge, research experience.",
        benefits: "Housing allowance, research opportunities, conference travel, academic partnerships.",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 8,
        title: "Sales Team Lead",
        company: "Zemen Logistics",
        category: "business",
        location: "Dire Dawa",
        salary: "16k-22k ETB",
        description: "Lead and motivate sales team to achieve targets and expand market presence.",
        requirements: "Proven sales track record, leadership skills, logistics experience preferred, team management experience.",
        benefits: "Commission structure, travel allowance, performance bonuses, leadership training.",
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
    
    for (const job of initialJobs) {
      await addToStore('jobs', job);
    }
    console.log('✅ Initial jobs seeded');
  }
}


async function authenticateUser(email, password) {
  try {
    const user = await getFromStore('users', email);
    if (user && user.password === password) {
      // Store session
      await updateInStore('session', { id: 'current', user: user });
      return user;
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

async function registerUser(userData) {
  try {
    // Check if user already exists
    const existingUser = await getFromStore('users', userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }
    

    await addToStore('users', userData);
    

    await updateInStore('session', { id: 'current', user: userData });
    
    return userData;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

async function getCurrentUserFromDB() {
  try {
    const session = await getFromStore('session', 'current');
    return session ? session.user : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

function logout() {
  updateInStore('session', { id: 'current', user: null });
  currentUser = null;
  location.reload();
}


async function getAllJobs(category = null) {
  try {
    let jobs = await getAllFromStore('jobs');
    if (category) {
      jobs = jobs.filter(job => job.category === category && job.isActive);
    } else {
      jobs = jobs.filter(job => job.isActive);
    }
    return jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

async function getJobById(jobId) {
  try {
    const jobs = await getAllFromStore('jobs');
    return jobs.find(job => job.id === parseInt(jobId));
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
}


async function updateUIForUser() {
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
      <h3>Welcome Back to SkillSwap Ethiopia 🇪🇹</h3>
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
  
  modal.querySelector('#loginBtn').onclick = async () => {
    const email = modal.querySelector('#loginEmail').value.trim();
    const password = modal.querySelector('#loginPassword').value;
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }
    
    const user = await authenticateUser(email, password);
    if (user) {
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
          <p><i class="fas fa-info-circle"></i> <strong>Demo Mode:</strong> Click "Pay Now" to simulate payment. This is a free offline version.</p>
        </div>
        <button class="btn-primary" id="completePayment">Complete Registration (Free)</button>
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
    return true;
  }
  
  function validateStep2() {
    let file = modal.querySelector('#idPhoto').files[0];
    if (!file) { 
      // Make ID photo optional for offline version
      if (confirm('ID photo is optional. Continue without it?')) {
        return true;
      }
      return false;
    }
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

  // Handle ID photo preview
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


  modal.querySelector('#completePayment').onclick = async () => {
    try {
      const idPhoto = modal.querySelector('#idPhoto').files[0];
      let idPhotoData = null;
      
      // Convert image to base64 for storage
      if (idPhoto) {
        idPhotoData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(idPhoto);
        });
      }
      
      const newUser = {
        name: modal.querySelector('#regName').value.trim(),
        age: parseInt(modal.querySelector('#regAge').value),
        email: modal.querySelector('#regEmail').value.trim(),
        phone: modal.querySelector('#regPhone').value.trim(),
        password: modal.querySelector('#regPassword').value,
        interest: modal.querySelector('input[name="interest"]:checked').value,
        workStyle: modal.querySelector('input[name="style"]:checked').value,
        paymentMethod: modal.querySelector('#paymentMethod').value,
        followedTelegram: modal.querySelector('#followedTelegram').checked,
        followedInstagram: modal.querySelector('#followedInstagram').checked,
        paymentCompleted: true,
        idPhoto: idPhotoData,
        registeredAt: new Date().toISOString()
      };
      
      const result = await registerUser(newUser);
      if (result) {
        alert('✅ Registration successful! Welcome to SkillSwap Ethiopia!');
        modal.remove();
        currentUser = result;
        updateUIForUser();
        if (currentUser.interest) {
          currentCategoryFilter = currentUser.interest;
          await renderJobs();
        }
        showPage('home');
      }
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
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


async function renderJobs() {
  const container = document.getElementById("jobListContainer");
  if (!container) return;
  
  try {
    const allJobs = await getAllJobs(currentCategoryFilter);
    
    if (allJobs.length === 0) { 
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px;">✨ New jobs coming soon. Take a course & unlock hidden roles!</div>`; 
      return; 
    }
    
    container.innerHTML = allJobs.map(job => `
      <div class="job-card" data-job-id="${job.id}">
        <h4><i class="fas fa-briefcase"></i> ${job.title}</h4>
        <p style="color: var(--ethio-green); font-weight:600;">${job.company}</p>
        <p><i class="fas fa-map-marker-alt"></i> ${job.location} &nbsp;| 💰 ${job.salary}</p>
        <p style="font-size:0.9rem; margin:12px 0;">${job.description}</p>
        <button class="btn-outline learn-apply-btn" data-job-id="${job.id}" style="padding:6px 14px;"><i class="fas fa-graduation-cap"></i> Learn & Apply</button>
      </div>
    `).join('');
    
    const label = document.getElementById("activeFilterLabel");
    if (label) label.innerText = currentCategoryFilter ? `🔥 ${currentCategoryFilter.toUpperCase()} jobs (matched by AI)` : `📢 All open positions (${allJobs.length}+ live)`;
    
    document.querySelectorAll('.learn-apply-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const jobId = btn.getAttribute('data-job-id');
        const job = await getJobById(jobId);
        if (job) {
          showJobDetail(job);
        }
      });
    });
  } catch (error) {
    console.error('Error loading jobs:', error);
    container.innerHTML = '<div style="text-align:center; padding:40px;">Error loading jobs. Please refresh the page.</div>';
  }
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
      <p>${job.description}</p>
      <h3 style="margin-top: 20px;">Requirements</h3>
      <p>${job.requirements || "• Relevant experience\n• Strong communication skills\n• Passion for growth"}</p>
      <h3 style="margin-top: 20px;">Benefits</h3>
      <p>${job.benefits || "• Competitive salary\n• Health insurance\n• Career development opportunities"}</p>
    </div>
    <div class="apply-section">
      <button id="applyNowBtn" class="btn-primary"><i class="fab fa-telegram"></i> Apply via Telegram Bot</button>
      <p style="margin-top: 12px; font-size: 0.85rem;">Clicking will open <strong>@SkillSwapEt_bot</strong> on Telegram. Complete your application there.</p>
    </div>
  `;
  document.getElementById('applyNowBtn')?.addEventListener('click', () => {
    window.open('https://t.me/SkillSwapEt_bot', '_blank');
  });
  showPage('jobdetail');
}

document.getElementById("resetJobsBtn")?.addEventListener("click", () => { 
  currentCategoryFilter = null; 
  renderJobs(); 
});
document.getElementById("backToJobsBtn")?.addEventListener("click", () => showPage('jobs'));

// ==================== AI Test Function ====================
document.getElementById("runAiTestBtn")?.addEventListener("click", () => {
  const selectedInterest = document.querySelector('#aitest-page input[name="interest"]:checked');
  if (!selectedInterest) { 
    alert("🇪🇹 Please select your main interest field to unlock AI job match!"); 
    return; 
  }
  const category = selectedInterest.value;
  const jobRoleMap = { 
    tech: "Software Developer, IT Support, Data Analyst", 
    design: "UI/UX Designer, Graphic Artist", 
    agri: "Agronomist, Farm Manager", 
    business: "Business Analyst, Project Manager" 
  };
  const courseMap = { 
    tech: "🎓 Recommended: Full Stack Web Dev", 
    design: "🎨 Recommended: Professional Design Masterclass", 
    agri: "🌱 Recommended: Smart Farming & Agribusiness", 
    business: "📈 Recommended: Business Leadership & Sales Track" 
  };
  document.getElementById("aiMatchText").innerHTML = `<i class="fas fa-microchip"></i> ✅ AI analysis: You're a perfect fit for ${jobRoleMap[category]}.`;
  document.getElementById("aiRecommendCourse").innerHTML = `<div style="margin-top:12px;"><i class="fas fa-book-open"></i> ${courseMap[category]}</div><div>✨ Matched jobs updated below!</div>`;
  document.getElementById("aiResultContainer").style.display = "block";
  currentCategoryFilter = category;
  renderJobs();
  showPage('jobs');
});


const courses = {
  webdev: {
    id: "webdev",
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
      { title: "Node.js & Express Crash Course (Traversy Media)", url: "https://youtu.be/fBNz5xF-Kx4" }
    ],
    pdfUrl: "https://t.me/skillswapethiopia",
    telegramGroup: "https://t.me/skillswapethiopia"
  },
  marketing: {
    id: "marketing",
    title: "Digital Marketing",
    description: "Learn SEO, Social Media Marketing, Email Campaigns, and Analytics. Get certified and land internships with top Ethiopian brands.",
    lectures: [
      "Introduction to Digital Marketing",
      "SEO Fundamentals",
      "Social Media Strategy (Facebook, Instagram, TikTok)",
      "Content Marketing & Blogging",
      "Email Marketing & Automation",
      "Google Analytics & Data Insights"
    ],
    videos: [
      { title: "Digital Marketing Full Course (Google)", url: "https://youtu.be/7bNPg8UbhaE" },
      { title: "SEO Tutorial for Beginners (Ahrefs)", url: "https://youtu.be/9tH6KhZ4KdU" }
    ],
    pdfUrl: "https://t.me/skillswapethiopia",
    telegramGroup: "https://t.me/skillswapethiopia"
  },
  agritech: {
    id: "agritech",
    title: "Smart Farming & Agri-tech",
    description: "Modern agriculture techniques, irrigation systems, drone technology, and agribusiness management. Direct placement with cooperatives.",
    lectures: [
      "Introduction to Precision Agriculture",
      "Soil Science & Crop Management",
      "Irrigation Systems & Water Management",
      "Drone Technology in Farming"
    ],
    videos: [
      { title: "Precision Agriculture Overview", url: "https://youtu.be/8Kq-8iR6F6I" },
      { title: "Soil Health & Management", url: "https://youtu.be/URjQbHpBQ7U" }
    ],
    pdfUrl: "https://t.me/skillswapethiopia",
    telegramGroup: "https://t.me/skillswapethiopia"
  },
  business: {
    id: "business",
    title: "Business Management & Leadership",
    description: "Project management, finance, entrepreneurship, and leadership skills. Guaranteed interview with partner firms upon completion.",
    lectures: [
      "Introduction to Business Management",
      "Strategic Planning & Decision Making",
      "Financial Management Basics",
      "Project Management (Agile, Scrum)"
    ],
    videos: [
      { title: "Business Management 101 (Crash Course)", url: "https://youtu.be/9HxGcL1Y1LA" },
      { title: "Strategic Planning (Harvard)", url: "https://youtu.be/5g9jRrC9J0U" }
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


async function init() {
  try {
    // Initialize database
    await initDatabase();
    console.log('✅ Database initialized');
    
    // Seed initial data
    await seedInitialData();
    console.log('✅ Initial data seeded');
    
    // Get current user from session
    currentUser = await getCurrentUserFromDB();
    console.log('Current user:', currentUser ? currentUser.name : 'None');
    
    updateUIForUser();
    if (currentUser && currentUser.interest) {
      currentCategoryFilter = currentUser.interest;
    }
    
    await renderJobs();
    console.log('✅ Application ready');
  } catch (error) {
    console.error('Initialization error:', error);
    alert('Error initializing app: ' + error.message);
  }
}


init();
