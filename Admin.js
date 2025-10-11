// ==========================
// 🔹 Supabase Initialization
// ==========================
const SUPABASE_URL = "https://perzckovzjqhgtkzcmcn.supabase.co"; // Replace with your project URL
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnpja292empxaGd0a3pjbWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NzAyNzYsImV4cCI6MjA3NTU0NjI3Nn0.4MugouFyajdyLGwvMogwpVQNRAem_giIvQx9jJXfw7A";                // Replace with your anon key

// Create Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const form = document.getElementById("survey");
const message = document.getElementById("message");
const thankYouDiv = document.getElementById("thank-you");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const age = form.elements["age"].value;
    const platform = form.elements["platform"].value;
    const time_day = form.elements["time_day"].value;
    const time_week = form.elements["time_week"].value;
    const purpose = form.elements["purpose"].value;
    const satisfaction = form.elements["satisfaction"].value;
    const feedback = form.elements["feedback"].value;

    message.textContent = "⏳ Sending your response...";
    message.style.color = "white";

    try {
      const { error } = await supabaseClient
        .from("survey")
        .insert([
          {
            age_group: age,
            platform,
            time_per_day: time_day,
            time_per_week: time_week,
            purpose,
            satisfaction,
            feedback
          }
        ]);

      if (error) {
        console.error(error);
        message.textContent = "❌ An error occurred. Please try again.";
        message.style.color = "red";
      } else {
        // Show thank you message
        form.style.display = "none";
        if (thankYouDiv) {
          thankYouDiv.innerHTML = `
            <h2>✅ Thank you for your time!</h2>
            <p>Your responses have been successfully recorded.</p>
          `;
          thankYouDiv.classList.remove("hidden");
        }
        message.textContent = "";
      }
    } catch (err) {
      console.error(err);
      message.textContent = "❌ Failed to connect to the server.";
      message.style.color = "red";
    }
  });
}

// ==========================
// 🔹 Admin Dashboard Functions
// ==========================
const tableBody = document.querySelector("#results-table tbody");
const statusMsg = document.getElementById("status");
const refreshBtn = document.getElementById("refresh");
const downloadBtn = document.getElementById("download");

// Only add event listeners if the elements exist
if (refreshBtn) refreshBtn.addEventListener("click", fetchData);
if (downloadBtn) downloadBtn.addEventListener("click", downloadCSV);
if (window.location.href.includes("admin")) {
  window.addEventListener("DOMContentLoaded", fetchData);
}

async function fetchData() {
  if (!tableBody || !statusMsg) return;

  statusMsg.textContent = "⏳ Loading data...";
  tableBody.innerHTML = "";

  try {
    const { data, error } = await supabaseClient
      .from("survey")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      statusMsg.textContent = "❌ Error loading data.";
      return;
    }

    if (!data || data.length === 0) {
      statusMsg.textContent = "⚠️ No responses found.";
      return;
    }

    // Populate table
    data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.id}</td>
        <td>${row.age_group}</td>
        <td>${row.platform}</td>
        <td>${row.time_per_day}</td>
        <td>${row.time_per_week}</td>
        <td>${row.purpose}</td>
        <td>${row.satisfaction}</td>
        <td>${row.feedback || ""}</td>
        <td>${new Date(row.created_at).toLocaleString()}</td>
      `;
      tableBody.appendChild(tr);
    });

    statusMsg.textContent = `✅ ${data.length} responses loaded.`;
  } catch (err) {
    console.error(err);
    statusMsg.textContent = "❌ Failed to fetch data.";
  }
}

// ==========================
// 🔹 CSV Download
// ==========================
function downloadCSV() {
  if (!tableBody) return;

  const rows = [
    ["ID", "Age", "Platform", "Time/Day", "Time/Week", "Purpose", "Satisfaction", "Feedback", "Date"]
  ];

  document.querySelectorAll("tbody tr").forEach(tr => {
    const cols = Array.from(tr.children).map(td => td.textContent);
    rows.push(cols);
  });

  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "survey_results.csv");
  link.click();
}