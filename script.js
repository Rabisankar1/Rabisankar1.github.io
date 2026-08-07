/* ═══════════════════════════════════
   NEURAL CONSTELLATION CANVAS
   Concept: particles = neurons,
   connections = synapses firing.
   Mouse proximity activates nearby nodes.
═══════════════════════════════════ */
const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');
let W, H, nodes = [], mouse = { x: -999, y: -999 };
const NODE_COUNT = () => Math.min(Math.floor((W * H) / 9000), 120);

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

class Node {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = (Math.random() - 0.5) * 0.25;
    this.r = Math.random() * 1.8 + 0.4;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.pulse = Math.random() * Math.PI * 2;
    this.pulseSpeed = (Math.random() * 0.02 + 0.005);
    this.color = Math.random() > 0.7 ? '#7c3aed' : '#00e5ff';
    this.activated = false;
  }
  update() {
    this.pulse += this.pulseSpeed;
    const md = Math.hypot(this.x - mouse.x, this.y - mouse.y);
    this.activated = md < 140;
    if (this.activated) {
      const angle = Math.atan2(this.y - mouse.y, this.x - mouse.x);
      this.vx += Math.cos(angle) * 0.008;
      this.vy += Math.sin(angle) * 0.008;
    }
    this.vx *= 0.995;
    this.vy *= 0.995;
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  }
  draw() {
    const pulse = Math.sin(this.pulse) * 0.5 + 0.5;
    const brightness = this.activated ? 0.9 : this.alpha * (0.6 + pulse * 0.4);
    const size = this.r * (this.activated ? 2 : 1);
    ctx.beginPath();
    ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
    ctx.fillStyle = this.color === '#00e5ff'
      ? `rgba(0,229,255,${brightness})`
      : `rgba(124,58,237,${brightness})`;
    ctx.fill();
    if (this.activated) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, size * 3, 0, Math.PI * 2);
      ctx.fillStyle = this.color === '#00e5ff'
        ? `rgba(0,229,255,0.06)`
        : `rgba(124,58,237,0.08)`;
      ctx.fill();
    }
  }
}

function initNodes() {
  nodes = [];
  const n = NODE_COUNT();
  for (let i = 0; i < n; i++) nodes.push(new Node());
}

function drawFrame() {
  ctx.clearRect(0, 0, W, H);

  // ambient gradients
  const g1 = ctx.createRadialGradient(W * 0.2, H * 0.25, 0, W * 0.2, H * 0.25, W * 0.5);
  g1.addColorStop(0, 'rgba(124,58,237,0.04)');
  g1.addColorStop(1, 'transparent');
  ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);

  const g2 = ctx.createRadialGradient(W * 0.8, H * 0.65, 0, W * 0.8, H * 0.65, W * 0.45);
  g2.addColorStop(0, 'rgba(0,229,255,0.03)');
  g2.addColorStop(1, 'transparent');
  ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

  // connections
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = (nodes[i].activated || nodes[j].activated) ? 180 : 130;
      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * (nodes[i].activated || nodes[j].activated ? 0.35 : 0.1);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,229,255,${alpha})`;
        ctx.lineWidth = nodes[i].activated || nodes[j].activated ? 0.8 : 0.4;
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }

  nodes.forEach(n => { n.update(); n.draw(); });
  requestAnimationFrame(drawFrame);
}

resize();
initNodes();
drawFrame();
window.addEventListener('resize', () => { resize(); initNodes(); });
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

/* ═══════════════════════════
   CUSTOM CURSOR
═══════════════════════════ */
const cur = document.getElementById('cursor');
const curRing = document.getElementById('cursor-ring');
let cx = 0, cy = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });
function animCursor() {
  cur.style.left = cx + 'px';
  cur.style.top = cy + 'px';
  rx += (cx - rx) * 0.12;
  ry += (cy - ry) * 0.12;
  curRing.style.left = rx + 'px';
  curRing.style.top = ry + 'px';
  requestAnimationFrame(animCursor);
}
animCursor();

/* ═══════════════════════════
   TYPING EFFECT
═══════════════════════════ */
const phrases = ['Software Engineer', 'Data Scientist', 'DSA Enthusiast', 'ML Explorer', 'Java Developer', 'Python Coder'];
let pi = 0, ci = 0, del = false;
const typedEl = document.getElementById('typed');
function type() {
  const word = phrases[pi];
  typedEl.textContent = del ? word.slice(0, ci--) : word.slice(0, ci++);
  if (!del && ci === word.length + 1) { del = true; setTimeout(type, 1800); return; }
  if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; setTimeout(type, 350); return; }
  setTimeout(type, del ? 50 : 85);
}
type();

/* ═══════════════════════════
   NAVBAR SCROLL
═══════════════════════════ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ═══════════════════════════
   MOBILE MENU
═══════════════════════════ */
function toggleMenu() {
  document.getElementById('mob-menu').classList.toggle('open');
}

/* ═══════════════════════════
   SCROLL REVEAL
═══════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      // animate skill bars
      e.target.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));

// Skill bar observer
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-fill').forEach(bar => {
        setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 200);
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.skill-bars').forEach(el => barObserver.observe(el));

setTimeout(() => {
  document.querySelectorAll('#hero .reveal, #hero .reveal-left, #hero .reveal-right').forEach(el => el.classList.add('visible'));
}, 100);

/* ═══════════════════════════
   PROJECT CARD MOUSE GLOW
═══════════════════════════ */
document.querySelectorAll('.proj-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mx', x + '%');
    card.style.setProperty('--my', y + '%');
  });
});

/* ═══════════════════════════
   CONTACT FORM
═══════════════════════════ */
function handleFormSubmit() {
  const name = document.getElementById('form-name').value;
  const email = document.getElementById('form-email').value;
  const msg = document.getElementById('form-msg').value;
  if (!name || !email || !msg) {
    alert('Please fill in all required fields.');
    return;
  }
  // In production: POST to backend API or mailto link
  const subject = document.getElementById('form-subject').value || 'Portfolio Inquiry';
  const body = `Name: ${name}\nEmail: ${email}\n\n${msg}`;
  const mailto = `mailto:pradhanrabisankar328@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  document.getElementById('form-success').style.display = 'block';
  setTimeout(() => { document.getElementById('form-success').style.display = 'none'; }, 4000);
}

