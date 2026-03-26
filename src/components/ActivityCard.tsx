import { FaChevronRight } from "react-icons/fa";
import { CiClock2 } from "react-icons/ci";

export default function ActivityCard({ activity }: any) {

  // No activity at all
  if (!activity || !activity.time_in) {
    return (
      <div className="bg-card dark:border rounded-xl p-4 shadow-sm">
        <p className="text-gray-custom">No activity today</p>
      </div>
    );
  }

  const timeIn = new Date(activity.time_in).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  // Only format timeOut if it exists
  const timeOut = activity.time_out
    ? new Date(activity.time_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  const hours = activity.total_hrs || 0;

  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm">

      <div className="flex justify-between items-center mb-2">
        <p className="font-medium text-secondary">Today's Activity</p>
        <span><FaChevronRight /></span>
      </div>

      {/* Time In */}
      <div className="border-t mb-4 border-gray-300 pt-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-primary text-xl"><CiClock2 /></span>
          <p className="text-primary">{timeIn}</p>
        </div>
      </div>

      {/* Time Out */}
      {timeOut && (
        <div className="border-t border-gray-300 pt-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-primary text-xl"><CiClock2 /></span>
            <p className="text-primary">
              {timeOut} - Worked {hours} hrs
            </p>
          </div>
        </div>
      )}

    </div>
  );
}