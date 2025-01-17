import React, { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import NavigationBar from "../../NavigationBar/NavigationBar";

const Modal = ({
  showModal,
  closeModal,
  handleConfirmDelete,
  modalContent,
}) => {
  return (
    showModal && (
      <div className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="relative max-w-lg mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-300">
              <h3 className="text-xl font-semibold">Delete Confirmation</h3>
              <button
                className="text-gray-700 hover:text-black transition ease-in-out duration-150"
                onClick={closeModal}
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M17.414 6.586a2 2 0 0 0-2.828 0L12 9.172 9.414 6.586a2 2 0 0 0-2.828 2.828L9.172 12l-2.586 2.586a2 2 0 1 0 2.828 2.828L12 14.828l2.586 2.586a2 2 0 1 0 2.828-2.828L14.828 12l2.586-2.586a2 2 0 0 0 0-2.828z"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="p-5">
              <p className="text-gray-700">
                Are you sure you want to delete {modalContent.filename}?
              </p>
            </div>
            <div className="flex justify-end p-5 border-t border-gray-300">
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded mr-2"
                type="button"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
                type="button"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

const RocFilings = () => {
  const [clientData, setClientData] = useState([]);
  const [filteredClientData, setFilteredClientData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isViewingClient, setIsViewingClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [rocFilingsData, setRocFilingsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRocFilingIndex, setSelectedRocFilingIndex] = useState(-1);
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState("");
  const [filteredROCFilingsData, setFilteredROCFilingsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [searchQueryC, setSearchQueryC] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [currentPageClient, setCurrentPageClient] = useState(1);
  const [itemsPerPageClient] = useState(10); // Adjust items per page as needed
  const [currentPageROCFilings, setCurrentPageROCFilings] = useState(1);
  const [itemsPerPageROCFilings] = useState(10);
  const [currentPageC, setCurrentPageC] = useState(1);
  const [itemsPerPageC, setItemsPerPageC] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  useEffect(() => {
    fetchClientData();
  }, []);

  useEffect(() => {
    filterClientData();
  }, [clientData, searchQueryC, filterOption]);

  const fetchClientData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5002/admin/client/manageclient",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      setClientData(response.data.clients);
    } catch (error) {
      console.error("Error fetching clientData:", error);
    }
  };

  const filterClientData = () => {
    let filteredClientData = clientData.filter((client) => {
      const fullName = `${client.firstname} ${client.lastname}.toLowerCase()`;
      return (
        fullName.includes(searchQueryC.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQueryC.toLowerCase())
      );
    });

    if (filterOption !== "all") {
      filteredClientData = filteredClientData.filter(
        (client) => client.status === filterOption
      );
    }

    setFilteredClientData(filteredClientData);
  };

  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5002/admin/settings/rocfilings/ROCfilingsfields"
        );
        setFields(response.data);
      } catch (error) {
        console.error("Error fetching fields:", error);
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  const handleClientChange = async (event) => {
    setSelectedCompany(event.target.value);
  };

  const handleFieldChange = (field) => {
    setSelectedField(field);
  };

  useEffect(() => {
    if (selectedClient) {
      fetchRocFilingsData();
    }
  }, [selectedClient]);

  const fetchRocFilingsData = async (client) => {
    try {
      setLoading(true);
      console.log(client.email);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5002/admin/document/rocfilings/getROCFilingsAdmin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            selectedClient: client.email,
          },
        }
      );
      if (response.data.rocFilings && response.data.rocFilings.length > 0) {
        setRocFilingsData(response.data.rocFilings);
        setSelectedClient(client);
        setIsViewingClient(true);
        // setLoading(false);
      } else {
        message.info(" No files available for this client.");
        setIsViewingClient(false);
      }
      setLoading(false);
    } catch (error) {
      // console.error('Error fetching ROC filings data:', error);
      // message.info(' No files available for this client.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedField) {
      const filteredData = rocFilingsData.filter(
        (rocFiling) => rocFiling.rocFieldName === selectedField
      );
      setFilteredROCFilingsData(filteredData);
    } else {
      setFilteredROCFilingsData(rocFilingsData);
    }
  }, [selectedField, rocFilingsData]);

  useEffect(() => {
    if (selectedField) {
      const filteredData = rocFilingsData.filter(
        (rocfiling) => rocfiling.rocFieldName === selectedField
      );
      setFilteredROCFilingsData(filteredData);
    } else {
      setFilteredROCFilingsData(rocFilingsData);
    }
  }, [selectedField, rocFilingsData]);

  const totalPages = Math.ceil(rocFilingsData.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPagesC = Math.ceil(clientData.length / itemsPerPageC);

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
    filteredClientData.length
  );
  const slicedHistoryC = filteredClientData.slice(startIndexC, endIndexC);

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 3; // Number of buttons to display
    const maxPages = Math.min(totalPages, maxButtons);
    const middleButton = Math.ceil(maxPages / 2);
    let startPage = Math.max(1, currentPage - middleButton + 1);
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (currentPage > middleButton && totalPages > maxButtons) {
      startPage = Math.min(currentPage - 1, totalPages - maxButtons + 1);
      endPage = Math.min(startPage + maxButtons - 1, totalPages);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <li
          key={i}
          className={`page-item ${currentPage === i ? "active" : ""}`}
        >
          <button
            onClick={() => paginate(i)}
            className={`page-link bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded ${
              currentPage === i ? "current-page" : ""
            }`}
          >
            {i}
          </button>
        </li>
      );
    }

    if (totalPages > maxButtons && endPage < totalPages) {
      buttons.push(
        <li key="ellipsis" className="page-item disabled">
          <span className="page-link bg-blue-500 text-white font-semibold py-2 px-4 rounded">
            ...
          </span>
        </li>
      );
      buttons.push(
        <li key={totalPages} className="page-item">
          <button
            onClick={() => paginate(totalPages)}
            className="page-link bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            {totalPages}
          </button>
        </li>
      );
    }

    return buttons;
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredROCFilingsData.length
  );
  const slicedHistory = filteredROCFilingsData.slice(startIndex, endIndex);

  useEffect(() => {
    const filteredData = rocFilingsData.filter((rocfilings) => {
      const searchLowerCase = searchQuery.toLowerCase();
      return (
        (rocfilings &&
          rocfilings.email &&
          rocfilings.email.toLowerCase().includes(searchLowerCase)) ||
        (rocfilings.role &&
          rocfilings.role.toLowerCase().includes(searchLowerCase)) ||
        (rocfilings.rocFieldName &&
          rocfilings.rocFieldName.toLowerCase().includes(searchLowerCase)) ||
        (rocfilings.company &&
          rocfilings.company.toLowerCase().includes(searchLowerCase))
      );
    });
    setFilteredROCFilingsData(filteredData);
  }, [searchQuery, rocFilingsData]);

  // const handleDelete = async (filename) => {
  //   try {
  //     await axios.post('http://localhost:5002/admin/deleteRocFilingAdmin', { filename });
  //     fetchRocFilingsData();
  //   } catch (error) {
  //     console.error('Error deleting ROC filing:', error);
  //   }
  // };

  // const handleBack = () => {
  //   setSelectedRocFilingIndex(-1);
  // };

  const handleDelete = (filename) => {
    try {
      setModalContent({ filename }); // Set modal content
      setShowModal(true); // Show modal for confirmation
    } catch (error) {
      console.error("Error deleting IT return:", error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5002/admin/document/rocfilings/deleteROCFilingAdmin",
        { filename: modalContent.filename },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchRocFilingsData(selectedClient); // Refresh the table after deletion
      setShowModal(false); // Close the modal after successful deletion
      setModalContent({}); // Clear modal content
      message.success("successfully deleted the file");
    } catch (error) {
      setShowModal(false); // Close the modal on error
      if (error.response && error.response.status === 500) {
        message.error("Failed to delete ROC Filings file, try again later");
      } else {
        message.error("Failed to delete ROC Filings. Please try again.");
      }
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false); // Close the modal if cancel is clicked
    setModalContent({}); // Clear modal content
  };

  const handleClientBack = () => {
    setIsViewingClient(false);
    setSelectedClient(null);
  };

  const handleROCFilingsBack = () => {
    setSelectedRocFilingIndex(-1);
  };

  const handleBack = () => {
    if (selectedRocFilingIndex !== -1) {
      // If viewing IT return details, go back to IT files table
      handleROCFilingsBack();
    } else {
      // If not viewing IT return details, go back to client table
      handleClientBack();
    }
  };

  const handleFilter = (filter) => {
    setFilterOption(filter);
  };

  const handlePreview = async (filename) => {
    try {
      const authToken = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5002/user/document/rocfilings/previewROCFiling/${filename}`,

        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          responseType: "arraybuffer",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error previewing file:", error);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const authToken = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5002/user/document/rocfilings/downloadROCFiling/${filename}`,
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
    }
  };

  // const handleView = (index) => {
  //   setSelectedRocFilingIndex(index);
  // };

  const handleView = (index) => {
    const ROCData = filteredROCFilingsData[index];

    // Store data in local storage
    localStorage.setItem("ROCData", JSON.stringify(ROCData));

    // Open new tab
    const ROCWindow = window.open("/roc", "_blank");

    if (!ROCWindow) {
      alert("Please allow pop-ups for this website to view ROC details.");
    }
  };

  const indexOfLastClient = currentPageClient * itemsPerPageClient;
  const indexOfFirstClient = indexOfLastClient - itemsPerPageClient;
  const currentClients = filteredClientData.slice(
    indexOfFirstClient,
    indexOfLastClient
  );

  const paginateClients = (pageNumber) => setCurrentPageClient(pageNumber);

  // Pagination Logic for IT Returns Data
  const indexOfLastROCFilings = currentPageROCFilings * itemsPerPageROCFilings;
  const indexOfFirstROCFilings = indexOfLastROCFilings - itemsPerPageROCFilings;
  const currentROCFilings = filteredROCFilingsData.slice(
    indexOfFirstROCFilings,
    indexOfLastROCFilings
  );

  const paginateROCFilings = (pageNumber) =>
    setCurrentPageROCFilings(pageNumber);

  if (isViewingClient) {
    return (
      <>
        <NavigationBar />
        <hr></hr>
        <div className="container mx-auto p-10">
          <p className="font-bold text-3xl text-blue-500 mb-10">
            ROC FILINGS LIST{" "}
          </p>
          <div className="flex flex-wrap mt-4">
            {selectedRocFilingIndex !== -1 ? (
              <div className="w-full mb-5">
                <button
                  onClick={handleBack}
                  className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded mb-5"
                >
                  Back
                </button>
                <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full">
                  <div className="p-5">
                    <p className="font-bold text-3xl text-blue-500 mb-10">
                      ROC FILINGS DETAILS{" "}
                    </p>
                    <p>
                      <strong className="text-gray-600">Company Name:</strong>{" "}
                      {rocFilingsData[selectedRocFilingIndex]?.company}
                    </p>
                    <p>
                      <strong className="text-gray-600">IT Return Type:</strong>{" "}
                      {rocFilingsData[selectedRocFilingIndex]?.rocFieldName}
                    </p>
                    <p>
                      <strong className="text-gray-600">Description:</strong>{" "}
                      {rocFilingsData[selectedRocFilingIndex]?.description}
                    </p>
                    <p>
                      <strong className="text-gray-600">Remarks:</strong>{" "}
                      {rocFilingsData[selectedRocFilingIndex]?.remarks}
                    </p>
                    <p>
                      <strong className="text-gray-600">Filename:</strong>{" "}
                      {rocFilingsData[selectedRocFilingIndex]?.files[0].filename
                        .split("_")
                        .slice(1)
                        .join("_")}
                    </p>
                    <p>
                      <strong className="text-gray-600">Uploader Name:</strong>{" "}
                      {rocFilingsData[selectedRocFilingIndex]?.name}
                    </p>
                    <p>
                      <strong className="text-gray-600">Uploader email:</strong>{" "}
                      {rocFilingsData[selectedRocFilingIndex]?.email}
                    </p>
                    <p>
                      <strong className="text-gray-600">Role:</strong>{" "}
                      {rocFilingsData[selectedRocFilingIndex]?.role}
                    </p>
                    <div className="flex items-center mt-4">
                      {rocFilingsData[selectedRocFilingIndex].files[0].filename
                        .slice(-3)
                        .toLowerCase() === "pdf" && (
                        <button
                          onClick={() =>
                            handlePreview(
                              rocFilingsData[selectedRocFilingIndex].files[0]
                                .filename
                            )
                          }
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mr-2"
                        >
                          Preview
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleDownload(
                            rocFilingsData[selectedRocFilingIndex].files[0]
                              .filename
                          )
                        }
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <div className="mb-4 w-full">
                    <button
                      onClick={handleBack}
                      className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded mb-5"
                    >
                      Back
                    </button>
                    <div className="flex justify-between border border-t-3 border-b-3 border-gray-200 p-5">
                      <div className="flex justify-between">
                        {fields.map((field) => (
                          <div
                            key={field.fieldName}
                            className={`cursor-pointer ${
                              selectedField === field.fieldName
                                ? "text-blue-500 font-bold"
                                : "text-gray-500 hover:text-blue-500"
                            } flex items-center mr-4`}
                            onClick={() => handleFieldChange(field.fieldName)}
                          >
                            {field.fieldName}
                          </div>
                        ))}
                      </div>
                      <div>
                        <input
                          id="search"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="p-2 border border-gray-300 rounded-md"
                          placeholder="Search..."
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-2 px-4 border-b">Sno</th>
                        <th className="py-2 px-4 border-b">Company Name</th>
                        <th className="py-2 px-4 border-b">RO Filing Type</th>
                        <th className="py-2 px-4 border-b">Description</th>
                        <th className="py-2 px-4 border-b">Remarks</th>
                        <th className="py-2 px-4 border-b">Filename</th>
                        <th className="py-2 px-4 border-b">Role</th>
                        <th className="py-2 px-4 border-b">Uploader Email</th>
                        <th className="py-2 px-4 border-b">View</th>
                        <th className="py-2 px-4 border-b">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slicedHistory.map((rocFiling, index) => (
                        <tr key={rocFiling._id}>
                          <td className="py-2 px-4 border-b">
                            {filteredROCFilingsData.length - startIndex - index}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {rocFiling.company}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {rocFiling.rocFieldName}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {rocFiling.description.substring(0, 50)}...
                          </td>
                          <td className="py-2 px-4 border-b">
                            {rocFiling.remarks.substring(0, 50)}...
                          </td>
                          <td className="py-2 px-4 border-b">
                            {rocFiling.files[0].filename
                              .split("_")
                              .slice(1)
                              .join("_")}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {rocFiling.role}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {rocFiling.email}
                          </td>
                          <td>
                            <button
                              onClick={() => handleView(index)}
                              className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                            >
                              View
                            </button>
                          </td>
                          <td>
                            <button
                              onClick={() =>
                                handleDelete(rocFiling.files[0].filename)
                              }
                              className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <ul className="pagination flex justify-center items-center my-4">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        className="page-link bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                      >
                        <FontAwesomeIcon icon={faAngleLeft} />
                      </button>
                    </li>
                    {renderPaginationButtons()}
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        onClick={() => paginate(currentPage + 1)}
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
        <Modal
          showModal={showModal}
          closeModal={() => setShowModal(false)}
          handleConfirmDelete={handleConfirmDelete}
          modalContent={modalContent}
        />
      </>
    );
  }

  return (
    <div>
      <NavigationBar />
      <hr></hr>
      <div className="container mx-auto p-5 md:p-10">
        <p className="font-bold text-3xl text-blue-500 mb-10">
          ROC FILINGS LIST{" "}
        </p>
        <div className="flex flex-wrap mt-2 md:mt-4">
          <div className="mb-2 md:mb-4 w-full">
            <div className="flex flex-col md:flex-row justify-between border border-t-3 border-b-3 border-gray-200 p-3 md:p-5">
              <div className="flex flex-wrap justify-center md:justify-start">
                <div
                  className={`cursor-pointer ${
                    filterOption === "all"
                      ? "text-blue-500 font-bold"
                      : "text-gray-500 hover:text-blue-500"
                  } flex items-center mb-2 mx-3 md:mb-0 md:mr-10`}
                  onClick={() => handleFilter("all")}
                >
                  <span
                    className={`mr-2 ${
                      filterOption === "all" ? "border-b-2 border-blue-500" : ""
                    }`}
                  >
                    All
                  </span>
                </div>
                <div
                  className={`cursor-pointer ${
                    filterOption === "inactive"
                      ? "text-red-500 font-bold"
                      : "text-gray-500 hover:text-red-500"
                  } flex items-center mb-2 mx-3  md:mb-0 md:mx-10`}
                  onClick={() => handleFilter("inactive")}
                >
                  <span
                    className={`mr-2 ${
                      filterOption === "inactive"
                        ? "border-b-2 border-red-500"
                        : ""
                    }`}
                  >
                    Inactive
                  </span>
                </div>
                <div
                  className={`cursor-pointer ${
                    filterOption === "active"
                      ? "text-green-500 font-bold"
                      : "text-gray-500 hover:text-green-500"
                  } flex items-center mb-2 mx-3  md:mb-0 md:mx-10`}
                  onClick={() => handleFilter("active")}
                >
                  <span
                    className={`mr-2 ${
                      filterOption === "active"
                        ? "border-b-2 border-green-500"
                        : ""
                    }`}
                  >
                    Active
                  </span>
                </div>
              </div>
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchQueryC}
                onChange={(e) => setSearchQueryC(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 mt-2 md:mt-0 w-full md:w-auto"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">S No</th>
                    <th className="py-2 px-4 border-b">First Name</th>
                    <th className="py-2 px-4 border-b">Last Name</th>
                    <th className="py-2 px-4 border-b">Email</th>
                    <th className="py-2 px-4 border-b">Phone Number</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slicedHistoryC.map((client, index) => (
                    <tr
                      key={index}
                      className={(index + 1) % 2 === 0 ? "bg-gray-100" : ""}
                    >
                      <td className="py-2 px-4 border-b">
                        {filteredClientData.length - startIndexC - index}
                      </td>
                      <td className="py-2 px-4 border-b">{client.firstname}</td>
                      <td className="py-2 px-4 border-b">{client.lastname}</td>
                      <td className="py-2 px-4 border-b">{client.email}</td>
                      <td className="py-2 px-4 border-b">
                        {client.Phone_number}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <span
                          className={
                            client.status === "active"
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {client.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b">
                        {client.status === "active" && (
                          <button
                            onClick={() => fetchRocFilingsData(client)}
                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          >
                            Select
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="pagination flex justify-center items-center my-4">
              <li
                className={`page-item ${currentPageC === 1 ? "disabled" : ""}`}
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
        <Modal
          showModal={showModal}
          closeModal={() => setShowModal(false)}
          handleConfirmDelete={handleConfirmDelete}
          modalContent={modalContent}
        />
      </div>
    </div>
  );
};
export default RocFilings;
