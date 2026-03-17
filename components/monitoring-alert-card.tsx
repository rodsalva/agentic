"use client"

import { Bell, X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MonitoringAlert {
  id: string
  name: string
  newCount: number
  lastUpdate: string
  isNew: boolean
}

interface MonitoringAlertCardProps {
  alert: MonitoringAlert
  onView: (id: string) => void
  onDismiss: (id: string) => void
}

export function MonitoringAlertCard({ alert, onView, onDismiss }: MonitoringAlertCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
        alert.isNew
          ? "border-l-2 border-l-amber-400 border-gray-200 bg-amber-50/30"
          : "border-gray-200 bg-gray-50/50"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
        alert.isNew ? "bg-amber-100" : "bg-gray-100"
      )}>
        <Bell className={cn("w-4 h-4", alert.isNew ? "text-amber-600" : "text-gray-500")} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{alert.name}</p>
        <p className="text-xs text-gray-500">
          <span className={cn("font-medium", alert.isNew && "text-amber-600")}>
            {alert.newCount} {alert.newCount === 1 ? "novidade" : "atualizações "}
          </span>
          <span className="mx-1.5 text-gray-300">·</span>
          <span>{alert.lastUpdate}</span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => onView(alert.id)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 transition-colors cursor-pointer"
        >
          Ver
          <ArrowRight className="w-3 h-3" />
        </button>
        <button
          onClick={() => onDismiss(alert.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

interface MonitoringAlertStackProps {
  alerts: MonitoringAlert[]
  onView: (id: string) => void
  onDismiss: (id: string) => void
}

export function MonitoringAlertStack({ alerts, onView, onDismiss }: MonitoringAlertStackProps) {
  if (alerts.length === 0) return null

  return (
    <div className="w-full space-y-2 mb-6">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Monitoramentos com atualizações 
      </p>
      {alerts.map((alert) => (
        <MonitoringAlertCard
          key={alert.id}
          alert={alert}
          onView={onView}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}
