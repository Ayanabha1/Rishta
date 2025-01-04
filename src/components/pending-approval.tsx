import React from "react";
import { Card } from "./ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

type Props = {};

const PendingApproval = (props: Props) => {
  return (
    <div className="rounded-lg overflow-y-scroll">
      <Card className="p-4 bg-yellow-100 border-l-4 border-yellow-500 space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-700" />
          <h3 className="text-lg font-medium text-yellow-700">
            Pending Approval
          </h3>
        </div>
        <p className="text-yellow-700">
          Your account is currently under review. We'll notify you once it's
          approved.
        </p>
      </Card>

      <Card className="p-4 bg-purple-100/80 backdrop-blur-sm space-y-4 mb-4">
        <h3 className="text-lg font-medium text-purple-900">What's Next?</h3>
        <ul className="space-y-2 text-purple-800">
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>We're reviewing your submitted information</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>This process usually takes 1-2 business days</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>You'll receive a sms once your account is approved</span>
          </li>
        </ul>
      </Card>

      <Card className="p-4 bg-purple-100/80 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-purple-900 mb-4">Need Help?</h3>
        <p className="text-purple-800 mb-4">
          If you have any questions about your application or need to update any
          information, please don't hesitate to contact our support team.
        </p>
        <button className="w-full shadow-lg bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
          Contact Support
        </button>
      </Card>
    </div>
  );
};

export default PendingApproval;
