const progressBar = document.querySelector('[data-progress-bar]');
const fileInput = document.querySelector('#cv-file');
const uploadZone = document.querySelector('#upload-zone');
const fileName = document.querySelector('#file-name');
const uploadStatus = document.querySelector('#upload-status');

function setProgress(value) {
  if (progressBar) progressBar.style.width = `${value}%`;
}

if (fileInput) {
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    fileName.textContent = `Selected: ${file.name}`;
    uploadStatus.textContent = 'Perfect. In the real YourTurn analysis, we’ll now read the useful parts of your CV — not judge you.';
    uploadStatus.classList.add('show');
    setProgress(75);
  });
}

if (uploadZone) {
  ['dragenter', 'dragover'].forEach((eventName) => {
    uploadZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadZone.classList.add('dragging');
    });
  });
  ['dragleave', 'drop'].forEach((eventName) => {
    uploadZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadZone.classList.remove('dragging');
    });
  });
  uploadZone.addEventListener('drop', (event) => {
    const file = event.dataTransfer.files?.[0];
    if (!file || !fileInput) return;
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event('change'));
  });
}

document.querySelectorAll('[data-demo-source]').forEach((source) => {
  source.addEventListener('click', () => {
    document.querySelectorAll('[data-demo-source]').forEach((item) => item.classList.remove('active'));
    source.classList.add('active');
    const label = document.querySelector('#demo-source-label');
    if (label) label.textContent = source.dataset.demoSource;
  });
});
