import { FaChevronRight } from "react-icons/fa";
import { CiClock2 } from "react-icons/ci";

export default function ActivityCard({ activity }: any) {

  if (!activity) {
    return (
      <div className="bg-surface rounded-xl p-4 shadow-sm">
        <p className="text-gray-custom">No activity today</p>
      </div>
    );
  }

  const timeIn = new Date(activity.time_in).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
  const timeOut = new Date(activity.time_out).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  const hours = activity.total_hrs;

  return (
    <div className="bg-surface rounded-xl p-4 shadow-sm">

      <div className="flex justify-between items-center mb-2">
        <p className="font-medium text-secondary">
          Today's Activity
        </p>
        <span><FaChevronRight /></span>
      </div>

      <div className="border-t mb-4 border-gray-300 pt-4 text-sm">

        <div className="flex items-center gap-2">
          <span className="text-primary text-xl"><CiClock2 /></span>

          <p className="text-primary">
            {timeIn} 
          </p>

        </div>

      </div>
      <div className="border-t border-gray-300 pt-4 text-sm">

        <div className="flex items-center gap-2">
          <span className="text-primary text-xl"><CiClock2 /></span>
          <p className="text-primary">
            {timeOut} - Worked {hours}hrs
          </p>

        </div>

      </div>
    </div>
  );
}