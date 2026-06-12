const STEPS = [
  { label: "Enter\nEmail", id: "step1" },
  { label: "Content\nProcess", id: "step2" },
  { label: "LLM\nInput", id: "step3" },
  { label: "Tone &\nGenerate", id: "step4" },
  { label: "Email\nStructure", id: "step6" },
  { label: "Review\n& Edit", id: "step7" },
  { label: "Send\nSMTP", id: "step8" },
];

let currentStep = 1;
let selectedTone = "professional";
let generatedBody = "";

// Build steps bar
function buildStepsBar() {
  const bar = document.getElementById('stepsBar');
  bar.innerHTML = '';
  STEPS.forEach((s, i) => {
    const num = i + 1;
    const item = document.createElement('div');
    item.className = 'step-item' + (num === currentStep ? ' active' : num < currentStep ? ' done' : '');
    item.innerHTML = `
      <div class="step-num">${num < currentStep ? '✓' : num}</div>
      <div class="step-label">${s.label.replace('\n','<br>')}</div>
    `;
    bar.appendChild(item);

    if (i < STEPS.length - 1) {
      const conn = document.createElement('div');
      conn.className = 'step-connector';
      if (num < currentStep) conn.style.background = 'var(--green)';
      bar.appendChild(conn);
    }
  });
}

function showSection(stepNum) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('step' + stepNum).classList.add('active');
}

async function goToStep(step) {
  currentStep = step;
  buildStepsBar();
  showSection(step);

  if (step === 2) {
    await processEmail();
  }

  if (step === 3) {
    setTimeout(() => goToStep(4), 1500);
  }

  if (step === 7) {
    document.getElementById('recipientEmail').value =
      document.getElementById('senderEmail').value;

    document.getElementById('finalSubject').value =
      'Re: ' + (document.getElementById('emailSubject').value || '(No Subject)');

    document.getElementById('finalBody').value = generatedBody;
  }

  if (step === 8) {
    document.getElementById('finalRecipient').textContent =
      document.getElementById('recipientEmail').value ||
      document.getElementById('senderEmail').value ||
      'recipient';
  }
}

async function processEmail() {
  const body = document.getElementById('emailBody').value.trim();
  const subject = document.getElementById('emailSubject').value.trim();
  const sender = document.getElementById('senderEmail').value.trim();

  const out = document.getElementById('processingOutput');
  out.innerHTML = `<div class="status-msg info">Processing email content...</div>`;

  await delay(1000);

  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const sentences = body.split(/[.!?]+/).filter(Boolean).length;

  out.innerHTML = `
    <p><b>Processing Complete</b></p>
    <p>Words: ${wordCount}</p>
    <p>Sentences: ${sentences}</p>
    <p>Sender: ${sender || 'Not provided'}</p>
    <p>Subject: ${subject || 'Not provided'}</p>
  `;

  document.getElementById('step2Btns').style.display = 'flex';
}

function selectTone(btn, tone) {
  document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedTone = tone;
}

async function generateReply() {
  const btn = document.getElementById('generateBtn');
  btn.disabled = true;
  btn.innerHTML = 'Generating...';

  const emailBody = document.getElementById('emailBody').value.trim();
  const emailSubject = document.getElementById('emailSubject').value.trim();
  const senderEmail = document.getElementById('senderEmail').value.trim();

  // Demo reply instead of API
  generatedBody = `Dear Sir/Madam,

Thank you for your email regarding "${emailSubject}". 
I appreciate you reaching out. I will review the information and get back to you shortly.

Please let me know if any additional details are required.

Best regards,
Your Name`;

  document.getElementById('previewTo').textContent = senderEmail || 'recipient@example.com';
  document.getElementById('previewSubject').textContent = 'Re: ' + (emailSubject || '(No Subject)');
  document.getElementById('previewTone').textContent = selectedTone;
  document.getElementById('previewBody').textContent = generatedBody;

  goToStep(6);

  btn.disabled = false;
  btn.innerHTML = 'Generate Reply with AI ✨';
}

function resetAll() {
  document.getElementById('emailBody').value = '';
  document.getElementById('emailSubject').value = '';
  document.getElementById('senderEmail').value = '';
  document.getElementById('charCounter').textContent = '0 characters';
  generatedBody = '';
  goToStep(1);
}

function updateCounter() {
  const len = document.getElementById('emailBody').value.length;
  document.getElementById('charCounter').textContent = len + ' characters';
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

fetch('http://127.0.0.1:5000/process_email', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: userInput,
        tone: selectedTone
    })
})
.then(res => res.json())
.then(data => {
    console.log("Category:", data.category);
    console.log("Reply:", data.reply);
});

// Init
buildStepsBar();