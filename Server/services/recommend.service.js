export const recommendDoctorBySymptoms = (symptoms = []) => {
    const s = symptoms.join(" ").toLowerCase();
  
    if (s.includes("chest")) return { doctor: "Cardiologist", urgency: "High" };
    if (s.includes("skin")) return { doctor: "Dermatologist", urgency: "Low" };
    if (s.includes("headache")) return { doctor: "Physician", urgency: "Medium" };
  
    return { doctor: "General Physician", urgency: "Low" };
  };