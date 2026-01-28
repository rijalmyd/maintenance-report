"use client";

import React, { useMemo, useState } from "react";
import AdminLayout from "@/components/layout/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { useGetReminders, useMarkReminderDone, useGetOverdueReminders } from "@/hooks/useReminder";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  Wrench,
  Clock,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import dayjs from "dayjs";
import { Reminder } from "@/schema/reminderSchema";
import { startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { useGetSparepartUsage } from "@/hooks/useSparepart";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import AssetHistoryCard from "@/components/maintenence/AssetHistoryCard";

/* ===================== TYPES & CONSTANTS ===================== */
type DaysPreset = "THIS_MONTH" | "30" | "60" | "90";
const PAGE_SIZE = 5;

const getDateRange = (preset: DaysPreset) => {
  const today = dayjs().startOf("day");
  if (preset === "THIS_MONTH") {
    return {
      startDate: today.startOf("month").format("YYYY-MM-DD"),
      endDate: today.endOf("month").format("YYYY-MM-DD"),
    };
  }
  const days = Number(preset);
  return {
    startDate: today.format("YYYY-MM-DD"),
    endDate: today.add(days, "day").format("YYYY-MM-DD"),
  };
};

const DashboardPage: React.FC = () => {
  const { data: summary, isLoading: isSummaryLoading } = useDashboardSummary();

  /* -------------------------------------------------------------------------- */
  /* 1. STATE & LOGIC: OVERDUE REMINDERS                                       */
  /* -------------------------------------------------------------------------- */
  const { data: overdueData, isLoading: isOverdueLoading } = useGetOverdueReminders();
  // Pastikan akses ke array data jika response dibungkus objek { data: [...] }
  const overdueList = Array.isArray(overdueData) ? overdueData : (overdueData as any)?.data || [];

  /* -------------------------------------------------------------------------- */
  /* 2. STATE & LOGIC: REMINDER (UPCOMING)                                     */
  /* -------------------------------------------------------------------------- */
  const [daysPreset, setDaysPreset] = useState<DaysPreset>("30");
  const [typeUI, setTypeUI] = useState<"ALL" | "STNK" | "KIR">("ALL");
  const [assetTypeUI, setAssetTypeUI] = useState<"ALL" | "VEHICLE" | "CHASSIS">("ALL");
  const [searchReminder, setSearchReminder] = useState("");
  const [page, setPage] = useState(1);

  const reminderDates = useMemo(() => getDateRange(daysPreset), [daysPreset]);

  const { data: remindersResponse, isLoading: isReminderLoading } = useGetReminders({
    ...reminderDates,
    type: typeUI === "ALL" ? undefined : typeUI,
    assetType: assetTypeUI === "ALL" ? undefined : assetTypeUI,
  });

  // Handle jika response dibungkus objek data
  const reminders = Array.isArray(remindersResponse) ? remindersResponse : (remindersResponse as any)?.data || [];

  const { mutate: markDone, isPending } = useMarkReminderDone();

  const filteredReminders = useMemo(() => {
    return reminders.filter((item: Reminder) => {
      const label = item.asset.vehicle?.license_plate || item.asset.chassis?.chassis_number || item.asset.name;
      return label?.toLowerCase().includes(searchReminder.toLowerCase());
    });
  }, [reminders, searchReminder]);

  const paginatedReminders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredReminders.slice(start, start + PAGE_SIZE);
  }, [filteredReminders, page]);

  /* -------------------------------------------------------------------------- */
  /* 3. STATE & LOGIC: SPAREPART USAGE                                         */
  /* -------------------------------------------------------------------------- */
  const [spDate, setSpDate] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const { data: response, isLoading: isSpLoading } = useGetSparepartUsage({
    startDate: spDate?.from ? dayjs(spDate.from).format("YYYY-MM-DD") : "",
    endDate: spDate?.to ? dayjs(spDate.to).format("YYYY-MM-DD") : "",
  });

  const sparepartUsage = response?.data || [];

  return (
    <AdminLayout>
      {/* ===================== STATS GRID ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Perbaikan Hari Ini", val: summary?.total_today_maintenances, color: "blue", icon: TrendingUp },
          { label: "Perbaikan Bulan Ini", val: summary?.total_this_month_maintenances, color: "orange", icon: CalendarDays },
          { label: "Active Users", val: summary?.total_active_users, color: "green", icon: Users },
          { label: "Total Sparepart", val: summary?.total_spareparts, color: "purple", icon: Package },
          { label: "Reminder Aktif", val: filteredReminders.length, color: "red", icon: Bell },
        ].map((item, idx) => (
          <Card key={idx} className={`border-l-4 ${idx === 4 ? 'border-l-red-500' : 'border-l-blue-500'}`}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardDescription className="text-xs font-medium">{item.label}</CardDescription>
              <item.icon className="w-4 h-4 opacity-70" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl font-bold">{isSummaryLoading ? "..." : item.val ?? 0}</CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ===================== LEFT COLUMN ===================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* NEW CARD: OVERDUE REMINDERS (Hanya muncul jika ada data) */}
          {overdueList.length > 0 && (
            <Card className="border-red-200 bg-red-50/50 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 animate-pulse" />
                    Reminder Sudah Jatuh Tempo
                  </CardTitle>
                  <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {overdueList.length} ITEM
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {isOverdueLoading ? (
                    <div className="flex items-center gap-2 text-xs text-gray-400"><Clock className="w-3 h-3 animate-spin" /> Loading...</div>
                  ) : (
                    overdueList.map((item: Reminder) => {
                      const label = item.asset.vehicle?.license_plate || item.asset.chassis?.chassis_number || item.asset.name;
                      const diffDays = dayjs().diff(dayjs(item.next_due_date), 'day');
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-red-100 rounded-lg">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 rounded uppercase">{item.reminder_type}</span>
                              <span className="text-sm font-bold text-gray-800">{label}</span>
                            </div>
                            <span className="text-[11px] text-red-500 font-medium mt-1">
                              Terlewat {diffDays} hari ({dayjs(item.next_due_date).format("DD/MM/YYYY")})
                            </span>
                          </div>
                          <button 
                            onClick={() => markDone(item.id)}
                            disabled={isPending}
                            className="p-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ===================== CARD 1: REMINDER (UPCOMING) ===================== */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                Reminder Terdekat
              </CardTitle>
              <CardDescription>Jatuh tempo STNK & KIR mendatang</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <select value={daysPreset} onChange={(e) => setDaysPreset(e.target.value as DaysPreset)} className="border rounded px-2 py-1 text-sm bg-white">
                  <option value="THIS_MONTH">Bulan Ini</option>
                  <option value="30">30 Hari Ke Depan</option>
                  <option value="60">60 Hari Ke Depan</option>
                  <option value="90">90 Hari Ke Depan</option>
                </select>

                <select value={typeUI} onChange={(e) => setTypeUI(e.target.value as any)} className="border rounded px-2 py-1 text-sm bg-white">
                  <option value="ALL">Semua Dokumen</option>
                  <option value="STNK">STNK</option>
                  <option value="KIR">KIR</option>
                </select>

                <select value={assetTypeUI} onChange={(e) => setAssetTypeUI(e.target.value as any)} className="border rounded px-2 py-1 text-sm bg-blue-50 border-blue-200">
                  <option value="ALL">Semua Asset</option>
                  <option value="VEHICLE">Vehicle</option>
                  <option value="CHASSIS">Chassis</option>
                </select>

                <input
                  placeholder="Cari plat / unit..."
                  value={searchReminder}
                  onChange={(e) => setSearchReminder(e.target.value)}
                  className="border rounded px-2 py-1 text-sm flex-1 min-w-[150px]"
                />
              </div>

              <div className="space-y-2">
                {isReminderLoading ? (
                  <p className="text-sm text-gray-500 italic">Memuat pengingat...</p>
                ) : paginatedReminders.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg bg-gray-50">
                    <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Tidak ada pengingat untuk periode ini.</p>
                  </div>
                ) : (
                  paginatedReminders.map((item: any) => {
                    const label = item.asset.vehicle?.license_plate || item.asset.chassis?.chassis_number || item.asset.name;
                    return (
                      <div key={item.id} className="flex justify-between items-center p-3 rounded border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">{item.reminder_type}</span>
                            <span className="text-sm font-semibold text-gray-700">{label}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">Jatuh Tempo: {dayjs(item.next_due_date).format("DD MMM YYYY")}</p>
                        </div>
                        <button onClick={() => markDone(item.id)} disabled={isPending} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors disabled:opacity-50">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {filteredReminders.length > PAGE_SIZE && (
                <div className="flex justify-between mt-4 items-center">
                  <span className="text-[11px] text-gray-400">Total {filteredReminders.length} item</span>
                  <div className="flex gap-2">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-xs border px-3 py-1 rounded hover:bg-gray-50 disabled:opacity-30">Prev</button>
                    <button disabled={page * PAGE_SIZE >= filteredReminders.length} onClick={() => setPage(p => p + 1)} className="text-xs border px-3 py-1 rounded hover:bg-gray-50 disabled:opacity-30">Next</button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ===================== RIGHT COLUMN ===================== */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-orange-500" /> Top Sparepart Usage
                </CardTitle>
                <DatePickerWithRange date={spDate} setDate={setSpDate} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isSpLoading ? (
                  <p className="text-xs text-center text-gray-400">Memuat data sparepart...</p>
                ) : sparepartUsage.length === 0 ? (
                  <p className="text-xs text-center text-gray-400 py-4">Tidak ada penggunaan sparepart.</p>
                ) : (
                  sparepartUsage.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                      <div className="flex flex-col">
                        <span className="text-gray-700 font-medium">{item.name}</span>
                        <span className="text-[10px] text-gray-400 uppercase">{item.part_number || 'N/A'}</span>
                      </div>
                      <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs">{item.total_used} Pcs</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* ASSET HISTORY CARD */}
          <AssetHistoryCard />
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;