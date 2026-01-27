
import ChassisTable from "@/components/assets/chassis/ChassisTable";
import EquipmentTable from "@/components/assets/equipment/EquipmentTable";
import VehicleTable from "@/components/assets/vehicle/VehicleTable";
import DriverForm from "@/components/driver/DriverForm";
import ChassisImportExcel from "@/components/assets/chassis/ChassisImportExcel";
import ChassisImportPreviewDialog from "@/components/assets/chassis/ChassisImportPreviewDialog";
import AssetForm from "@/components/assets/AssetForm";
import AdminLayout from "@/components/layout/admin";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";
import { useBulkCreateChassis } from "@/hooks/useChassis";
import { useBulkCreateVehicle } from "@/hooks/useVehicle";
import VehicleImportExcel from "@/components/assets/vehicle/VehicleImportExcel";
import VehicleImportPreviewDialog from "@/components/assets/vehicle/VehicleImportPreviewDialog";

const AssetPage: React.FC = () => {
  const route = useRouter();
  const searchParam = useSearchParams();

  const chassisBulkMutation = useBulkCreateChassis();
  const vehicleBulkMutation = useBulkCreateVehicle();

  const [importedChassisData, setImportedChassisData] = useState<any[]>([]);
  const [previewChassisOpen, setPreviewChassisOpen] = useState(false);

  const [importedVehicleData, setImportedVehicleData] = useState<any[]>([]);
  const [previewVehicleOpen, setPreviewVehicleOpen] = useState(false);

  const handleChassisImport = (data: any[]) => {
    console.log("Imported Data:", data);
    setImportedChassisData(data);
    setPreviewChassisOpen(true);
  };

  const handleVehicleImport = (data: any[]) => {
    console.log("Imported Data:", data);
    setImportedVehicleData(data);
    setPreviewVehicleOpen(true);
  }

  const handleSubmitChassisImport = async () => {
    chassisBulkMutation.mutate(importedChassisData);

    setPreviewChassisOpen(false);
    setImportedChassisData([]);
  };

  const handleSubmitVehicleImport = async () => {
    vehicleBulkMutation.mutate(importedVehicleData);

    setPreviewVehicleOpen(false);
    setImportedVehicleData([]);
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Aset</CardTitle>
          <CardAction className="space-x-2">
            <VehicleImportExcel onImported={handleVehicleImport} />
            <ChassisImportExcel onImported={handleChassisImport} />
            <AssetForm />
          </CardAction>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue={searchParam.get("asset") ?? "vehicle"}>
              <TabsList>
                <TabsTrigger
                  value="vehicle"
                  onClick={() => route.push("/admin/assets?asset=vehicle")}
                >
                  Kendaraan
                </TabsTrigger>
                <TabsTrigger
                  value="chassis"
                  onClick={() => route.push("/admin/assets?asset=chassis")}
                >
                  Chassis
                </TabsTrigger>
                <TabsTrigger
                  value="equipment"
                  onClick={() => route.push("/admin/assets?asset=equipment")}
                >
                  Equipment
                </TabsTrigger>
              </TabsList>
              <TabsContent value="vehicle">
                <VehicleTable />
              </TabsContent>
              <TabsContent value="chassis">
                <ChassisTable />
              </TabsContent>
              <TabsContent value="equipment">
                <EquipmentTable />
              </TabsContent>
            </Tabs>
          
        </CardContent>
      </Card>

      {/* DIALOG PREVIEW */}
      <ChassisImportPreviewDialog
        open={previewChassisOpen}
        data={importedChassisData}
        onClose={() => setPreviewChassisOpen(false)}
        onSubmit={handleSubmitChassisImport}
      />

      {/* VEHICLE PREVIEW DIALOG */}
      <VehicleImportPreviewDialog
        open={previewVehicleOpen}
        data={importedVehicleData}
        onClose={() => setPreviewVehicleOpen(false)}
        onSubmit={handleSubmitVehicleImport}
      />
    </AdminLayout>
  );
};

export default AssetPage;
