import { IoChevronBack } from "react-icons/io5";
import Header from "../../components/Header";


export default function Notifications() {

  return (
    <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto p-4 space-y-4">
            <Header />
            <a href="/settings" className="text-secondary text-xl font-semibold flex items-center gap-1">
                <IoChevronBack />
            </a>
            <div className="flex items-center justify-center">
                <p className="text-muted text-sm">This feature is not yet available</p>
            </div>
        </div>

    </div>
  );
}