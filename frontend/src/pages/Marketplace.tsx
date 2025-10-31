import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Clock, RefreshCw, ArrowRightLeft, User } from 'lucide-react';
import axios from 'axios';

interface SwappableSlot {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
}

interface MySwappableSlot {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
}

const Marketplace = () => {
  const [swappableSlots, setSwappableSlots] = useState<SwappableSlot[]>([]);
  const [mySwappableSlots, setMySwappableSlots] = useState<MySwappableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<SwappableSlot | null>(null);
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);

  const fetchSwappableSlots = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/swappable-slots', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSwappableSlots(response.data.slots || []);
    } catch (error) {
      console.error('Error fetching swappable slots:', error);
    }
  };

  const fetchMySwappableSlots = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/events?status=SWAPPABLE', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMySwappableSlots(response.data.events || []);
    } catch (error) {
      console.error('Error fetching my swappable slots:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchSwappableSlots(), fetchMySwappableSlots()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSwapRequest = async (mySlotId: string, theirSlotId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/swap-request', {
        mySlotId,
        theirSlotId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsSwapDialogOpen(false);
      setSelectedSlot(null);
      // Refresh data
      await Promise.all([fetchSwappableSlots(), fetchMySwappableSlots()]);
    } catch (error) {
      console.error('Error sending swap request:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading available slots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-600 mt-2">Find and request time slot swaps with other users</p>
        </div>

        {/* Available Slots */}
        <div className="space-y-4">
          {swappableSlots.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ArrowRightLeft className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No swappable slots available</h3>
                <p className="text-gray-600">Check back later for new opportunities to swap time slots</p>
              </CardContent>
            </Card>
          ) : (
            swappableSlots.map((slot) => (
              <Card key={slot._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{slot.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(slot.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {slot.userId.name}
                        </span>
                      </CardDescription>
                      {slot.description && (
                        <p className="text-sm text-gray-600 mt-2">{slot.description}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      SWAPPABLE
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Dialog open={isSwapDialogOpen && selectedSlot?._id === slot._id} onOpenChange={(open) => {
                    setIsSwapDialogOpen(open);
                    if (!open) setSelectedSlot(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setSelectedSlot(slot)}
                        className="w-full sm:w-auto"
                        disabled={mySwappableSlots.length === 0}
                      >
                        {mySwappableSlots.length === 0 ? 'No Swappable Slots' : 'Request Swap'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Slot Swap</DialogTitle>
                        <DialogDescription>
                          Choose one of your swappable slots to offer in exchange for "{slot.title}"
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-2">They're offering:</h4>
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">{slot.title}</p>
                            <p>{formatDate(slot.date)} • {slot.startTime} - {slot.endTime}</p>
                            {slot.description && <p className="mt-1">{slot.description}</p>}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Your swappable slots:</h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {mySwappableSlots.map((mySlot) => (
                              <Card key={mySlot._id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">{mySlot.title}</p>
                                      <p className="text-sm text-gray-600">
                                        {formatDate(mySlot.date)} • {mySlot.startTime} - {mySlot.endTime}
                                      </p>
                                      {mySlot.description && (
                                        <p className="text-xs text-gray-500 mt-1">{mySlot.description}</p>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => handleSwapRequest(mySlot._id, slot._id)}
                                    >
                                      Offer This Slot
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {mySwappableSlots.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      You need to mark some of your events as "Swappable" in your dashboard to request swaps.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;