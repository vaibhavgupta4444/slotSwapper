import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, ArrowRightLeft } from "lucide-react";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Swap Your Time Slots
            <span className="text-indigo-600"> Effortlessly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A peer-to-peer scheduling platform where you can swap your busy time slots with others. 
            Perfect for when you need flexibility in your calendar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/signup">Get Started Free</a>
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How SlotSwapper Works</h2>
          <p className="text-lg text-gray-600">Simple, secure, and efficient time slot management</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Calendar className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Mark Swappable Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Mark any busy time slot in your calendar as "swappable" when you need flexibility.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Browse Available Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                See what slots other users are willing to swap and find the perfect match for your schedule.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <ArrowRightLeft className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Request a Swap</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Send swap requests offering one of your swappable slots in exchange for theirs.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Accept & Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Once accepted, calendars are automatically updated for both users instantly.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Example Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">See It In Action</h2>
            <p className="text-lg text-gray-600">Here's how a typical swap works</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User A</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-red-800">Team Meeting</h4>
                  <p className="text-red-600">Tuesday, 10:00-11:00 AM</p>
                  <span className="inline-block bg-red-200 text-red-800 text-xs px-2 py-1 rounded mt-2">
                    Swappable
                  </span>
                </div>
                <p className="text-sm text-gray-600">Wants to swap this slot for a different time</p>
              </CardContent>
            </Card>

            <div className="text-center">
              <ArrowRightLeft className="h-12 w-12 text-indigo-600 mx-auto" />
              <p className="text-sm text-gray-600 mt-2">Swap Request</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User B</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-blue-800">Focus Block</h4>
                  <p className="text-blue-600">Wednesday, 2:00-3:00 PM</p>
                  <span className="inline-block bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded mt-2">
                    Swappable
                  </span>
                </div>
                <p className="text-sm text-gray-600">Available for swapping</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Schedule?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of users who are already swapping their way to better time management.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href="/signup">Start Swapping Today</a>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <ArrowRightLeft className="h-6 w-6 text-indigo-400" />
              <span className="ml-2 text-lg font-bold text-white">SlotSwapper</span>
            </div>
            <p className="text-gray-400">© 2025 SlotSwapper. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;