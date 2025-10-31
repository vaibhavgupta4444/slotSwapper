import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, RefreshCw, CheckCircle, XCircle, ArrowRightLeft } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '@/contexts/SocketContext';

interface SwapRequest {
  _id: string;
  mySlotId: {
    _id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description?: string;
    status: string;
    userId: {
      _id: string;
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  theirSlotId: {
    _id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description?: string;
    status: string;
    userId: {
      _id: string;
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  requesterId: {
    _id: string;
    name: string;
    email: string;
  };
  recipientId: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const Requests = () => {
  const [allRequests, setAllRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  // Get current user ID from token or context
  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return null;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      return payload.userId || payload.id || payload._id;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  // Filter requests based on user's perspective
  const incomingRequests = allRequests.filter(req => req.recipientId._id === currentUserId);
  const outgoingRequests = allRequests.filter(req => req.requesterId._id === currentUserId);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/swap-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Raw response:', response.data);
      console.log('Current user ID:', currentUserId);
      
      const requests = response.data.requests || [];
      setAllRequests(requests);
      
      // Debug filtering
      const incoming = requests.filter((req: SwapRequest) => req.recipientId._id === currentUserId);
      const outgoing = requests.filter((req: SwapRequest) => req.requesterId._id === currentUserId);
      
      console.log('All requests:', requests);
      console.log('Incoming requests:', incoming);
      console.log('Outgoing requests:', outgoing);
      
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    
    // Listen for socket events to refresh requests
    if (socket) {
      const handleNewSwapRequest = () => {
        console.log('Received new swap request notification, refreshing...');
        fetchRequests();
      };
      
      const handleSwapResponse = () => {
        console.log('Received swap response notification, refreshing...');
        fetchRequests();
      };
      
      socket.on('new-swap-request', handleNewSwapRequest);
      socket.on('swap-response', handleSwapResponse);
      
      return () => {
        socket.off('new-swap-request', handleNewSwapRequest);
        socket.off('swap-response', handleSwapResponse);
      };
    }
  }, [socket]);

  const handleSwapResponse = async (requestId: string, accepted: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/swap-response/${requestId}`, {
        accepted
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh requests
      fetchRequests();
    } catch (error) {
      console.error('Error responding to swap request:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Swap Requests</h1>
          <p className="text-gray-600 mt-2">Manage incoming and outgoing slot swap requests</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Incoming Requests */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Incoming Requests ({incomingRequests.filter(req => req.status === 'PENDING').length})
            </h2>
            
            <div className="space-y-4">
              {incomingRequests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <ArrowRightLeft className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No incoming requests</p>
                  </CardContent>
                </Card>
              ) : (
                incomingRequests.map((request) => (
                  <Card key={request._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Swap Request from {request.requesterId.name}
                          </CardTitle>
                          <CardDescription>
                            Requested {formatDateTime(request.createdAt)}
                          </CardDescription>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* They want */}
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">They want your slot:</h4>
                          <div className="text-sm">
                            <p className="font-medium">{request.mySlotId.title}</p>
                            <p className="text-gray-600 flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(request.mySlotId.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {request.mySlotId.startTime} - {request.mySlotId.endTime}
                              </span>
                            </p>
                            {request.mySlotId.description && (
                              <p className="text-gray-600 mt-1">{request.mySlotId.description}</p>
                            )}
                          </div>
                        </div>

                        {/* They offer */}
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">They're offering:</h4>
                          <div className="text-sm">
                            <p className="font-medium">{request.theirSlotId.title}</p>
                            <p className="text-gray-600 flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(request.theirSlotId.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {request.theirSlotId.startTime} - {request.theirSlotId.endTime}
                              </span>
                            </p>
                            {request.theirSlotId.description && (
                              <p className="text-gray-600 mt-1">{request.theirSlotId.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        {request.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleSwapResponse(request._id, true)}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              onClick={() => handleSwapResponse(request._id, false)}
                              variant="outline"
                              className="flex-1 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Outgoing Requests */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Outgoing Requests ({outgoingRequests.filter(req => req.status === 'PENDING').length} pending)
            </h2>
            
            <div className="space-y-4">
              {outgoingRequests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <ArrowRightLeft className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No outgoing requests</p>
                  </CardContent>
                </Card>
              ) : (
                outgoingRequests.map((request) => (
                  <Card key={request._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Request to {request.recipientId.name}
                          </CardTitle>
                          <CardDescription>
                            Sent {formatDateTime(request.createdAt)}
                          </CardDescription>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* You offered */}
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">You offered:</h4>
                          <div className="text-sm">
                            <p className="font-medium">{request.theirSlotId.title}</p>
                            <p className="text-gray-600 flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(request.theirSlotId.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {request.theirSlotId.startTime} - {request.theirSlotId.endTime}
                              </span>
                            </p>
                            {request.theirSlotId.description && (
                              <p className="text-gray-600 mt-1">{request.theirSlotId.description}</p>
                            )}
                          </div>
                        </div>

                        {/* You want */}
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">For their slot:</h4>
                          <div className="text-sm">
                            <p className="font-medium">{request.mySlotId.title}</p>
                            <p className="text-gray-600 flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(request.mySlotId.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {request.mySlotId.startTime} - {request.mySlotId.endTime}
                              </span>
                            </p>
                            {request.mySlotId.description && (
                              <p className="text-gray-600 mt-1">{request.mySlotId.description}</p>
                            )}
                          </div>
                        </div>

                        {request.status === 'PENDING' && (
                          <p className="text-sm text-yellow-600 font-medium">
                            Waiting for {request.recipientId.name} to respond...
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Requests;