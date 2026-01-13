import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchGigs } from '../store/slices/gigSlice';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { gigs, isLoading } = useSelector((state) => state.gigs);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchGigs());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchGigs({ search: searchTerm }));
  };

  const clearSearch = () => {
    setSearchTerm('');
    dispatch(fetchGigs());
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
         <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Find Your Next Opportunity
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Connect with top clients and freelancers. Post projects or bid on exciting opportunities.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-xl p-2 shadow-2xl">
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for gigs, skills, or projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg transition-all"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
              >
                Search
              </button>
            </div>
          </form>

          {/* CTA for non-authenticated users */}
          {!isAuthenticated && (
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 shadow-lg transition-all"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{gigs.length}</div>
            <div className="text-gray-600 mt-1">Active Gigs</div>
          </div>
          <div className="text-center border-l border-r border-gray-200">
            <div className="text-3xl font-bold text-purple-600">
              {gigs.filter(g => g.status === 'open').length}
            </div>
            <div className="text-gray-600 mt-1">Open Opportunities</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {gigs.filter(g => g.status === 'assigned').length}
            </div>
            <div className="text-gray-600 mt-1">Completed Hires</div>
          </div>
        </div>
      </div>

      {/* Gigs Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Available Gigs</h2>
            <p className="text-gray-600 mt-1">
              {searchTerm ? `Results for "${searchTerm}"` : 'Browse all open opportunities'}
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => navigate('/create-gig')}
              className="hidden md:flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post a Gig
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading amazing opportunities...</p>
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">No gigs found</h3>
            <p className="mt-2 text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'Be the first to post a gig!'}
            </p>
            {isAuthenticated && (
              <button
                onClick={() => navigate('/create-gig')}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all"
              >
                Post Your First Gig
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <div
                key={gig._id}
                onClick={() => navigate(`/gigs/${gig._id}`)}
                className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-indigo-200 group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {gig.title}
                      </h3>
                    </div>
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${gig.status === 'open'
                      ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                      : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
                      }`}>
                      {gig.status === 'open' ? '✓ Open' : 'Assigned'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3 min-h-[60px]">
                    {gig.description}
                  </p>

                  {/* Footer */}
                  <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Budget</div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ${gig.budget.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-gray-500 mb-1">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs">Posted by</span>
                      </div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {gig.ownerId?.name || 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Bar */}
                <div className="h-1 bg-gradient-to-r from-indigo-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Post Button */}
        {isAuthenticated && (
          <button
            onClick={() => navigate('/create-gig')}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default Home;