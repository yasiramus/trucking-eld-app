import { useState } from "react";
import axios from "axios";

import "./App.css";

import TripForm from "./components/Form/Form";
import MapDisplay from "./components/Map/MapDisplay";
import TripSummary from "./components/Summary/Summary";
import ELDLogs from "./components/ELDLogs/ELDLogs";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

function App() {
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**calculate trip */
  const calculateTrip = async (formData) => {
    setLoading(true);
    setError(null);
    setTripData(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/trips/calculate/`,
        formData
      );

      setTripData(response.data);
      console.log("Trip calculated:", response.data);
    } catch (err) {
      console.error("Error calculating trip:", err);
      setError(
        err.response?.data?.error ||
        "Failed to calculate trip. Please check your inputs."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚛 Trucking ELD Route Planner</h1>
        <p>Plan your route using HOS compliance</p>
      </header>

      <main className="app-main">
        {/* Input Form */}
        <section className="section">
          <TripForm onSubmit={calculateTrip} loading={loading} />
        </section>

        {/* Error Message */}
        {error && (
          <section className="section error-section">
            <div className="error-message">❌ {error}</div>
          </section>
        )}

        {/* Loading State */}
        {loading && (
          <section className="section loading-section">
            <div className="loading">
              <div className="spinner" />
              <p>Calculating route and HOS compliance...</p>
            </div>
          </section>
        )}

        {/* Results */}
        {tripData && !loading && (
          <>
            {/* Map Display */}
            <section className="section">
              <h2>📍 Route Map</h2>
              <div>Map display</div>
              <MapDisplay tripData={tripData} />
            </section>

            {/* Trip Summary */}
            <section className="section">
              <h2>📊 Trip Summary</h2>
              <TripSummary tripData={tripData} />
            </section>

            {/* ELD Logs */}
            <section className="section">
              <h2>📄 ELD Daily Log Sheets</h2>
              <ELDLogs tripData={tripData} />
            </section>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Built for Spotter.ai Assessment | Django & React</p>
      </footer>
    </div>
  );
}

export default App;
