import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import NavigationBar from "../../Pages/User/NavigationBar/NavigationBar";
const UserGSTNotice = () => {
  let navigate = useNavigate();

  const [gstNotice, setGSTNotice] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState({});
  const [selectedGSTNotice, setSelectedGSTNotice] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companyNames, setCompanyNames] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGSTNotice, setFilteredGSTNotice] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15); // Change this value as per your requirement
  let isMounted = true;
  const [showAlert, setShowAlert] = useState(false);
  const [alertShown, setAlertShown] = useState(false);
  const [currentPageC, setCurrentPageC] = useState(1);
  const [itemsPerPageC, setItemsPerPageC] = useState(50);

  useEffect(() => {
    fetchGSTNotice();
    fetchCompanyNames();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchGSTNotice = async () => {
    isMounted = true;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5002/admin/getGSTNotice",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response) {
        throw new Error("Failed to fetch profile data");
      }
      setGSTNotice(response.data.gstNotice);
      setFilteredGSTNotice(response.data.gstNotice);
    } catch (error) {
      if (
        isMounted &&
        error.response &&
        error.response.status === 500 &&
        !alertShown
      ) {
        setShowAlert(true);
        setAlertShown(true); // Set flag to true once alert is shown
        alert("Session expired. Please login again.");
        navigate("/");
      }
      console.error("Error fetching IT returns:", error);
    }
  };

  const fetchCompanyNames = async () => {
    isMounted = true;
    try {
      const authToken = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5002/user/getCompanyNameOnlyDetails",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (!response) {
        throw new Error("Failed to fetch profile data");
      }
      setCompanyNames(response.data);
    } catch (error) {
      if (
        isMounted &&
        error.response &&
        error.response.status === 500 &&
        !alertShown
      ) {
        setShowAlert(true);
        setAlertShown(true); // Set flag to true once alert is shown
        alert("Session expired. Please login again.");
        navigate("/");
      }
      // console.error('Error fetching company names:', error);
    }
  };

  const handleDownload = async (filename) => {
    try {
      setLoadingDownload({ ...loadingDownload, [filename]: true });
      const authToken = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5002/admin/downloadGSTNotice/${filename}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          responseType: "arraybuffer",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setLoadingDownload({ ...loadingDownload, [filename]: false });
    }
  };

  const handlePreview = async (filename) => {
    try {
      setLoadingPreview({ ...loadingPreview, [filename]: true });

      const authToken = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5002/admin/previewGSTNotice/${filename}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          responseType: "arraybuffer",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);

      // Open the PDF in a new tab
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error previewing file:", error);
    } finally {
      setLoadingPreview({ ...loadingPreview, [filename]: false });
    }
  };

  const handleViewDetails = (index) => {
    const GSTNoticeData = index;

    // Store data in local storage
    localStorage.setItem("GSTNoticeData", JSON.stringify(GSTNoticeData));

    // Open new tab
    const GSTNoticesWindow = window.open("/gstnotice", "_blank");

    if (!GSTNoticesWindow) {
      alert("Please allow pop-ups for this website to view IT Return details.");
    }
  };

  const handleCloseDetails = () => {
    setSelectedGSTNotice(null);
  };

  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
    filterGSTNotice(event.target.value);
  };

  const filterGSTNotice = (company) => {
    if (company === "") {
      setFilteredGSTNotice(gstNotice);
    } else {
      const filtered = gstNotice.filter(
        (gstNotice) => gstNotice.selectedClientGroup === company
      );
      setFilteredGSTNotice(filtered);
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    const filtered = gstNotice.filter((gstNotice) => {
      return (
        gstNotice.files[0].filename
          .toLowerCase()
          .includes(event.target.value.toLowerCase()) ||
        gstNotice.description
          .toLowerCase()
          .includes(event.target.value.toLowerCase()) ||
        gstNotice.remarks
          .toLowerCase()
          .includes(event.target.value.toLowerCase()) ||
        gstNotice.name.toLowerCase().includes(event.target.value.toLowerCase())
      );
    });
    setFilteredGSTNotice(filtered);
  };

  const extractFilenameAfterUnderscore = (filename) => {
    const parts = filename.split("_");
    return parts.slice(1).join("_"); // Extracting text after the first underscore
  };

  const truncateText = (text, limit) => {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + "...";
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredGSTNotice.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPagesC = Math.ceil(filteredGSTNotice.length / itemsPerPageC);

  const paginateC = (pageNumber) => {
    setCurrentPageC(pageNumber);
  };

  const renderPaginationButtonsC = () => {
    const buttons = [];
    const maxButtons = 3; // Number of buttons to display
    const maxPages = Math.min(totalPagesC, maxButtons);
    const middleButton = Math.ceil(maxPages / 2);
    let startPage = Math.max(1, currentPageC - middleButton + 1);
    let endPage = Math.min(totalPagesC, startPage + maxPages - 1);

    if (currentPageC > middleButton && totalPagesC > maxButtons) {
      startPage = Math.min(currentPageC - 1, totalPagesC - maxButtons + 1);
      endPage = Math.min(startPage + maxButtons - 1, totalPagesC);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <li
          key={i}
          className={`page-item ${currentPageC === i ? "active" : ""}`}
        >
          <button
            onClick={() => paginateC(i)}
            className={`page-link bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded ${
              currentPageC === i ? "current-page" : ""
            }`}
          >
            {i}
          </button>
        </li>
      );
    }

    if (totalPagesC > maxButtons && endPage < totalPagesC) {
      buttons.push(
        <li key="ellipsis" className="page-item disabled">
          <span className="page-link bg-blue-500 text-white font-semibold py-2 px-4 rounded">
            ...
          </span>
        </li>
      );
      buttons.push(
        <li key={totalPagesC} className="page-item">
          <button
            onClick={() => paginateC(totalPagesC)}
            className="page-link bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            {totalPagesC}
          </button>
        </li>
      );
    }

    return buttons;
  };

  const startIndexC = (currentPageC - 1) * itemsPerPageC;
  const endIndexC = Math.min(
    startIndexC + itemsPerPageC,
    filteredGSTNotice.length
  );
  const slicedHistoryC = filteredGSTNotice.slice(startIndexC, endIndexC);

  return (
    <div>
      <NavigationBar />
      <hr></hr>
      <div className="container mx-5 p-4">
        <p className="font-bold text-3xl text-blue-500 mb-10 ">
          GST NOTICE LIST{" "}
        </p>

        {/* Dropdown for selecting companies */}
        {selectedGSTNotice ? (
          <div className="my-10 w-full">
            <button
              onClick={handleCloseDetails}
              className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded mb-5 mx-10"
            >
              Back
            </button>
            <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full md:w-11/12 lg:w-11/12  xl:w-11/12  mx-auto">
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-400 mb-3">
                  GST Notice Details
                </h3>
                <p>
                  <strong className="text-gray-600">Filename:</strong>
                  {selectedGSTNotice.files[0].filename}
                </p>
                <p>
                  <strong className="text-gray-600">Description:</strong>
                  {selectedGSTNotice.description}
                </p>
                <p>
                  <strong className="text-gray-600">Remarks:</strong>
                  {selectedGSTNotice.remarks}
                </p>
                <p>
                  <strong className="text-gray-600">
                    Name of the Uploader:
                  </strong>
                  {selectedGSTNotice.name}
                </p>
                <p>
                  <strong className="text-gray-600">IT Returns Type:</strong>{" "}
                  {selectedGSTNotice.selectedReturnType}
                </p>
                <p>
                  <strong className="text-gray-600">
                    Email of the uploader:
                  </strong>{" "}
                  {selectedGSTNotice.email}
                </p>
                <p>
                  <strong className="text-gray-600">Role:</strong>{" "}
                  {selectedGSTNotice.role}
                </p>
                <div className="flex items-center mt-4 flex-wrap">
                  {selectedGSTNotice.files[0].filename
                    .slice(-3)
                    .toLowerCase() === "pdf" && (
                    <button
                      onClick={() =>
                        handlePreview(selectedGSTNotice.files[0].filename)
                      }
                      disabled={
                        loadingPreview[selectedGSTNotice.files[0].filename] ||
                        !selectedGSTNotice.files[0].filename.endsWith(".pdf")
                      }
                      className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                    >
                      {loadingPreview[selectedGSTNotice.files[0].filename]
                        ? "Loading Preview..."
                        : "Preview"}
                    </button>
                  )}
                  <button
                    onClick={() =>
                      handleDownload(selectedGSTNotice.files[0].filename)
                    }
                    disabled={
                      loadingDownload[selectedGSTNotice.files[0].filename]
                    }
                    className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded"
                  >
                    {loadingDownload[selectedGSTNotice.files[0].filename]
                      ? "Downloading..."
                      : "Download"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 mx-5">
            <label className="block mb-2 ">
              <p className="text-xl text-gray-600">Select Company:</p>
              <select
                value={selectedCompany}
                onChange={handleCompanyChange}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Companies</option>
                {companyNames.map((companyName) => (
                  <option key={companyName} value={companyName}>
                    {companyName}
                  </option>
                ))}
              </select>
            </label>

            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 mt-4 mb-2 focus:outline-none focus:border-blue-500"
              placeholder="Search..."
            />
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border bg-gray-200 px-4 py-2 text-center">Sno</th>
                    <th className="border bg-gray-200 px-4 py-2 text-center">
                     File Name
                    </th>
                    
                    <th className="border bg-gray-200 px-4 py-2 text-center">
                      Uploaded By
                    </th>
                    <th className="border bg-gray-200 px-4 py-2 text-center">Preview</th>
                    <th className="border bg-gray-200 px-4 py-2 text-center">Download</th>
                    <th className="border bg-gray-200 px-4 py-2 text-center">View</th>
                  </tr>
                </thead>
                <tbody>
                  {slicedHistoryC.length > 0 ? (
                    slicedHistoryC.map((GSTNotice, index) => (
                      <tr key={GSTNotice._id}>
                        <td className="border px-4 py-2 text-center">
                          {filteredGSTNotice.length - startIndexC - index}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          {truncateText(
                            extractFilenameAfterUnderscore(
                              GSTNotice.files[0].filename
                            ),
                            20
                          )}
                        </td>
                      
                        <td className="border px-4 py-2 text-center">
                          {truncateText(GSTNotice.name, 20)}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          {GSTNotice.files[0].filename
                            .slice(-3)
                            .toLowerCase() === "pdf" && (
                            <button
                              onClick={() =>
                                handlePreview(GSTNotice.files[0].filename)
                              }
                              disabled={
                                loadingPreview[GSTNotice.files[0].filename]
                              }
                              className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                            >
                              {loadingPreview[GSTNotice.files[0].filename]
                                ? "Loading Preview..."
                                : "Preview"}
                            </button>
                          )}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <button
                            onClick={() =>
                              handleDownload(GSTNotice.files[0].filename)
                            }
                            disabled={
                              loadingDownload[GSTNotice.files[0].filename]
                            }
                            className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded"
                          >
                            {loadingDownload[GSTNotice.files[0].filename]
                              ? "Downloading..."
                              : "Download"}
                          </button>
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <button
                            onClick={() => handleViewDetails(GSTNotice)}
                            className="bg-transparent hover:bg-gray-500 text-gray-700 font-semibold hover:text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="border px-4 py-2 text-center">
                        No GST Noticeavailable.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <ul className="pagination flex justify-center items-center my-4">
                <li
                  className={`page-item ${
                    currentPageC === 1 ? "disabled" : ""
                  }`}
                >
                  <button
                    onClick={() => paginateC(currentPageC - 1)}
                    className="page-link bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                  >
                    <FontAwesomeIcon icon={faAngleLeft} />
                  </button>
                </li>
                {renderPaginationButtonsC()}
                <li
                  className={`page-item ${
                    currentPageC === totalPagesC ? "disabled" : ""
                  }`}
                >
                  <button
                    onClick={() => paginateC(currentPageC + 1)}
                    className="page-link bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                  >
                    <FontAwesomeIcon icon={faAngleRight} />
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserGSTNotice;
