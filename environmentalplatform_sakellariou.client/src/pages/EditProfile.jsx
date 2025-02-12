import React, { useState, useEffect } from "react";
import "../styles/Forms.css"; // Assuming you want to use the same styles as the RegisterPage

const EditProfile = () => {
    const [formData, setFormData] = useState({
        name: "", // Changed to lowercase
        surname: "", // Changed to lowercase
        profession: "", // Changed to lowercase
        dateOfBirth: "", // Changed to lowercase
        afm: "", // Changed to lowercase
        website: "", // Changed to lowercase
        headquarters: "", // Changed to lowercase
        aim: "", // Changed to lowercase
        legalForm: "", // Changed to lowercase
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const role = localStorage.getItem("userRole"); // Corrected key to userRole
    console.log("User role:", role); // Check role value

    const userId = localStorage.getItem("userId");
    console.log("Retrieved userId from localStorage:", userId);

    // Fetch profile data from API
    useEffect(() => {
        fetch("https://localhost:7029/api/users/profile", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then((response) => {
                console.log("API Response Status:", response.status);
                return response.json();
            })
            .then((data) => {
                console.log("Fetched profile data:", data); // Log the fetched data

                const userDetails = data.details || {}; // Default to an empty object if no details exist

                if (role === "Regular User") {
                    setFormData({
                        name: userDetails.name || "", // Default empty string if no name
                        surname: userDetails.surname || "",
                        profession: userDetails.profession || "",
                        dateOfBirth: userDetails.dateOfBirth || "",
                    });
                } else if (role === "Organization") {
                    setFormData({
                        name: userDetails.name || "",
                        afm: userDetails.afm || "",
                        website: userDetails.website || "",
                        headquarters: userDetails.headquarters || "",
                        aim: userDetails.aim || "",
                        legalForm: userDetails.legalForm || "",
                    });
                }

                setLoading(false); // Set loading to false after data is fetched
            })
            .catch((error) => {
                console.error("Error fetching profile:", error);
                setLoading(false); // Ensure loading is set to false in case of error
            });
    }, [role]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ensure userId is not null or undefined
        if (!userId) {
            setError("User ID is not defined");
            return;
        }

        // Prepare the data to send
        let requestData = {};

        // Include common fields
        requestData.name = formData.name;

        if (role === "Regular User") {
            // Include Regular User specific fields
            requestData = {
                ...requestData,
                surname: formData.surname,
                profession: formData.profession,
                dateOfBirth: formData.dateOfBirth,
            };
        } else if (role === "Organization") {
            // Include Organization specific fields
            requestData = {
                ...requestData,
                name: formData.name,
                afm: formData.afm ? parseInt(formData.afm, 10) : null,  // Ensure afm is an integer
                website: formData.website,
                headquarters: formData.headquarters,
                aim: formData.aim,
                legalForm: formData.legalForm,
            };
        }

        // Log the payload to ensure it's correctly structured
        console.log("Request Payload:", requestData);

        try {
            const response = await fetch(`https://localhost:7029/api/users/update-profile/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",  // Ensure correct content type
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(requestData),  // Send the payload as a JSON string
            });

            const result = await response.json();
            if (!response.ok) {
                setError(result.message || "Error updating profile");
                setSuccess(null);  // Clear success message
            } else {
                setSuccess(result.message || "Profile updated successfully");
                setError(null);  // Clear error message
            }
        } catch (error) {
            console.error("Error:", error);
            setError("An error occurred while updating the profile");
            setSuccess(null);  // Clear success message
        }
    };


    return (
        <div className="form-container">
            <h2>Edit Profile</h2>
            {loading ? (
                <p>Loading...</p>
            ) : role === "Regular User" ? (
                <form onSubmit={handleSubmit}>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name" 
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <label>Surname:</label>
                    <input
                        type="text"
                        name="surname" 
                        value={formData.surname}
                        onChange={handleChange}
                        required
                    />

                    <label>Profession:</label>
                    <input
                        type="text"
                        name="profession" 
                        value={formData.profession}
                        onChange={handleChange}
                    />

                    <label>Date of Birth:</label>
                    <input
                        type="date"
                        name="dateOfBirth" 
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                    />

                    <button type="submit">Save Changes</button>
                </form>
            ) : role === "Organization" ? (
                <form onSubmit={handleSubmit}>
                    <label>Organization Name:</label>
                    <input
                        type="text"
                        name="name" 
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <label>AFM:</label>
                    <input
                        type="text"
                        name="afm" 
                        value={formData.afm}
                        onChange={handleChange}
                    />

                    <label>Website:</label>
                    <input
                        type="url"
                        name="website" 
                        value={formData.website}
                        onChange={handleChange}
                    />

                    <label>Headquarters:</label>
                    <input
                        type="text"
                        name="headquarters" 
                        value={formData.headquarters}
                        onChange={handleChange}
                    />

                    <label>Aim:</label>
                    <input
                        type="text"
                        name="aim" 
                        value={formData.aim}
                        onChange={handleChange}
                    />

                    <label>Legal Form:</label>
                    <input
                        type="text"
                        name="legalForm" 
                        value={formData.legalForm}
                        onChange={handleChange}
                    />

                    <button type="submit">Save Changes</button>
                </form>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default EditProfile;
