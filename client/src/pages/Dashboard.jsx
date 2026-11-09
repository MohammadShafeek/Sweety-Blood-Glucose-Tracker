import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Reports from "../components/Reports";

function Dashboard() {
  const { user, token, logout } = useAuth();

  const today = new Date();

  const currentDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const [date, setDate] = useState(currentDate);
  const [timeSlot, setTimeSlot] = useState("Morning");
  const [value, setValue] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [readings, setReadings] = useState([]);

  // Fetch logged-in user's readings
  const fetchReadings = async () => {
    try {
      const response = await api.get("/readings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReadings(response.data.readings);
    } catch (err) {
      setError("Unable to load readings.");
    }
  };

  useEffect(() => {
    if (token) {
      fetchReadings();
    }
  }, [token]);

  // Add reading
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (value.trim() === "") {
      setError("Please enter a glucose value.");
      return;
    }

    const glucoseValue = Number(value);

    if (
      !Number.isInteger(glucoseValue) ||
      glucoseValue < 40 ||
      glucoseValue > 600
    ) {
      setError("Value must be between 40 and 600 mg/dl.");
      return;
    }

    try {
      await api.post(
        "/readings",
        {
          date,
          timeSlot,
          value: glucoseValue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Reading added successfully!");
      setValue("");

      await fetchReadings();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to add reading."
      );
    }
  };

  // Edit reading
  const handleEdit = async (reading) => {
    const newValue = window.prompt(
      "Enter new glucose value:",
      reading.glucose_value
    );

    if (newValue === null) {
      return;
    }

    if (newValue.trim() === "") {
      setError("Please enter a glucose value.");
      setMessage("");
      return;
    }

    const glucoseValue = Number(newValue);

    if (
      !Number.isInteger(glucoseValue) ||
      glucoseValue < 40 ||
      glucoseValue > 600
    ) {
      setError("Value must be between 40 and 600 mg/dl.");
      setMessage("");
      return;
    }

    try {
      await api.put(
        `/readings/${reading.id}`,
        {
          date: reading.reading_date,
          timeSlot: reading.time_slot,
          value: glucoseValue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Reading updated successfully!");
      setError("");

      await fetchReadings();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update reading."
      );
      setMessage("");
    }
  };

  // Delete reading
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reading?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/readings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Reading deleted successfully!");
      setError("");

      await fetchReadings();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete reading."
      );
      setMessage("");
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Sweety</h1>
          <p>Welcome, {user?.name}!</p>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-card">
          <h2>Add Blood Glucose Reading</h2>

          <form className="reading-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={date}
                max={currentDate}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
              >
                <option>Morning</option>
                <option>After breakfast</option>
                <option>After lunch</option>
                <option>After dinner</option>
              </select>
            </div>

            <div className="form-group">
              <label>Glucose Value (mg/dl)</label>
              <input
                type="number"
                placeholder="Enter glucose value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>

            {message && (
              <p className="success-message">{message}</p>
            )}

            {error && (
              <p className="error-message">{error}</p>
            )}

            <button className="primary-btn" type="submit">
              Save Reading
            </button>
          </form>
        </section>

        <section className="dashboard-card">
          <h2>My Glucose Readings</h2>

          {readings.length === 0 ? (
            <p>No readings found. Add your first reading.</p>
          ) : (
            <div className="table-container">
              <table className="readings-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Glucose Value (mg/dl)</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {readings.map((reading) => (
                    <tr key={reading.id}>
                      <td>{reading.reading_date}</td>
                      <td>{reading.time_slot}</td>
                      <td>{reading.glucose_value}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(reading)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(reading.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dashboard-card">
          <Reports token={token} />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;