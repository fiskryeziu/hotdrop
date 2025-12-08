import React from "react";
import { useSession, signOut } from "../lib/auth-client";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { User, Mail, Calendar, LogOut } from "lucide-react";
import { formatDate } from "../utils/formatters";

export const ProfilePage: React.FC = () => {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    navigate("/login");
    return null;
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <User size={40} className="text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              {user.role && (
                <span className="inline-block mt-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                  {user.role}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-gray-700">
              <Mail size={20} className="text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <Calendar size={20} className="text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>

          <Button
            variant="danger"
            onClick={handleSignOut}
            className="w-full gap-2"
          >
            <LogOut size={20} />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
