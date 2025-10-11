// 🧩 Replace with your real Supabase credentials
const SUPABASE_URL = "https://perzckovzjqhgtkzcmcn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnpja292empxaGd0a3pjbWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NzAyNzYsImV4cCI6MjA3NTU0NjI3Nn0.4MugouFyajdyLGwvMogwpVQNRAem_giIvQx9jJXfw7A";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById("feedback-form");
const message = document.getElementById("message");
const thankYou = document.getElementById("thank-you");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    age_group: form.elements["age"].value,
    platform: form.elements["platform"].value,
    time_per_day: form.elements["time_day"].value,
    time_per_week: form.elements["time_week"].value,
    purpose: form.elements["purpose"].value,
    satisfaction: form.elements["satisfaction"].value,
    feedback: form.elements["feedback"].value || null,
  };

  const { error } = await db.from("survey").insert([data]);

  if (error) {
    console.error(error);
    message.textContent = "❌ Une erreur est survenue. Réessayez.";
    message.style.color = "red";
  } else {
    form.reset();
    message.textContent = "";

    // Animate form fade-out
    form.style.opacity = "0";
    setTimeout(() => {
      form.classList.add("hidden");
      thankYou.classList.remove("hidden");
      thankYou.classList.add("show");
      launchConfetti();
    }, 500);
  }
});

/* 🎉 Confetti Animation */
function launchConfetti() {
  const duration = 2 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);

    const particleCount = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, {
      particleCount,
      origin: { x: randomInRange(0, 1), y: Math.random() - 0.2 },
    }));
  }, 250);
}
