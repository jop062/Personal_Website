// =============================
// ===== Wait for DOM ==========
// =============================
document.addEventListener("DOMContentLoaded", () => {

  // =============================
  // ===== Year ==================
  // =============================
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // =============================
  // ===== Auto Theme (PST) ======
  // =============================
  function setThemeByPST() {
    const now = new Date();
    const pstHour = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      hour12: false,
    }).format(now);
    const hour = parseInt(pstHour, 10);
    const isLight = hour >= 7 && hour < 18;
    document.body.classList.toggle("dark", !isLight);
    const pill = document.getElementById("themePill");
    if (pill) pill.textContent = isLight ? "PST Light Mode" : "PST Dark Mode";
  }
  setThemeByPST();
  setInterval(setThemeByPST, 60000);

  // =============================
  // ===== Sidebar Toggle ========
  // =============================
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebarNav = document.getElementById("sidebarNav");
  if (sidebarToggle && sidebarNav) {
    sidebarToggle.addEventListener("click", () => {
      const open = sidebarNav.classList.toggle("is-open");
      sidebarToggle.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        if (sidebarNav.classList.contains("is-open")) {
          sidebarNav.classList.remove("is-open");
          sidebarToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  // =============================
  // ===== Reveal Animation ======
  // =============================
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  }

  // =============================
  // ===== Resume Modal ==========
  // =============================
  const resumeBtn = document.getElementById("resumeBtn");
  const resumeModal = document.getElementById("resumeModal");
  const resumeClose = document.getElementById("resumeClose");
  const resumeForm = document.getElementById("resumeForm");
  const FORMSPREE_RESUME_ENDPOINT = "https://formspree.io/f/xjgepvyz";

  const isSubfolder = window.location.pathname.includes("/About/") ||
    window.location.pathname.includes("/Experience/") ||
    window.location.pathname.includes("/Projects/") ||
    window.location.pathname.includes("/Skills/") ||
    window.location.pathname.includes("/Leadership/") ||
    window.location.pathname.includes("/CoolStuff/") ||
    window.location.pathname.includes("/CoolStuff/") ||
    window.location.pathname.includes("/Analytics/") ||
    window.location.pathname.includes("/Contact/");

  const RESUME_FILE = isSubfolder
    ? "../Resume-JonathanPham.docx (4).pdf"
    : "Resume-JonathanPham.docx (4).pdf";

  function openModal() {
    if (!resumeModal) return;
    resumeModal.style.display = "flex";
    resumeModal.setAttribute("aria-hidden", "false");
  }
  function closeModal() {
    if (!resumeModal) return;
    resumeModal.style.display = "none";
    resumeModal.setAttribute("aria-hidden", "true");
  }
  if (resumeBtn) resumeBtn.addEventListener("click", openModal);
  if (resumeClose) resumeClose.addEventListener("click", closeModal);
  if (resumeModal) {
    resumeModal.addEventListener("click", (e) => {
      if (e.target === resumeModal) closeModal();
    });
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  if (resumeForm) {
    resumeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = resumeForm.email.value.trim();
      if (!email) return;
      try {
        await fetch(FORMSPREE_RESUME_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ type: "resume_view", email, timestamp: new Date().toISOString(), page: window.location.href }),
        });
      } catch (err) { console.warn("Tracking failed:", err); }
      window.open(RESUME_FILE, "_blank", "noopener");
      resumeForm.reset();
      closeModal();
    });
  }

  // =============================
  // ===== Today I Learned =======
  // =============================
  const tilQuotes = [
    "Cloud cost optimization is a machine learning problem in itself.",
    "Vector databases rely on approximate nearest neighbor search to scale efficiently.",
    "Production ML systems fail more often from bad data than bad models.",
    "Prompt clarity reduces hallucination more than model size.",
    "Latency optimization often matters more than model accuracy."
  ];
  const tilText = document.getElementById("tilText");
  const tilDate = document.getElementById("tilDate");
  if (tilText && tilDate) {
    tilDate.textContent = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    let quoteIndex = Math.floor(Math.random() * tilQuotes.length);
    let charIndex = 0;
    let deleting = false;
    let pause = false;
    function typeWriter() {
      const currentQuote = tilQuotes[quoteIndex];
      if (!deleting && !pause) {
        tilText.textContent = currentQuote.slice(0, charIndex++);
        if (charIndex > currentQuote.length) {
          pause = true;
          setTimeout(() => { pause = false; deleting = true; }, 10000);
        }
      } else if (deleting && !pause) {
        tilText.textContent = currentQuote.slice(0, charIndex--);
        if (charIndex < 0) { deleting = false; quoteIndex = (quoteIndex + 1) % tilQuotes.length; }
      }
      setTimeout(typeWriter, deleting ? 30 : 55);
    }
    typeWriter();
  }

  // =============================
  // ===== AI News Feed ==========
  // =============================
  const aiFeed = document.getElementById("aiFeed");
  if (aiFeed) {
    async function loadAINews() {
      try {
        const res = await fetch("https://hn.algolia.com/api/v1/search?query=AI&tags=story");
        const data = await res.json();
        aiFeed.innerHTML = "";
        data.hits.slice(0, 5).forEach(item => {
          const li = document.createElement("li");
          li.innerHTML = `<a href="${item.url}" target="_blank" rel="noopener" style="color:#0066CC"><u>${item.title}</u></a>`;
          aiFeed.appendChild(li);
        });
      } catch (err) { aiFeed.innerHTML = "<li>Unable to load news.</li>"; }
    }
    loadAINews();
  }

  // =============================
  // ===== Sentiment Checker =====
  // =============================
  const analyzeBtn = document.getElementById("analyzeBtn");
  const sentimentInput = document.getElementById("sentimentInput");
  const sentimentResult = document.getElementById("sentimentResult");
  if (analyzeBtn && sentimentInput && sentimentResult) {
    analyzeBtn.addEventListener("click", () => {
      const text = sentimentInput.value.toLowerCase();
      const positiveWords = ["good", "great", "excellent", "awesome", "love", "smart"];
      const negativeWords = ["bad", "terrible", "hate", "slow", "bug", "broken"];
      let score = 0;
      positiveWords.forEach(word => { if (text.includes(word)) score++; });
      negativeWords.forEach(word => { if (text.includes(word)) score--; });
      if (score > 0) sentimentResult.textContent = "Sentiment: Positive 😊";
      else if (score < 0) sentimentResult.textContent = "Sentiment: Negative ⚠️";
      else sentimentResult.textContent = "Sentiment: Neutral 🤖";
    });
  }

  // =============================
  // ===== Analytics =============
  // =============================
  const metricViews = document.getElementById("metricViews");
  const metricResume = document.getElementById("metricResume");
  const metricSession = document.getElementById("metricSession");

  if (metricViews) {
    let views = parseInt(localStorage.getItem("site_views") || "0") + 1;
    localStorage.setItem("site_views", views);
    metricViews.textContent = views;
  }

  if (metricResume) {
    let resumeClicks = parseInt(localStorage.getItem("resume_clicks") || "0");
    metricResume.textContent = resumeClicks;
  }

  const resumeBtnTrack = document.getElementById("resumeBtn");
  resumeBtnTrack?.addEventListener("click", () => {
    let resumeClicks = parseInt(localStorage.getItem("resume_clicks") || "0") + 1;
    localStorage.setItem("resume_clicks", resumeClicks);
    if (metricResume) metricResume.textContent = resumeClicks;
  });

  // Session timer
  let seconds = 0;
  function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }
  setInterval(() => {
    seconds++;
    if (metricSession) metricSession.textContent = formatTime(seconds);
  }, 1000);

  // =============================
  // ===== Slideshow =============
  // =============================
  const slideImage = document.getElementById("slideImage");
  const slideCaption = document.getElementById("slideCaption");
  const slideDots = document.getElementById("slideDots");

  if (slideImage && slideCaption && slideDots) {
    const isSub = window.location.pathname.includes("/About/") ||
      window.location.pathname.includes("/Experience/") ||
      window.location.pathname.includes("/Projects/") ||
      window.location.pathname.includes("/Skills/") ||
      window.location.pathname.includes("/Leadership/") ||
      window.location.pathname.includes("/CoolStuff/") ||
      window.location.pathname.includes("/CoolStuff/") ||
      window.location.pathname.includes("/Analytics/") ||
      window.location.pathname.includes("/Contact/");
    const imgPrefix = isSub ? "../" : "";

    const slides = [
      { src: `${imgPrefix}../images/tritonBall.jpeg`, caption: "UCSD Triton Ball Sports Analytics Club – Built models and analytics for UCSD sports teams." },
      { src: `${imgPrefix}../images/CCCAAWomen-568.jpg`, caption: "Playing tennis" },
      { src: `${imgPrefix}../images/IMG_4723.jpg`, caption: "Fishing in Minnesota" }
    ];

    let currentSlide = 0;
    let slideInterval;

    function renderDots() {
      slideDots.innerHTML = "";
      slides.forEach((_, index) => {
        const dot = document.createElement("span");
        if (index === currentSlide) dot.classList.add("active");
        dot.addEventListener("click", () => { goToSlide(index); resetAutoSlide(); });
        slideDots.appendChild(dot);
      });
    }
    function updateSlide() {
      slideImage.style.opacity = 0;
      setTimeout(() => {
        slideImage.src = slides[currentSlide].src;
        slideCaption.textContent = slides[currentSlide].caption;
        slideImage.style.opacity = 1;
        renderDots();
      }, 200);
    }
    function nextSlide() { currentSlide = (currentSlide + 1) % slides.length; updateSlide(); }
    function prevSlide() { currentSlide = (currentSlide - 1 + slides.length) % slides.length; updateSlide(); }
    function goToSlide(index) { currentSlide = index; updateSlide(); }
    function startAutoSlide() { slideInterval = setInterval(nextSlide, 5000); }
    function resetAutoSlide() { clearInterval(slideInterval); startAutoSlide(); }

    document.getElementById("nextSlide")?.addEventListener("click", () => { nextSlide(); resetAutoSlide(); });
    document.getElementById("prevSlide")?.addEventListener("click", () => { prevSlide(); resetAutoSlide(); });
    updateSlide();
    startAutoSlide();
  }

  // =============================
  // ===== Sidebar Collapse =======
  // =============================
  const sidebarCollapse = document.getElementById("sidebarCollapse");
  const sidebar = document.querySelector(".sidebar");
  if (sidebarCollapse && sidebar) {
    if (localStorage.getItem("sidebar_collapsed") === "true") {
      sidebar.classList.add("collapsed");
    }
    sidebarCollapse.addEventListener("click", () => {
      const isCollapsed = sidebar.classList.toggle("collapsed");
      localStorage.setItem("sidebar_collapsed", isCollapsed);
      const content = document.querySelector(".content");
      if (content) content.style.marginLeft = isCollapsed ? "82px" : "calc(240px + 18px)";
    });
  }

  // =============================
  // ===== Floating AI Chat =======
  // =============================
  const chatFab = document.getElementById("chatFab");
  const chatPanel = document.getElementById("chatPanel");
  const chatClose = document.getElementById("chatClose");
  const chatInput = document.getElementById("chatInput");
  const chatSend = document.getElementById("chatSend");
  const chatMessages = document.getElementById("chatMessages");

  let welcomeTyped = false;

  function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = `chat-msg chat-msg--${type}`;
    div.innerHTML = `<span></span>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  function typeMessage(element, text, speed = 18) {
    return new Promise((resolve) => {
      const span = element.querySelector("span");
      let i = 0;
      function typeChar() {
        if (i < text.length) {
          span.textContent += text[i];
          i++;
          chatMessages.scrollTop = chatMessages.scrollHeight;
          setTimeout(typeChar, speed);
        } else {
          resolve();
        }
      }
      typeChar();
    });
  }

  function openChat() {
    chatPanel.classList.add("is-open");
    chatPanel.setAttribute("aria-hidden", "false");
    chatInput.focus();
    const tooltip = document.getElementById("chatTooltip");
    if (tooltip) tooltip.classList.add("hidden");
    if (!welcomeTyped) {
      welcomeTyped = true;
      const welcomeEl = document.getElementById("welcomeMsg");
      if (welcomeEl) {
        setTimeout(() => {
          typeMessage(welcomeEl, "👋 Hi! I'm Jonathan's AI assistant. Ask me anything about him — his education, projects, skills, or experience!", 22);
        }, 300);
      }
    }
  }

  


setTimeout(() => {
  if (!isSubfolder) {
    openChat();
  }
}, 1500);


  chatFab.addEventListener("click", () => {
    const isOpen = chatPanel.classList.toggle("is-open");
    chatPanel.setAttribute("aria-hidden", String(!isOpen));
    if (isOpen) openChat();
  });

  chatClose?.addEventListener("click", () => {
    chatPanel.classList.remove("is-open");
    chatPanel.setAttribute("aria-hidden", "true");
  });
  chatSend?.addEventListener("click", sendMessage);
  chatInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(); });

  // Auto-hide tooltip after 6 seconds
  setTimeout(() => {
    const tooltip = document.getElementById("chatTooltip");
    if (tooltip) tooltip.classList.add("hidden");
  }, 6000);

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = "";

    const userEl = addMessage("", "user");
    userEl.querySelector("span").textContent = text;

    const typingEl = document.createElement("div");
    typingEl.className = "chat-msg chat-msg--typing";
    typingEl.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
    chatMessages.appendChild(typingEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    await new Promise(r => setTimeout(r, 800));

    const reply = getSmartReply(text);
    typingEl.remove();

    const aiEl = addMessage("", "ai");
    await typeMessage(aiEl, reply);
  }

  function getSmartReply(question) {
    const q = question.toLowerCase();
    if (q.match(/college|university|school|ucsd|study|studying|major|degree|education/))
      return "Jonathan currently attends the University of California, San Diego (UCSD), located in La Jolla, California. He is studying Data Analytics and is expected to graduate in 2027.";
    if (q.match(/where.*live|where.*from|location|city|san diego|la jolla/))
      return "Jonathan is based in San Diego, California — home to UC San Diego where he currently studies Data Analytics.";
    if (q.match(/intern|job|hire|hiring|available|open to|work|employ|opportunity/))
      return "Jonathan is actively seeking internships for Summer 2026! He's open to roles in data analytics, machine learning, software engineering, and AI. You can reach him at jop062@ucsd.edu.";
    if (q.match(/experience|work history|worked|thorpeto|past job/))
      return "Jonathan interned at THORPETO INC. during Summer 2025 as a Data Insight Intern, where he analyzed operational data, built reporting workflows, and delivered actionable insights.";
    if (q.match(/project|built|build|rag|llm|dashboard|automation|portfolio/))
      return "Jonathan has built several impressive projects! His standout work includes an LLM RAG Assistant (Python, FAISS, embeddings), an Analytics KPI Dashboard (SQL + Pandas), and automation scripts. Check his GitHub at github.com/jop062.";
    if (q.match(/skill|know|language|tech|stack|python|sql|tools|code|coding|program/))
      return "Jonathan is skilled in Python, SQL, Java, C++, Pandas, scikit-learn, Git, Linux, R, React, FAISS, RAG, Embeddings, Bash, Stata, and data visualization.";
    if (q.match(/lead|leadership|club|team|ai club|sports analytics/))
      return "Jonathan served as AI Club Project Lead at UCSD, leading a 6-person team building a retrieval-based AI assistant. He also participated in the UCSD Sports Analytics Group.";
    if (q.match(/contact|email|phone|reach|linkedin|github|social/))
      return "You can reach Jonathan at jop062@ucsd.edu or (858) 280-1309. LinkedIn: linkedin.com/in/jonathan-pham-9ab3942a6 | GitHub: github.com/jop062.";
    if (q.match(/hobby|hobbies|interest|fun|outside|personal|tennis|fish|tetris|sport/))
      return "Outside of tech, Jonathan enjoys tennis, fishing, and strategy games like Tetris — disciplines that reinforce focus, iteration, and competitive thinking.";
    if (q.match(/who|name|jonathan|tell me about/))
      return "Jonathan Pham is a Data Analytics student at UC San Diego with a passion for building practical AI and data systems. He's interned at THORPETO INC. and is seeking Summer 2026 internships.";
    if (q.match(/resume|cv|download/))
      return "You can request Jonathan's resume by clicking the Resume button in the sidebar!";
    return "That's a great question! Jonathan hasn't shared that specific detail yet. Feel free to reach out at jop062@ucsd.edu — he'd love to connect!";
  }

});
