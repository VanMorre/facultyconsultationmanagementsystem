import useLogout from "@/app/pages/hooks/logout";

const LogoutButton = () => {
  const logout = useLogout();

  return (
    <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
      Logout
    </button>
  );
};

export default LogoutButton;
