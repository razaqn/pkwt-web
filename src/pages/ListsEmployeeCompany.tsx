import { Users } from "lucide-react";
import EmployeeTabs from "../components/EmployeeTabs";
import { dummyEmployees } from "../lib/dummyData";
import { getCompanyIdFromAuth } from "../utils/contractUtils";

export default function ListsEmployeeCompany() {
    // Get company ID from auth (simulated)
    const companyId = getCompanyIdFromAuth();

    return (
        <div className="space-y-4 p-0">
            <div className="flex items-center gap-3 px-6 pt-6 pb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">List PKWT/PKWTT</h1>
            </div>

            <div className="px-6 pb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-0">
                    <EmployeeTabs employees={dummyEmployees} companyId={companyId} />
                </div>
            </div>
        </div>
    );
}