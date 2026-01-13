import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGigById } from '../store/slices/gigSlice';
import { submitBid, fetchBidsForGig, hireFreelancer, clearSuccess } from '../store/slices/bidSlice';

function GigDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentGig } = useSelector((state) => state.gigs);
  const { bids, isLoading, successMessage } = useSelector((state) => state.bids);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [showBidForm, setShowBidForm] = useState(false);
  const [bidData, setBidData] = useState({
    message: '',
    price: ''
  });

  const isOwner = user?._id === currentGig?.ownerId?._id;

  useEffect(() => {
    dispatch(fetchGigById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (isOwner && currentGig) {
      dispatch(fetchBidsForGig(id));
    }
  }, [dispatch, id, isOwner, currentGig]);

  useEffect(() => {
    if (successMessage) {
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-slide-in';
      notification.innerHTML = `
        <div class="flex items-center">
          <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span class="font-semibold">${successMessage}</span>
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
      dispatch(clearSuccess());
      setShowBidForm(false);
      setBidData({ message: '', price: '' });
      dispatch(fetchGigById(id));
      if (isOwner) {
        dispatch(fetchBidsForGig(id));
      }
    }
  }, [successMessage, dispatch, id, isOwner]);

  const handleBidSubmit = (e) => {
    e.preventDefault();
    dispatch(submitBid({
      gigId: id,
      message: bidData.message,
      price: Number(bidData.price)
    }));
  };

  const handleHire = (bidId) => {
    if (window.confirm('Are you sure you want to hire this freelancer? This will close the gig and reject all other bids.')) {
      dispatch(hireFreelancer(bidId));
    }
  };

  if (!currentGig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading gig details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Gig Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 text-white">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    currentGig.status === 'open' 
                      ? 'bg-green-400 text-green-900' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {currentGig.status === 'open' ? '✓ Open for Bids' : '✓ Position Filled'}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  {currentGig.title}
                </h1>
                <div className="flex items-center text-indigo-100">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Posted by {currentGig.ownerId?.name || 'Unknown'}</span>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center min-w-[200px]">
                <div className="text-sm text-indigo-100 mb-1">Project Budget</div>
                <div className="text-4xl font-bold">${currentGig.budget.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Project Description
              </h3>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{currentGig.description}</p>
              </div>
            </div>

            {/* Action Buttons for Non-Owners */}
            {!isOwner && isAuthenticated && currentGig.status === 'open' && (
              <div className="border-t border-gray-200 pt-6">
                {!showBidForm ? (
                  <button
                    onClick={() => setShowBidForm(true)}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                  >
                    <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Submit Your Bid
                  </button>
                ) : (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <svg className="w-7 h-7 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Submit Your Proposal
                    </h3>
                    <form onSubmit={handleBidSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Your Proposal *
                        </label>
                        <textarea
                          required
                          value={bidData.message}
                          onChange={(e) => setBidData({ ...bidData, message: e.target.value })}
                          rows="5"
                          placeholder="Explain why you're the perfect fit for this project:
• Your relevant experience
• Proposed approach and timeline
• Why you're interested in this project"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Your Bid Amount (USD) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">$</span>
                          <input
                            type="number"
                            required
                            min="0"
                            value={bidData.price}
                            onChange={(e) => setBidData({ ...bidData, price: e.target.value })}
                            placeholder="Enter your competitive price"
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 text-lg font-semibold"
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Project budget: ${currentGig.budget.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {isLoading ? 'Submitting...' : 'Submit Bid'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBidForm(false)}
                          className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bids Section for Owner */}
        {isOwner && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <svg className="w-7 h-7 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Received Bids
              </h2>
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                {bids.length} {bids.length === 1 ? 'Bid' : 'Bids'}
              </span>
            </div>

            {bids.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No bids yet</h3>
                <p className="text-gray-600">Freelancers will start bidding on your project soon</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bids.map((bid) => (
                  <div
                    key={bid._id}
                    className={`border-2 rounded-xl p-6 transition-all ${
                      bid.status === 'hired' 
                        ? 'bg-green-50 border-green-300 shadow-lg' 
                        : bid.status === 'rejected'
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {bid.freelancerId?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{bid.freelancerId?.name}</h3>
                          <p className="text-sm text-gray-500">{bid.freelancerId?.email}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Submitted {new Date(bid.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <div className="text-3xl font-bold text-indigo-600 mb-1">
                          ${bid.price.toLocaleString()}
                        </div>
                        <span className={`inline-block px-4 py-1 rounded-full text-xs font-semibold ${
                          bid.status === 'hired'
                            ? 'bg-green-200 text-green-800'
                            : bid.status === 'rejected'
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {bid.status === 'hired' ? '✓ Hired' : bid.status === 'rejected' ? '✗ Rejected' : '⏱ Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/50 rounded-lg p-4 mb-4 border border-gray-200">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{bid.message}</p>
                    </div>

                    {bid.status === 'pending' && currentGig.status === 'open' && (
                      <button
                        onClick={() => handleHire(bid._id)}
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {isLoading ? 'Processing...' : 'Hire This Freelancer'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GigDetails;