import React, { useMemo, useState } from 'react';
import {
  differenceInMinutes,
  format,
  isAfter,
  isBefore,
  isEqual,
  parse,
  startOfDay,
} from 'date-fns';
import {
  CalendarDays,
  Clock3,
  LayoutDashboard,
  Monitor,
  Pencil,
  Trash2,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react';

const USERS = [
  {
    id: 'u1',
    name: 'Alex Morgan',
    avatar: 'https://i.pravatar.cc/100?img=12',
  },
  {
    id: 'u2',
    name: 'Priya Shah',
    avatar: 'https://i.pravatar.cc/100?img=47',
  },
  {
    id: 'u3',
    name: 'Daniel Kim',
    avatar: 'https://i.pravatar.cc/100?img=32',
  },
  {
    id: 'u4',
    name: 'Maria Rossi',
    avatar: 'https://i.pravatar.cc/100?img=5',
  },
];

const CURRENT_USER_ID = 'u1';

const INITIAL_RESOURCES = [
  { id: 'd1', name: 'Desk 1', type: 'desk', x: 140, y: 165 },
  { id: 'd2', name: 'Desk 2', type: 'desk', x: 245, y: 165 },
  { id: 'd3', name: 'Desk 3', type: 'desk', x: 350, y: 165 },
  { id: 'd4', name: 'Desk 4', type: 'desk', x: 455, y: 165 },
  { id: 'd5', name: 'Desk 5', type: 'desk', x: 560, y: 165 },
  { id: 'r1', name: 'Room A', type: 'room', x: 225, y: 345 },
  { id: 'r2', name: 'Room B', type: 'room', x: 520, y: 345 },
];

const getToday = () => format(new Date(), 'yyyy-MM-dd');

const createDateTime = (dateString, timeString) =>
  parse(`${dateString} ${timeString}`, 'yyyy-MM-dd HH:mm', new Date());

const INITIAL_BOOKINGS = [
  {
    id: 'b1',
    userId: 'u2',
    resourceId: 'd1',
    start: createDateTime(getToday(), '08:00').toISOString(),
    end: createDateTime(getToday(), '18:00').toISOString(),
  },
  {
    id: 'b2',
    userId: 'u3',
    resourceId: 'd4',
    start: createDateTime(getToday(), '06:00').toISOString(),
    end: createDateTime(getToday(), '12:00').toISOString(),
  },
  {
    id: 'b3',
    userId: 'u1',
    resourceId: 'd5',
    start: createDateTime(getToday(), '13:00').toISOString(),
    end: createDateTime(getToday(), '18:00').toISOString(),
  },
  {
    id: 'b4',
    userId: 'u4',
    resourceId: 'r1',
    start: createDateTime(getToday(), '09:00').toISOString(),
    end: createDateTime(getToday(), '10:30').toISOString(),
  },
  {
    id: 'b5',
    userId: 'u2',
    resourceId: 'r1',
    start: createDateTime(getToday(), '11:00').toISOString(),
    end: createDateTime(getToday(), '12:00').toISOString(),
  },
  {
    id: 'b6',
    userId: 'u3',
    resourceId: 'r2',
    start: createDateTime(getToday(), '14:00').toISOString(),
    end: createDateTime(getToday(), '15:30').toISOString(),
  },
];

const deskSlotOptions = [
  { label: 'Half-day Morning', value: 'morning', start: '06:00', end: '12:00' },
  { label: 'Half-day Afternoon', value: 'afternoon', start: '13:00', end: '18:00' },
  { label: 'Full-day', value: 'fullday', start: '08:00', end: '18:00' },
];

const WORKDAY_START = '06:00';
const WORKDAY_END = '18:00';
const WORKDAY_MINUTES = 12 * 60;

const getUserById = (id) => USERS.find((u) => u.id === id);

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

const FloorplanBase = ({ floorplanUrl }) => {
  if (floorplanUrl) {
    return (
      <img
        src={floorplanUrl}
        alt="Uploaded floorplan"
        className="h-full w-full rounded-2xl object-cover opacity-85"
      />
    );
  }

  return (
    <svg viewBox="0 0 800 480" className="h-full w-full rounded-2xl bg-slate-900/60" aria-label="Office floorplan">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#bgGrad)" />
      <rect x="40" y="40" width="720" height="400" rx="20" fill="none" stroke="#475569" strokeWidth="6" />
      <rect x="80" y="85" width="640" height="170" rx="12" fill="#1d4ed833" stroke="#3b82f6" strokeWidth="2" />
      <text x="100" y="112" fill="#93c5fd" fontSize="16" fontWeight="700">
        Open Workspace
      </text>
      <rect x="80" y="290" width="280" height="120" rx="12" fill="#10b9812a" stroke="#10b981" strokeWidth="2" />
      <text x="100" y="316" fill="#6ee7b7" fontSize="16" fontWeight="700">
        Meeting Area A
      </text>
      <rect x="440" y="290" width="280" height="120" rx="12" fill="#f59e0b22" stroke="#f59e0b" strokeWidth="2" />
      <text x="460" y="316" fill="#fcd34d" fontSize="16" fontWeight="700">
        Meeting Area B
      </text>
      <line x1="400" y1="70" x2="400" y2="420" stroke="#475569" strokeWidth="4" strokeDasharray="8 8" />
    </svg>
  );
};

const ResourceBadge = ({ resource, percentBooked, onClick, avatar }) => {
  const color = percentBooked === 0 ? '#22c55e' : percentBooked >= 95 ? '#ef4444' : '#f59e0b';
  const rotation = `${Math.min(percentBooked, 100) * 3.6}deg`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105"
      style={{ left: resource.x, top: resource.y }}
      title={resource.name}
    >
      <div
        className="relative flex h-16 w-16 items-center justify-center rounded-full p-[3px] shadow-lg"
        style={{ background: `conic-gradient(${color} ${rotation}, #1e293b ${rotation})` }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900/95 ring-1 ring-white/20">
          {resource.type === 'desk' ? <Monitor size={20} className="text-cyan-300" /> : <Users size={20} className="text-violet-300" />}
        </div>
      </div>
      <span className="mt-1 block rounded-md bg-slate-900/80 px-2 py-0.5 text-xs text-slate-100 ring-1 ring-white/10">{resource.name}</span>
      {avatar && (
        <img
          src={avatar}
          alt="Booked user"
          className="absolute -right-1 -top-1 h-6 w-6 rounded-full border-2 border-white object-cover"
        />
      )}
    </button>
  );
};

const BookingModal = ({ resource, bookings, selectedDate, bookingToEdit, onClose, onSave, currentUserName }) => {
  const [deskSlot, setDeskSlot] = useState('morning');
  const [roomStart, setRoomStart] = useState('10:00');
  const [roomEnd, setRoomEnd] = useState('11:30');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (bookingToEdit) {
      const start = format(new Date(bookingToEdit.start), 'HH:mm');
      const end = format(new Date(bookingToEdit.end), 'HH:mm');
      if (resource.type === 'desk') {
        const match = deskSlotOptions.find((slot) => slot.start === start && slot.end === end);
        setDeskSlot(match?.value || 'fullday');
      } else {
        setRoomStart(start);
        setRoomEnd(end);
      }
    }
  }, [bookingToEdit, resource.type]);

  const timeline = useMemo(() => {
    if (resource.type !== 'room') return [];
    return bookings
      .map((b) => ({ ...b, user: getUserById(b.userId) }))
      .sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [bookings, resource.type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (resource.type === 'desk') {
      const slot = deskSlotOptions.find((s) => s.value === deskSlot);
      onSave({ start: slot.start, end: slot.end, bookingId: bookingToEdit?.id });
      return;
    }

    const startDate = createDateTime(selectedDate, roomStart);
    const endDate = createDateTime(selectedDate, roomEnd);
    if (!isBefore(startDate, endDate)) {
      setError('End time must be later than start time.');
      return;
    }

    onSave({ start: roomStart, end: roomEnd, bookingId: bookingToEdit?.id });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-6 text-slate-100 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">Book {resource.name}</h3>
            <p className="text-sm text-slate-300">Booking as {currentUserName}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm">Date</label>
            <input type="date" value={selectedDate} readOnly className="w-full rounded-md border border-white/20 bg-slate-900/70 px-3 py-2" />
          </div>

          {resource.type === 'desk' ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-300">Choose desk slot</p>
              {deskSlotOptions.map((slot) => (
                <label key={slot.value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/15 bg-slate-900/50 p-3 hover:bg-slate-800/70">
                  <input
                    type="radio"
                    checked={deskSlot === slot.value}
                    onChange={() => setDeskSlot(slot.value)}
                    className="accent-cyan-400"
                  />
                  <span>
                    {slot.label} ({slot.start} - {slot.end})
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-1 block text-sm">Start time</span>
                  <input
                    type="time"
                    step="1800"
                    value={roomStart}
                    onChange={(e) => setRoomStart(e.target.value)}
                    className="w-full rounded-md border border-white/20 bg-slate-900/70 px-3 py-2"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-sm">End time</span>
                  <input
                    type="time"
                    step="1800"
                    value={roomEnd}
                    onChange={(e) => setRoomEnd(e.target.value)}
                    className="w-full rounded-md border border-white/20 bg-slate-900/70 px-3 py-2"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-white/20 bg-slate-900/50 p-3">
                <h4 className="mb-2 text-sm font-semibold">Daily room schedule</h4>
                <div className="space-y-2">
                  {timeline.length === 0 && <p className="text-sm text-slate-300">No bookings yet.</p>}
                  {timeline.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between rounded-md bg-slate-800/80 px-3 py-2 text-sm">
                      <span>
                        {format(new Date(booking.start), 'HH:mm')} - {format(new Date(booking.end), 'HH:mm')}
                      </span>
                      <span className="text-cyan-300">{booking.user?.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-rose-300">{error}</p>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md border border-white/20 px-4 py-2 hover:bg-white/10">
              Cancel
            </button>
            <button type="submit" className="rounded-md bg-cyan-500 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-400">
              {bookingToEdit ? 'Update booking' : 'Save booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [mode, setMode] = useState('user');
  const [view, setView] = useState('floorplan');
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedTime, setSelectedTime] = useState(format(new Date(), 'HH:mm'));
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [modalState, setModalState] = useState(null);
  const [floorplanUrl, setFloorplanUrl] = useState('');
  const [adminEditor, setAdminEditor] = useState(null);
  const [feedback, setFeedback] = useState('');

  const currentUser = USERS.find((u) => u.id === CURRENT_USER_ID);

  const dateBookings = useMemo(
    () => bookings.filter((b) => format(new Date(b.start), 'yyyy-MM-dd') === selectedDate),
    [bookings, selectedDate],
  );

  const getResourceBookings = (resourceId) => dateBookings.filter((b) => b.resourceId === resourceId);

  const getBookedPercent = (resourceId) => {
    const startWindow = createDateTime(selectedDate, WORKDAY_START);
    const endWindow = createDateTime(selectedDate, WORKDAY_END);
    const total = getResourceBookings(resourceId).reduce((acc, booking) => {
      const start = new Date(booking.start);
      const end = new Date(booking.end);
      const insideStart = isAfter(start, startWindow) ? start : startWindow;
      const insideEnd = isBefore(end, endWindow) ? end : endWindow;
      const mins = Math.max(0, differenceInMinutes(insideEnd, insideStart));
      return acc + mins;
    }, 0);
    return (Math.min(total, WORKDAY_MINUTES) / WORKDAY_MINUTES) * 100;
  };

  const getDeskAvatar = (resourceId) => {
    const check = createDateTime(selectedDate, selectedTime);
    const booking = getResourceBookings(resourceId).find((b) => {
      const start = new Date(b.start);
      const end = new Date(b.end);
      return (isBefore(start, check) || isEqual(start, check)) && isAfter(end, check);
    });
    return booking ? getUserById(booking.userId)?.avatar : null;
  };

  const validateAndSaveBooking = ({ resource, start, end, bookingId }) => {
    const startDate = createDateTime(selectedDate, start);
    const endDate = createDateTime(selectedDate, end);

    const conflictingResourceBooking = bookings.find((b) => {
      if (b.resourceId !== resource.id || b.id === bookingId) return false;
      return overlaps(startDate, endDate, new Date(b.start), new Date(b.end));
    });

    if (conflictingResourceBooking) {
      setFeedback('Time overlaps with an existing booking on this resource.');
      return;
    }

    if (resource.type === 'desk') {
      const conflictingUserDesk = bookings.find((b) => {
        if (b.id === bookingId || b.userId !== CURRENT_USER_ID) return false;
        const targetResource = resources.find((r) => r.id === b.resourceId);
        if (targetResource?.type !== 'desk') return false;
        return overlaps(startDate, endDate, new Date(b.start), new Date(b.end));
      });

      if (conflictingUserDesk) {
        setFeedback('You can only have one desk booking at a time.');
        return;
      }
    }

    if (bookingId) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, start: startDate.toISOString(), end: endDate.toISOString() } : b)),
      );
      setFeedback('Booking updated.');
    } else {
      const newBooking = {
        id: `b${Date.now()}`,
        userId: CURRENT_USER_ID,
        resourceId: resource.id,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      };
      setBookings((prev) => [...prev, newBooking]);
      setFeedback('Booking created.');
    }

    setModalState(null);
  };

  const openResourceBooking = (resourceId, bookingId = null) => {
    setModalState({ resourceId, bookingId });
  };

  const onMapClickForAdmin = (e) => {
    if (mode !== 'admin') return;
    if (e.target.closest('[data-resource-marker="true"]')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 480;

    const newResource = {
      id: `res${Date.now()}`,
      name: `New Desk ${resources.length + 1}`,
      type: 'desk',
      x: Math.round(x),
      y: Math.round(y),
    };

    setResources((prev) => [...prev, newResource]);
    setAdminEditor(newResource);
  };

  const selectedResource = modalState ? resources.find((r) => r.id === modalState.resourceId) : null;
  const bookingToEdit = modalState?.bookingId ? bookings.find((b) => b.id === modalState.bookingId) : null;

  const myBookings = useMemo(() => {
    const now = startOfDay(new Date());
    return bookings
      .filter((b) => b.userId === CURRENT_USER_ID && isAfter(new Date(b.end), now))
      .sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [bookings]);

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-xl backdrop-blur md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Desk & Room Booking MVP</h1>
              <p className="text-sm text-slate-300">Interactive office floorplan + smart booking rules</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/70 p-1">
              <button
                type="button"
                onClick={() => setMode('user')}
                className={`rounded-lg px-3 py-2 text-sm ${mode === 'user' ? 'bg-cyan-500 text-slate-950' : 'hover:bg-white/10'}`}
              >
                <User className="mr-1 inline" size={14} /> User Mode
              </button>
              <button
                type="button"
                onClick={() => setMode('admin')}
                className={`rounded-lg px-3 py-2 text-sm ${mode === 'admin' ? 'bg-violet-500 text-white' : 'hover:bg-white/10'}`}
              >
                <LayoutDashboard className="mr-1 inline" size={14} /> Admin Mode
              </button>
            </div>
          </div>
        </header>

        <nav className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setView('floorplan')}
            className={`rounded-lg px-4 py-2 ${view === 'floorplan' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            Floorplan View
          </button>
          <button
            type="button"
            onClick={() => setView('mybookings')}
            className={`rounded-lg px-4 py-2 ${view === 'mybookings' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            My Bookings
          </button>
        </nav>

        {feedback && <div className="rounded-xl border border-cyan-300/30 bg-cyan-500/20 px-4 py-3 text-sm">{feedback}</div>}

        {view === 'floorplan' ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-3 shadow-xl">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <label className="text-sm">
                  <CalendarDays className="mr-1 inline" size={15} />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="ml-2 rounded-md border border-white/15 bg-slate-800 px-2 py-1"
                  />
                </label>
                <label className="text-sm">
                  <Clock3 className="mr-1 inline" size={15} />
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="ml-2 rounded-md border border-white/15 bg-slate-800 px-2 py-1"
                  />
                </label>
                {mode === 'admin' && (
                  <label className="cursor-pointer rounded-md border border-white/15 bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">
                    <Upload className="mr-1 inline" size={15} /> Upload Floorplan
                    <input
                      type="file"
                      accept="image/*,.svg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFloorplanUrl(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                )}
              </div>

              <div
                className="relative aspect-[5/3] w-full overflow-hidden rounded-2xl border border-white/10"
                onClick={onMapClickForAdmin}
              >
                <FloorplanBase floorplanUrl={floorplanUrl} />
                {resources.map((resource) => (
                  <div key={resource.id} data-resource-marker="true">
                    <ResourceBadge
                      resource={resource}
                      percentBooked={getBookedPercent(resource.id)}
                      avatar={resource.type === 'desk' ? getDeskAvatar(resource.id) : null}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (mode === 'admin') {
                          setAdminEditor(resource);
                        } else {
                          openResourceBooking(resource.id);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>

              {mode === 'admin' && <p className="mt-3 text-sm text-slate-300">Admin tip: Click empty space on map to add resources instantly.</p>}
            </section>

            <aside className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-xl">
              <h3 className="mb-3 text-lg font-semibold">Legend</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><span className="mr-2 inline-block h-3 w-3 rounded-full bg-green-500" />Free</li>
                <li><span className="mr-2 inline-block h-3 w-3 rounded-full bg-amber-500" />Partially booked</li>
                <li><span className="mr-2 inline-block h-3 w-3 rounded-full bg-red-500" />Fully booked</li>
              </ul>
              <div className="mt-4 rounded-xl bg-slate-800/80 p-3 text-sm text-slate-300">
                Circular ring shows booked % for 06:00 - 18:00.
              </div>
            </aside>
          </div>
        ) : (
          <section className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-xl">
            <h2 className="text-xl font-semibold">My Upcoming Bookings</h2>
            {myBookings.length === 0 && <p className="text-slate-300">No upcoming bookings.</p>}
            {myBookings.map((booking) => {
              const resource = resources.find((r) => r.id === booking.resourceId);
              return (
                <div key={booking.id} className="rounded-xl border border-white/15 bg-slate-800/80 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{resource?.name} ({resource?.type})</p>
                      <p className="text-sm text-slate-300">
                        {format(new Date(booking.start), 'EEE, MMM d')} · {format(new Date(booking.start), 'HH:mm')} - {format(new Date(booking.end), 'HH:mm')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDate(format(new Date(booking.start), 'yyyy-MM-dd'));
                          openResourceBooking(booking.resourceId, booking.id);
                        }}
                        className="rounded-md border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
                      >
                        <Pencil className="mr-1 inline" size={14} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookings((prev) => prev.filter((b) => b.id !== booking.id))}
                        className="rounded-md border border-rose-300/40 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/20"
                      >
                        <Trash2 className="mr-1 inline" size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {adminEditor && mode === 'admin' && (
          <div className="fixed bottom-4 right-4 z-30 w-full max-w-sm rounded-2xl border border-white/20 bg-slate-900/90 p-4 shadow-2xl backdrop-blur">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">Manage Resource</h3>
              <button type="button" onClick={() => setAdminEditor(null)} className="rounded p-1 hover:bg-white/10">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-sm">
                Name
                <input
                  value={adminEditor.name}
                  onChange={(e) => setAdminEditor((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-white/20 bg-slate-800 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                Type
                <select
                  value={adminEditor.type}
                  onChange={(e) => setAdminEditor((prev) => ({ ...prev, type: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-white/20 bg-slate-800 px-3 py-2"
                >
                  <option value="desk">Desk</option>
                  <option value="room">Room</option>
                </select>
              </label>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResources((prev) => prev.map((r) => (r.id === adminEditor.id ? adminEditor : r)));
                    setAdminEditor(null);
                  }}
                  className="flex-1 rounded-md bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResources((prev) => prev.filter((r) => r.id !== adminEditor.id));
                    setBookings((prev) => prev.filter((b) => b.resourceId !== adminEditor.id));
                    setAdminEditor(null);
                  }}
                  className="rounded-md border border-rose-300/50 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedResource && mode === 'user' && (
          <BookingModal
            resource={selectedResource}
            bookings={getResourceBookings(selectedResource.id)}
            selectedDate={selectedDate}
            bookingToEdit={bookingToEdit}
            currentUserName={currentUser.name}
            onClose={() => setModalState(null)}
            onSave={({ start, end, bookingId }) => validateAndSaveBooking({ resource: selectedResource, start, end, bookingId })}
          />
        )}
      </div>
    </div>
  );
}
