import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { TiHeartOutline } from 'react-icons/ti';
import { MdOutlineSearch } from 'react-icons/md';
import { BiSolidUpvote } from "react-icons/bi";

function Forum() {
    const [threads, setThreads] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showComments, setShowComments] = useState({});

    useEffect(() => {
        const fetchThreads = async () => {
            const threadRef = collection(db, 'threads');
            const threadSnapshot = await getDocs(threadRef);

            const threadsData = threadSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setThreads(threadsData.sort((a, b) => (b.upvotes - a.upvotes))); // Sort threads by upvotes
        };

        fetchThreads();
    }, []);

    const handleQuestionChange = (e) => {
        setNewQuestion(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        await addDoc(collection(db, 'threads'), {
            question: newQuestion,
            comments: [],
            upvotes: 0
        });

        const threadRef = collection(db, 'threads');
        const threadSnapshot = await getDocs(threadRef);
        const threadsData = threadSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setThreads(threadsData.sort((a, b) => (b.upvotes - a.upvotes))); // Sort threads by upvotes

        setNewQuestion('');
        setShowModal(false);
    };

    const handleAddComment = async (threadId, newComment) => {
        const threadDocRef = doc(db, 'threads', threadId);
        await updateDoc(threadDocRef, {
            comments: [...threads.find(thread => thread.id === threadId).comments, { text: newComment, upvotes: 0 }]
        });

        const updatedThreads = threads.map(thread =>
            thread.id === threadId
                ? { ...thread, comments: [...thread.comments, { text: newComment, upvotes: 0 }] }
                : thread
        );
        setThreads(updatedThreads.map(thread => ({ ...thread, comments: thread.comments.sort((a, b) => (b.upvotes - a.upvotes)) }))); // Sort comments by upvotes
    };

    const handleUpvote = async (type, id, index) => {
        const docRef = doc(db, 'threads', id);
        const thread = threads.find(thread => thread.id === id);

        if (type === 'thread') {
            const updatedUpvotes = thread.upvotes + 1;
            await updateDoc(docRef, { upvotes: updatedUpvotes });

            const updatedThreads = threads.map(thread =>
                thread.id === id
                    ? { ...thread, upvotes: updatedUpvotes }
                    : thread
            );
            setThreads(updatedThreads.sort((a, b) => (b.upvotes - a.upvotes))); // Sort threads by upvotes
        } else if (type === 'comment') {
            const updatedComments = [...thread.comments];
            updatedComments[index] = { ...updatedComments[index], upvotes: updatedComments[index].upvotes + 1 };

            await updateDoc(docRef, { comments: updatedComments });

            const updatedThreads = threads.map(thread =>
                thread.id === id
                    ? { ...thread, comments: updatedComments.sort((a, b) => (b.upvotes - a.upvotes)) }
                    : thread
            );
            setThreads(updatedThreads); // Comments already sorted within each thread
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const toggleComments = (id) => {
        setShowComments(prevState => ({ ...prevState, [id]: !prevState[id] }));
    };

    const filteredThreads = threads.filter(thread => thread.question.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="max-w-3xl mx-auto p-6 bg-blue-50 shadow-lg rounded-lg mt-10">
            <h1 className="text-3xl font-bold text-center mb-6">Discussion Forum</h1>
            <div className="mb-4 flex justify-end">
                <button
                    onClick={() => setShowModal(true)}
                    className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    type="button"
                >
                    Post a Question
                </button>
            </div>
            {showModal && (
                <div id="default-modal" tabIndex="-1" aria-hidden="true" className="fixed inset-0 z-50 flex items-center justify-center w-full p-4">
                    <div className="relative w-full max-w-2xl bg-white rounded-lg shadow">
                        <div className="flex items-center justify-between p-4 border-b rounded-t">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Post a question
                            </h3>
                            <button
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                                onClick={() => setShowModal(false)}
                            >
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        <div className="p-4">
                            <textarea
                                value={newQuestion}
                                onChange={handleQuestionChange}
                                placeholder="Ask a question..."
                                className="border border-blue-300 rounded-md p-2 mb-4 w-full"
                            />
                        </div>
                        <div className="flex items-center p-4 border-t border-gray-200 rounded-b">
                            <button
                                type="button"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                onClick={handleSubmit}
                            >
                                Post
                            </button>
                            <button
                                type="button"
                                className="py-2.5 px-5 ml-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search questions..."
                    className="border border-blue-300 rounded-md px-2 py-1 mr-2"
                />
                <MdOutlineSearch className="inline-block text-blue-500" />
            </div>
            {filteredThreads.map((thread, index) => (
                <div key={thread.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-100'} p-4 rounded-lg mb-8`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <AiOutlineQuestionCircle className="text-blue-500 mr-2" />
                            <h2 className="text-lg font-semibold">{thread.question}</h2>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Upvotes: {thread.upvotes}</p>
                            <button className="bg-blue-500 text-white px-2 py-1 rounded-md mt-2 flex items-center" onClick={() => handleUpvote('thread', thread.id)}>Upvote <BiSolidUpvote className="ml-1" />
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => toggleComments(thread.id)}
                        className="mt-2 text-blue-600 hover:underline"
                    >
                        {showComments[thread.id] ? 'Hide Comments' : 'Show Comments'}
                    </button>
                    {showComments[thread.id] && (
                        <div className="mt-4">
                            {thread.comments.map((comment, index) => (
                                <div key={index} className="border-t pt-2 mt-2">
                                    <div className="flex justify-between">
                                        <p>{comment.text}</p>
                                        <div>
                                            <p className="text-sm text-gray-600">Upvotes: {comment.upvotes}</p>
                                            <button className="bg-blue-500 text-white px-2 py-1 rounded-md mt-2 flex items-center" onClick={() => handleUpvote('comment', thread.id, index)}>Upvote <BiSolidUpvote className="ml-1" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const newComment = e.target.newComment.value;
                                    if (newComment.trim() !== '') {
                                        handleAddComment(thread.id, newComment);
                                        e.target.newComment.value = '';
                                    }
                                }}
                                className="mt-4"
                            >
                                <input
                                    type="text"
                                    name="newComment"
                                    placeholder="Add a comment..."
                                    className="border border-blue-300 rounded-md px-2 py-1 mr-2"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-2 py-1 rounded-md"
                                >
                                    Add Comment
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default Forum;
