// Firebase config
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDkqZfZdp9wn16rXpigCQGaKvLqcHVZr6A",
  authDomain: "crabster-reviews.firebaseapp.com",
  projectId: "crabster-reviews",
  storageBucket: "crabster-reviews.appspot.com",
  messagingSenderId: "6404522229",
  appId: "1:6404522229:web:a9b6e425b572a61f8505bc",
  measurementId: "G-6G07536TYD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const reviewsRef = collection(db, "reviews");

// Rating star logic
document.querySelectorAll('#stars i').forEach((star, index) => {
  star.addEventListener('click', () => {
    document.querySelectorAll('#stars i').forEach((s, i) => {
      s.classList.toggle('text-yellow-400', i <= index);
      s.classList.toggle('text-gray-300', i > index);
    });
    document.getElementById('stars').dataset.rating = index + 1;
  });
});

let allReviews = [];
let visibleReviews = 4;

async function submitReview() {
  const username = document.getElementById('username').value.trim();
  const service = document.getElementById('service').value;
  const comment = document.getElementById('comment').value.trim();
  const rating = document.getElementById('stars').dataset.rating || 0;

  if (!username || !service || !comment || rating == 0) {
    alert("Please fill in all fields and select a rating.");
    return;
  }

  try {
    await addDoc(reviewsRef, {
      name: username,
      service: service,
      message: comment,
      rating: parseInt(rating),
      timestamp: serverTimestamp()
    });
    alert("Review submitted!");
    clearForm();
    fetchReviews();
  } catch (error) {
    alert("Error submitting review: " + error.message);
  }
}

function clearForm() {
  document.getElementById('username').value = '';
  document.getElementById('service').value = '';
  document.getElementById('comment').value = '';
  document.getElementById('stars').dataset.rating = 0;
  document.querySelectorAll('#stars i').forEach(star => {
    star.classList.remove('text-yellow-400');
    star.classList.add('text-gray-300');
  });
}

function renderReviews(reviewsToShow) {
  const container = document.getElementById('reviewsSection');
  container.innerHTML = '';

  reviewsToShow.forEach(review => {
    const reviewCard = document.createElement('div');
    reviewCard.className = "bg-white rounded-xl shadow-lg p-6";

    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      starsHtml += `<i class="fas fa-star ${i <= review.rating ? 'text-yellow-400' : 'text-gray-300'}"></i>`;
    }

    reviewCard.innerHTML = `
      <div class="flex justify-between mb-4">
        <h4 class="text-lg font-bold text-orange-700">${review.name}</h4>
        <div>${starsHtml}</div>
      </div>
      <p class="text-sm text-gray-500 mb-2">${review.service}</p>
      <p class="italic text-gray-600 mb-4">"${review.message}"</p>
      <p class="text-xs text-gray-400">${review.timestamp?.toDate().toLocaleString() || ''}</p>
    `;

    container.appendChild(reviewCard);
  });

  document.getElementById('loadMoreBtn').style.display = (allReviews.length > visibleReviews) ? 'block' : 'none';
  document.getElementById('hideBtn').style.display = (visibleReviews > 4) ? 'block' : 'none';
}

async function fetchReviews() {
  const q = query(reviewsRef, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  allReviews = snapshot.docs.map(doc => doc.data());
  renderReviews(allReviews.slice(0, visibleReviews));
}

function loadMore() {
  visibleReviews += 4;
  renderReviews(allReviews.slice(0, visibleReviews));
}

function hideReviews() {
  visibleReviews = 4;
  renderReviews(allReviews.slice(0, visibleReviews));
}

// Initial fetch
fetchReviews();
