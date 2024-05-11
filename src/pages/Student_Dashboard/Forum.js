import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import "./Forum.css"
function Forum() {

    const [threads, setThreads] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');

    useEffect(() => {
        const fetchThreads = async () => {
            const threadRef = collection(db, 'threads');
            const threadSnapshot = await getDocs(threadRef);

            const threadsData = threadSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setThreads(threadsData);
        };

        fetchThreads();
    }, []);

    const handleQuestionChange = (e) => {
        setNewQuestion(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Add the new thread to Firestore
        await addDoc(collection(db, 'threads'), {
            question: newQuestion,
            comments: [],
            upvotes: 0
        });

        // Fetch the updated list of threads
        const threadRef = collection(db, 'threads');
        const threadSnapshot = await getDocs(threadRef);
        const threadsData = threadSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setThreads(threadsData);

        // Reset the new question input
        setNewQuestion('');
    };

    const handleAddComment = async (threadId, newComment) => {
        const threadDocRef = doc(db, 'threads', threadId);
        await updateDoc(threadDocRef, {
            comments: [...threads.find(thread => thread.id === threadId).comments, { text: newComment, upvotes: 0 }]
        });

        // Update the local state to reflect the new comment
        const updatedThreads = threads.map(thread =>
            thread.id === threadId
                ? { ...thread, comments: [...thread.comments, { text: newComment, upvotes: 0 }] }
                : thread
        );
        setThreads(updatedThreads);
    };

    const handleUpvoteComment = async (threadId, commentIndex) => {
        const threadDocRef = doc(db, 'threads', threadId);
        const thread = threads.find(thread => thread.id === threadId);
        const updatedComments = [...thread.comments];
        updatedComments[commentIndex] = { ...updatedComments[commentIndex], upvotes: updatedComments[commentIndex].upvotes + 1 };

        await updateDoc(threadDocRef, { comments: updatedComments });

        // Update the local state to reflect the upvoted comment
        const updatedThreads = threads.map(thread =>
            thread.id === threadId
                ? { ...thread, comments: updatedComments }
                : thread
        );
        setThreads(updatedThreads);
    };

    return (
      <div className="forum-container">
          <h1 className="forum-title">Forum</h1>
          {threads.map(thread => (
              <div className="thread" key={thread.id}>
                  <h2>{thread.question}</h2>
                  <p>Upvotes: {thread.upvotes}</p>
                  <ul className="comments">
                      {thread.comments && thread.comments.map((comment, index) => (
                          <li className="comment" key={index}>
                              <p className="comment-text">{comment.text} - Upvotes: {comment.upvotes}</p>
                              <div className="comment-actions">
                                  <button onClick={() => handleUpvoteComment(thread.id, index)}>Upvote</button>
                              </div>
                          </li>
                      ))}
                  </ul>
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const newComment = e.target.elements.comment.value;
                      if (newComment.trim() !== '') {
                          handleAddComment(thread.id, newComment);
                          e.target.elements.comment.value = '';
                      }
                  }}>
                      <input type="text" name="comment" placeholder="Add a comment" />
                      <button type="submit">Comment</button>
                  </form>
              </div>
          ))}
          <form onSubmit={handleSubmit}>
              <label>
                  Question:
                  <input type="text" value={newQuestion} onChange={handleQuestionChange} />
              </label>
              <button type="submit">Submit</button>
          </form>
      </div>
  );
}

export default Forum;