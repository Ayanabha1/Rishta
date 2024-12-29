"use client";

import { Header } from "@/components/header";
import { RecentTransactions } from "@/components/recent-transactions";
import { StatsCard } from "@/components/stats-card";
import IUser from "@/interfaces/IUser";
import { API } from "@/lib/axios";
import { useEffect, useState } from "react";

export default function Page() {
  const [userData, setUserData] = useState<IUser>();
  const getUserDetails = async () => {
    try {
      const data = await API.get("/getAccount", {
        headers: {
          accessToken: localStorage.getItem("access_token"),
          deviceId: localStorage.getItem("device_id"),
        },
      });

      setUserData(data.data.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  return (
    <section className="px-4 w-full h-full">
      <Header />

      <div className="py-8 space-y-8">
        <div className="-space-y-1">
          <h1 className="text-2xl font-semibold text-purple-950">Welcome</h1>
          <p className="text-5xl font-bold text-purple-950">
            {userData?.firstname}
          </p>
        </div>

        <div className="space-y-4">
          <StatsCard
            title="Your Yearly Earnings"
            value={userData?.["12monthearing"]}
          />
          <RecentTransactions
            transactions={userData?.latest10paymenthistory || []}
          />
        </div>
      </div>
    </section>
  );
}
