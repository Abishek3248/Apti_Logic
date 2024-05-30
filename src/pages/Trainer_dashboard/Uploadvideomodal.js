import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import "./UploadVideo.css";

function UploadVideo() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const topic = e.target.elements.topic.value;
    const videoLink = e.target.elements.videoLink.value;

    // Add the topic and video link to Firestore
    await addDoc(collection(db, 'topics'), {
      topic,
      videoLink
    });
    // Close the modal
    handleClose();
  };

  return (
    <>
      <button
        id="updateButton"
        className="custom-button"
        onClick={handleShow}
      >
        Update
      </button>

      {show && (
        <div className="custom-modal">
          <div className="custom-modal-content">
            <div className="custom-modal-header">
              <h2>Add Video</h2>
              <span className="custom-close" onClick={handleClose}>&times;</span>
            </div>
            <div className="custom-modal-body">
              <form onSubmit={handleSubmit} className="custom-form">
                {/* Topic input */}
                <div className="form-group">
                  <label htmlFor="topic" className="form-label">Topic</label>
                  <input
                    className="form-input"
                    id="topic"
                    type="text"
                    name="topic"
                    placeholder="Enter topic"
                  />
                </div>

                {/* Video link input */}
                <div className="form-group">
                  <label htmlFor="videoLink" className="form-label">Video link</label>
                  <input
                    className="form-input"
                    id="videoLink"
                    type="text"
                    name="videoLink"
                    placeholder="Enter video link"
                  />
                </div>

                {/* Other form fields (if any) */}

                <button type="submit" className="custom-button">
                  Update
                </button>
              </form>
            </div>
            <div className="custom-modal-footer">
              <button onClick={handleClose} className="custom-button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UploadVideo;
