"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Search, History, Download, Car, Truck, Wrench, ArrowRight, Loader2
} from "lucide-react";
import dayjs from "dayjs";
import { useGetAllMaintenence, useGetMaintenenceByAssetId } from "@/hooks/useMaintenences";
import { DownloadMaintenancePDF } from "./MaintenenceTable";

type AssetType = "VEHICLE" | "CHASSIS" | "EQUIPMENT";

interface Asset {
  name: string;
  id: string;
  asset_code: string;
  asset_type: AssetType;
  brand: string | null;
  model: string | null;
  serrial_number: string | null;
  purchase_date: Date | null;
  purchase_price: number | null;
  is_active: boolean;
  createdAt: Date;
}

const AssetHistoryCard = () => {
  const [assetType, setAssetType] = useState<AssetType>("VEHICLE");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<{ id: string, name: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch List Aset (Hanya metadata aset)
  const { data: maintenanceData, isLoading: isListLoading } = useGetAllMaintenence({
    page: 1,
    size: 1000,
    search: searchTerm,
  });

  // Filter aset unik
  const uniqueAssets = useMemo(() => {
    if (!maintenanceData?.data) return [];
    const assetsMap = new Map();
    maintenanceData.data.forEach((m: any) => {
      const asset: Asset = m.asset;
      if (asset.asset_type === assetType && !assetsMap.has(asset.id)) {
        assetsMap.set(asset.id, asset);
      }
    });
    return Array.from(assetsMap.values()) as Asset[];
  }, [maintenanceData, assetType]);

  /**
   * 2. Fetch Detail Riwayat
   * Kita menambahkan logic 'enabled' agar fetch HANYA berjalan jika:
   * - Modal sedang terbuka (isModalOpen)
   * - Ada ID aset yang terpilih (selectedAsset.id)
   */
  const { data: historyData, isLoading: isHistoryLoading } = useGetMaintenenceByAssetId(
    selectedAsset?.id ?? "",
    {
      enabled: isModalOpen && !!selectedAsset?.id
    }
  ) as { data: any[], isLoading: boolean };

  const handleOpenHistory = (asset: Asset) => {
    setSelectedAsset({ id: asset.id, name: asset.name });
    setIsModalOpen(true);
  };

  // Reset state saat modal ditutup agar fetch berhenti/bersih
  const handleCloseModal = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      // Opsional: tunggu animasi tutup selesai baru reset selectedAsset
      setTimeout(() => setSelectedAsset(null), 200);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" /> Riwayat Aset
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* TABS JENIS ASET */}
          <div className="flex bg-gray-100 p-1 rounded-md mb-3">
            {(["VEHICLE", "CHASSIS", "EQUIPMENT"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setAssetType(t)}
                className={`flex-1 text-[10px] font-bold py-1.5 rounded transition-all ${assetType === t ? "bg-white shadow-sm text-blue-600" : "text-gray-500"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* INPUT PENCARIAN */}
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              placeholder={`Cari ${assetType.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-md pl-8 pr-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* LIST ASET */}
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {isListLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              </div>
            ) : uniqueAssets.length > 0 ? (
              uniqueAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => handleOpenHistory(asset)}
                  className="group flex items-center justify-between p-2 border rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded text-gray-600 group-hover:bg-white">
                      {assetType === "VEHICLE" && <Car className="w-3.5 h-3.5" />}
                      {assetType === "CHASSIS" && <Truck className="w-3.5 h-3.5" />}
                      {assetType === "EQUIPMENT" && <Wrench className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">{asset.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase">
                        {asset.asset_code} {asset.brand ? `• ${asset.brand}` : ""}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500" />
                </div>
              ))
            ) : (
              <div className="text-[11px] text-gray-400 py-4 text-center border border-dashed rounded">
                Unit {assetType.toLowerCase()} tidak ditemukan
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* POPUP RIWAYAT */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <History className="w-5 h-5 text-blue-600" />
              Riwayat Perbaikan
            </DialogTitle>
            <DialogDescription>
              Menampilkan data maintenance untuk <strong>{selectedAsset?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-3 max-h-[50vh] overflow-y-auto pr-2">
            {isHistoryLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-xs text-gray-400">Mengambil data...</p>
              </div>
            ) : historyData && historyData.length > 0 ? (
              historyData.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-xl bg-gray-50 hover:bg-white transition-all group">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-blue-600 uppercase">
                      {dayjs(log.createdAt).format("DD MMM YYYY")}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">{log.record_number}</p>
                    <p className="text-[11px] text-gray-500 line-clamp-1 italic">
                      "{log.complaint || "Tidak ada deskripsi keluhan"}"
                    </p>
                  </div>

                  <DownloadMaintenancePDF maintenanceId={log.id} />
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm italic">
                Belum ada catatan perbaikan untuk unit ini.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AssetHistoryCard;