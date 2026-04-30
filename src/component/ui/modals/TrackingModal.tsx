"use client";

import React, { useEffect, useState } from "react";
import { DeliveryService } from "@/domain/application/services/delivery.service";
import { TrackingResponse } from "@/domain/shared/types/order.type";
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  X, 
  AlertCircle,
  MapPin,
  Calendar
} from "lucide-react";

interface TrackingModalProps {
  waybill: string;
  onClose: () => void;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({ waybill, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingResponse | null>(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        setLoading(true);
        const data = await DeliveryService.trackShipment(waybill);
        setTrackingData(data);
      } catch (err) {
        setError("Failed to fetch tracking details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [waybill]);

  const shipment = trackingData?.ShipmentData?.[0]?.Shipment;
  const status = shipment?.Status;
  const scans = status?.Scans || [];

  const getStatusIcon = (statusStr: string) => {
    const s = statusStr.toLowerCase();
    if (s.includes("delivered")) return <CheckCircle2 className="w-6 h-6 text-green-500" />;
    if (s.includes("transit") || s.includes("out")) return <Truck className="w-6 h-6 text-blue-500" />;
    if (s.includes("picked") || s.includes("manifest")) return <Package className="w-6 h-6 text-orange-500" />;
    return <Clock className="w-6 h-6 text-gray-400" />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Track Shipment</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Waybill: {waybill}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[70vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 font-medium">Fetching live updates...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-gray-900 font-semibold">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Current Status Summary */}
              <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-4 border border-blue-100">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-blue-100">
                  {getStatusIcon(status?.Status || "")}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900 uppercase tracking-tight">
                    {status?.Status || "Updating Status..."}
                  </h4>
                  <p className="text-xs text-blue-700/80 mt-1 leading-relaxed">
                    {status?.Instructions || "No additional instructions available."}
                  </p>
                  {shipment?.ExpectedDeliveryDate && (
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-blue-800">
                      <Calendar className="w-3.5 h-3.5" />
                      Expected by {new Date(shipment.ExpectedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {scans.length > 0 ? (
                  scans.map((scan: any, index: number) => {
                    const detail = scan.ScanDetail;
                    return (
                      <div key={index} className="relative">
                        {/* Dot */}
                        <div className={`absolute -left-[26px] top-1.5 w-[14px] h-[14px] rounded-full border-2 bg-white z-10 ${
                          index === 0 ? "border-blue-500 ring-4 ring-blue-50" : "border-gray-300"
                        }`} />
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h5 className={`text-sm font-bold ${index === 0 ? "text-gray-900" : "text-gray-500"}`}>
                              {detail.Scan}
                            </h5>
                            <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                              {new Date(detail.ScanDateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {new Date(detail.ScanDateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 italic">
                            <MapPin className="w-3 h-3" />
                            {detail.Location}
                          </div>
                          {detail.Instructions && (
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed pl-4 border-l-2 border-gray-50">
                              {detail.Instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-400 py-4 italic">
                    Waiting for carrier updates...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-all shadow-md active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
