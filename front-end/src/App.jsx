import { useState } from "react";
import axios from "axios";

function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askBot = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      const res = await axios.post("http://localhost:5000/chat", {
        query,
      });
      setAnswer(res.data.answer);
    } catch (error) {
      console.error(error);
      setAnswer("⚠️ Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">College Chatbot (Prototype)</h1>

      <textarea
        className="w-full max-w-xl p-3 border rounded-lg focus:outline-none focus:ring"
        rows="3"
        placeholder="Ask your question..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      ></textarea>

      <button
        onClick={askBot}
        className="mt-3 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {loading ? "Thinking..." : "Ask"}
      </button>

      {answer && (
        <div className="mt-6 w-full max-w-xl bg-white shadow p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Answer:</h2>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default App;
