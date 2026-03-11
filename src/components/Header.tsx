import Logo from "../assets/logo.svg"

export default function Header() {

  const user = JSON.parse(localStorage.getItem("user") || "{}")

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img src={Logo} className="w-10 h-10" />
        <h1 className="text-black font-bold text-xl">Time<span className="text-primary">Bud</span></h1>
      </div>

      <p className="text-secondary font-medium">
        Hello {user?.f_name || "User"}!
      </p>
    </div>
  )
}