/* ═══════════════════════════
   AI CHATBOT (Anthropic API)
═══════════════════════════ */
let chatOpen = false;

const PORTFOLIO_CONTEXT = `You are an AI assistant for Rabisankar Pradhan's portfolio website. Here is information about Rabisankar:

NAME: Rabisankar Pradhan
LOCATION: Kolkata, West Bengal, India
EDUCATION: B.Tech in Computer Science & Engineering with Data Science specialization, graduating 2028
EMAIL: pradhanrabisankar328@gmail.com
LINKEDIN: https://www.linkedin.com/in/rabisankar-pradhan-362986313
GITHUB: https://github.com/Rabisankar1
LEETCODE: https://leetcode.com/u/rabisankar8670/
GEEKSFORGEEKS: https://www.geeksforgeeks.org/user/Rabisankar1

SKILLS:
- Languages: Java (primary), Python, C, SQL
- Data Science: NumPy, Pandas, Matplotlib, Seaborn, Scikit-Learn, TensorFlow
- AI/ML Focus: Machine Learning, Deep Learning, Generative AI, NLP
- Tools: Git, GitHub, VS Code, Jupyter, Anaconda
- Databases: PostgreSQL, MySQL

PROJECTS:
1. IPL Capstone Project - Data analysis on IPL dataset using Python (Pandas, Matplotlib, Seaborn)
2. Student Management System - Java OOP project with CRUD operations
3. Python File Management System - Automation tool to organize files by type
4. Tower of Hanoi - Java recursion and DSA implementation
5. Java Calculator - Feature-rich calculator in Java
6. LokSabha 2024 Election West Bengal - Data analysis of 2024 Indian General Elections focusing on West Bengal, using Python, Pandas, Matplotlib, Seaborn
7. Insurance Management System - Java-based insurance app with policy creation, customer records, premium calculation, and claim processing
8. Java Mini Projects Collection - Curated set of Java programs covering algorithms, OOP, sorting, string manipulation

AVAILABILITY: Actively seeking internship opportunities in Software Engineering, Data Science, and ML.

Answer questions about Rabisankar in a friendly, professional manner. Be concise (2-4 sentences). If asked something not in this context, say you don't have that info but Rabisankar can be reached via email.`;

function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById('chat-panel').classList.toggle('open', chatOpen);
  if (chatOpen) document.getElementById('chat-input').focus();
}

function addMsg(text, who) {
  const msgs = document.getElementById('chat-msgs');
  const div = document.createElement('div');
  div.className = `chat-msg ${who}`;
  div.innerHTML = `<div class="msg-bubble">${text}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

function addThinking() {
  const msgs = document.getElementById('chat-msgs');
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.innerHTML = `<div class="chat-thinking"><span></span><span></span><span></span></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  const btn = document.getElementById('chat-send-btn');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  btn.disabled = true;
  document.getElementById('chat-sugs').style.display = 'none';
  addMsg(text, 'user');
  const thinking = addThinking();
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: PORTFOLIO_CONTEXT,
        messages: [{ role: 'user', content: text }]
      })
    });
    const data = await res.json();
    thinking.remove();
    const reply = data.content?.[0]?.text || "I couldn't get a response. Please try again!";
    addMsg(reply, 'bot');
  } catch (e) {
    thinking.remove();
    addMsg("Oops, something went wrong. Try emailing Rabisankar directly at pradhanrabisankar328@gmail.com", 'bot');
  }
  btn.disabled = false;
  document.getElementById('chat-input').focus();
}

/* ═══════════════════════════
   THEME TOGGLE — DAY / NIGHT
═══════════════════════════ */
(function() {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const STORAGE_KEY = 'rp-theme';

  // Restore saved preference
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'day') root.classList.add('day');

  btn.addEventListener('click', () => {
    const isDay = root.classList.toggle('day');
    localStorage.setItem(STORAGE_KEY, isDay ? 'day' : 'night');

    // Ripple effect on toggle
    btn.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.25)' },
      { transform: 'scale(1)' }
    ], { duration: 350, easing: 'cubic-bezier(0.34,1.56,0.64,1)' });

    // Briefly flash the canvas
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
      canvas.style.transition = 'opacity 0.5s';
      canvas.style.opacity = '0';
      setTimeout(() => { canvas.style.opacity = ''; }, 500);
    }
  });
})();
