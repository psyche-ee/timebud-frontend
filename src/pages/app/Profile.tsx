import Header from "../../components/Header";
import { IoCameraOutline, IoChevronBack } from "react-icons/io5";
import { FaUserEdit } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function Profile() {

  const [editMode, setEditMode] = useState(false);

  const [profile, setProfile] = useState({
    f_name: "",
    m_name: "",
    l_name: "",
    email: "",
    dob: "",
    gender: "",
    rate_per_hr: ""
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    setProfile({
      f_name: user.f_name || "",
      m_name: user.m_name || "",
      l_name: user.l_name || "",
      email: user.email || "",
      dob: user.dob || "",
      gender: user.gender || "",
      rate_per_hr: user.rate_per_hr || ""
    });
  }, []);

  const handleChange = (e:any) => {
    const { name, value } = e.target;

    setProfile({
      ...profile,
      [name]: value
    });
  };

  const handleSave = () => {
    localStorage.setItem("user", JSON.stringify(profile));
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-4 space-y-4">
        <Header />

        <div className="max-w-md mx-auto">

          {/* Title + Edit */}
          <div className="flex justify-between items-center mb-6">

            <a href="/settings" className="text-secndary text-xl font-semibold">
              <IoChevronBack />
            </a>

            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex bg-primary px-4 py-1 rounded-md items-center gap-1 text-surface text-sm font-medium"
              >
                <FaUserEdit />
                Edit
              </button>
            )}

          </div>

          <div className="bg-card border rounded-2xl shadow-sm p-6 space-y-6">

            {/* Avatar */}
            <div className="flex flex-col items-center">

              <div className="relative">

                <img
                  src="https://i.pravatar.cc/150"
                  className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-sm"
                />

                {editMode && (
                  <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow">
                    <IoCameraOutline size={16} />
                  </button>
                )}

              </div>

              <p className="font-medium text-secondary mt-3">
                {profile.f_name} {profile.l_name}
              </p>

              <p className="text-sm text-muted">
                {profile.email}
              </p>

            </div>

            {/* First Name */}
            <div>
              <label className="text-sm text-muted">First Name</label>
              <input
                type="text"
                name="f_name"
                value={profile.f_name}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white disabled:opacity-70 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* Middle Name */}
            <div>
              <label className="text-sm text-muted">Middle Name</label>
              <input
                type="text"
                name="m_name"
                value={profile.m_name || ""}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white disabled:opacity-70 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="text-sm text-muted">Last Name</label>
              <input
                type="text"
                name="l_name"
                value={profile.l_name}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white disabled:opacity-70 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* DOB */}
            <div>
              <label className="text-sm text-muted">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={profile.dob}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white disabled:opacity-70 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="text-sm text-muted">Gender</label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white disabled:opacity-70 focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Rate */}
            <div>
              <label className="text-sm text-muted">Rate per Hour</label>
              <input
                type="number"
                name="rate_per_hr"
                value={profile.rate_per_hr}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white disabled:opacity-70 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* Buttons */}
            {editMode && (
              <div className="flex gap-3 pt-2">

                <button
                  onClick={handleSave}
                  className="flex-1 bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-hover transition"
                >
                  Save Changes
                </button>

                <button
                  onClick={() => setEditMode(false)}
                  className="flex-1 border border-gray-300 py-2.5 rounded-lg text-secondary"
                >
                  Cancel
                </button>

              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}