
import { useState, useEffect } from "react";
import api from "../services/api";

function Reports({ token }) {
  const today = new Date();

  const currentDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const [reportDate, setReportDate] = useState(currentDate);
  const [dailyReport, setDailyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [previousMonthReport, setPreviousMonthReport] = useState(null);
  const [error, setError] = useState("");

  // Get daily report
  const fetchDailyReport = async () => {
    setError("");

    try {
      const response = await api.get(
        `/reports/daily?date=${reportDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDailyReport(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load daily report."
      );
    }
  };

  // Get current and previous month reports
  const fetchMonthlyReports = async () => {
    setError("");

    try {
      const monthlyResponse = await api.get("/reports/monthly", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const previousResponse = await api.get(
        "/reports/previous-month",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMonthlyReport(monthlyResponse.data);
      setPreviousMonthReport(previousResponse.data);
    } catch (err) {
      setError("Unable to load monthly reports.");
    }
  };

  // Load monthly reports when the component opens
  useEffect(() => {
    if (token) {
      fetchMonthlyReports();
    }
  }, [token]);

  // Show report summary values
  const showSummary = (summary) => {
    return (
      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Readings</span>
          <h3>{summary.count}</h3>
        </div>

        <div className="summary-card">
          <span>Highest</span>
          <h3>{summary.highest ?? "N/A"}</h3>
        </div>

        <div className="summary-card">
          <span>Lowest</span>
          <h3>{summary.lowest ?? "N/A"}</h3>
        </div>

        <div className="summary-card">
          <span>Average</span>
          <h3>{summary.average ?? "N/A"}</h3>
        </div>
      </div>
    );
  };

  return (
    <div className="reports-section">
      <h2>Glucose Reports</h2>

      {error && <p className="error-message">{error}</p>}

      {/* Daily Report */}
      <div className="report-block">
        <h3>Daily Report</h3>

        <div className="report-filter">
          <input
            type="date"
            value={reportDate}
            max={currentDate}
            onChange={(e) => setReportDate(e.target.value)}
          />

          <button
            className="primary-btn"
            onClick={fetchDailyReport}
          >
            View Daily Report
          </button>
        </div>

        {dailyReport && (
          <div>
            <h4>Date: {dailyReport.date}</h4>

            {showSummary(dailyReport.summary)}

            <h4>Daily Readings</h4>

            {dailyReport.readings.length === 0 ? (
              <p>No readings found for this date.</p>
            ) : (
              <div className="daily-reading-list">
                {dailyReport.readings.map((reading) => (
                  <div
                    className="daily-reading-item"
                    key={reading.id}
                  >
                    <span>{reading.time_slot}</span>
                    <strong>{reading.glucose_value} mg/dl</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Current Month Report */}
      <div className="report-block">
        <h3>Month-to-date Report</h3>

        {monthlyReport ? (
          showSummary(monthlyReport.summary)
        ) : (
          <p>Loading monthly report...</p>
        )}
      </div>

      {/* Previous Month Report */}
      <div className="report-block">
        <h3>Previous Month Report</h3>

        {previousMonthReport ? (
          showSummary(previousMonthReport.summary)
        ) : (
          <p>Loading previous month report...</p>
        )}
      </div>
    </div>
  );
}

export default Reports;
