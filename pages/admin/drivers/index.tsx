import DriverForm from "@/components/driver/DriverForm";
import DriverTable from "@/components/driver/DriverTable";
import AdminLayout from "@/components/layout/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DriverPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Daftar Driver</CardTitle>
          </CardHeader>
          <CardContent>
            <DriverTable />
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Create Driver</CardTitle>
          </CardHeader>
          <CardContent>
            <DriverForm />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DriverPage;
