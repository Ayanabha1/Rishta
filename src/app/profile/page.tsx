"use client";
import { Button } from "@/components/ui/button";
import IUser from "@/interfaces/IUser";
import { API } from "@/lib/axios";
import errorHandler from "@/lib/error-handler";
import { set } from "lodash";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  User,
  Building2,
  CreditCard,
  Wallet,
  BadgeCheck,
  DollarSign,
  BadgeInfo,
  LogOut,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [userData, setUserData] = useState<IUser>();
  const [profilePending, setProfilePending] = useState(false);
  const [loading, setLoading] = useState(true);

  const getUserDetails = async () => {
    try {
      const data = await API.get("/getAccount");
      console.log(data.data.data);
      setUserData(data.data.data.data);
      setProfilePending(data.data.data.data.status === "Pending for Approval");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      errorHandler(error);
    }
  };

  const logOut = () => {
    console.log("Logging out");
    localStorage.removeItem("access_token");
    window.location.href = "/sign-in";
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  // if (loading) {
  //   return (
  //     <div className="min-h-screen w-full flex items-center justify-center">
  //       <div className="bg-white p-6 rounded-lg shadow-xl">
  //         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
  //         <p className="text-purple-600 font-semibold mt-4 text-center">
  //           Loading profile...
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="glassmorphic-card shadow-2xl w-full p-4 pb-8 flex flex-col">
      {/* top section */}

      <div className="">
        {/* Header */}
        <div className="flex justify-between items-center mb-8  -mx-4 px-4 py-2">
          <Link
            href="/"
            className="rounded-full p-2 bg-white/40 backdrop-blur-md hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 " />
          </Link>
          <div className="px-4 py-2 rounded-full bg-white/40 backdrop-blur-md">
            <span className="font-medium">Profile Details</span>
          </div>
        </div>

        {/* Profile Header */}
        <div className="text-center space-y-4">
          {loading ? (
            <div className="w-24 h-24 rounded-full bg-black/10 animate-pulse mx-auto"></div>
          ) : (
            <div className="relative w-24 h-24 mx-auto">
              <div className="w-full h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-3xl font-bold">
                {userData?.accounttype === "Dealers" ||
                userData?.accounttype === "Business Partner"
                  ? userData?.owner_name
                      ?.split(" ")
                      .map((name) => name[0])
                      .join("")
                  : `${userData?.firstname?.[0]}${userData?.lastname?.[0]}`}
              </div>
              {profilePending ? (
                <div className="absolute -bottom-2 right-0 bg-yellow-500 rounded-full p-2">
                  <BadgeInfo className="w-4 h-4 " />
                </div>
              ) : (
                <div className="absolute -bottom-2 right-0 bg-green-500 rounded-full p-2 shadow-lg">
                  <BadgeCheck className="w-4 h-4 " />
                </div>
              )}
            </div>
          )}

          <div>
            {loading ? (
              <div className="h-6 w-48 bg-black/10 rounded animate-pulse mx-auto"></div>
            ) : (
              <h1 className="text-2xl font-bold ">
                {userData?.accounttype === "Dealers" ||
                userData?.accounttype === "Business Partner"
                  ? userData?.owner_name
                  : `${userData?.firstname} ${userData?.lastname}`}
              </h1>
            )}
            <div className="flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <div className="h-6 w-48 bg-black/10 rounded animate-pulse mx-auto"></div>
              ) : (
                <>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      profilePending ? "bg-yellow-500" : "bg-green-500"
                    } text-black`}
                  >
                    {userData?.status}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="mt-4 overflow-y-scroll rounded-lg bg-white/20 shadow">
        {/* Personal Information */}
        <div className="backdrop-blur-md rounded-2xl p-4 space-y-4">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <div className="space-y-3">
            {userData?.accounttype === "Dealers" ||
            userData?.accounttype === "Business Partner" ? (
              <>
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-pink-500" />
                  {loading ? (
                    <div className="h-6 w-48 bg-black/10 rounded animate-pulse"></div>
                  ) : (
                    <span className="/80">{userData?.accountname}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-pink-500" />
                  {loading ? (
                    <div className="h-6 w-48 bg-black/10 rounded animate-pulse"></div>
                  ) : (
                    <span className="/80">{userData?.owner_name}</span>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-pink-500" />
                {loading ? (
                  <div className="h-6 w-48 bg-black/10 rounded animate-pulse"></div>
                ) : (
                  <span className="/80">{userData?.email}</span>
                )}
              </div>
            )}
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-pink-500" />
              {loading ? (
                <div className="h-6 w-48 bg-black/10 rounded animate-pulse"></div>
              ) : (
                <span className="/80">{userData?.mobile}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-pink-500" />
              {loading ? (
                <div className="h-6 w-48 bg-black/10 rounded animate-pulse"></div>
              ) : (
                <span className="/80">{userData?.address}</span>
              )}
            </div>
          </div>
        </div>

        {/* Points/Earnings Section - Show differently for dealer */}
        <div className="backdrop-blur-md rounded-2xl p-4 space-y-4">
          <h2 className="text-lg font-semibold">
            {userData?.accounttype === "Dealers" ||
            userData?.accounttype === "Business Partner"
              ? "Points"
              : "Earnings"}
          </h2>
          <div className="flex items-center gap-3">
            {userData?.accounttype === "Dealers" ||
            userData?.accounttype === "Business Partner" ? (
              <>
                <Star className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="text-xs /60">Last 12 Months Points</p>
                  {loading ? (
                    <div className="h-6 w-48 bg-black/10 rounded animate-pulse"></div>
                  ) : (
                    <p className="/80 text-2xl font-bold">
                      {userData?.["12monthpoints"]}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="text-xs /60">Last 12 Months</p>
                  {loading ? (
                    <div className="h-6 w-48 bg-black/10 rounded animate-pulse"></div>
                  ) : (
                    <p className="/80 text-2xl font-bold">
                      ₹{userData?.["12monthearing"]}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Only show Bank Details for Mason */}
        {userData?.accounttype !== "Dealers" &&
          userData?.accounttype !== "Business Partner" && (
            <div className="backdrop-blur-md rounded-2xl p-4 space-y-4">
              <h2 className="text-lg font-semibold">Bank Details</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 ">
                  <Building2 className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-xs /60">Bank Name</p>
                    {loading ? (
                      <div className="h-6 w-48 bg-black/10 rounded animate-pulse "></div>
                    ) : (
                      <p className="/80">{userData?.bankname}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 ">
                  <CreditCard className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-xs /60">Account Number</p>
                    {loading ? (
                      <div className="h-6 w-48 bg-black/10 rounded animate-pulse "></div>
                    ) : (
                      <p className="/80">{userData?.bankaccountnumber}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 ">
                  <Wallet className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-xs /60">IFSC Code</p>
                    {loading ? (
                      <div className="h-6 w-48 bg-black/10 rounded animate-pulse "></div>
                    ) : (
                      <p className="/80">{userData?.ifsccode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>

      <div className="pt-6">
        <Button
          variant="ghost"
          className="w-full shadow-md border-2 border-pink-400 hover:bg-pink-50 text-pink-600 font-medium rounded-xl h-12"
          onClick={logOut}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
