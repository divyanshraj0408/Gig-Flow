import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

function NotificationCenter() {
  const { notifications, removeNotification } = useSocket();
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    if (notification.gigId) {
      navigate(`/gigs/${notification.gigId}`);
    }
    removeNotification(notification.id);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.slice(0, 3).map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className={`
            cursor-pointer transform transition-all duration-300 animate-slide-in
            bg-white rounded-xl shadow-2xl border-l-4 p-4 hover:scale-105
            ${notification.type === 'hired' ? 'border-green-500' : 
              notification.type === 'new_bid' ? 'border-blue-500' : 
              'border-gray-400'}
          `}
        >
          <div className="flex items-start">
            {/* Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              notification.type === 'hired' ? 'bg-green-100' :
              notification.type === 'new_bid' ? 'bg-blue-100' :
              'bg-gray-100'
            }`}>
              {notification.type === 'hired' ? (
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : notification.type === 'new_bid' ? (
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="ml-3 flex-1">
              <p className={`text-sm font-semibold ${
                notification.type === 'hired' ? 'text-green-900' :
                notification.type === 'new_bid' ? 'text-blue-900' :
                'text-gray-900'
              }`}>
                {notification.type === 'hired' ? '🎉 Congratulations!' :
                 notification.type === 'new_bid' ? '📬 New Bid Received' :
                 '❌ Bid Not Selected'}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {notification.message}
              </p>
              {notification.bidAmount && (
                <p className="text-xs font-semibold text-indigo-600 mt-1">
                  Amount: ${notification.bidAmount.toLocaleString()}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NotificationCenter;