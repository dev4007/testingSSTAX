import React, { useRef, useState } from "react";
import axios from "axios";
import { message } from "antd";
import NavigationBar from "../NavigationBar/NavigationBar";

const Notification = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);

  const formRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    const token = localStorage.getItem("token");
    setLoading(true); // Activate loader

    try {
      const response = await axios.post(
        "http://localhost:5002/admin/notification/sendnotification",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("Notification sent successfully");
      formRef.current.reset();
      setTitle("");
      setDescription("");
      setFiles([]);
    } catch (error) {
      message.error("Error sending notification");
      // Handle error
    } finally {
      setLoading(false); // Deactivate loader
    }
  };

  return (
    <div>
      <NavigationBar />
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="max-w-2xl  w-full bg-white p-8 rounded-md shadow-md">
          <p className="font-bold text-3xl flex justify-center text-blue-500 mb-10">
            SEND NOTIFICATION{" "}
          </p>
          <form ref={formRef}>
            <div className="mb-6">
              <label
                className="block text-gray-500 text-lg mb-2"
                htmlFor="title"
              >
                Title:
              </label>
              <input
                className="border border-gray-200 rounded px-4 py-2 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full"
                id="title"
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={handleTitleChange}
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-gray-500 text-lg mb-2"
                htmlFor="description"
              >
                Description:
              </label>
              <textarea
                className="border border-gray-200 rounded px-4 py-2 resize-y focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full h-36"
                id="description"
                placeholder="Enter description"
                value={description}
                onChange={handleDescriptionChange}
                style={{ width: "100%" }} // Set the width to 100%
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-gray-500 text-lg mb-2"
                htmlFor="files"
              >
                Attach Files:
              </label>
              <input
                className="appearance-none block w-full bg-white border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:border-blue-500 focus:shadow-outline"
                id="files"
                type="file"
                multiple
                onChange={handleFileChange}
              />
            </div>
            <div className="flex justify-center items-center mt-12">
              <button
                className="inline-block w-56 rounded px-6 pb-2 pt-2.5 leading-normal text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:from-blue-600 hover:to-blue-800 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:from-blue-600 focus:to-blue-800 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:from-blue-700 active:to-blue-900 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                type="button"
                onClick={handleSubmit}
              >
                {loading ? "Loading..." : "Send Notification"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Notification;
