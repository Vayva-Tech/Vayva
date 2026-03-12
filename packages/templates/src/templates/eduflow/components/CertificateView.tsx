import React from "react";
import { Button } from "@vayva/ui";
import { X, Award, Download, Share2 } from "lucide-react";
import { PublicProduct } from "@vayva/templates/types/storefront";

interface CertificateViewProps {
  course: PublicProduct;
  studentName: string;
  onClose: () => void;
}

export const CertificateView = ({
  course,
  studentName,
  onClose,
}: CertificateViewProps) => {
  // eslint-disable-next-line react-hooks/purity
  const credentialId = React.useMemo(() => Math.random().toString(36).substring(2, 11).toUpperCase(), []);
  const completionDate = React.useMemo(() => new Date().toLocaleDateString(), []);
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-transparent w-full max-w-2xl rounded-xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
        <Button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 z-10"
        >
          <X size={24} />
        </Button>

        <div className="border-8 border-double border-blue-900/10 m-2 p-8 md:p-12 text-center rounded-lg bg-[#FAFAFA]">
          <div className="w-20 h-20 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center mb-6 shadow-xl">
            <Award size={48} />
          </div>

          <h2 className="text-4xl font-serif text-gray-900 font-bold mb-2 uppercase tracking-widest">
            Certificate
          </h2>
          <p className="text-gray-500 text-sm uppercase tracking-widest mb-8">
            Of Completion
          </p>

          <p className="text-gray-600 mb-2">This certifies that</p>
          <h3 className="text-3xl font-cursive font-bold text-blue-900 mb-2">
            {studentName}
          </h3>
          <p className="text-gray-600 mb-6">
            has successfully completed the course
          </p>

          <h4 className="text-xl font-bold text-gray-900 mb-8">
            {course.name}
          </h4>

          <div className="flex items-center justify-between border-t border-gray-200 pt-8 max-w-xs mx-auto text-xs text-gray-400">
            <div className="text-left">
              <p className="font-bold text-gray-900 border-b border-gray-300 pb-1 mb-1">
                {course.courseDetails?.instructor.name}
              </p>
              <p>Instructor</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 border-b border-gray-300 pb-1 mb-1">
                {completionDate}
              </p>
              <p>Date</p>
            </div>
          </div>
        </div>

        <div className="bg-background/40 backdrop-blur-sm p-4 flex justify-between items-center border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Credential ID:{" "}
            {credentialId}
          </p>
          <div className="flex gap-2">
            <Button className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-gray-200 rounded text-xs font-bold text-gray-700 hover:bg-white/60">
              <Share2 size={14} /> Share
            </Button>
            <Button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 rounded text-xs font-bold text-white hover:bg-blue-700">
              <Download size={14} /> Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
