import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { io } from 'socket.io-client';

async function createIO() {
  try {
    const X_USER_ID = 'X-User-Id';

    const response = await fetch('/api/id/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}.`);
    }

    const { id } = await response.json();

    sessionStorage.setItem(X_USER_ID, id);

    const socket = io('', {
      // THE PATH MUST BE EXACTLY /api/socket-io/
      // THIS DOES NOT WORK /api/socket-io
      path: '/api/socket-io/',
      extraHeaders: {
        [X_USER_ID]: id,
      },
    });

    window.dispatchEvent(
      new CustomEvent('socketIOReady', { detail: { socket } }),
    );
  } catch (error) {
    window.dispatchEvent(
      new CustomEvent('socketIOError', { detail: { error } }),
    );
  }
}

// Call outside of react tree to avoid creating multiple connections.
createIO();

function useSocket() {
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    function onSocketIOReady(event) {
      setSocket(event.detail.socket);
    }

    window.addEventListener('socketIOReady', onSocketIOReady);

    return () => {
      window.removeEventListener('socketIOReady', onSocketIOReady);
    };
  }, []);

  useEffect(() => {
    function onSocketIOError(event) {
      setError(event.detail.error);
    }
    window.addEventListener('socketIOError', onSocketIOError);
    return () => {
      window.removeEventListener('socketIOError', onSocketIOError);
    };
  }, []);

  return { socket, error };
}

const App = () => {
  const { socket, error } = useSocket();
  const [isConnected, setIsConnected] = useState(false);
  const [fooEvents, setFooEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sentString, setSentString] = useState(null);
  const [receivedString, setReceivedString] = useState({
    value: '',
    'x-user-id': '',
  });

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value) {
      setFooEvents((previous) => [...previous, value]);
    }

    function onNotification(value) {
      setNotifications((previous) => [...previous, value]);
    }
    function onSendToBackend(value) {
      setReceivedString(value);
    }

    if (socket) {
      socket.on('notification', onNotification);
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('foo', onFooEvent);
      socket.on('sendToFrontend', onSendToBackend);
    }

    return () => {
      if (socket) {
        socket.off('notification', onNotification);
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('foo', onFooEvent);
        socket.off('sendToFrontend', onSendToBacked);
      }
    };
  }, [socket]);

  function createStatus() {
    if (!socket && !error) {
      return 'Creating socket...';
    } else {
      if (socket) {
        return isConnected ? 'Connected' : 'Disconnected';
      }
      if (error) {
        return 'Failed to create socket. ' + error.message;
      }
      return 'Something went horribly wrong...';
    }
  }

  return (
    <div>
      <h1>SocketIO demo</h1>
      <p>{createStatus()}</p>
      {receivedString['x-user-id'] && (
        <div>x-user-id={receivedString['x-user-id']}</div>
      )}
      <button
        onClick={() => {
          function createRandomString() {
            return Array.from(crypto.getRandomValues(new Uint8Array(8)))
              .map((b) => b.toString(16).padStart(2, '0'))
              .join('');
          }
          const randomString = createRandomString();
          setSentString(randomString);
          socket.emit('sendToBackend', randomString);
        }}
      >
        <div>
          {sentString === null
            ? 'Click to send to backend'
            : `Sent to backend '${sentString}', received from backend '${receivedString.value}'`}
        </div>
      </button>
      <p>Notifications</p>
      <ul>
        {notifications.map((notification) => {
          return <li key={notification.id}>{notification.value}</li>;
        })}
      </ul>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
