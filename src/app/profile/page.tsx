"use client";
import IUser from "@/interfaces/IUser";
import { API } from "@/lib/axios";
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
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [userData, setUserData] = useState<IUser>();
  const getUserDetails = async () => {
    try {
      const data = await API.get("/getAccount", {
        headers: {
          accessToken: localStorage.getItem("access_token"),
          deviceId: localStorage.getItem("device_id"),
        },
      });
      console.log(data.data.data);
      setUserData(data.data.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  const userProfile = {
    firstname: "Rimba",
    lastname: "Mishra",
    email: "rimab@example.com",
    mobile: "8918829811",
    address: "4545 Main Street",
    salesofficername: "Rajib Singa",
    accountholdername: "Sunia Chouhan",
    bankaccountnumber: "145456564646464",
    ifsccode: "SBIN000045",
    bankname: "United Bank Of India",
    status: "Pending for Approval",
    "12monthearing": "1250",
  };

  return (
    <div className="overflow-scroll glassmorphic-card shadow-2xl w-full">
      <div className="relative h-[844px] w-full max-w-[390px] mx-auto overflow-auto p-4">
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
        <div className="text-center space-y-4 mb-8">
          <div className="relative w-24 h-24 mx-auto">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center  text-3xl font-bold">
              {userProfile.firstname[0]}
              {userProfile.lastname[0]}
            </div>
            <div className="absolute -bottom-2 right-0 bg-green-500 rounded-full p-2 shadow-lg">
              <BadgeCheck className="w-4 h-4 " />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold ">{`${userProfile.firstname} ${userProfile.lastname}`}</h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="px-3 py-1 rounded-full text-xs bg-white/40  backdrop-blur-md border ">
                {userProfile.status}
              </span>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 space-y-4  ">
            <h2 className="text-lg font-semibold ">Personal Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 ">
                <Mail className="w-5 h-5 text-pink-500" />
                <span className="/80">{userProfile.email}</span>
              </div>
              <div className="flex items-center gap-3 ">
                <Phone className="w-5 h-5 text-pink-500" />
                <span className="/80">{userProfile.mobile}</span>
              </div>
              <div className="flex items-center gap-3 ">
                <MapPin className="w-5 h-5 text-pink-500" />
                <span className="/80">{userProfile.address}</span>
              </div>
            </div>
          </div>

          {/* Team Information */}
          <div className="backdrop-blur-md rounded-2xl p-4 space-y-4 ">
            <h2 className="text-lg font-semibold ">Team Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 ">
                <User className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="text-xs /60">Sales Officer</p>
                  <p className="/80">{userProfile.salesofficername}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ">
                <User className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="text-xs /60">Account Holder</p>
                  <p className="/80">{userProfile.accountholdername}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="backdrop-blur-md rounded-2xl p-4 space-y-4">
            <h2 className="text-lg font-semibold ">Bank Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 ">
                <Building2 className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="text-xs /60">Bank Name</p>
                  <p className="/80">{userProfile.bankname}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ">
                <CreditCard className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="text-xs /60">Account Number</p>
                  <p className="/80">{userProfile.bankaccountnumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ">
                <Wallet className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="text-xs /60">IFSC Code</p>
                  <p className="/80">{userProfile.ifsccode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings */}
          <div className="backdrop-blur-md rounded-2xl p-4 space-y-4">
            <h2 className="text-lg font-semibold ">Earnings</h2>
            <div className="flex items-center gap-3 ">
              <DollarSign className="w-5 h-5 text-pink-500" />
              <div>
                <p className="text-xs /60">Last 12 Months</p>
                <p className="text-2xl font-bold ">
                  ${userProfile["12monthearing"]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
