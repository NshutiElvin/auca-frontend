import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Table, MoreHorizontal, Bell, User } from 'lucide-react';

const BlockedBookings = () => {
  const [selectedDate, setSelectedDate] = useState('Tuesday 13 May 2025');
  const [viewMode, setViewMode] = useState('Calendar');

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '07:00 PM'
  ];

  const bookings = [
    { room: 101, guest: 'Patric McDonald', time: 'May 13, 10:28 AM', timeSlot: 1, duration: 1, type: 'blocked' },
    { room: 101, guest: 'Emma Tremblay', time: 'May 13, 05:28 PM', timeSlot: 8, duration: 1, type: 'blocked' },
    { room: 102, guest: 'Liam O\'Connor', time: 'May 13, 10:42 AM', timeSlot: 1, duration: 1, type: 'regular' },
    { room: 102, guest: 'Avery Chen', time: 'May 13, 12:00 PM', timeSlot: 4, duration: 1, type: 'regular' },
    { room: 102, guest: 'Noah Patel', time: 'May 13, 03:00 PM', timeSlot: 6, duration: 1, type: 'regular' },
    { room: 102, guest: 'Jackson Nguyen', time: 'May 13, 05:00 PM', timeSlot: 8, duration: 1, type: 'blocked' },
    { room: 103, guest: 'Maya Desjardins', time: 'May 13, 10:01 AM', timeSlot: 1, duration: 1, type: 'regular' },
    { room: 103, guest: 'Ethan K...', time: 'May 1...', timeSlot: 5, duration: 1, type: 'regular' },
    { room: 103, guest: 'Olivia Leblanc', time: 'May 13, 03:47 PM', timeSlot: 6, duration: 1, type: 'regular' },
    { room: 104, guest: 'Lucas Fontaine', time: 'May 13, 08:18 AM', timeSlot: 0, duration: 1, type: 'regular' },
    { room: 106, guest: 'Charlotte Singh', time: 'May 13, 09:33 AM', timeSlot: 1, duration: 1, type: 'regular' },
    { room: 106, guest: 'Benjamin Roy', time: 'May 13, 11:03 AM', timeSlot: 3, duration: 1, type: 'regular' },
    { room: 106, guest: 'Isla Morrison', time: 'May 13, 03:09 PM', timeSlot: 6, duration: 1, type: 'regular' },
    { room: 106, guest: 'Nathaniel Brooks', time: 'May 13, 05:09 PM', timeSlot: 8, duration: 1, type: 'regular' },
    { room: 107, guest: 'Zoe Ahmed', time: 'May 13, 12:01 PM', timeSlot: 4, duration: 1, type: 'regular' },
    { room: 107, guest: 'Connor...', time: 'May 1...', timeSlot: 6, duration: 1, type: 'regular' },
    { room: 107, guest: 'Amelia Laurent', time: 'May 13, 04:28 PM', timeSlot: 7, duration: 1, type: 'regular' },
    { room: 108, guest: 'Elijah Thibault', time: 'May 13, 11:00 AM', timeSlot: 3, duration: 1, type: 'regular' },
    { room: 108, guest: 'Chloe Park', time: 'May 13, 02:26 PM', timeSlot: 5, duration: 1, type: 'regular' },
    { room: 109, guest: 'Xavier Bouchard', time: 'May 13, 11:21 AM', timeSlot: 3, duration: 1, type: 'regular' },
    { room: 110, guest: 'Jasmine...', time: 'May 1...', timeSlot: 1, duration: 1, type: 'regular' },
    { room: 110, guest: 'Gabriel D\'Souza', time: 'May 13, 12:00 AM', timeSlot: 3, duration: 1, type: 'regular' },
    { room: 110, guest: 'Mackenzie Beaulieu', time: 'May 13, 04:01 PM', timeSlot: 7, duration: 1, type: 'regular' }
  ];

  const rooms = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110];

  const getBookingForSlot = (room: number, timeSlot: number) => {
    return bookings.find(b => b.room === room && b.timeSlot === timeSlot);
  };

  const BookingCard = ({ booking }: { booking: any }) => {
    const isBlocked = booking.type === 'blocked';
    
    return (
      <div className={`relative h-12 rounded-md p-2 text-xs ${
        isBlocked 
          ? 'bg-red-50 border border-red-200' 
          : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-center justify-between h-full">
          <div className="flex-1 min-w-0">
            <div className={`font-medium truncate ${
              isBlocked ? 'text-red-700' : 'text-gray-900'
            }`}>
              {booking.guest}
            </div>
            <div className={`text-xs truncate ${
              isBlocked ? 'text-red-600' : 'text-gray-500'
            }`}>
              {booking.time}
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </div>
        {isBlocked && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-10">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="font-semibold text-gray-900">Reminder</span>
          </div>
          
          <nav className="space-y-1">
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-600">
              <div className="w-5 h-5 rounded-full bg-gray-300"></div>
              <span>Dashboard</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-900 font-medium">
                <div className="w-5 h-5 rounded bg-gray-900"></div>
                <span>Bookings</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </div>
              
              <div className="ml-8 space-y-1">
                <div className="flex items-center space-x-3 px-3 py-2 text-gray-600">
                  <div className="w-4 h-4 rounded border border-gray-300"></div>
                  <span>Reservations</span>
                </div>
                <div className="flex items-center space-x-3 px-3 py-2 text-red-600 bg-red-50 rounded-md">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span>Blocked Bookings</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-600">
              <div className="w-5 h-5 rounded-full border border-gray-300"></div>
              <span>Property Management</span>
            </div>
            
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-600">
              <div className="w-5 h-5 rounded-full border border-gray-300"></div>
              <span>Payments & Pricing</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Blocked Bookings</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="w-5 h-5 text-gray-500" />
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Today</span>
                <span className="font-medium">{selectedDate}</span>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
                <option>Single Rooms</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('Calendar')}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
                    viewMode === 'Calendar' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Calendar</span>
                </button>
                <button
                  onClick={() => setViewMode('Table')}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
                    viewMode === 'Table' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span>Table</span>
                </button>
              </div>
              
              <div className="bg-red-500 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1">
                <span>6:32</span>
                <ChevronLeft className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Time Header */}
            <div className="flex border-b border-gray-200">
              <div className="w-16 p-3 bg-gray-50 font-medium text-sm text-gray-900 border-r border-gray-200">
                Rooms
              </div>
              {timeSlots.map((time, index) => (
                <div key={index} className="flex-1 p-3 bg-gray-50 text-center text-sm font-medium text-gray-900 border-r border-gray-200 last:border-r-0">
                  {time}
                </div>
              ))}
            </div>

            {/* Room Rows */}
            <div className="divide-y divide-gray-200">
              {rooms.map((room) => (
                <div key={room} className="flex">
                  <div className="w-16 p-3 bg-gray-50 flex items-center justify-center border-r border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-3 bg-gray-400 rounded-sm"></div>
                      <span className="text-sm font-medium text-gray-900">{room}</span>
                    </div>
                  </div>
                  {timeSlots.map((_, timeIndex) => {
                    const booking = getBookingForSlot(room, timeIndex);
                    return (
                      <div key={timeIndex} className="flex-1 p-2 border-r border-gray-200 last:border-r-0 min-h-[64px]">
                        {booking && <BookingCard booking={booking} />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockedBookings;