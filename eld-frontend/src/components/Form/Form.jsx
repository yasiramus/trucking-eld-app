import { useState } from "react";
import Button from "../Button/Button";

import "./Form.css";

function Form({ onSubmit, loading }) {
  /**state */
  const [formData, setFormData] = useState({
    current_location: "",
    pickup_location: "",
    drop_off_location: "",
    current_cycle_used: 0,
  });

  /**handle change event oon input form*/
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "current_cycle_used" && value !== "" ? parseFloat(value) : value
    }));
  };

  /**handleSubmit */
  const handleSubmit = (e) => {
    e.preventDefault();

    //Validation
    if (formData.current_cycle_used < 0 || formData.current_cycle_used > 70) {
      alert("Current cycle used must be between 0 and 70 hours");
      return;
    }

    onSubmit(formData);
  };

  /**load sample data */
  const loadSampleData = () => {
    setFormData({
      current_location: "Los Angeles, CA",
      pickup_location: "Phoenix, AZ",
      drop_off_location: "Dallas, TX",
      current_cycle_used: 25.5,
    });
  };

  return (
    <form className="trip-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>🚚 Trip Details</h2>
        <Button onClick={loadSampleData} className={"btn-secondary btn-small"}>Load Sample</Button>
      </div>

      <div className="form-grid">
        {/* Location Inputs */}
        {["current_location", "pickup_location", "drop_off_location"].map(
          (field, index) => (
            <div className="form-group" key={field}>
              <label htmlFor={field}>
                {["📍 Current Location", "📦 Pickup Location", "🏁 Drop Off Location"][index]}
              </label>
              <input
                type="text"
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder={`${["Los Angeles, CA", "Phoenix, AZ", "Dallas, TX"][index]}`}
                autoComplete="off"
              />
            </div>
          )
        )}

        {/* current_cycle_used */}
        <div className="form-group">
          <label htmlFor="current_cycle_used">
            ⏱️ Current Cycle Used (Hours)
          </label>
          <input
            type="number"
            id="current_cycle_used"
            name="current_cycle_used"
            value={formData.current_cycle_used}
            onChange={handleChange}
            min="0"
            max="70"
            step="0.5"
            required
            disabled={loading}
          />
          <small>Hours used in current 70-hour/8-day cycle (0-70)</small>
        </div>
      </div>

      <Button type={"submit"}
        loading={loading}
        className={"btn-primary btn-large"}
      >
        🚀 Calculate Route
      </Button>
    </form>
  );
}

export default Form;